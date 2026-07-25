import React, { useState } from 'react';
import { FolderTree, Plus, Edit2, Trash2, Check, X, ShieldAlert, Package } from 'lucide-react';
import { CatalogCategory } from '../types';

interface CategoryManagerProps {
  categories: (CatalogCategory & { itemCount: number })[];
  onCreateCategory: (name: string) => Promise<any>;
  onUpdateCategory: (id: string, name: string) => Promise<any>;
  onDeleteCategory: (id: string) => Promise<any>;
  onClose?: () => void;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({
  categories,
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory,
  onClose,
}) => {
  const [newCatName, setNewCatName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    try {
      setLoading(true);
      setError(null);
      await onCreateCategory(newCatName.trim());
      setNewCatName('');
    } catch (err: any) {
      setError(err.message || 'Failed to create category.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async (id: string) => {
    if (!editName.trim()) return;

    try {
      setLoading(true);
      setError(null);
      await onUpdateCategory(id, editName.trim());
      setEditingId(null);
    } catch (err: any) {
      setError(err.message || 'Failed to rename category.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete category '${name}'? Any assigned items will be moved to General.`)) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await onDeleteCategory(id);
      if (!res.success) {
        setError(res.message);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete category.');
    } finally {
      setLoading(false);
    }
  };

  return {
    render: (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs max-w-2xl mx-auto">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 rounded-lg">
              <FolderTree className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Category Registry</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Organize catalog offerings for fast filtering and sales picking
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-800 dark:text-red-300 rounded-lg text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 flex-shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Add New Category Form */}
        <form onSubmit={handleAdd} className="flex gap-2 mb-6">
          <input
            type="text"
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            placeholder="New category name (e.g. Hardware, Bakery, Subscription)..."
            className="flex-1 px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
          <button
            type="submit"
            disabled={loading || !newCatName.trim()}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        </form>

        {/* Categories List */}
        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
          {categories.map((cat) => {
            const isEditing = editingId === cat.id;

            return (
              <div
                key={cat.id}
                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-lg"
              >
                {isEditing ? (
                  <div className="flex items-center gap-2 flex-1 mr-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 px-3 py-1 bg-white dark:bg-slate-900 border border-emerald-500 rounded-md text-sm text-slate-900 dark:text-slate-100 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(cat.id)}
                      className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-md"
                      title="Save"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md"
                      title="Cancel"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                      {cat.name}
                    </span>
                    {cat.isSystem ? (
                      <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded uppercase tracking-wider border border-blue-200/50 dark:border-blue-900/50">
                        System
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-slate-500 bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded">
                        Custom
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                    <Package className="w-3.5 h-3.5" />
                    <strong>{cat.itemCount}</strong> items
                  </span>

                  {!isEditing && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(cat.id);
                          setEditName(cat.name);
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-md transition-colors"
                        title="Rename Category"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {!cat.isSystem && (
                        <button
                          type="button"
                          onClick={() => handleDelete(cat.id, cat.name)}
                          className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-md transition-colors"
                          title="Delete Category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    ),
  }.render;
};
