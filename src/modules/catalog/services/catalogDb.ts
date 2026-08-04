import Dexie, { Table } from 'dexie';
import { CatalogCategory, CatalogItem, CatalogSettings, StockAdjustment } from '../types';

export class CatalogDatabase extends Dexie {
  items!: Table<CatalogItem, string>;
  categories!: Table<CatalogCategory, string>;
  settings!: Table<CatalogSettings & { id: string }, string>;
  stockAdjustments!: Table<StockAdjustment, string>;

  constructor() {
    super('SaltedHash_CatalogDB');
    this.version(1).stores({
      items: 'id, itemCode, name, type, categoryId, status, stockTracked, price, createdAt, [status+type]',
      categories: 'id, name, isSystem, createdAt',
      settings: 'id',
      stockAdjustments: 'id, itemId, timestamp',
    });

    this.version(2).stores({
      items: 'id, itemCode, name, slug, type, categoryId, status, stockTracked, price, createdAt, visible, featured, [status+type]',
      categories: 'id, name, isSystem, createdAt',
      settings: 'id',
      stockAdjustments: 'id, itemId, timestamp',
    }).upgrade(trans => {
      return trans.table('items').toCollection().modify(item => {
        // Map old description to shortDescription if it exists and shortDescription doesn't
        if (item.description && !item.shortDescription) {
          item.shortDescription = item.description;
        }

        // Generate a basic slug if one doesn't exist
        if (!item.slug && item.name) {
          item.slug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        }

        // Set default values for new boolean fields
        if (typeof item.visible === 'undefined') item.visible = true;
        if (typeof item.featured === 'undefined') item.featured = false;

        // Initialize version to 1
        if (typeof item.version === 'undefined') item.version = 1;

        // Initialize relatedItemIds
        if (!item.relatedItemIds) item.relatedItemIds = [];
      });
    });
  }
}

export const catalogDb = new CatalogDatabase();
