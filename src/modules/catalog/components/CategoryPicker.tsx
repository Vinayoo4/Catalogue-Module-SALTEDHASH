import React, { useState } from 'react';
import { Plus, Check, FolderTree } from 'lucide-react';
import { CatalogCategory } from '../types';

interface CategoryPickerProps {
  categories: CatalogCategory[];
  value?: string;
  onChange: (categoryId: string, categoryName: string) => void;
  onCreateCategory?: (name: string) => Promise<any>;
}

export const CategoryPicker: React.FC<CategoryPickerProps> = ({
  categories,
  value,
  onChange,
  onCreateCategory,
}) => {
  const [creating, setCreating] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!newCatName.trim() || !onCreateCategory) return;
    try {
      setLoading(true);
      const res = await onCreateCategory(newCatName.trim());
      const cat = res.category || res;
      onChange(cat.id, cat.name);
      setNewCatName('');
      setCreating(false);
    } catch (err) {
      console.error('Failed to create category from picker:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          Category
        </label>
        {onCreateCategory && !creating && (
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Category</span>
          </button>
        )}
      </div>

      {creating ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            placeholder="Enter new category name..."
            className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-emerald-500 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
            autoFocus
          />
          <button
            type="button"
            onClick={handleCreate}
            disabled={loading || !newCatName.trim()}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => setCreating(false)}
            className="px-2.5 py-1.5 text-slate-400 hover:text-slate-600 text-xs"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="relative">
          <select
            value={value || ''}
            onChange={(e) => {
              const selectedId = e.target.value;
              const catObj = categories.find((c) => c.id === selectedId);
              onChange(selectedId, catObj ? catObj.name : '');
            }}
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 cursor-pointer"
          >
            <option value="">Select a category...</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name} {cat.isSystem ? '(System)' : ''}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};
