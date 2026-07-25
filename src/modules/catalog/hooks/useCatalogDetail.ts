import { useCallback, useEffect, useState } from 'react';
import { catalogAdapter } from '../api/adapters';
import { CatalogItemDetailResponse } from '../api/dto';
import { CatalogRepository } from '../services/catalogRepository';
import { StockAdjustment } from '../types';

export function useCatalogDetail(itemId: string | null) {
  const [detail, setDetail] = useState<CatalogItemDetailResponse | null>(null);
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!itemId) {
      setDetail(null);
      setAdjustments([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await catalogAdapter.getCatalogItemById(itemId);
      setDetail(res);

      if (res.item.type === 'product' && res.item.stockTracked) {
        const history = await CatalogRepository.getStockAdjustments(itemId);
        setAdjustments(history);
      }
    } catch (err: any) {
      console.error(`Failed to fetch catalog item ${itemId}:`, err);
      setError(err.message || 'Failed to load catalog item detail.');
    } finally {
      setLoading(false);
    }
  }, [itemId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const archiveItem = async () => {
    if (!itemId) return;
    try {
      await catalogAdapter.archiveCatalogItem(itemId);
      await fetchDetail();
    } catch (err: any) {
      setError(err.message || 'Failed to archive item.');
      throw err;
    }
  };

  const restoreItem = async () => {
    if (!itemId) return;
    try {
      await catalogAdapter.restoreCatalogItem(itemId);
      await fetchDetail();
    } catch (err: any) {
      setError(err.message || 'Failed to restore item.');
      throw err;
    }
  };

  const duplicateItem = async () => {
    if (!itemId) return null;
    try {
      const res = await catalogAdapter.duplicateCatalogItem(itemId);
      return res.newItem;
    } catch (err: any) {
      setError(err.message || 'Failed to duplicate item.');
      throw err;
    }
  };

  const adjustStock = async (changeQty: number, reason: 'sale' | 'purchase' | 'manual_correction' | 'restock', notes?: string) => {
    if (!itemId) return;
    try {
      await catalogAdapter.adjustStock({ itemId, changeQty, reason, notes });
      await fetchDetail();
    } catch (err: any) {
      setError(err.message || 'Failed to adjust stock.');
      throw err;
    }
  };

  return {
    detail,
    item: detail?.item,
    category: detail?.category,
    isLowStock: detail?.isLowStock ?? false,
    profitMarginPercent: detail?.profitMarginPercent,
    adjustments,
    loading,
    error,
    refetch: fetchDetail,
    archiveItem,
    restoreItem,
    duplicateItem,
    adjustStock,
  };
}
