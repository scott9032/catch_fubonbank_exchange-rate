
import { GoogleGenAI, Type } from "@google/genai";
import { ExchangeRate, RateUpdate } from "../types.ts";

const API_KEY = process.env.API_KEY || "";

export const fetchLatestRates = async (): Promise<RateUpdate> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  // 針對富邦銀行的網頁結構（分頁設計）優化提示詞
  const prompt = `
    請精準抓取富邦銀行「台北富邦銀行-匯率查詢」頁面的數據：
    網址：https://www.fubon.com/banking/personal/deposit/exchange_rate/exchange_rate_tw.htm?page=ex_rate_tab0
    
    【抓取指令】
    1. 網頁上有「即期」、「現鈔」等不同按鈕或分頁。
    2. 請確保獲取每一種幣別（如：美金 USD, 日圓 JPY, 歐元 EUR...）的下列四項數值：
       - 即期買入 (Spot Buy)
       - 即期賣出 (Spot Sell)
       - 現鈔買入 (Cash Buy)
       - 現鈔賣出 (Cash Sell)
    3. 如果網頁當前視圖只顯示「即期」，請也設法獲取「現鈔」的資料（通常在同一表格的其他欄位或切換分頁後出現）。
    4. 請檢查表格中的所有欄位，不要遺漏「即期買入」與「即期賣出」。
    5. 若某項數值確實不存在，請填入 "-"。
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            timestamp: { type: Type.STRING, description: "公告更新時間" },
            rates: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  currency: { type: Type.STRING },
                  currencyCode: { type: Type.STRING },
                  cashBuy: { type: Type.STRING },
                  cashSell: { type: Type.STRING },
                  spotBuy: { type: Type.STRING },
                  spotSell: { type: Type.STRING }
                },
                required: ["currency", "currencyCode", "cashBuy", "cashSell", "spotBuy", "spotSell"]
              }
            }
          }
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    return {
      timestamp: result.timestamp || new Date().toLocaleString(),
      rates: result.rates || [],
      sourceUrl: "https://www.fubon.com/banking/personal/deposit/exchange_rate/exchange_rate_tw.htm"
    };
  } catch (error) {
    console.error("Fetch Error:", error);
    throw new Error("無法從富邦銀行擷取完整數據。請確認 API Key 有效且具備搜尋功能。");
  }
};
