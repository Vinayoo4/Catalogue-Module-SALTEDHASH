import React from 'react';
import { Package, Plus, Sparkles, Layers, DollarSign } from 'lucide-react';

interface EmptyCatalogStateProps {
  onCreateFirst: () => void;
  onSeedDemoData: () => void;
}

export const EmptyCatalogState: React.FC<EmptyCatalogStateProps> = ({
  onCreateFirst,
  onSeedDemoData,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 sm:p-12 text-center max-w-xl mx-auto my-8 shadow-xs space-y-6">
      <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 rounded-2xl mx-auto flex items-center justify-center shadow-xs">
        <Package className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
          Your Offering Catalog is Empty
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
          The Catalog is the master registry of product offerings and billable services in SALTEDHASH Business OS. Add your offerings to streamline sales and track inventory.
        </p>
      </div>

      {/* Feature highlights */}
      <div className="grid grid-cols-3 gap-3 text-left py-2 border-y border-slate-100 dark:border-slate-800">
        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
          <Package className="w-4 h-4 text-blue-600 mb-1" />
          <div className="text-xs font-bold text-slate-900 dark:text-slate-100">Products</div>
          <div className="text-[10px] text-slate-500">Track stock & SKUs</div>
        </div>
        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
          <Layers className="w-4 h-4 text-purple-600 mb-1" />
          <div className="text-xs font-bold text-slate-900 dark:text-slate-100">Services</div>
          <div className="text-[10px] text-slate-500">Consulting & labor</div>
        </div>
        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
          <DollarSign className="w-4 h-4 text-emerald-600 mb-1" />
          <div className="text-xs font-bold text-slate-900 dark:text-slate-100">Sales Feed</div>
          <div className="text-[10px] text-slate-500">Instant POS picker</div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <button
          onClick={onCreateFirst}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-all shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add First Catalog Item</span>
        </button>

        <button
          onClick={onSeedDemoData}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 font-semibold text-sm rounded-xl transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Seed Sample Catalog Data</span>
        </button>
      </div>
    </div>
  );
};
