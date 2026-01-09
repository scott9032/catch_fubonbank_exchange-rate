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

  const handleFetch = useCallback(async () => {
    setStatus(FetchStatus.LOADING);
    setError(null);
    try {
      const result = await fetchLatestRates();
      if (!result.rates || result.rates.length === 0) {
        throw new Error("抓取成功但未發現有效的匯率數據。");
      }
      setData(result);
      setStatus(FetchStatus.SUCCESS);
      setLastUpdateAttempt(new Date());
    } catch (err: any) {
      console.error("App handleFetch Error:", err);
      setError(err.message || "資料抓取失敗");
      setStatus(FetchStatus.ERROR);
    }
  }, []);

  useEffect(() => {
    handleFetch();
  }, [handleFetch]);

  const exportToExcel = () => {
    if (!data) return;
    const worksheetData = data.rates.map(r => ({
      '幣別': r.currency,
      '代碼': r.currencyCode,
      '即期買入': r.spotBuy,
      '即期賣出': r.spotSell,
      '現鈔買入': r.cashBuy,
      '現鈔賣出': r.cashSell
    }));
    const ws = XLSX.utils.json_to_sheet(worksheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "富邦最新匯率");
    XLSX.writeFile(wb, `富邦匯率_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const isQuotaError = error?.includes("429") || error?.includes("配額");

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-8 px-4">
      <div className="w-full max-w-6xl">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-lg shadow-blue-200">F</div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">富邦銀行匯率監控</h1>
              <p className="text-slate-500 text-sm font-medium">即時數據擷取自富邦銀行官方網站</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button 
              onClick={handleFetch} 
              disabled={status === FetchStatus.LOADING}
              className="flex-1 md:flex-none px-6 py-3 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl hover:bg-blue-100 transition-all flex items-center justify-center gap-2 font-bold disabled:opacity-50"
            >
              <svg className={`w-5 h-5 ${status === FetchStatus.LOADING ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {status === FetchStatus.LOADING ? '抓取中...' : '重新整理'}
            </button>
            
            <button 
              onClick={exportToExcel} 
              disabled={!data || data.rates.length === 0}
              className="flex-1 md:flex-none px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-bold shadow-md disabled:bg-slate-300"
            >
              匯出 Excel
            </button>
          </div>
        </header>

        {error ? (
          <div className={`border p-8 rounded-2xl shadow-sm text-center ${isQuotaError ? 'bg-amber-50 border-amber-200' : 'bg-rose-50 border-rose-200'}`}>
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-4 ${isQuotaError ? 'bg-amber-100 text-amber-600' : 'bg-rose-100 text-rose-600'}`}>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className={`text-lg font-bold mb-2 ${isQuotaError ? 'text-amber-900' : 'text-rose-900'}`}>
              {isQuotaError ? 'API 限制提示' : '錯誤詳情'}
            </h3>
            <p className={`mb-6 text-sm ${isQuotaError ? 'text-amber-700' : 'text-rose-700'}`}>{error}</p>
            <div className="flex gap-4 justify-center">
              <button 
                onClick={handleFetch} 
                className={`px-6 py-2 rounded-lg font-semibold transition-colors text-white ${isQuotaError ? 'bg-amber-600 hover:bg-amber-700' : 'bg-rose-600 hover:bg-rose-700'}`}
              >
                再次重試
              </button>
              {isQuotaError && (
                <a 
                  href="https://ai.google.dev/pricing" 
                  target="_blank" 
                  className="px-6 py-2 bg-white border border-amber-200 text-amber-700 rounded-lg hover:bg-amber-100 font-semibold"
                >
                  查看配額限制
                </a>
              )}
            </div>
          </div>
        ) : (
          <main className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            {status === FetchStatus.LOADING && !data ? (
              <div className="py-40 flex flex-col items-center justify-center text-center px-4">
                <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                <p className="text-slate-500 font-medium">Gemini 正在擷取並解析富邦銀行即時匯率...</p>
                <p className="text-xs text-slate-400 mt-2">（若發生 429 錯誤，請等待 1 分鐘後再整理）</p>
              </div>
            ) : data && data.rates.length > 0 ? (
              <RateTable rates={data.rates} />
            ) : (
              <div className="py-40 text-center text-slate-400">尚無資料，請點擊重新整理。</div>
            )}
          </main>
        )}

        {data?.sources && data.sources.length > 0 && (
          <div className="mt-4 p-4 bg-white rounded-xl border border-slate-200 text-xs text-slate-500">
            <p className="font-bold mb-2">資料來源引注 (Google Search)：</p>
            <ul className="list-disc pl-5 flex flex-col gap-1">
              {data.sources.map((source, i) => (
                <li key={i}>
                  <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {source.title || source.uri}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        <footer className="mt-6 flex flex-col md:flex-row justify-between items-center text-slate-400 text-xs gap-2 px-4">
          <p>© 台北富邦銀行 匯率自動監控工具</p>
          <div className="flex gap-4">
            {lastUpdateAttempt && <span>本地最後連線：{lastUpdateAttempt.toLocaleTimeString()}</span>}
            {data?.timestamp && <span>銀行公告時間：{data.timestamp}</span>}
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;