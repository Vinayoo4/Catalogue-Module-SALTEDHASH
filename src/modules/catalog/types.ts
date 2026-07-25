export type ItemType = 'product' | 'service' | 'custom';
export type ItemStatus = 'active' | 'archived';

export interface CatalogItem {
  id: string;
  itemCode: string;
  name: string;
  type: ItemType;
  categoryId?: string;
  categorySnapshot?: string;
  description?: string;
  sku?: string;
  barcode?: string;
  unit?: string; // pcs, hrs, kg, box, unit, session, item
  price: number;
  costPrice?: number;
  stockTracked: boolean;
  stockQty?: number;
  lowStockThreshold?: number;
  taxLabel?: string;
  imageUrl?: string;
  tags?: string[];
  status: ItemStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CatalogCategory {
  id: string;
  name: string;
  isSystem: boolean;
  createdAt: string;
}

export interface CatalogSettings {
  nextItemCode: number;
  allowCustomItems: boolean;
  recentCategories: string[];
}

export interface StockAdjustment {
  id: string;
  itemId: string;
  changeQty: number; // positive for addition, negative for reduction
  newStockQty: number;
  reason: 'sale' | 'purchase' | 'manual_correction' | 'restock' | 'initial';
  notes?: string;
  timestamp: string;
}
