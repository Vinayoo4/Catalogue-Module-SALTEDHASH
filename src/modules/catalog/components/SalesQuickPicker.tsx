import React, { useEffect, useState } from 'react';
import { ShoppingCart, Search, Plus, Minus, Check, Package, Layers, AlertTriangle, Trash2, CheckCircle } from 'lucide-react';
import { catalogAdapter } from '../api/adapters';
import { CatalogCategory, CatalogItem } from '../types';

interface CartLineItem {
  item: CatalogItem;
  quantity: number;
}

export const SalesQuickPicker: React.FC = () => {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [cart, setCart] = useState<CartLineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saleCompleted, setSaleCompleted] = useState(false);
  const [saleSummaryText, setSaleSummaryText] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [pickerItems, catRes] = await Promise.all([
        catalogAdapter.getItemsForSalePicker(search, selectedCat !== 'all' ? selectedCat : undefined),
        catalogAdapter.getCatalogCategories(),
      ]);
      setItems(pickerItems);
      setCategories(catRes.categories);
    } catch (err) {
      console.error('Failed to load catalog for Sales picker:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, selectedCat]);

  const addToCart = (item: CatalogItem) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((line) => line.item.id === item.id);
      if (existingIndex >= 0) {
        const copy = [...prev];
        const currentQty = copy[existingIndex].quantity;
        // Check stock limit if tracked product
        if (item.type === 'product' && item.stockTracked && currentQty >= (item.stockQty ?? 0)) {
          alert(`Cannot exceed available stock of ${item.stockQty} ${item.unit || 'pcs'}.`);
          return prev;
        }
        copy[existingIndex].quantity += 1;
        return copy;
      } else {
        if (item.type === 'product' && item.stockTracked && (item.stockQty ?? 0) <= 0) {
          alert(`Item '${item.name}' is out of stock.`);
          return prev;
        }
        return [...prev, { item, quantity: 1 }];
      }
    });
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((line) => {
          if (line.item.id === itemId) {
            const newQty = line.quantity + delta;
            if (newQty <= 0) return null;
            if (line.item.type === 'product' && line.item.stockTracked && newQty > (line.item.stockQty ?? 0)) {
              alert(`Stock limit reached (${line.item.stockQty}).`);
              return line;
            }
            return { ...line, quantity: newQty };
          }
          return line;
        })
        .filter(Boolean) as CartLineItem[]
    );
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((l) => l.item.id !== itemId));
  };

  const subtotal = cart.reduce((acc, line) => acc + line.item.price * line.quantity, 0);
  const tax = subtotal * 0.10; // 10% tax estimate
  const grandTotal = subtotal + tax;

  const handleCompleteSale = async () => {
    if (cart.length === 0) return;

    try {
      // Reduce stock for each product in cart
      for (const line of cart) {
        if (line.item.type === 'product' && line.item.stockTracked) {
          await catalogAdapter.adjustStock({
            itemId: line.item.id,
            changeQty: -line.quantity,
            reason: 'sale',
            notes: `POS Checkout Sale (${line.quantity} ${line.item.unit || 'pcs'})`,
          });
        }
      }

      setSaleSummaryText(
        `Sale completed! Subtotal: $${subtotal.toFixed(2)}, Tax: $${tax.toFixed(2)}, Total: $${grandTotal.toFixed(2)} (${cart.length} items sold). Stock updated in Catalog.`
      );
      setSaleCompleted(true);
      setCart([]);
      loadData(); // Reload inventory
    } catch (err: any) {
      alert(`Sale process error: ${err.message}`);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 rounded-xl">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Sales Integration & Quick Item Picker
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Demonstrates how Sales module consumes Catalog API to query offerings and decrease stock
            </p>
          </div>
        </div>
      </div>

      {saleCompleted && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{saleSummaryText}</span>
          </div>
          <button
            onClick={() => setSaleCompleted(false)}
            className="text-xs font-bold underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Catalog Item Selector */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search & Category Filter Tabs */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Quick search offerings for sale..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>

            {/* Category Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <button
                type="button"
                onClick={() => setSelectedCat('all')}
                className={`px-3 py-1 rounded-lg font-semibold flex-shrink-0 transition-all cursor-pointer ${
                  selectedCat === 'all'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCat(cat.id)}
                  className={`px-3 py-1 rounded-lg font-semibold flex-shrink-0 transition-all cursor-pointer ${
                    selectedCat === cat.id
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Catalog Items Grid */}
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading catalog items for sales...</div>
          ) : items.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 border border-dashed rounded-xl">
              No matching offerings found.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
              {items.map((item) => {
                const isOutOfStock = item.type === 'product' && item.stockTracked && (item.stockQty ?? 0) <= 0;

                return (
                  <div
                    key={item.id}
                    className={`p-3.5 bg-slate-50 dark:bg-slate-800/60 border rounded-xl flex items-center justify-between transition-all ${
                      isOutOfStock ? 'opacity-50 border-slate-200' : 'border-slate-200 dark:border-slate-700 hover:border-emerald-500'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-lg ${
                        item.type === 'product' ? 'bg-blue-100 dark:bg-blue-950 text-blue-600' : 'bg-purple-100 dark:bg-purple-950 text-purple-600'
                      }`}>
                        {item.type === 'product' ? <Package className="w-4 h-4" /> : <Layers className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900 dark:text-slate-100 line-clamp-1">{item.name}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1">
                          <span className="font-mono">{item.itemCode}</span>
                          <span>· ${item.price.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={isOutOfStock}
                      onClick={() => addToCart(item)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer flex-shrink-0"
                    >
                      {isOutOfStock ? 'Out' : 'Add'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Cart & Checkout Summary */}
        <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700 mb-3">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <ShoppingCart className="w-4 h-4 text-emerald-600" />
                <span>Current Order ({cart.length})</span>
              </h3>
              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={() => setCart([])}
                  className="text-[11px] text-slate-400 hover:text-red-600"
                >
                  Clear Cart
                </button>
              )}
            </div>

            {/* Cart Items */}
            {cart.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 italic">
                Cart is empty. Select catalog items to build order.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {cart.map(({ item, quantity }) => (
                  <div key={item.id} className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100 line-clamp-1">{item.name}</div>
                      <div className="text-[11px] text-slate-400">${item.price.toFixed(2)} / {item.unit || 'unit'}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 border">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="p-1 hover:bg-white rounded"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-mono font-bold px-2">{quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="p-1 hover:bg-white rounded"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-slate-400 hover:text-red-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Checkout Totals */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-700 mt-4 space-y-2">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-500">
              <span>Estimated Tax (10%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-extrabold text-slate-900 dark:text-slate-100 pt-1 border-t">
              <span>Grand Total</span>
              <span className="text-emerald-600 dark:text-emerald-400">${grandTotal.toFixed(2)}</span>
            </div>

            <button
              type="button"
              disabled={cart.length === 0}
              onClick={handleCompleteSale}
              className="w-full mt-2 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Complete Sale & Deduct Stock
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
