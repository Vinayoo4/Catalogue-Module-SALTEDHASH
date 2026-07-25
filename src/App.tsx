import React, { useEffect, useState } from 'react';
import { CatalogListPage } from './modules/catalog/CatalogListPage';
import { NewCatalogItemPage } from './modules/catalog/NewCatalogItemPage';
import { CatalogItemDetailPage } from './modules/catalog/CatalogItemDetailPage';
import { CatalogItem } from './modules/catalog/types';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<string>('list');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);

  // Sync state with URL hash for clean offline route bookmarking
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash.startsWith('/catalog/new')) {
        setCurrentRoute('new');
        setEditingItem(null);
      } else if (hash.startsWith('/catalog/') && hash.endsWith('/edit')) {
        setCurrentRoute('edit');
      } else if (hash.startsWith('/catalog/')) {
        const id = hash.replace('/catalog/', '');
        if (id) {
          setSelectedItemId(id);
          setCurrentRoute('detail');
        }
      } else {
        setCurrentRoute('list');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateToList = () => {
    window.location.hash = '/catalog';
    setCurrentRoute('list');
    setSelectedItemId(null);
    setEditingItem(null);
  };

  const navigateToNew = () => {
    setEditingItem(null);
    window.location.hash = '/catalog/new';
    setCurrentRoute('new');
  };

  const navigateToDetail = (id: string) => {
    setSelectedItemId(id);
    window.location.hash = `/catalog/${id}`;
    setCurrentRoute('detail');
  };

  const navigateToEdit = (item: CatalogItem) => {
    setEditingItem(item);
    window.location.hash = `/catalog/${item.id}/edit`;
    setCurrentRoute('edit');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-emerald-500 selection:text-white">
      {/* Top App Header */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div
            onClick={navigateToList}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl flex items-center justify-center font-extrabold text-sm tracking-tighter shadow-sm group-hover:scale-105 transition-transform">
              SH
            </div>
            <div>
              <span className="font-black text-slate-900 dark:text-slate-100 text-base tracking-tight flex items-center gap-1.5">
                SALTEDHASH
                <span className="text-[10px] font-mono font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                  Business OS
                </span>
              </span>
              <div className="text-[11px] text-slate-400 -mt-0.5">
                Module 5 · Catalog & Offering Registry
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Local-First Offline Active
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentRoute === 'new' && (
          <NewCatalogItemPage
            initialItem={null}
            onSuccess={(saved) => navigateToDetail(saved.id)}
            onCancel={navigateToList}
          />
        )}

        {currentRoute === 'edit' && editingItem && (
          <NewCatalogItemPage
            initialItem={editingItem}
            onSuccess={(saved) => navigateToDetail(saved.id)}
            onCancel={navigateToList}
          />
        )}

        {currentRoute === 'detail' && selectedItemId && (
          <CatalogItemDetailPage
            itemId={selectedItemId}
            onBack={navigateToList}
            onEdit={(item) => navigateToEdit(item)}
            onDuplicateSuccess={(newItem) => navigateToDetail(newItem.id)}
            onQuickSale={() => navigateToList()}
          />
        )}

        {currentRoute === 'list' && (
          <CatalogListPage
            onNavigateNew={navigateToNew}
            onNavigateDetail={navigateToDetail}
            onNavigateEdit={navigateToEdit}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 mt-12 py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>SALTEDHASH Business OS — Module 5 (Catalog Registry)</div>
          <div>API Contract Packaging & Dexie.js Offline Persistence</div>
        </div>
      </footer>
    </div>
  );
}
