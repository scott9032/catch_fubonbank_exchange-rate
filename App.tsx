
import React, { useState, useEffect, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { fetchLatestRates } from './services/geminiService';
import { ExchangeRate, RateUpdate, FetchStatus } from './types';
import RateTable from './components/RateTable';

const App: React.FC = () => {
  const [data, setData] = useState<RateUpdate | null>(null);
  const [status, setStatus] = useState<FetchStatus>(FetchStatus.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdateAttempt, setLastUpdateAttempt] = useState<Date | null>(null);

  // 檢查是否有 API Key
  const isApiKeyMissing = !process.env.API_KEY || process.env.API_KEY === "";

  const handleFetch = useCallback(async () => {
    if (isApiKeyMissing) {
      setError("未偵測到有效的 API Key。請確保環境變數已正確設定。");
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
      setError(err.message || "發生未知錯誤");
      setStatus(FetchStatus.ERROR);
    }
  }, [isApiKeyMissing]);

  // 自動更新邏輯
  useEffect(() => {
    handleFetch();
    const interval = setInterval(handleFetch, 300000); // 5 分鐘
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
    XLSX.utils.book_append_sheet(wb, ws, "富邦銀行匯率");
    
    const fileName = `富邦銀行匯率_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* 標頭區域 */}
        <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-200">
                F
              </div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">富邦銀行匯率監控</h1>
            </div>
            <p className="text-slate-500">
              即時抓取富邦銀行官方數據，並支援一鍵匯出 Excel
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleFetch}
              disabled={status === FetchStatus.LOADING}
              className={`px-5 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2 border shadow-sm
                ${status === FetchStatus.LOADING 
                  ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' 
                  : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400 hover:text-blue-600'}`}
            >
              <svg className={`w-4 h-4 ${status === FetchStatus.LOADING ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {status === FetchStatus.LOADING ? '正在同步...' : '手動更新'}
            </button>

            <button
              onClick={exportToExcel}
              disabled={!data}
              className={`px-5 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2 shadow-lg
                ${!data 
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
                  : 'bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-emerald-200'}`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              下載 Excel 報表
            </button>
          </div>
        </header>

        {/* 狀態列 */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-medium text-slate-600 shadow-sm">
            <div className={`w-2 h-2 rounded-full ${status === FetchStatus.LOADING ? 'bg-amber-400 animate-pulse' : (error ? 'bg-rose-500' : 'bg-emerald-500')}`}></div>
            {status === FetchStatus.LOADING ? '資料擷取中' : (error ? '連線失敗' : '系統在線')}
          </div>
          {lastUpdateAttempt && (
            <div className="text-xs text-slate-400">
              最後檢查時間: {lastUpdateAttempt.toLocaleTimeString()}
            </div>
          )}
        </div>

        {/* 內容區域 */}
        {error ? (
          <div className="bg-rose-50 border border-rose-200 p-8 rounded-2xl">
            <div className="flex items-start gap-4 text-rose-800">
              <svg className="w-8 h-8 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h3 className="font-bold text-lg mb-1">無法讀取匯率資訊</h3>
                <p className="text-sm opacity-90 mb-4">{error}</p>
                {isApiKeyMissing ? (
                  <div className="bg-white/50 p-4 rounded-lg border border-rose-100 text-xs leading-relaxed">
                    <strong>開發提示：</strong> 
                    <br />由於您是在靜態網頁環境執行，程式碼找不到 <code>process.env.API_KEY</code>。
                    如果是自行部署，請確保 API Key 已正確注入或在程式碼中設定。
                  </div>
                ) : (
                  <button 
                    onClick={handleFetch}
                    className="bg-rose-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-rose-700"
                  >
                    再試一次
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="relative">
            {status === FetchStatus.LOADING && !data && (
              <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                <p className="text-slate-500 font-medium italic">正在連線至富邦銀行官網...</p>
              </div>
            )}
            
            {data && <RateTable rates={data.rates} />}
          </div>
        )}

        <footer className="mt-12 text-center text-slate-400 text-sm">
          <p>本工具自動解析 <a href="https://www.fubon.com/banking/personal/deposit/exchange_rate/exchange_rate_tw.htm" target="_blank" rel="noreferrer" className="underline hover:text-blue-500">富邦官網</a> 公開數據</p>
          <p className="mt-1">僅供參考，實際交易匯率請依銀行櫃檯為準。</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
