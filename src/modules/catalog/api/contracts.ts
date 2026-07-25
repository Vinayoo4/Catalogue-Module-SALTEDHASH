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

export interface ICatalogModuleService {
  createCatalogItem(input: CreateCatalogItemInput): Promise<CatalogItemDetailResponse>;
  updateCatalogItem(input: UpdateCatalogItemInput): Promise<CatalogItemDetailResponse>;
  getCatalogItemById(id: string): Promise<CatalogItemDetailResponse>;
  getCatalogItems(query?: CatalogListQuery): Promise<CatalogListResponse>;
  archiveCatalogItem(id: string): Promise<ArchiveCatalogItemResponse>;
  restoreCatalogItem(id: string): Promise<ArchiveCatalogItemResponse>;
  duplicateCatalogItem(id: string): Promise<DuplicateCatalogItemResponse>;
  getCatalogSummary(query?: CatalogListQuery): Promise<CatalogSummaryResponse>;
  getCatalogCategories(): Promise<CategoryListResponse>;
  createCategory(name: string): Promise<{ success: boolean; category: CategoryListResponse['categories'][0] }>;
  updateCategory(id: string, name: string): Promise<{ success: boolean }>;
  deleteCategory(id: string): Promise<{ success: boolean; message: string }>;
  adjustStock(input: StockAdjustInput): Promise<StockAdjustResponse>;
  getItemsForSalePicker(search?: string, categoryId?: string): Promise<CatalogItemDetailResponse['item'][]>;
}
