import React from 'react';
import { Package, Layers, Sparkles, CheckCircle2, AlertCircle, ArrowLeft, DollarSign, Tag, Barcode, Image as ImageIcon } from 'lucide-react';
import { useCatalogForm } from '../hooks/useCatalogForm';
import { CategoryPicker } from './CategoryPicker';
import { CatalogCategory, CatalogItem } from '../types';

interface CatalogFormProps {
  initialItem?: CatalogItem | null;
  categories: CatalogCategory[];
  onSuccess: (savedItem: CatalogItem) => void;
  onCancel: () => void;
  onCreateCategory?: (name: string) => Promise<any>;
}

export const CatalogForm: React.FC<CatalogFormProps> = ({
  initialItem,
  categories,
  onSuccess,
  onCancel,
  onCreateCategory,
}) => {
  const {
    values,
    errors,
    submitting,
    serverError,
    updateField,
    submitForm,
  } = useCatalogForm(initialItem, onSuccess);

  const isEditing = Boolean(initialItem?.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitForm();
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
              {isEditing ? `Edit Offering (${initialItem?.itemCode})` : 'New Catalog Item'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Register sellable products or billable services into the Business OS catalog
            </p>
          </div>
        </div>
      </div>

      {serverError && (
        <div className="p-3.5 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-xl text-xs text-red-800 dark:text-red-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      {/* 1. Item Type Selector */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          Offering Type <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => updateField('type', 'product')}
            className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
              values.type === 'product'
                ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-500 text-blue-900 dark:text-blue-200 ring-2 ring-blue-500/20'
                : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              {values.type === 'product' && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
            </div>
            <div>
              <div className="text-sm font-bold">Product</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Physical goods, stock tracked</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => updateField('type', 'service')}
            className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
              values.type === 'service'
                ? 'bg-purple-50/70 dark:bg-purple-950/40 border-purple-500 text-purple-900 dark:text-purple-200 ring-2 ring-purple-500/20'
                : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <Layers className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              {values.type === 'service' && <CheckCircle2 className="w-4 h-4 text-purple-600" />}
            </div>
            <div>
              <div className="text-sm font-bold">Service</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Consulting, labor, retainer</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => updateField('type', 'custom')}
            className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
              values.type === 'custom'
                ? 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-500 text-amber-900 dark:text-amber-200 ring-2 ring-amber-500/20'
                : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              {values.type === 'custom' && <CheckCircle2 className="w-4 h-4 text-amber-600" />}
            </div>
            <div>
              <div className="text-sm font-bold">Custom Item</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Special packages, bundles</div>
            </div>
          </button>
        </div>
      </div>

      {/* 2. Primary Information */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Item Name */}
        <div className="sm:col-span-2 space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Item Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={values.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="e.g. Artisanal Whole Espresso Beans 500g"
            className={`w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none transition-all ${
              errors.name ? 'border-red-500 ring-2 ring-red-500/20' : 'border-slate-200 dark:border-slate-700 focus:border-emerald-600'
            }`}
          />
          {errors.name && <p className="text-xs text-red-500 font-medium">{errors.name}</p>}
        </div>

        {/* Category Picker */}
        <CategoryPicker
          categories={categories}
          value={values.categoryId}
          onChange={(catId, catName) => {
            updateField('categoryId', catId);
            updateField('categoryName', catName);
          }}
          onCreateCategory={onCreateCategory}
        />

        {/* Unit */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Unit of Measurement
          </label>
          <select
            value={values.unit}
            onChange={(e) => updateField('unit', e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none cursor-pointer"
          >
            <option value="pcs">pcs (Pieces)</option>
            <option value="bag">bag (Bags)</option>
            <option value="bottle">bottle (Bottles)</option>
            <option value="box">box (Boxes)</option>
            <option value="kg">kg (Kilograms)</option>
            <option value="hrs">hrs (Hours)</option>
            <option value="session">session (Sessions)</option>
            <option value="month">month (Monthly)</option>
            <option value="unit">unit (Units)</option>
          </select>
        </div>
      </div>

      {/* 3. Pricing & Cost Structure */}
      <div className="p-4 bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4">
        <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
          <DollarSign className="w-4 h-4 text-emerald-600" />
          <span>Pricing & Cost Margins</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Selling Price */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Selling Price ($) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={values.price}
              onChange={(e) => updateField('price', e.target.value)}
              placeholder="0.00"
              className={`w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none transition-all ${
                errors.price ? 'border-red-500 ring-2 ring-red-500/20' : 'border-slate-200 dark:border-slate-700 focus:border-emerald-600'
              }`}
            />
            {errors.price && <p className="text-xs text-red-500 font-medium">{errors.price}</p>}
          </div>

          {/* Cost Price */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Cost Price ($) <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={values.costPrice}
              onChange={(e) => updateField('costPrice', e.target.value)}
              placeholder="0.00"
              className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-600"
            />
          </div>

          {/* Tax Label */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Tax Category
            </label>
            <select
              value={values.taxLabel}
              onChange={(e) => updateField('taxLabel', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none cursor-pointer"
            >
              <option value="Standard (10%)">Standard Tax (10%)</option>
              <option value="Reduced (5%)">Reduced Tax (5%)</option>
              <option value="Zero Rated (0%)">Zero Rated (0%)</option>
              <option value="Exempt">Tax Exempt</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Inventory & Stock Controls (Conditional for Products) */}
      {values.type === 'product' && (
        <div className="p-4 bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider flex items-center gap-1.5">
                <Package className="w-4 h-4 text-amber-600" />
                <span>Inventory & Stock Tracking</span>
              </h3>
              <p className="text-[11px] text-amber-700/80 dark:text-amber-400 mt-0.5">
                Automatically reduce stock when sales are completed in Sales module
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={values.stockTracked}
                onChange={(e) => updateField('stockTracked', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:after:border-slate-600 peer-checked:bg-amber-600"></div>
            </label>
          </div>

          {values.stockTracked && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Current Stock Quantity ({values.unit || 'pcs'})
                </label>
                <input
                  type="number"
                  min="0"
                  value={values.stockQty}
                  onChange={(e) => updateField('stockQty', e.target.value)}
                  className={`w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border rounded-xl text-sm font-bold text-slate-900 dark:text-slate-100 focus:outline-none ${
                    errors.stockQty ? 'border-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-amber-600'
                  }`}
                />
                {errors.stockQty && <p className="text-xs text-red-500 font-medium">{errors.stockQty}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Low Stock Threshold Alert
                </label>
                <input
                  type="number"
                  min="0"
                  value={values.lowStockThreshold}
                  onChange={(e) => updateField('lowStockThreshold', e.target.value)}
                  placeholder="5"
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-600"
                />
                <p className="text-[11px] text-slate-400">Triggers low stock badge when quantity falls to or below this level</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. Identifiers, Image & Tags */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* SKU */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
            <Barcode className="w-3.5 h-3.5 text-slate-400" />
            <span>SKU Code</span>
          </label>
          <input
            type="text"
            value={values.sku}
            onChange={(e) => updateField('sku', e.target.value)}
            placeholder="e.g. COFF-AR-500"
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
          />
        </div>

        {/* Barcode */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
            <Barcode className="w-3.5 h-3.5 text-slate-400" />
            <span>Barcode Number</span>
          </label>
          <input
            type="text"
            value={values.barcode}
            onChange={(e) => updateField('barcode', e.target.value)}
            placeholder="e.g. 8901234567891"
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
          />
        </div>

        {/* Image URL */}
        <div className="sm:col-span-2 space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
            <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
            <span>Image URL</span>
          </label>
          <input
            type="text"
            value={values.imageUrl}
            onChange={(e) => updateField('imageUrl', e.target.value)}
            placeholder="https://images.unsplash.com/photo-..."
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-600"
          />
        </div>


        {/* NEW CATALOGUE FIELDS */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Slug
          </label>
          <input
            type="text"
            value={values.slug}
            onChange={(e) => updateField('slug', e.target.value)}
            placeholder="Auto-generated if empty"
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Short Description
          </label>
          <input
            type="text"
            value={values.shortDescription}
            onChange={(e) => updateField('shortDescription', e.target.value)}
            placeholder="Brief summary..."
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
          />
        </div>

        <div className="sm:col-span-2 space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Long Description
          </label>
          <textarea
            rows={4}
            value={values.longDescription}
            onChange={(e) => updateField('longDescription', e.target.value)}
            placeholder="Detailed description..."
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-600"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Target Audience
          </label>
          <input
            type="text"
            value={values.targetAudience}
            onChange={(e) => updateField('targetAudience', e.target.value)}
            placeholder="e.g. Enterprise, Small Business"
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Pricing Model
          </label>
          <select
            value={values.pricingModel}
            onChange={(e) => updateField('pricingModel', e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none cursor-pointer"
          >
            <option value="Fixed">Fixed</option>
            <option value="Subscription">Subscription</option>
            <option value="Tiered">Tiered</option>
            <option value="Custom">Custom Quote</option>
          </select>
        </div>

        <div className="flex gap-4 sm:col-span-2">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={values.visible}
              onChange={(e) => updateField('visible', e.target.checked)}
              className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-600"
            />
            Visible in Catalogue
          </label>

          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={values.featured}
              onChange={(e) => updateField('featured', e.target.checked)}
              className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-600"
            />
            Featured Item
          </label>
        </div>


        {/* Description (Legacy) */}
        <div className="sm:col-span-2 space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Item Description
          </label>
          <textarea
            rows={3}
            value={values.description}
            onChange={(e) => updateField('description', e.target.value)}
            placeholder="Describe product highlights, origin, or service scope..."
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-600"
          />
        </div>

        {/* Tags */}
        <div className="sm:col-span-2 space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
            <Tag className="w-3.5 h-3.5 text-slate-400" />
            <span>Search Tags <span className="text-slate-400 font-normal">(Comma separated)</span></span>
          </label>
          <input
            type="text"
            value={values.tagsInput}
            onChange={(e) => updateField('tagsInput', e.target.value)}
            placeholder="bestseller, roasted, organic, hardware"
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
          />
        </div>
      </div>


      {/* 6. Related Items */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
          <Tag className="w-4 h-4 text-slate-500" />
          <span>Related Offerings</span>
        </h3>
        <p className="text-xs text-slate-500 mb-2">Enter comma-separated IDs of related items.</p>
        <input
            type="text"
            value={(values.relatedItemIds || []).join(', ')}
            onChange={(e) => {
              const ids = e.target.value.split(',').map(id => id.trim()).filter(id => id && id !== values.id);
              updateField('relatedItemIds', Array.from(new Set(ids))); // remove dupes
            }}
            placeholder="item-123, item-456"
            className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
        />
      </div>


      {/* Form Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-sm transition-all cursor-pointer"
        >
          {submitting ? 'Saving Offering...' : isEditing ? 'Update Offering' : 'Create Catalog Item'}
        </button>
      </div>
    </form>
  );
};
