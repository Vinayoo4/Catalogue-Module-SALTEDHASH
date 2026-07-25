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
  }
}

export const catalogDb = new CatalogDatabase();
