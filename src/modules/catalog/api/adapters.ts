import { ICatalogModuleService } from './contracts';
import { catalogService } from './catalogService';
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

/**
 * LocalCatalogAdapter
 * Serves as the primary bridge between UI/Hooks and the domain/API layer.
 * Can be replaced or extended with HTTP REST calls if process.env.VITE_USE_REMOTE_API is true.
 */
export class LocalCatalogAdapter implements ICatalogModuleService {
  private service: ICatalogModuleService;

  constructor(service: ICatalogModuleService = catalogService) {
    this.service = service;
  }

  async createCatalogItem(input: CreateCatalogItemInput): Promise<CatalogItemDetailResponse> {
    return this.service.createCatalogItem(input);
  }

  async updateCatalogItem(input: UpdateCatalogItemInput): Promise<CatalogItemDetailResponse> {
    return this.service.updateCatalogItem(input);
  }

  async getCatalogItemById(id: string): Promise<CatalogItemDetailResponse> {
    return this.service.getCatalogItemById(id);
  }

  async getCatalogItems(query?: CatalogListQuery): Promise<CatalogListResponse> {
    return this.service.getCatalogItems(query);
  }

  async archiveCatalogItem(id: string): Promise<ArchiveCatalogItemResponse> {
    return this.service.archiveCatalogItem(id);
  }

  async restoreCatalogItem(id: string): Promise<ArchiveCatalogItemResponse> {
    return this.service.restoreCatalogItem(id);
  }

  async duplicateCatalogItem(id: string): Promise<DuplicateCatalogItemResponse> {
    return this.service.duplicateCatalogItem(id);
  }

  async getCatalogSummary(query?: CatalogListQuery): Promise<CatalogSummaryResponse> {
    return this.service.getCatalogSummary(query);
  }

  async getCatalogCategories(): Promise<CategoryListResponse> {
    return this.service.getCatalogCategories();
  }

  async createCategory(name: string): Promise<{ success: boolean; category: CategoryListResponse['categories'][0] }> {
    return this.service.createCategory(name);
  }

  async updateCategory(id: string, name: string): Promise<{ success: boolean }> {
    return this.service.updateCategory(id, name);
  }

  async deleteCategory(id: string): Promise<{ success: boolean; message: string }> {
    return this.service.deleteCategory(id);
  }

  async adjustStock(input: StockAdjustInput): Promise<StockAdjustResponse> {
    return this.service.adjustStock(input);
  }

  async getItemsForSalePicker(search?: string, categoryId?: string) {
    return this.service.getItemsForSalePicker(search, categoryId);
  }
}

export const catalogAdapter = new LocalCatalogAdapter();
