
import React from 'react';
import { ExchangeRate } from '../types.ts';

interface RateTableProps {
  rates: ExchangeRate[];
}

const RateTable: React.FC<RateTableProps> = ({ rates }) => {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left border-collapse min-w-[800px]">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="px-6 py-6 text-sm font-bold text-slate-700" rowSpan={2}>幣別</th>
            <th className="px-6 py-3 text-center text-xs font-bold text-blue-700 bg-blue-50/50 border-l border-slate-200" colSpan={2}>即期匯率 (Spot)</th>
            <th className="px-6 py-3 text-center text-xs font-bold text-amber-700 bg-amber-50/50 border-l border-slate-200" colSpan={2}>現鈔匯率 (Cash)</th>
          </tr>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="px-6 py-3 text-xs font-bold text-blue-600 bg-blue-50/30 border-l border-slate-200">買入</th>
            <th className="px-6 py-3 text-xs font-bold text-blue-600 bg-blue-50/30">賣出</th>
            <th className="px-6 py-3 text-xs font-bold text-amber-600 bg-amber-50/30 border-l border-slate-200">買入</th>
            <th className="px-6 py-3 text-xs font-bold text-amber-600 bg-amber-50/30">賣出</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rates.map((rate, idx) => (
            <tr key={rate.currencyCode || idx} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-5 border-r border-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-500">
                    {rate.currencyCode?.substring(0, 2)}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900">{rate.currencyCode}</span>
                    <span className="text-[11px] text-slate-500">{rate.currency}</span>
                  </div>
                </div>
              </td>
              
              {/* 即期匯率 - 增加背景色使其更顯眼 */}
              <td className="px-6 py-5 text-sm font-bold text-blue-800 bg-blue-50/5 border-l border-slate-50">
                {rate.spotBuy || '-'}
              </td>
              <td className="px-6 py-5 text-sm font-bold text-blue-800 bg-blue-50/5">
                {rate.spotSell || '-'}
              </td>
              
              {/* 現鈔匯率 */}
              <td className="px-6 py-5 text-sm font-medium text-amber-700 bg-amber-50/5 border-l border-slate-50">
                {rate.cashBuy || '-'}
              </td>
              <td className="px-6 py-5 text-sm font-medium text-amber-700 bg-amber-50/5">
                {rate.cashSell || '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RateTable;
