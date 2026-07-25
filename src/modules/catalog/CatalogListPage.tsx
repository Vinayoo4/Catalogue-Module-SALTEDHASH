import React, { useState } from 'react';
import { Plus, FolderTree, ShoppingCart, Terminal, Sparkles, ShieldCheck, RefreshCw, Package } from 'lucide-react';
import { useCatalogList } from './hooks/useCatalogList';
import { CatalogSummary } from './components/CatalogSummary';
import { CatalogFilters } from './components/CatalogFilters';
import { CatalogItemCard } from './components/CatalogItemCard';
import { EmptyCatalogState } from './components/EmptyCatalogState';
import { CategoryManager } from './components/CategoryManager';
import { SalesQuickPicker } from './components/SalesQuickPicker';
import { ApiContractTester } from './components/ApiContractTester';
import { CatalogTestRunner } from './components/CatalogTestRunner';
import { QrShareModal } from './components/QrShareModal';
import { CatalogRepository } from './services/catalogRepository';
import { CatalogItem } from './types';

interface CatalogListPageProps {
  onNavigateNew: () => void;
  onNavigateDetail: (id: string) => void;
  onNavigateEdit: (item: CatalogItem) => void;
}

export const CatalogListPage: React.FC<CatalogListPageProps> = ({
  onNavigateNew,
  onNavigateDetail,
  onNavigateEdit,
}) => {
  const {
    items,
    summary,
    categories,
    query,
    loading,
    error,
    refetch,
    updateQuery,
    resetFilters,
    archiveItem,
    restoreItem,
    duplicateItem,
    adjustStock,
  } = useCatalogList();

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [activeTab, setActiveTab] = useState<'catalog' | 'categories' | 'sales_simulator' | 'api_console' | 'tests'>('catalog');
  const [qrItem, setQrItem] = useState<CatalogItem | null>(null);

  const handleResetDemoData = async () => {
    if (confirm('Reset catalog to sample demo data? This will restore initial products & categories.')) {
      await CatalogRepository.resetToDemoData();
      await refetch();
    }
  };

  const handleCategoryCreate = async (name: string) => {
    const res = await CatalogRepository.createCategory(name);
    await refetch();
    return res;
  };

  const handleCategoryUpdate = async (id: string, name: string) => {
    const res = await CatalogRepository.updateCategory(id, name);
    await refetch();
    return res;
  };

  const handleCategoryDelete = async (id: string) => {
    const res = await CatalogRepository.deleteCategory(id);
    await refetch();
    return res;
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Navigation Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-md uppercase border border-emerald-200 dark:border-emerald-800">
              SALTEDHASH Business OS
            </span>
            <span className="text-xs text-slate-400">· Module 5</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight mt-1">
            Master Offering Catalog
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Local-first product & service registry with internal API contracts, pricing, and stock tracking
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onNavigateNew}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Offering</span>
          </button>

          <button
            onClick={handleResetDemoData}
            className="p-2.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            title="Reset to Sample Demo Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Module View Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-100 dark:border-slate-800 text-xs sm:text-sm font-semibold">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer flex-shrink-0 ${
            activeTab === 'catalog'
              ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Package className="w-4 h-4 text-emerald-500" />
          <span>Catalog Offerings</span>
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer flex-shrink-0 ${
            activeTab === 'categories'
              ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FolderTree className="w-4 h-4 text-blue-500" />
          <span>Categories</span>
        </button>

        <button
          onClick={() => setActiveTab('sales_simulator')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer flex-shrink-0 ${
            activeTab === 'sales_simulator'
              ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ShoppingCart className="w-4 h-4 text-purple-500" />
          <span>Sales Integration</span>
        </button>

        <button
          onClick={() => setActiveTab('api_console')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer flex-shrink-0 ${
            activeTab === 'api_console'
              ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Terminal className="w-4 h-4 text-amber-500" />
          <span>API Console</span>
        </button>

        <button
          onClick={() => setActiveTab('tests')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer flex-shrink-0 ${
            activeTab === 'tests'
              ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Automated Tests</span>
        </button>
      </div>

      {/* TAB CONTENT 1: Primary Catalog View */}
      {activeTab === 'catalog' && (
        <div className="space-y-6">
          {/* Summary Stats Cards */}
          <CatalogSummary
            summary={summary}
            onFilterLowStock={() => updateQuery({ lowStockOnly: true })}
            onFilterArchived={() => updateQuery({ status: 'archived' })}
          />

          {/* Filters & Control Bar */}
          <CatalogFilters
            query={query}
            categories={categories}
            onUpdateQuery={updateQuery}
            onResetFilters={resetFilters}
            viewMode={viewMode}
            onToggleViewMode={setViewMode}
          />

          {/* Catalog Listing */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 h-44 animate-pulse space-y-3">
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
                  <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-2xl p-6 text-center text-red-800 dark:text-red-300">
              Error loading catalog: {error}
            </div>
          ) : items.length === 0 ? (
            <EmptyCatalogState
              onCreateFirst={onNavigateNew}
              onSeedDemoData={handleResetDemoData}
            />
          ) : viewMode === 'table' ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-x-auto shadow-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Offering</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Stock Level</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <CatalogItemCard
                      key={item.id}
                      item={item}
                      viewMode="table"
                      onSelect={onNavigateDetail}
                      onEdit={onNavigateEdit}
                      onArchive={archiveItem}
                      onRestore={restoreItem}
                      onDuplicate={duplicateItem}
                      onAdjustStock={(id, delta) => adjustStock(id, delta, 'manual_correction', 'Quick table adjustment')}
                      onQuickSale={() => setActiveTab('sales_simulator')}
                      onShareQr={setQrItem}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((item) => (
                <CatalogItemCard
                  key={item.id}
                  item={item}
                  viewMode="grid"
                  onSelect={onNavigateDetail}
                  onEdit={onNavigateEdit}
                  onArchive={archiveItem}
                  onRestore={restoreItem}
                  onDuplicate={duplicateItem}
                  onAdjustStock={(id, delta) => adjustStock(id, delta, 'manual_correction', 'Quick card adjustment')}
                  onQuickSale={() => setActiveTab('sales_simulator')}
                  onShareQr={setQrItem}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 2: Category Manager */}
      {activeTab === 'categories' && (
        <CategoryManager
          categories={categories}
          onCreateCategory={handleCategoryCreate}
          onUpdateCategory={handleCategoryUpdate}
          onDeleteCategory={handleCategoryDelete}
        />
      )}

      {/* TAB CONTENT 3: Sales Integration Simulator */}
      {activeTab === 'sales_simulator' && <SalesQuickPicker />}

      {/* TAB CONTENT 4: API Console */}
      {activeTab === 'api_console' && <ApiContractTester />}

      {/* TAB CONTENT 5: Automated Tests */}
      {activeTab === 'tests' && <CatalogTestRunner />}

      {/* QR Share Modal */}
      <QrShareModal item={qrItem} onClose={() => setQrItem(null)} />
    </div>
  );
};
