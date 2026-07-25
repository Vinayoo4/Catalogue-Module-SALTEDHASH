import React, { useState } from 'react';
import { Download, Upload, FileText, FileSpreadsheet } from 'lucide-react';
import { CatalogItem } from '../types';
import * as xlsx from 'xlsx';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType } from 'docx';
import { catalogAdapter } from '../api/adapters';

interface CatalogImportExportProps {
  items: CatalogItem[];
  onRefresh: () => void;
}

export const CatalogImportExport: React.FC<CatalogImportExportProps> = ({ items, onRefresh }) => {
  const [loading, setLoading] = useState(false);

  const handleExportExcel = () => {
    try {
      const exportData = items.map((item) => ({
        'Item Code': item.itemCode,
        'Name': item.name,
        'Type': item.type,
        'Category': item.categorySnapshot || 'General',
        'Price': item.price,
        'Cost Price': item.costPrice || '',
        'Stock Tracked': item.stockTracked ? 'Yes' : 'No',
        'Stock Qty': item.stockQty || 0,
        'Status': item.status,
      }));

      const ws = xlsx.utils.json_to_sheet(exportData);
      const wb = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(wb, ws, 'Catalog');

      const excelBuffer = xlsx.write(wb, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
      saveAs(data, `catalog_export_${new Date().getTime()}.xlsx`);
    } catch (error) {
      console.error('Error exporting Excel:', error);
      alert('Failed to export Excel.');
    }
  };

  const handleExportDocx = async () => {
    try {
      const tableRows = [
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Code', bold: true })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Name', bold: true })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Type', bold: true })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Price', bold: true })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Stock', bold: true })] })] }),
          ],
        }),
        ...items.map(
          (item) =>
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph(item.itemCode)] }),
                new TableCell({ children: [new Paragraph(item.name)] }),
                new TableCell({ children: [new Paragraph(item.type)] }),
                new TableCell({ children: [new Paragraph(item.price.toString())] }),
                new TableCell({ children: [new Paragraph(item.stockTracked ? (item.stockQty?.toString() || '0') : 'N/A')] }),
              ],
            })
        ),
      ];

      const doc = new Document({
        sections: [
          {
            properties: {},
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'Master Catalog Report',
                    bold: true,
                    size: 32,
                  }),
                ],
              }),
              new Paragraph({ text: `Generated on: ${new Date().toLocaleString()}` }),
              new Paragraph({ text: '' }), // Spacer
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: tableRows,
              }),
            ],
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `catalog_report_${new Date().getTime()}.docx`);
    } catch (error) {
      console.error('Error exporting DOCX:', error);
      alert('Failed to export Word document.');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = xlsx.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = xlsx.utils.sheet_to_json<any>(worksheet);

      let importedCount = 0;
      for (const row of jsonData) {
        if (!row['Name'] || !row['Price']) continue; // Basic validation

        await catalogAdapter.createCatalogItem({
          name: row['Name'],
          type: row['Type'] === 'service' ? 'service' : 'product',
          price: parseFloat(row['Price']) || 0,
          costPrice: row['Cost Price'] ? parseFloat(row['Cost Price']) : undefined,
          stockTracked: row['Stock Tracked'] === 'Yes',
          stockQty: row['Stock Qty'] ? parseInt(row['Stock Qty'], 10) : 0,
        });
        importedCount++;
      }

      alert(`Successfully imported ${importedCount} items.`);
      onRefresh();
    } catch (error) {
      console.error('Import error:', error);
      alert('Failed to import data. Please ensure it matches the export template.');
    } finally {
      setLoading(false);
      // reset file input
      e.target.value = '';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Download className="w-5 h-5 text-blue-500" />
          Import & Export Tools
        </h2>
        <p className="text-xs text-slate-500 mt-1">Export your catalog to Excel or Word, or import items from an Excel file.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={handleExportExcel}
          className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all group"
        >
          <div className="p-3 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 rounded-xl group-hover:scale-110 transition-transform">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div className="text-center">
            <div className="font-bold text-slate-900 dark:text-slate-100">Export to Excel</div>
            <div className="text-xs text-slate-500">Download .xlsx spreadsheet</div>
          </div>
        </button>

        <button
          onClick={handleExportDocx}
          className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all group"
        >
          <div className="p-3 bg-blue-100 dark:bg-blue-900/50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
            <FileText className="w-6 h-6" />
          </div>
          <div className="text-center">
            <div className="font-bold text-slate-900 dark:text-slate-100">Export to Word</div>
            <div className="text-xs text-slate-500">Download .docx report</div>
          </div>
        </button>

        <label className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-all group cursor-pointer relative">
          <input
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={handleFileUpload}
            disabled={loading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />
          <div className="p-3 bg-purple-100 dark:bg-purple-900/50 text-purple-600 rounded-xl group-hover:scale-110 transition-transform">
            <Upload className="w-6 h-6" />
          </div>
          <div className="text-center">
            <div className="font-bold text-slate-900 dark:text-slate-100">
              {loading ? 'Importing...' : 'Import from Excel'}
            </div>
            <div className="text-xs text-slate-500">Upload .xlsx to bulk add items</div>
          </div>
        </label>
      </div>
    </div>
  );
};
