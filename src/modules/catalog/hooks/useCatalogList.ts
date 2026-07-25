import { useCallback, useEffect, useState } from 'react';
import { catalogAdapter } from '../api/adapters';
import { CatalogListQuery, CatalogListResponse, CatalogSummaryResponse, CategoryListResponse } from '../api/dto';
import { CatalogItem } from '../types';

export function useCatalogList(initialQuery?: CatalogListQuery) {
  const [query, setQuery] = useState<CatalogListQuery>({
    status: 'active',
    type: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,
    limit: 50,
    ...initialQuery,
  });

  const [data, setData] = useState<CatalogListResponse | null>(null);
  const [summary, setSummary] = useState<CatalogSummaryResponse | null>(null);
  const [categoriesData, setCategoriesData] = useState<CategoryListResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCatalog = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [listRes, summaryRes, categoriesRes] = await Promise.all([
        catalogAdapter.getCatalogItems(query),
        catalogAdapter.getCatalogSummary(),
        catalogAdapter.getCatalogCategories(),
      ]);
      setData(listRes);
      setSummary(summaryRes);
      setCategoriesData(categoriesRes);
    } catch (err: any) {
      console.error('Failed to load catalog list:', err);
      setError(err.message || 'An error occurred while loading catalog data.');
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  const updateQuery = (newParams: Partial<CatalogListQuery>) => {
    setQuery((prev) => ({ ...prev, ...newParams, page: newParams.page ?? 1 }));
  };

  const resetFilters = () => {
    setQuery({
      status: 'active',
      type: 'all',
      search: '',
      categoryId: undefined,
      lowStockOnly: false,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      page: 1,
      limit: 50,
    });
  };

  const archiveItem = async (id: string) => {
    try {
      await catalogAdapter.archiveCatalogItem(id);
      await fetchCatalog();
    } catch (err: any) {
      setError(err.message || 'Failed to archive item.');
      throw err;
    }
  };

  const restoreItem = async (id: string) => {
    try {
      await catalogAdapter.restoreCatalogItem(id);
      await fetchCatalog();
    } catch (err: any) {
      setError(err.message || 'Failed to restore item.');
      throw err;
    }
  };

  const duplicateItem = async (id: string): Promise<CatalogItem> => {
    try {
      const res = await catalogAdapter.duplicateCatalogItem(id);
      await fetchCatalog();
      return res.newItem;
    } catch (err: any) {
      setError(err.message || 'Failed to duplicate item.');
      throw err;
    }
  };

  const adjustStock = async (itemId: string, changeQty: number, reason: 'sale' | 'purchase' | 'manual_correction' | 'restock', notes?: string) => {
    try {
      await catalogAdapter.adjustStock({ itemId, changeQty, reason, notes });
      await fetchCatalog();
    } catch (err: any) {
      setError(err.message || 'Failed to adjust stock.');
      throw err;
    }
  };

  return {
    items: data?.items || [],
    total: data?.total || 0,
    listSummary: data?.summary,
    summary,
    categories: categoriesData?.categories || [],
    query,
    loading,
    error,
    refetch: fetchCatalog,
    updateQuery,
    resetFilters,
    archiveItem,
    restoreItem,
    duplicateItem,
    adjustStock,
  };
}
