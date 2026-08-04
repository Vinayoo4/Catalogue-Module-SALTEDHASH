import { CatalogCategory, CatalogItem, ItemStatus, ItemType } from '../types';

export interface CreateCatalogItemInput {
  name: string;
  slug?: string;
  type: ItemType;
  categoryId?: string;
  categoryName?: string;
  description?: string;
  shortDescription?: string;
  longDescription?: string;
  subcategory?: string;
  targetAudience?: string;
  pricingModel?: string;
  currency?: string;
  featured?: boolean;
  visible?: boolean;
  relatedItemIds?: string[];
  icon?: string;
  sortOrder?: number;
  sku?: string;
  barcode?: string;
  unit?: string;
  price: number;
  costPrice?: number;
  stockTracked?: boolean;
  stockQty?: number;
  lowStockThreshold?: number;
  taxLabel?: string;
  imageUrl?: string;
  tags?: string[];
}

export interface UpdateCatalogItemInput extends Partial<CreateCatalogItemInput> {
  id: string;
  status?: ItemStatus;
}

export interface CatalogListQuery {
  search?: string;
  type?: ItemType | 'all';
  categoryId?: string;
  status?: ItemStatus | 'all';
  lowStockOnly?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'price' | 'stockQty' | 'createdAt' | 'itemCode';
  sortOrder?: 'asc' | 'desc';
}

export interface CatalogListResponse {
  items: CatalogItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  summary: {
    totalItems: number;
    activeProducts: number;
    activeServices: number;
    lowStockCount: number;
  };
}

export interface CatalogItemDetailResponse {
  item: CatalogItem;
  category?: CatalogCategory;
  isLowStock: boolean;
  profitMarginPercent?: number;
}

export interface CatalogSummaryResponse {
  totalItems: number;
  activeProducts: number;
  activeServices: number;
  totalStockValue: number;
  totalStockCostValue: number;
  lowStockCount: number;
  archivedCount: number;
  totalCategories: number;
  featuredCount: number;
  hiddenCount: number;
}

export interface CategoryListResponse {
  categories: (CatalogCategory & { itemCount: number })[];
  total: number;
}

export interface ArchiveCatalogItemResponse {
  success: boolean;
  itemId: string;
  status: ItemStatus;
  message: string;
}

export interface DuplicateCatalogItemResponse {
  success: boolean;
  newItem: CatalogItem;
  message: string;
}

export interface StockAdjustInput {
  itemId: string;
  changeQty: number;
  reason: 'sale' | 'purchase' | 'manual_correction' | 'restock';
  notes?: string;
}

export interface StockAdjustResponse {
  success: boolean;
  itemId: string;
  previousQty: number;
  newQty: number;
  isLowStock: boolean;
  item: CatalogItem;
}
