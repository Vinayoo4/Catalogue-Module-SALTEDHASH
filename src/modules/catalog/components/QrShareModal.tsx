import React, { useState } from 'react';
import { QrCode, X, Copy, Check, Share2, Package, Download } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { CatalogItem } from '../types';

interface QrShareModalProps {
  item: CatalogItem | null;
  onClose: () => void;
}

export const QrShareModal: React.FC<QrShareModalProps> = ({ item, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!item) return null;

  // Generate SVG QR Code representation (local-first)
  const qrDataValue = `SALTEDHASH:ITEM:${item.itemCode}:${item.id}`;

  const formattedShareText = `🛒 *SALTEDHASH BUSINESS OS CATALOG*
──────────────────────
*Item:* ${item.name}
*Code:* ${item.itemCode}
*Category:* ${item.categorySnapshot || 'General'}
*Price:* $${item.price.toFixed(2)} per ${item.unit || 'unit'}
${item.stockTracked ? `*Stock Level:* ${item.stockQty ?? 0} ${item.unit || 'pcs'} available` : '*Availability:* Service (Immediate)'}
${item.description ? `\n*Details:* ${item.description}` : ''}
──────────────────────
Shared via SALTEDHASH Local Business OS`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(formattedShareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl relative space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-1">
          <div className="inline-flex p-2.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 rounded-2xl mb-1">
            <QrCode className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">QR & Offering Share Card</h3>
          <p className="text-xs text-slate-500">Scan to verify item code or share details with client</p>
        </div>

        {/* QR Code Container */}
        <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 text-center space-y-3 flex flex-col items-center">
          <div className="w-40 h-40 mx-auto rounded-lg border border-slate-200 bg-white p-2 shadow-xs flex items-center justify-center">
            <QRCodeSVG value={qrDataValue} size={140} />
          </div>
          <div className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
            {item.itemCode}
          </div>
        </div>

        {/* Formatted Text Box */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
            Client Message Format
          </label>
          <textarea
            readOnly
            rows={4}
            value={formattedShareText}
            className="w-full p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={copyToClipboard}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shadow-xs"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Share Text'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
