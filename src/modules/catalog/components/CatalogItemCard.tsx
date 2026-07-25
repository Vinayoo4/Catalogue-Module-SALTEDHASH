import React from 'react';
import { Package, Layers, AlertTriangle, Copy, Archive, ShoppingCart, Plus, Minus, Tag, QrCode } from 'lucide-react';
import { calculateProfitMargin, isLowStock } from '../services/catalogDomain';
import { CatalogItem } from '../types';

interface CatalogItemCardProps {
  item: CatalogItem;
  viewMode?: 'grid' | 'table';
  onSelect: (id: string) => void;
  onEdit: (item: CatalogItem) => void;
  onArchive: (id: string) => void;
  onRestore?: (id: string) => void;
  onDuplicate: (id: string) => void;
  onAdjustStock?: (id: string, delta: number) => void;
  onQuickSale?: (item: CatalogItem) => void;
  onShareQr?: (item: CatalogItem) => void;
}

export const CatalogItemCard: React.FC<CatalogItemCardProps> = ({
  item,
  viewMode = 'grid',
  onSelect,
  onEdit,
  onArchive,
  onRestore,
  onDuplicate,
  onAdjustStock,
  onQuickSale,
  onShareQr,
}) => {
  const lowStock = isLowStock(item);
  const margin = calculateProfitMargin(item.price, item.costPrice);
  const isArchived = item.status === 'archived';

  if (viewMode === 'table') {
    return (
      <tr className={`border-b border-slate-100 dark:border-slate-800/80 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors ${isArchived ? 'opacity-60 bg-slate-50/50 dark:bg-slate-900/40' : ''}`}>
        {/* Item Name & Code */}
        <td className="py-3 px-4">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-lg flex-shrink-0 ${
              item.type === 'product'
                ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400'
                : 'bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400'
            }`}>
              {item.type === 'product' ? <Package className="w-4 h-4" /> : <Layers className="w-4 h-4" />}
            </div>
            <div>
              <button
                onClick={() => onSelect(item.id)}
                className="font-semibold text-slate-900 dark:text-slate-100 hover:text-emerald-600 dark:hover:text-emerald-400 text-sm text-left transition-colors cursor-pointer"
              >
                {item.name}
              </button>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <span className="font-mono">{item.itemCode}</span>
                {item.sku && <span>· SKU: {item.sku}</span>}
              </div>
            </div>
          </div>
        </td>

        {/* Category & Type */}
        <td className="py-3 px-4 text-xs">
          <span className="inline-flex items-center px-2 py-0.5 rounded-md font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {item.categorySnapshot || 'General'}
          </span>
        </td>

        {/* Price & Margin */}
        <td className="py-3 px-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
          ${item.price.toFixed(2)}
          <span className="text-xs font-normal text-slate-400 ml-1">/ {item.unit || 'item'}</span>
          {margin !== undefined && (
            <div className="text-[11px] font-normal text-emerald-600 dark:text-emerald-400">
              {margin}% margin
            </div>
          )}
        </td>

        {/* Stock Status */}
        <td className="py-3 px-4 text-xs">
          {item.type === 'service' ? (
            <span className="text-slate-400 italic">Service (Unlimited)</span>
          ) : !item.stockTracked ? (
            <span className="text-slate-400">Untracked</span>
          ) : lowStock ? (
            <span className="inline-flex items-center gap-1 font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-md">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              {item.stockQty ?? 0} {item.unit || 'pcs'} (Low)
            </span>
          ) : (
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {item.stockQty ?? 0} {item.unit || 'pcs'}
            </span>
          )}
        </td>

        {/* Actions */}
        <td className="py-3 px-4 text-right">
          <div className="flex items-center justify-end gap-1">
            {item.type === 'product' && item.stockTracked && onAdjustStock && !isArchived && (
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 mr-1 border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => onAdjustStock(item.id, -1)}
                  className="p-1 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white rounded"
                  title="Quick Decrement"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onAdjustStock(item.id, 1)}
                  className="p-1 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white rounded"
                  title="Quick Increment"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {onQuickSale && !isArchived && (
              <button
                onClick={() => onQuickSale(item)}
                className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-lg transition-colors"
                title="Select in Sale"
              >
                <ShoppingCart className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => onSelect(item.id)}
              className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg transition-colors"
              title="View Detail"
            >
              View
            </button>
          </div>
        </td>
      </tr>
    );
  }

  // Grid Card View
  return (
    <div
      className={`bg-white dark:bg-slate-900 border rounded-xl p-4 shadow-xs transition-all flex flex-col justify-between relative group ${
        isArchived
          ? 'border-slate-200 dark:border-slate-800/60 opacity-60 bg-slate-50/50 dark:bg-slate-900/40'
          : lowStock
          ? 'border-amber-300 dark:border-amber-900/80 hover:border-amber-400'
          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      {/* Header Info */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          {/* Type Badge & Category */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold tracking-wide uppercase ${
                item.type === 'product'
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60'
                  : item.type === 'service'
                  ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              {item.type === 'product' ? <Package className="w-3 h-3" /> : <Layers className="w-3 h-3" />}
              {item.type}
            </span>

            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
              {item.categorySnapshot || 'General'}
            </span>

            {isArchived && (
              <span className="text-[11px] font-semibold text-slate-500 bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-md">
                Archived
              </span>
            )}
          </div>

          {/* Item Code */}
          <span className="text-xs font-mono font-medium text-slate-400">{item.itemCode}</span>
        </div>

        {/* Item Title */}
        <h3
          onClick={() => onSelect(item.id)}
          className="font-bold text-slate-900 dark:text-slate-100 hover:text-emerald-600 dark:hover:text-emerald-400 text-base leading-snug cursor-pointer mb-1 transition-colors line-clamp-2"
        >
          {item.name}
        </h3>

        {/* Description snippet if present */}
        {item.description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
            {item.description}
          </p>
        )}

        {/* SKU / Barcode tags */}
        {(item.sku || item.barcode) && (
          <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-3">
            {item.sku && <span>SKU: <strong className="font-mono text-slate-600 dark:text-slate-300">{item.sku}</strong></span>}
            {item.barcode && <span>Barcode: <strong className="font-mono text-slate-600 dark:text-slate-300">{item.barcode}</strong></span>}
          </div>
        )}
      </div>

      {/* Footer Details & Action Bar */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 mt-2">
        <div className="flex items-center justify-between mb-3">
          {/* Price */}
          <div>
            <div className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
              ${item.price.toFixed(2)}
              <span className="text-xs font-normal text-slate-400 ml-1">/ {item.unit || 'unit'}</span>
            </div>
            {margin !== undefined && (
              <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                Cost: ${item.costPrice?.toFixed(2)} ({margin}% margin)
              </div>
            )}
          </div>

          {/* Stock Level Badge */}
          <div>
            {item.type === 'service' ? (
              <span className="text-xs text-slate-400 font-medium">Service (Unlimited)</span>
            ) : !item.stockTracked ? (
              <span className="text-xs text-slate-400 font-medium">Stock Untracked</span>
            ) : lowStock ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                {item.stockQty ?? 0} {item.unit || 'pcs'}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                {item.stockQty ?? 0} {item.unit || 'pcs'} in stock
              </span>
            )}
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center justify-between gap-1.5 pt-1">
          {/* Stock Quick Adjustment */}
          {item.type === 'product' && item.stockTracked && onAdjustStock && !isArchived ? (
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => onAdjustStock(item.id, -1)}
                className="p-1 hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded transition-all cursor-pointer"
                title="Subtract 1 stock"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-mono font-bold px-1 text-slate-800 dark:text-slate-100">
                {item.stockQty ?? 0}
              </span>
              <button
                type="button"
                onClick={() => onAdjustStock(item.id, 1)}
                className="p-1 hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded transition-all cursor-pointer"
                title="Add 1 stock"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-1">
            {/* Quick Share QR */}
            {onShareQr && (
              <button
                type="button"
                onClick={() => onShareQr(item)}
                className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
                title="QR / Share Offering"
              >
                <QrCode className="w-4 h-4" />
              </button>
            )}

            {/* Quick Duplicate */}
            <button
              type="button"
              onClick={() => onDuplicate(item.id)}
              className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
              title="Duplicate Item"
            >
              <Copy className="w-4 h-4" />
            </button>

            {/* Quick Sale / Use in Sale */}
            {onQuickSale && !isArchived && (
              <button
                type="button"
                onClick={() => onQuickSale(item)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition-colors shadow-xs cursor-pointer"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Sell</span>
              </button>
            )}

            {/* View Full Detail Button */}
            <button
              type="button"
              onClick={() => onSelect(item.id)}
              className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              View
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
