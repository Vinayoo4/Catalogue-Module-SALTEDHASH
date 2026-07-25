import { ICatalogModuleService } from './contracts';
import {
  ArchiveCatalogItemResponse,
  CatalogItemDetailResponse,
  CatalogListQuery,
  CatalogListResponse,
  CatalogSummaryResponse,
  CategoryListResponse,
  CreateCatalogItemInput,
  DuplicateCatalogItemResponse,
  StockAdjustInput,
  StockAdjustResponse,
  UpdateCatalogItemInput,
} from './dto';
import { CatalogRepository } from '../services/catalogRepository';
import {
  buildCatalogSummary,
  buildCategorySummary,
  calculateProfitMargin,
  filterCatalogItems,
  isLowStock,
} from '../services/catalogDomain';
import { validateCatalogItemInput } from '../services/catalogValidation';
import { CatalogItem } from '../types';

export class CatalogModuleService implements ICatalogModuleService {
  async createCatalogItem(input: CreateCatalogItemInput): Promise<CatalogItemDetailResponse> {
    const validation = validateCatalogItemInput(input);
    if (!validation.isValid) {
      const firstErr = Object.values(validation.errors)[0];
      throw new Error(`Validation Error: ${firstErr}`);
    }

    let categoryId = input.categoryId;
    let categorySnapshot = input.categoryName;

    if (!categoryId && input.categoryName) {
      const cat = await CatalogRepository.createCategory(input.categoryName);
      categoryId = cat.id;
      categorySnapshot = cat.name;
    }

    const createdItem = await CatalogRepository.createCatalogItemRecord({
      name: input.name.trim(),
      type: input.type,
      categoryId,
      categorySnapshot,
      description: input.description?.trim(),
      sku: input.sku?.trim(),
      barcode: input.barcode?.trim(),
      unit: input.unit?.trim() || (input.type === 'product' ? 'pcs' : 'session'),
      price: input.price,
      costPrice: input.costPrice,
      stockTracked: input.type === 'product' ? (input.stockTracked ?? false) : false,
      stockQty: input.type === 'product' && input.stockTracked ? (input.stockQty ?? 0) : undefined,
      lowStockThreshold: input.type === 'product' && input.stockTracked ? (input.lowStockThreshold ?? 5) : undefined,
      taxLabel: input.taxLabel,
      imageUrl: input.imageUrl?.trim(),
      tags: input.tags,
      status: 'active',
    });

    const category = categoryId ? await CatalogRepository.getCategoryById(categoryId) : undefined;

    return {
      item: createdItem,
      category,
      isLowStock: isLowStock(createdItem),
      profitMarginPercent: calculateProfitMargin(createdItem.price, createdItem.costPrice),
    };
  }

