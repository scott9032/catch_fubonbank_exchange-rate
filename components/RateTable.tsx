
import React from 'react';
import { ExchangeRate } from '../types.ts';

interface RateTableProps {
  rates: ExchangeRate[];
}

const RateTable: React.FC<RateTableProps> = ({ rates }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-100 border-b border-slate-200">
            <th className="px-6 py-4 text-sm font-bold text-slate-700" rowSpan={2}>幣別</th>
            <th className="px-6 py-2 text-center text-xs font-bold text-rose-600 bg-rose-50/50 border-l border-slate-200" colSpan={2}>現鈔匯率 (Cash)</th>
            <th className="px-6 py-2 text-center text-xs font-bold text-blue-600 bg-blue-50/50 border-l border-slate-200" colSpan={2}>即期匯率 (Spot)</th>
          </tr>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="px-6 py-2 text-xs font-semibold text-slate-500 border-l border-slate-200">買入</th>
            <th className="px-6 py-2 text-xs font-semibold text-slate-500">賣出</th>
            <th className="px-6 py-2 text-xs font-semibold text-slate-500 border-l border-slate-200">買入</th>
            <th className="px-6 py-2 text-xs font-semibold text-slate-500">賣出</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rates.map((rate) => (
            <tr key={rate.currencyCode} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4 border-r border-slate-100">
                <div className="flex flex-col">
                  <span className="font-bold text-slate-900">{rate.currencyCode}</span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">{rate.currency}</span>
                </div>
              </td>
              {/* 現鈔欄位 */}
              <td className="px-6 py-4 text-sm font-medium text-slate-600 bg-rose-50/10">
                {rate.cashBuy || '-'}
              </td>
              <td className="px-6 py-4 text-sm font-medium text-slate-600 bg-rose-50/10">
                {rate.cashSell || '-'}
              </td>
              {/* 即期欄位 - 增加強調色確保資料有帶進來 */}
              <td className="px-6 py-4 text-sm font-bold text-blue-700 bg-blue-50/10 border-l border-slate-100">
                {rate.spotBuy || '-'}
              </td>
              <td className="px-6 py-4 text-sm font-bold text-blue-700 bg-blue-50/10">
                {rate.spotSell || '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RateTable;
