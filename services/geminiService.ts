import { GoogleGenAI, Type } from "@google/genai";
import { RateUpdate } from "../types.ts";

export const fetchLatestRates = async (): Promise<RateUpdate> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("找不到 API Key。請確保環境變數已設定。");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  // 優化後的 Prompt，增加對富邦頁面結構的描述
  const prompt = `
    請使用 Google Search 功能，造訪台北富邦銀行的「最新匯率」頁面：
    URL: https://www.fubon.com/banking/personal/deposit/exchange_rate/exchange_rate_tw.htm?page=ex_rate_tab0
    
    你的任務是精確擷取頁面中的匯率表格數據。請注意：
    1. 尋找「牌告匯率」表格。
    2. 表格中應包含：幣別代碼 (例如 USD, JPY)、幣別名稱、即期買入、即期賣出、現鈔買入、現鈔賣出。
    3. 如果數值顯示為 "-" 或空白，請在 JSON 中保留為 "-"。
    4. 必須同時回傳網頁上標註的「公告日期時間」。
    
    請務必以純 JSON 格式回傳，不得包含 Markdown 代碼塊標籤。
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
            timestamp: { type: Type.STRING, description: "公告時間" },
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

    const text = response.text;
    if (!text) throw new Error("模型未回傳有效的內容。");

    const result = JSON.parse(text);
    
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const sources = groundingChunks?.map((chunk: any) => {
      if (chunk.web) {
        return { title: chunk.web.title, uri: chunk.web.uri };
      }
      return null;
    }).filter((s: any) => s !== null) || [];

    return {
      timestamp: result.timestamp || new Date().toLocaleString(),
      rates: result.rates || [],
      sourceUrl: "https://www.fubon.com/banking/personal/deposit/exchange_rate/exchange_rate_tw.htm",
      sources: sources
    };
  } catch (error: any) {
    console.error("Gemini Service Error:", error);
    throw new Error(error.message || "擷取資料時發生錯誤，請稍後再試。");
  }
};