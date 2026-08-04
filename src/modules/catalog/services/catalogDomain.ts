import { CatalogListQuery, CatalogSummaryResponse, CategoryListResponse } from '../api/dto';
import { CatalogCategory, CatalogItem } from '../types';

export function buildItemCode(sequenceNumber: number): string {
  return `ITEM-${String(sequenceNumber).padStart(3, '0')}`;
}

export function isLowStock(item: CatalogItem): boolean {
  if (item.type !== 'product' || !item.stockTracked || item.status === 'archived') {
    return false;
  }
  const threshold = item.lowStockThreshold ?? 5;
  const currentQty = item.stockQty ?? 0;
  return currentQty <= threshold;
}

export function calculateProfitMargin(price: number, costPrice?: number): number | undefined {
  if (costPrice === undefined || costPrice === null || price <= 0 || costPrice < 0) {
    return undefined;
  }
  const margin = ((price - costPrice) / price) * 100;
  return Math.round(margin * 10) / 10;
}

export function buildCatalogSummary(items: CatalogItem[], totalCategories: number): CatalogSummaryResponse {
  let activeProducts = 0;
  let activeServices = 0;
  let totalStockValue = 0;
  let totalStockCostValue = 0;
  let lowStockCount = 0;
  let archivedCount = 0;
  let featuredCount = 0;
  let hiddenCount = 0;

  for (const item of items) {
    if (item.status === 'archived') {
      archivedCount++;
      continue;
    }

    if (item.featured) featuredCount++;
    if (item.visible === false) hiddenCount++;

    if (item.type === 'product') {
      activeProducts++;
      if (item.stockTracked) {
        const qty = item.stockQty ?? 0;
        totalStockValue += item.price * qty;
        totalStockCostValue += (item.costPrice ?? item.price) * qty;

        if (isLowStock(item)) {
          lowStockCount++;
        }
      }
    } else if (item.type === 'service') {
      activeServices++;
    }
  }

  return {
    totalItems: items.length,
    activeProducts,
    activeServices,
    totalStockValue: Math.round(totalStockValue * 100) / 100,
    totalStockCostValue: Math.round(totalStockCostValue * 100) / 100,
    lowStockCount,
    archivedCount,
    totalCategories,
    featuredCount,
    hiddenCount,
  };
}

export function buildCategorySummary(categories: CatalogCategory[], items: CatalogItem[]): CategoryListResponse {
  const countMap: Record<string, number> = {};

  for (const item of items) {
    if (item.status === 'active' && item.categoryId) {
      countMap[item.categoryId] = (countMap[item.categoryId] || 0) + 1;
    }
  }

  const categoryList = categories.map((cat) => ({
    ...cat,
    itemCount: countMap[cat.id] || 0,
  }));

  return {
    categories: categoryList,
    total: categoryList.length,
  };
}

export function filterCatalogItems(items: CatalogItem[], query?: CatalogListQuery): CatalogItem[] {
  if (!query) return items;

  let result = [...items];

  // Status Filter (default to active unless specified)
  if (query.status && query.status !== 'all') {
    result = result.filter((i) => i.status === query.status);
  }

  // Type Filter
  if (query.type && query.type !== 'all') {
    result = result.filter((i) => i.type === query.type);
  }

  // Category Filter
  if (query.categoryId) {
    result = result.filter((i) => i.categoryId === query.categoryId);
  }

  // Low Stock Filter
  if (query.lowStockOnly) {
    result = result.filter((i) => isLowStock(i));
  }

  // Search Filter
  if (query.search && query.search.trim() !== '') {
    const term = query.search.trim().toLowerCase();
    result = result.filter((i) => {
      const matchName = i.name.toLowerCase().includes(term);
      const matchDesc = i.shortDescription ? i.shortDescription.toLowerCase().includes(term) : (i.description ? i.description.toLowerCase().includes(term) : false);
      const matchCode = i.itemCode.toLowerCase().includes(term);
      const matchAudience = i.targetAudience ? i.targetAudience.toLowerCase().includes(term) : false;
      const matchSku = i.sku ? i.sku.toLowerCase().includes(term) : false;
      const matchBarcode = i.barcode ? i.barcode.toLowerCase().includes(term) : false;
      const matchCat = i.categorySnapshot ? i.categorySnapshot.toLowerCase().includes(term) : false;
      const matchTags = i.tags ? i.tags.some((t) => t.toLowerCase().includes(term)) : false;
      return matchName || matchDesc || matchAudience || matchCode || matchSku || matchBarcode || matchCat || matchTags;
    });
  }

  // Sorting
  const sortBy = query.sortBy || 'createdAt';
  const sortOrder = query.sortOrder || 'desc';

  result.sort((a, b) => {
    let valA: any = a[sortBy as keyof CatalogItem];
    let valB: any = b[sortBy as keyof CatalogItem];

    if (sortBy === 'stockQty') {
      valA = a.stockQty ?? 0;
      valB = b.stockQty ?? 0;
    }

    if (typeof valA === 'string') {
      const cmp = valA.localeCompare(valB || '');
      return sortOrder === 'asc' ? cmp : -cmp;
    }

    if (typeof valA === 'number') {
      return sortOrder === 'asc' ? valA - (valB || 0) : (valB || 0) - valA;
    }

    return 0;
  });

  return result;
}
