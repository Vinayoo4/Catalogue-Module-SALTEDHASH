import React from 'react';
import { Package, Layers, AlertTriangle, DollarSign, Archive, FolderTree } from 'lucide-react';
import { CatalogSummaryResponse } from '../api/dto';

interface CatalogSummaryProps {
  summary: CatalogSummaryResponse | null;
  onFilterLowStock?: () => void;
  onFilterArchived?: () => void;
}

export const CatalogSummary: React.FC<CatalogSummaryProps> = ({ summary, onFilterLowStock, onFilterArchived }) => {
  if (!summary) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">

      {/* Total Items */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-xs">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
          <span className="text-xs font-medium">Total Items</span>
          <Package className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="text-xl font-bold text-slate-900 dark:text-slate-100">{summary.totalItems}</div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
          {summary.activeProducts} products · {summary.activeServices} services
        </div>
      </div>

      {/* Featured Items (New summary) */}
      <button
        onClick={() => {}}
        className="text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-xs transition-all hover:border-amber-400 dark:hover:border-amber-600 cursor-pointer"
      >
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
          <span className="text-xs font-medium text-amber-600 dark:text-amber-500">Featured Items</span>
          <Package className="w-4 h-4 text-amber-600 dark:text-amber-500" />
        </div>
        <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
           {summary.featuredCount || 0}
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Highlighted offerings</div>
      </button>

      {/* Hidden Items (New summary) */}
      <button
        onClick={() => {}}
        className="text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-xs transition-all hover:border-slate-400 dark:hover:border-slate-600 cursor-pointer"
      >
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
          <span className="text-xs font-medium">Hidden / Draft</span>
          <Archive className="w-4 h-4 text-slate-600 dark:text-slate-400" />
        </div>
        <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
          {summary.hiddenCount || 0}
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Not visible to public</div>
      </button>


      {/* Active Products */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-xs">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
          <span className="text-xs font-medium">Products</span>
          <Package className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="text-xl font-bold text-slate-900 dark:text-slate-100">{summary.activeProducts}</div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Sellable goods</div>
      </div>

      {/* Active Services */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-xs">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
          <span className="text-xs font-medium">Services</span>
          <Layers className="w-4 h-4 text-purple-600 dark:text-purple-400" />
        </div>
        <div className="text-xl font-bold text-slate-900 dark:text-slate-100">{summary.activeServices}</div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">No stock limit</div>
      </div>

      {/* Low Stock Warning */}
      <button
        onClick={onFilterLowStock}
        className={`text-left bg-white dark:bg-slate-900 border rounded-xl p-3.5 shadow-xs transition-all hover:border-amber-400 dark:hover:border-amber-600 cursor-pointer ${
          summary.lowStockCount > 0
            ? 'border-amber-300 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20'
            : 'border-slate-200 dark:border-slate-800'
        }`}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-amber-800 dark:text-amber-400">Low Stock</span>
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="text-xl font-bold text-slate-900 dark:text-slate-100">{summary.lowStockCount}</div>
        <div className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">
          {summary.lowStockCount > 0 ? 'Click to review' : 'All stock healthy'}
        </div>
      </button>

      {/* Stock Value */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-xs">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
          <span className="text-xs font-medium">Stock Value</span>
          <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
          ${summary.totalStockValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">At selling price</div>
      </div>

      {/* Categories & Archived */}
      <button
        onClick={onFilterArchived}
        className="text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-xs transition-all hover:border-slate-400 dark:hover:border-slate-600 cursor-pointer"
      >
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
          <span className="text-xs font-medium">Categories & Archived</span>
          <FolderTree className="w-4 h-4 text-slate-600 dark:text-slate-400" />
        </div>
        <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
          {summary.totalCategories} <span className="text-xs font-normal text-slate-400">cat</span>
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
          {summary.archivedCount} archived items
        </div>
      </button>
    </div>
  );
};
