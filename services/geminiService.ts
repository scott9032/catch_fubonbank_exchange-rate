
import { GoogleGenAI, Type } from "@google/genai";
import { ExchangeRate, RateUpdate } from "../types";

const API_KEY = process.env.API_KEY || "";

export const fetchLatestRates = async (): Promise<RateUpdate> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const prompt = `
    請幫我抓取富邦銀行最新匯率資訊。
    網址：https://www.fubon.com/banking/personal/deposit/exchange_rate/exchange_rate_tw.htm?page=ex_rate_tab0
    
    我需要以下資訊：
    1. 幣別 (例如: 美金, 日圓)
    2. 幣別代碼 (例如: USD, JPY)
    3. 現鈔買入匯率
    4. 現鈔賣出匯率
    5. 即期買入匯率
    6. 即期賣出匯率
    
    請確保數據是最新的。
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
            timestamp: { type: Type.STRING, description: "數據更新時間" },
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
          },
          required: ["timestamp", "rates"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    return {
      timestamp: result.timestamp || new Date().toLocaleString(),
      rates: result.rates || [],
      sourceUrl: "https://www.fubon.com/banking/personal/deposit/exchange_rate/exchange_rate_tw.htm?page=ex_rate_tab0"
    };
  } catch (error) {
    console.error("Gemini fetch error:", error);
    throw new Error("無法從富邦銀行擷取最新匯率，請稍後再試。");
  }
};
