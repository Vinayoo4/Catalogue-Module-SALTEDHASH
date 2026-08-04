import { CatalogCategory, CatalogItem, CatalogSettings, StockAdjustment } from '../types';
import { catalogDb } from './catalogDb';
import { buildItemCode } from './catalogDomain';
import { INITIAL_CATEGORIES, INITIAL_ITEMS, INITIAL_SETTINGS } from './catalogSeedData';

export class CatalogRepository {
  private static isInitialized = false;
  private static initPromise: Promise<void> | null = null;

  static async ensureInitialized(): Promise<void> {
    if (this.isInitialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      try {
        const categoriesCount = await catalogDb.categories.count();
        if (categoriesCount === 0) {
          await catalogDb.categories.bulkPut(INITIAL_CATEGORIES);
        }

        const itemsCount = await catalogDb.items.count();
        if (itemsCount === 0) {
          await catalogDb.items.bulkPut(INITIAL_ITEMS);
        }

        const settingsCount = await catalogDb.settings.count();
        if (settingsCount === 0) {
          await catalogDb.settings.put(INITIAL_SETTINGS);
        }

        this.isInitialized = true;
      } catch (err) {
        console.error('Error initializing catalog database:', err);
      } finally {
        this.initPromise = null;
      }
    })();

    return this.initPromise;
  }

  static async getSettings(): Promise<CatalogSettings> {
    await this.ensureInitialized();
    const settings = await catalogDb.settings.get('catalog_settings');
    if (!settings) {
      await catalogDb.settings.put(INITIAL_SETTINGS);
      return INITIAL_SETTINGS;
    }
    return settings;
  }

  static async updateSettings(updates: Partial<CatalogSettings>): Promise<CatalogSettings> {
    await this.ensureInitialized();
    const current = await this.getSettings();
    const updated = { ...current, ...updates, id: 'catalog_settings' };
    await catalogDb.settings.put(updated);
    return updated;
  }

  static async getNextItemCode(): Promise<string> {
    const settings = await this.getSettings();
    const nextSeq = settings.nextItemCode || 101;
    const itemCode = buildItemCode(nextSeq);
    await this.updateSettings({ nextItemCode: nextSeq + 1 });
    return itemCode;
  }

  static async getCategories(): Promise<CatalogCategory[]> {
    await this.ensureInitialized();
    return catalogDb.categories.toArray();
  }

  static async getCategoryById(id: string): Promise<CatalogCategory | undefined> {
    await this.ensureInitialized();
    return catalogDb.categories.get(id);
  }

  static async createCategory(name: string): Promise<CatalogCategory> {
    await this.ensureInitialized();
    const trimmed = name.trim();
    const existing = await catalogDb.categories.where('name').equalsIgnoreCase(trimmed).first();
    if (existing) {
      return existing;
    }

    const newCategory: CatalogCategory = {
      id: `cat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: trimmed,
      isSystem: false,
      createdAt: new Date().toISOString(),
    };

    await catalogDb.categories.add(newCategory);
    return newCategory;
  }

  static async updateCategory(id: string, name: string): Promise<boolean> {
    await this.ensureInitialized();
    const cat = await catalogDb.categories.get(id);
    if (!cat) return false;
    await catalogDb.categories.update(id, { name: name.trim() });

    // Update snapshot for items using this category
    const items = await catalogDb.items.where('categoryId').equals(id).toArray();
    for (const item of items) {
      await catalogDb.items.update(item.id, { categorySnapshot: name.trim() });
    }

    return true;
  }

  static async deleteCategory(id: string): Promise<{ success: boolean; message: string }> {
    await this.ensureInitialized();
    const cat = await catalogDb.categories.get(id);
    if (!cat) return { success: false, message: 'Category not found.' };
    if (cat.isSystem) return { success: false, message: 'System categories cannot be deleted.' };

    const itemsCount = await catalogDb.items.where('categoryId').equals(id).count();
    if (itemsCount > 0) {
      // Reassign items to General
      const generalCat = await catalogDb.categories.where('name').equalsIgnoreCase('General').first();
      const defaultCatId = generalCat ? generalCat.id : 'cat-general';
      const defaultCatName = generalCat ? generalCat.name : 'General';

      const items = await catalogDb.items.where('categoryId').equals(id).toArray();
      for (const item of items) {
        await catalogDb.items.update(item.id, {
          categoryId: defaultCatId,
          categorySnapshot: defaultCatName,
        });
      }
    }

    await catalogDb.categories.delete(id);
    return { success: true, message: 'Category deleted successfully.' };
  }

  static async listCatalogItems(): Promise<CatalogItem[]> {
    await this.ensureInitialized();
    return catalogDb.items.toArray();
  }

  static async getCatalogItemById(id: string): Promise<CatalogItem | undefined> {
    await this.ensureInitialized();
    return catalogDb.items.get(id);
  }

  static async createCatalogItemRecord(itemData: Omit<CatalogItem, 'id' | 'itemCode' | 'createdAt' | 'updatedAt' | 'status'> & { status?: 'active' | 'archived' }): Promise<CatalogItem> {
    await this.ensureInitialized();
    const itemCode = await this.getNextItemCode();
    const now = new Date().toISOString();

    let categorySnapshot = itemData.categorySnapshot;
    if (itemData.categoryId && !categorySnapshot) {
      const cat = await catalogDb.categories.get(itemData.categoryId);
      if (cat) categorySnapshot = cat.name;
    }

    const newItem: CatalogItem = {
      ...itemData,
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      itemCode,
      slug: itemData.slug || itemData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      categorySnapshot: categorySnapshot || 'General',
      status: itemData.status || 'active',
      stockTracked: itemData.type === 'product' ? (itemData.stockTracked ?? false) : false,
      stockQty: itemData.type === 'product' && itemData.stockTracked ? (itemData.stockQty ?? 0) : undefined,
      visible: typeof itemData.visible !== 'undefined' ? itemData.visible : true,
      featured: typeof itemData.featured !== 'undefined' ? itemData.featured : false,
      version: 1,
      relatedItemIds: itemData.relatedItemIds || [],
      createdAt: now,
      updatedAt: now,
    };

    await catalogDb.items.add(newItem);

    // Initial stock adjustment entry if product and tracked
    if (newItem.type === 'product' && newItem.stockTracked && (newItem.stockQty ?? 0) > 0) {
      await this.recordStockAdjustment(newItem.id, newItem.stockQty ?? 0, 'initial', 'Initial inventory setup');
    }

    return newItem;
  }

  static async updateCatalogItemRecord(id: string, updates: Partial<CatalogItem>): Promise<CatalogItem> {
    await this.ensureInitialized();
    const existing = await catalogDb.items.get(id);
    if (!existing) {
      throw new Error(`Catalog item with ID ${id} not found.`);
    }

    const now = new Date().toISOString();
    let categorySnapshot = updates.categorySnapshot || existing.categorySnapshot;
    if (updates.categoryId && updates.categoryId !== existing.categoryId) {
      const cat = await catalogDb.categories.get(updates.categoryId);
      if (cat) categorySnapshot = cat.name;
    }

    const updatedItem: CatalogItem = {
      ...existing,
      ...updates,
      categorySnapshot,
      version: (existing.version || 1) + 1,
      updatedAt: now,
    };

    // Ensure services do not track stock
    if (updatedItem.type === 'service') {
      updatedItem.stockTracked = false;
      updatedItem.stockQty = undefined;
      updatedItem.lowStockThreshold = undefined;
    }

    await catalogDb.items.put(updatedItem);
    return updatedItem;
  }

  static async archiveCatalogItemRecord(id: string): Promise<CatalogItem> {
    return this.updateCatalogItemRecord(id, { status: 'archived' });
  }

  static async restoreCatalogItemRecord(id: string): Promise<CatalogItem> {
    return this.updateCatalogItemRecord(id, { status: 'active' });
  }

  static async duplicateCatalogItemRecord(id: string): Promise<CatalogItem> {
    const original = await this.getCatalogItemById(id);
    if (!original) {
      throw new Error(`Original item ${id} not found.`);
    }

    const newItemCode = await this.getNextItemCode();
    const now = new Date().toISOString();

    const duplicatedItem: CatalogItem = {
      ...original,
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      itemCode: newItemCode,
      name: `${original.name} (Copy)`,
      sku: original.sku ? `${original.sku}-COPY` : undefined,
      barcode: undefined,
      status: 'active',
      createdAt: now,
      updatedAt: now,
    };

    await catalogDb.items.add(duplicatedItem);
    return duplicatedItem;
  }

  static async recordStockAdjustment(itemId: string, changeQty: number, reason: StockAdjustment['reason'], notes?: string): Promise<StockAdjustment> {
    await this.ensureInitialized();
    const item = await catalogDb.items.get(itemId);
    if (!item) {
      throw new Error(`Item ${itemId} not found.`);
    }

    const prevQty = item.stockQty ?? 0;
    const newQty = Math.max(0, prevQty + changeQty);

    await catalogDb.items.update(itemId, {
      stockQty: newQty,
      updatedAt: new Date().toISOString(),
    });

    const adj: StockAdjustment = {
      id: `adj-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      itemId,
      changeQty,
      newStockQty: newQty,
      reason,
      notes,
      timestamp: new Date().toISOString(),
    };

    await catalogDb.stockAdjustments.add(adj);
    return adj;
  }

  static async getStockAdjustments(itemId: string): Promise<StockAdjustment[]> {
    await this.ensureInitialized();
    return catalogDb.stockAdjustments.where('itemId').equals(itemId).reverse().sortBy('timestamp');
  }

  static async resetToDemoData(): Promise<void> {
    await catalogDb.items.clear();
    await catalogDb.categories.clear();
    await catalogDb.settings.clear();
    await catalogDb.stockAdjustments.clear();

    await catalogDb.categories.bulkPut(INITIAL_CATEGORIES);
    await catalogDb.items.bulkPut(INITIAL_ITEMS);
    await catalogDb.settings.put(INITIAL_SETTINGS);

    this.isInitialized = true;
  }
}
