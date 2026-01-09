
export interface ExchangeRate {
  currency: string;
  currencyCode: string;
  cashBuy: string;
  cashSell: string;
  spotBuy: string;
  spotSell: string;
}

export interface RateUpdate {
  timestamp: string;
  rates: ExchangeRate[];
  sourceUrl: string;
}

export enum FetchStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
