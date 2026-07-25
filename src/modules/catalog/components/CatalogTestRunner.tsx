import React, { useState } from 'react';
import { CheckCircle2, XCircle, Play, ShieldCheck } from 'lucide-react';
import { runCatalogTestSuite, TestResult } from '../services/catalogTests';

export const CatalogTestRunner: React.FC = () => {
  const [results, setResults] = useState<TestResult[] | null>(null);
  const [testing, setTesting] = useState(false);

  const handleRun = async () => {
    setTesting(true);
    const testResults = await runCatalogTestSuite();
    setResults(testResults);
    setTesting(false);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Catalog Module Automated Test Suite</h3>
            <p className="text-xs text-slate-500">Run unit & contract integrity tests on local repository and domain services</p>
          </div>
        </div>

        <button
          onClick={handleRun}
          disabled={testing}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
        >
          <Play className="w-4 h-4" />
          <span>{testing ? 'Running Tests...' : 'Run Test Suite'}</span>
        </button>
      </div>

      {results && (
        <div className="space-y-2 pt-1">
          {results.map((res, i) => (
            <div
              key={i}
              className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                res.passed
                  ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900 text-emerald-950 dark:text-emerald-200'
                  : 'bg-red-50/50 dark:bg-red-950/30 border-red-200 dark:border-red-900 text-red-950 dark:text-red-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {res.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                )}
                <div>
                  <div className="font-bold">{res.name}</div>
                  <div className="text-[11px] opacity-80">{res.message}</div>
                </div>
              </div>

              <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] uppercase ${
                res.passed ? 'bg-emerald-200 text-emerald-800' : 'bg-red-200 text-red-800'
              }`}>
                {res.passed ? 'PASS' : 'FAIL'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
