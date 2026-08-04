import React, { useState } from 'react';
import { Package, Layers, AlertTriangle, ArrowLeft, Edit, Copy, Archive, RotateCcw, ShoppingCart, QrCode, Plus, Minus, Share2, History, DollarSign, Barcode, Tag } from 'lucide-react';
import { useCatalogDetail } from '../hooks/useCatalogDetail';
import { CatalogItem } from '../types';

interface CatalogItemDetailCardProps {
  itemId: string;
  onBack: () => void;
  onEdit: (item: CatalogItem) => void;
  onDuplicateSuccess?: (newItem: CatalogItem) => void;
  onQuickSale?: (item: CatalogItem) => void;
  onOpenQrModal?: (item: CatalogItem) => void;
}

export const CatalogItemDetailCard: React.FC<CatalogItemDetailCardProps> = ({
  itemId,
  onBack,
  onEdit,
  onDuplicateSuccess,
  onQuickSale,
  onOpenQrModal,
}) => {
  const {
    item,
    category,
    isLowStock,
    profitMarginPercent,
    adjustments,
    loading,
    error,
    archiveItem,
    restoreItem,
    duplicateItem,
    adjustStock,
  } = useCatalogDetail(itemId);

  const [stockDelta, setStockDelta] = useState<string>('1');
  const [stockReason, setStockReason] = useState<'restock' | 'manual_correction' | 'purchase' | 'sale'>('restock');
  const [stockNotes, setStockNotes] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [copiedText, setCopiedText] = useState<boolean>(false);

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center animate-pulse space-y-4">
        <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-xl mx-auto" />
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/3 mx-auto" />
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/2 mx-auto" />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center space-y-4">
        <div className="text-red-600 font-bold text-lg">{error || 'Item not found'}</div>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg font-semibold text-sm"
        >
          Return to Catalog
        </button>
      </div>
    );
  }

  const isArchived = item.status === 'archived';

  const handleStockSubmit = async (sign: number) => {
    const qty = parseInt(stockDelta, 10);
    if (isNaN(qty) || qty <= 0) return;
    try {
      setActionLoading(true);
      await adjustStock(sign * qty, stockReason, stockNotes || undefined);
      setStockNotes('');
    } catch (err) {
      console.error('Failed to adjust stock:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleArchive = async () => {
    try {
      setActionLoading(true);
      if (isArchived) {
        await restoreItem();
      } else {
        await archiveItem();
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleDuplicate = async () => {
    try {
      setActionLoading(true);
      const newItem = await duplicateItem();
      if (newItem && onDuplicateSuccess) {
        onDuplicateSuccess(newItem);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const copyShareText = () => {
    const text = `📦 ${item.name} (${item.itemCode})\nCategory: ${item.categorySnapshot || 'General'}\nPrice: $${item.price.toFixed(2)} / ${item.unit || 'unit'}\n${item.description || ''}`;
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Navigation & Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalog</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {/* Share QR */}
          {onOpenQrModal && (
            <button
              onClick={() => onOpenQrModal(item)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-emerald-600" />
              <span>QR Offering</span>
            </button>
          )}

          {/* Copy Offering Text */}
          <button
            onClick={copyShareText}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            <Share2 className="w-4 h-4 text-blue-600" />
            <span>{copiedText ? 'Copied!' : 'Copy Summary'}</span>
          </button>

          {/* Duplicate */}
          <button
            onClick={handleDuplicate}
            disabled={actionLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            <Copy className="w-4 h-4 text-purple-600" />
            <span>Duplicate</span>
          </button>

          {/* Edit */}
          <button
            onClick={() => onEdit(item)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            <Edit className="w-4 h-4" />
            <span>Edit Item</span>
          </button>

          {/* Archive / Restore */}
          <button
            onClick={handleArchive}
            disabled={actionLoading}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 border rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              isArchived
                ? 'border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                : 'border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            {isArchived ? <RotateCcw className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
            <span>{isArchived ? 'Restore Item' : 'Archive'}</span>
          </button>

          {/* Quick Sale Button */}
          {onQuickSale && !isArchived && (
            <button
              onClick={() => onQuickSale(item)}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Use in Sale</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Offering Detail Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
        {/* Banner / Title Row */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-start gap-4">
            <div className={`p-4 rounded-2xl flex-shrink-0 ${
              item.type === 'product'
                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                : 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400'
            }`}>
              {item.type === 'product' ? <Package className="w-8 h-8" /> : <Layers className="w-8 h-8" />}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="font-mono text-xs font-bold text-slate-400">{item.itemCode}</span>
                <span className="px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {item.type}
                </span>
                <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {item.categorySnapshot || category?.name || 'General'}
                </span>
                {isArchived && (
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-slate-200 text-slate-600">
                    Archived Status
                  </span>
                )}
              </div>

              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{item.name}</h1>
              {item.description && (
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 max-w-2xl">{item.description}</p>
              )}
            </div>
          </div>

          {/* Pricing Highlight Box */}
          <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-right sm:min-w-[180px]">
            <div className="text-xs text-slate-400 font-medium">Selling Price</div>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
              ${item.price.toFixed(2)}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              per {item.unit || 'unit'}
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Cost & Margin */}
          <div className="p-4 bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl">
            <div className="text-xs text-slate-400 font-medium mb-1">Cost & Profit Margin</div>
            <div className="text-base font-bold text-slate-900 dark:text-slate-100">
              {item.costPrice !== undefined ? `$${item.costPrice.toFixed(2)}` : 'N/A'}
            </div>
            {profitMarginPercent !== undefined ? (
              <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                {profitMarginPercent}% Gross Margin
              </div>
            ) : (
              <div className="text-xs text-slate-400 mt-0.5">Cost untracked</div>
            )}
          </div>

          {/* Stock Level */}
          <div className="p-4 bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl">
            <div className="text-xs text-slate-400 font-medium mb-1">Inventory Status</div>
            {item.type === 'service' ? (
              <div className="text-sm font-semibold text-purple-600 dark:text-purple-400">Unlimited Service</div>
            ) : !item.stockTracked ? (
              <div className="text-sm font-semibold text-slate-500">Stock Untracked</div>
            ) : isLowStock ? (
              <div>
                <div className="text-base font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  {item.stockQty ?? 0} {item.unit || 'pcs'}
                </div>
                <div className="text-[11px] font-medium text-amber-600 mt-0.5">Below threshold ({item.lowStockThreshold || 5})</div>
              </div>
            ) : (
              <div>
                <div className="text-base font-bold text-emerald-700 dark:text-emerald-400">
                  {item.stockQty ?? 0} {item.unit || 'pcs'}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">Threshold: {item.lowStockThreshold || 5}</div>
              </div>
            )}
          </div>

          {/* SKU / Barcode */}
          <div className="p-4 bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl">
            <div className="text-xs text-slate-400 font-medium mb-1">Identifiers</div>
            <div className="text-xs font-mono text-slate-800 dark:text-slate-200 space-y-1">
              <div>SKU: <strong className="font-bold">{item.sku || 'None'}</strong></div>
              <div>Barcode: <strong className="font-bold">{item.barcode || 'None'}</strong></div>
            </div>
          </div>

          {/* Tax & Created Date */}
          <div className="p-4 bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl">
            <div className="text-xs text-slate-400 font-medium mb-1">Tax & System Record</div>
            <div className="text-xs text-slate-800 dark:text-slate-200 font-semibold">{item.taxLabel || 'Standard (10%)'}</div>
            <div className="text-[11px] text-slate-400 mt-1">
              Added: {new Date(item.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>


        {/* Tags and Related Items */}
        <div className="flex flex-col gap-4">
          {item.tags && item.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <Tag className="w-4 h-4 text-slate-400" />
              <span className="text-xs text-slate-400">Tags:</span>
              {item.tags.map((tag, idx) => (
                <span key={idx} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-lg">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {item.relatedItemIds && item.relatedItemIds.length > 0 && (
            <div className="flex items-start gap-2 flex-wrap mt-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide mt-1">Related Offerings:</span>
              <div className="flex gap-2 flex-wrap">
                {item.relatedItemIds.map(id => (
                  <span key={id} className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50 text-xs font-semibold rounded-lg font-mono">
                    {id}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>


      {/* Stock Adjustment Panel (for tracked products) */}
      {item.type === 'product' && item.stockTracked && !isArchived && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-600" />
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Record Stock Adjustment</h3>
            </div>
            <span className="text-xs text-slate-500">
              Current Stock: <strong className="font-mono text-slate-900 dark:text-slate-100">{item.stockQty ?? 0} {item.unit || 'pcs'}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {/* Quantity */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Quantity</label>
              <input
                type="number"
                min="1"
                value={stockDelta}
                onChange={(e) => setStockDelta(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>

            {/* Reason */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Reason</label>
              <select
                value={stockReason}
                onChange={(e) => setStockReason(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none cursor-pointer"
              >
                <option value="restock">Restock / Received</option>
                <option value="manual_correction">Manual Adjustment</option>
                <option value="purchase">Supplier Purchase</option>
                <option value="sale">Manual Sale Reduction</option>
              </select>
            </div>

            {/* Notes */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Notes (Optional)</label>
              <input
                type="text"
                value={stockNotes}
                onChange={(e) => setStockNotes(e.target.value)}
                placeholder="e.g. Batch #402 shipment received"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={() => handleStockSubmit(-1)}
              disabled={actionLoading}
              className="inline-flex items-center gap-1 px-4 py-2 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 hover:bg-red-100 rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              <Minus className="w-3.5 h-3.5" />
              <span>Deduct Stock</span>
            </button>
            <button
              onClick={() => handleStockSubmit(1)}
              disabled={actionLoading}
              className="inline-flex items-center gap-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Stock</span>
            </button>
          </div>
        </div>
      )}

      {/* Stock History Timeline */}
      {item.type === 'product' && item.stockTracked && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Stock Movement Audit Trail</h3>
            </div>
            <span className="text-xs text-slate-400">{adjustments.length} records</span>
          </div>

          {adjustments.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No previous stock adjustments recorded.</p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-60 overflow-y-auto">
              {adjustments.map((adj) => (
                <div key={adj.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
                      {adj.reason.replace('_', ' ')}
                    </span>
                    {adj.notes && <span className="text-slate-400 ml-2">— {adj.notes}</span>}
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {new Date(adj.timestamp).toLocaleString()}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`font-mono font-bold text-sm ${
                      adj.changeQty > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {adj.changeQty > 0 ? `+${adj.changeQty}` : adj.changeQty} {item.unit || 'pcs'}
                    </span>
                    <div className="text-[10px] text-slate-400 font-mono">
                      New level: {adj.newStockQty}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