  async updateCatalogItem(input: UpdateCatalogItemInput): Promise<CatalogItemDetailResponse> {
    const validation = validateCatalogItemInput(input);
    if (!validation.isValid) {
      const firstErr = Object.values(validation.errors)[0];
      throw new Error(`Validation Error: ${firstErr}`);
    }

    const updatedItem = await CatalogRepository.updateCatalogItemRecord(input.id, {
      ...(input.name !== undefined ? { name: input.name.trim() } : {}),
      ...(input.type !== undefined ? { type: input.type } : {}),
      ...(input.categoryId !== undefined ? { categoryId: input.categoryId } : {}),
      ...(input.categoryName !== undefined ? { categorySnapshot: input.categoryName } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.sku !== undefined ? { sku: input.sku } : {}),
      ...(input.barcode !== undefined ? { barcode: input.barcode } : {}),
      ...(input.unit !== undefined ? { unit: input.unit } : {}),
      ...(input.price !== undefined ? { price: input.price } : {}),
      ...(input.costPrice !== undefined ? { costPrice: input.costPrice } : {}),
      ...(input.stockTracked !== undefined ? { stockTracked: input.stockTracked } : {}),
      ...(input.stockQty !== undefined ? { stockQty: input.stockQty } : {}),
      ...(input.lowStockThreshold !== undefined ? { lowStockThreshold: input.lowStockThreshold } : {}),
      ...(input.taxLabel !== undefined ? { taxLabel: input.taxLabel } : {}),
      ...(input.imageUrl !== undefined ? { imageUrl: input.imageUrl } : {}),
      ...(input.tags !== undefined ? { tags: input.tags } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
    });

    const category = updatedItem.categoryId ? await CatalogRepository.getCategoryById(updatedItem.categoryId) : undefined;

    return {
      item: updatedItem,
      category,
      isLowStock: isLowStock(updatedItem),
      profitMarginPercent: calculateProfitMargin(updatedItem.price, updatedItem.costPrice),
    };
  }

  async getCatalogItemById(id: string): Promise<CatalogItemDetailResponse> {
    const item = await CatalogRepository.getCatalogItemById(id);
    if (!item) {
      throw new Error(`Item with ID '${id}' not found.`);
    }

    const category = item.categoryId ? await CatalogRepository.getCategoryById(item.categoryId) : undefined;

    return {
      item,
      category,
      isLowStock: isLowStock(item),
      profitMarginPercent: calculateProfitMargin(item.price, item.costPrice),
    };
  }

  async getCatalogItems(query?: CatalogListQuery): Promise<CatalogListResponse> {
    const allItems = await CatalogRepository.listCatalogItems();
    const categories = await CatalogRepository.getCategories();

    const filtered = filterCatalogItems(allItems, query);

    const page = query?.page || 1;
    const limit = query?.limit || 50;
    const startIndex = (page - 1) * limit;
    const paginatedItems = filtered.slice(startIndex, startIndex + limit);
    const totalPages = Math.ceil(filtered.length / limit) || 1;

    const summary = buildCatalogSummary(allItems, categories.length);

    return {
      items: paginatedItems,
      total: filtered.length,
      page,
      limit,
      totalPages,
      summary: {
        totalItems: summary.totalItems,
        activeProducts: summary.activeProducts,
        activeServices: summary.activeServices,
        lowStockCount: summary.lowStockCount,
      },
    };
  }

  async archiveCatalogItem(id: string): Promise<ArchiveCatalogItemResponse> {
    const archived = await CatalogRepository.archiveCatalogItemRecord(id);
    return {
      success: true,
      itemId: archived.id,
      status: 'archived',
      message: `Catalog item '${archived.name}' has been archived successfully.`,
    };
  }

  async restoreCatalogItem(id: string): Promise<ArchiveCatalogItemResponse> {
    const restored = await CatalogRepository.restoreCatalogItemRecord(id);
    return {
      success: true,
      itemId: restored.id,
      status: 'active',
      message: `Catalog item '${restored.name}' has been restored to active status.`,
    };
  }

  async duplicateCatalogItem(id: string): Promise<DuplicateCatalogItemResponse> {
    const newItem = await CatalogRepository.duplicateCatalogItemRecord(id);
    return {
      success: true,
      newItem,
      message: `Catalog item duplicated successfully as '${newItem.name}'.`,
    };
  }

  async getCatalogSummary(): Promise<CatalogSummaryResponse> {
    const allItems = await CatalogRepository.listCatalogItems();
    const categories = await CatalogRepository.getCategories();
    return buildCatalogSummary(allItems, categories.length);
  }

  async getCatalogCategories(): Promise<CategoryListResponse> {
    const categories = await CatalogRepository.getCategories();
    const allItems = await CatalogRepository.listCatalogItems();
    return buildCategorySummary(categories, allItems);
  }

  async createCategory(name: string): Promise<{ success: boolean; category: CategoryListResponse['categories'][0] }> {
    const cat = await CatalogRepository.createCategory(name);
    const allItems = await CatalogRepository.listCatalogItems();
    const itemCount = allItems.filter((i) => i.status === 'active' && i.categoryId === cat.id).length;

    return {
      success: true,
      category: {
        ...cat,
        itemCount,
      },
    };
  }

  async updateCategory(id: string, name: string): Promise<{ success: boolean }> {
    const success = await CatalogRepository.updateCategory(id, name);
    return { success };
  }

  async deleteCategory(id: string): Promise<{ success: boolean; message: string }> {
    return CatalogRepository.deleteCategory(id);
  }

  async adjustStock(input: StockAdjustInput): Promise<StockAdjustResponse> {
    const item = await CatalogRepository.getCatalogItemById(input.itemId);
    if (!item) {
      throw new Error(`Catalog item ${input.itemId} not found.`);
    }

    if (item.type !== 'product' || !item.stockTracked) {
      throw new Error(`Item '${item.name}' does not support stock tracking.`);
    }

    const prevQty = item.stockQty ?? 0;

    // Record adjustment
    const adj = await CatalogRepository.recordStockAdjustment(input.itemId, input.changeQty, input.reason, input.notes);

    const updatedItem = await CatalogRepository.getCatalogItemById(input.itemId);

    return {
      success: true,
      itemId: input.itemId,
      previousQty: prevQty,
      newQty: adj.newStockQty,
      isLowStock: isLowStock(updatedItem!),
      item: updatedItem!,
    };
  }

  async getItemsForSalePicker(search?: string, categoryId?: string): Promise<CatalogItem[]> {
    const items = await CatalogRepository.listCatalogItems();
    return filterCatalogItems(items, {
      status: 'active',
      search,
      categoryId,
      sortBy: 'name',
      sortOrder: 'asc',
    });
  }
}

export const catalogService = new CatalogModuleService();
