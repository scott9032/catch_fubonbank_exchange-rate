
import React from 'react';
import { ExchangeRate } from '../types';

interface RateTableProps {
  rates: ExchangeRate[];
}

const RateTable: React.FC<RateTableProps> = ({ rates }) => {
  if (rates.length === 0) return null;

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-6 py-4 text-sm font-semibold text-slate-700">幣別</th>
            <th className="px-6 py-4 text-sm font-semibold text-slate-700">現鈔買入</th>
            <th className="px-6 py-4 text-sm font-semibold text-slate-700">現鈔賣出</th>
            <th className="px-6 py-4 text-sm font-semibold text-slate-700">即期買入</th>
            <th className="px-6 py-4 text-sm font-semibold text-slate-700">即期賣出</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rates.map((rate) => (
            <tr key={rate.currencyCode} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-900">{rate.currencyCode}</span>
                  <span className="text-sm text-slate-500">{rate.currency}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-blue-600 font-medium">{rate.cashBuy || '-'}</td>
              <td className="px-6 py-4 text-sm text-rose-600 font-medium">{rate.cashSell || '-'}</td>
              <td className="px-6 py-4 text-sm text-blue-800 font-semibold">{rate.spotBuy || '-'}</td>
              <td className="px-6 py-4 text-sm text-rose-800 font-semibold">{rate.spotSell || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RateTable;
