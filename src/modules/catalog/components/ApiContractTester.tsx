import React, { useState } from 'react';
import { Terminal, Play, Code, CheckCircle, Copy, Check } from 'lucide-react';
import { catalogAdapter } from '../api/adapters';

export const ApiContractTester: React.FC = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('getCatalogItems');
  const [payloadInput, setPayloadInput] = useState<string>(
    JSON.stringify({ status: 'active', page: 1, limit: 10 }, null, 2)
  );
  const [responseOutput, setResponseOutput] = useState<string>('// Response will appear here after execution');
  const [loading, setLoading] = useState<boolean>(false);
  const [execTime, setExecTime] = useState<number | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const handleEndpointSelect = (endpoint: string) => {
    setSelectedEndpoint(endpoint);

    switch (endpoint) {
      case 'getCatalogItems':
        setPayloadInput(JSON.stringify({ status: 'active', page: 1, limit: 10 }, null, 2));
        break;
      case 'getCatalogSummary':
        setPayloadInput(JSON.stringify({}, null, 2));
        break;
      case 'getCatalogCategories':
        setPayloadInput(JSON.stringify({}, null, 2));
        break;
      case 'createCatalogItem':
        setPayloadInput(
          JSON.stringify(
            {
              name: 'Sample API Created Offering',
              type: 'product',
              price: 29.99,
              costPrice: 12.00,
              stockTracked: true,
              stockQty: 50,
              unit: 'pcs',
              categoryName: 'API Generated Goods',
            },
            null,
            2
          )
        );
        break;
      case 'adjustStock':
        setPayloadInput(
          JSON.stringify(
            {
              itemId: 'item-101',
              changeQty: 5,
              reason: 'restock',
              notes: 'Bulk API shipment receiving',
            },
            null,
            2
          )
        );
        break;
      default:
        setPayloadInput(JSON.stringify({}, null, 2));
    }
  };

  const executeApiCall = async () => {
    setLoading(true);
    const startTime = performance.now();

    try {
      let parsedInput: any = {};
      try {
        parsedInput = JSON.parse(payloadInput);
      } catch (e: any) {
        throw new Error(`JSON Syntax Error in Request Payload: ${e.message}`);
      }

      let result: any;

      switch (selectedEndpoint) {
        case 'getCatalogItems':
          result = await catalogAdapter.getCatalogItems(parsedInput);
          break;
        case 'getCatalogSummary':
          result = await catalogAdapter.getCatalogSummary(parsedInput);
          break;
        case 'getCatalogCategories':
          result = await catalogAdapter.getCatalogCategories();
          break;
        case 'createCatalogItem':
          result = await catalogAdapter.createCatalogItem(parsedInput);
          break;
        case 'adjustStock':
          result = await catalogAdapter.adjustStock(parsedInput);
          break;
        default:
          throw new Error('Unknown API endpoint');
      }

      const endTime = performance.now();
      setExecTime(Math.round(endTime - startTime));
      setResponseOutput(JSON.stringify({ status: 200, success: true, data: result }, null, 2));
    } catch (err: any) {
      const endTime = performance.now();
      setExecTime(Math.round(endTime - startTime));
      setResponseOutput(JSON.stringify({ status: 400, success: false, error: err.message }, null, 2));
    } finally {
      setLoading(false);
    }
  };

  const copyResponse = () => {
    navigator.clipboard.writeText(responseOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 space-y-6 shadow-xl">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">Catalog Module API Contract Tester</h2>
            <p className="text-xs text-slate-400">
              Interactive JSON service contract console validating internal domain packaging
            </p>
          </div>
        </div>
      </div>

      {/* Endpoint Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono">
        {[
          { id: 'getCatalogItems', name: 'GET /api/catalog' },
          { id: 'getCatalogSummary', name: 'GET /api/catalog/summary' },
          { id: 'getCatalogCategories', name: 'GET /api/catalog/categories' },
          { id: 'createCatalogItem', name: 'POST /api/catalog' },
          { id: 'adjustStock', name: 'POST /api/catalog/stock-adjust' },
        ].map((ep) => (
          <button
            key={ep.id}
            onClick={() => handleEndpointSelect(ep.id)}
            className={`px-3 py-1.5 rounded-lg border font-medium flex-shrink-0 transition-all cursor-pointer ${
              selectedEndpoint === ep.id
                ? 'bg-emerald-600 border-emerald-500 text-white'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-600'
            }`}
          >
            {ep.name}
          </button>
        ))}
      </div>

      {/* Code Editors Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Request Payload Editor */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono font-bold text-slate-400 flex items-center gap-1">
              <Code className="w-3.5 h-3.5 text-emerald-400" />
              <span>Request DTO Payload (JSON)</span>
            </label>
            <button
              onClick={executeApiCall}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{loading ? 'Executing...' : 'Execute Request'}</span>
            </button>
          </div>

          <textarea
            rows={12}
            value={payloadInput}
            onChange={(e) => setPayloadInput(e.target.value)}
            className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-emerald-400 focus:outline-none focus:border-emerald-500/50"
          />
        </div>

        {/* Response Inspector */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono font-bold text-slate-400 flex items-center gap-2">
              <span>Response Payload (JSON)</span>
              {execTime !== null && (
                <span className="text-[10px] font-normal text-slate-500 bg-slate-800 px-2 py-0.5 rounded">
                  {execTime}ms
                </span>
              )}
            </label>
            <button
              onClick={copyResponse}
              className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <textarea
            readOnly
            rows={12}
            value={responseOutput}
            className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-slate-300 focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
};
