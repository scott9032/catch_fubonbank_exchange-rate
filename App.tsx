
import React, { useState, useEffect, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { fetchLatestRates } from './services/geminiService.ts';
import { ExchangeRate, RateUpdate, FetchStatus } from './types.ts';
import RateTable from './components/RateTable.tsx';

const App: React.FC = () => {
  const [data, setData] = useState<RateUpdate | null>(null);
  const [status, setStatus] = useState<FetchStatus>(FetchStatus.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdateAttempt, setLastUpdateAttempt] = useState<Date | null>(null);

  const isApiKeyMissing = !process.env.API_KEY || process.env.API_KEY === "";

  const handleFetch = useCallback(async () => {
    if (isApiKeyMissing) {
      setError("請確認已設定 API_KEY 環境變數。");
      setStatus(FetchStatus.ERROR);
      return;
    }

    setStatus(FetchStatus.LOADING);
    setError(null);
    try {
      const result = await fetchLatestRates();
      setData(result);
      setStatus(FetchStatus.SUCCESS);
      setLastUpdateAttempt(new Date());
    } catch (err: any) {
      setError(err.message || "抓取失敗");
      setStatus(FetchStatus.ERROR);
    }
  }, [isApiKeyMissing]);

  useEffect(() => {
    handleFetch();
    const interval = setInterval(handleFetch, 300000);
    return () => clearInterval(interval);
  }, [handleFetch]);

  const exportToExcel = () => {
    if (!data) return;
    const worksheetData = data.rates.map(r => ({
      '幣別': r.currency,
      '代碼': r.currencyCode,
      '現鈔買入': r.cashBuy,
      '現鈔賣出': r.cashSell,
      '即期買入': r.spotBuy,
      '即期賣出': r.spotSell
    }));
    const ws = XLSX.utils.json_to_sheet(worksheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "富邦匯率");
    XLSX.writeFile(wb, `富邦匯率_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-blue-200">F</div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">富邦銀行匯率監控</h1>
            </div>
            <p className="text-slate-500 font-medium">即時串接官網數據，支援一鍵導出 Excel 報表</p>
          </div>
          <div className="flex gap-3">
            {/* 修正按鈕樣式：增加邊框對比度與背景色，解決消失問題 */}
            <button 
              onClick={handleFetch} 
              disabled={status === FetchStatus.LOADING} 
              className="px-5 py-2.5 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 hover:border-slate-400 active:bg-slate-200 transition-all shadow-sm flex items-center gap-2 text-slate-700 font-semibold"
            >
              <svg className={`w-4 h-4 text-blue-600 ${status === FetchStatus.LOADING ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {status === FetchStatus.LOADING ? '更新中...' : '手動更新'}
            </button>
            <button 
              onClick={exportToExcel} 
              disabled={!data} 
              className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 active:bg-emerald-800 transition-all shadow-lg shadow-emerald-100 flex items-center gap-2 disabled:bg-slate-300 disabled:shadow-none font-semibold"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              匯出 Excel
            </button>
          </div>
        </header>

        {error ? (
          <div className="bg-rose-50 border border-rose-200 p-6 rounded-2xl text-rose-800 shadow-sm flex items-center gap-4">
            <div className="bg-rose-100 p-2 rounded-full text-rose-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <p className="font-bold">連線異常</p>
              <p className="text-sm opacity-80">{error}</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {!data && status === FetchStatus.LOADING && (
              <div className="py-32 text-center">
                <div className="inline-block w-8 h-8 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                <p className="text-slate-400 font-medium">正在為您擷取富邦銀行最新匯率...</p>
              </div>
            )}
            {data && <RateTable rates={data.rates} />}
          </div>
        )}
        
        <div className="mt-4 flex justify-between items-center text-xs text-slate-400 px-2">
          {lastUpdateAttempt && <span>上次更新：{lastUpdateAttempt.toLocaleString()}</span>}
          {data?.timestamp && <span>數據來源公告時間：{data.timestamp}</span>}
        </div>
      </div>
    </div>
  );
};

export default App;
