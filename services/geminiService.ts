
import { GoogleGenAI, Type } from "@google/genai";
import { RateUpdate } from "../types.ts";

/**
 * fetchLatestRates uses the Gemini 3 Flash model with Google Search grounding
 * to scrape the latest exchange rates from Fubon Bank.
 */
export const fetchLatestRates = async (): Promise<RateUpdate> => {
  // Always initialize GoogleGenAI directly with process.env.API_KEY as per guidelines.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    請前往富邦銀行匯率頁面並抓取最新資料：
    網址：https://www.fubon.com/banking/personal/deposit/exchange_rate/exchange_rate_tw.htm?page=ex_rate_tab0
    
    【精確擷取指令】
    請仔細核對表格的每一列與每一欄，確保擷取到以下所有數據：
    1. 幣別 (例如: 美金, 日圓)
    2. 幣別代碼 (例如: USD, JPY)
    3. 即期買入 (Spot Buy)
    4. 即期賣出 (Spot Sell)
    5. 現鈔買入 (Cash Buy)
    6. 現鈔賣出 (Cash Sell)
    
    注意：在富邦銀行的網頁上，「即期」和「現鈔」是分開的指標，請務必將「即期」數值填入對應的 spotBuy/spotSell。
    如果數值是橫線或空白，請填入 "-"。
    
    請回傳包含 timestamp (公告時間) 和 rates 陣列的 JSON。
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
            timestamp: { type: Type.STRING },
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

    // Access the text property directly on the response object.
    const result = JSON.parse(response.text || "{}");
    
    // Extract grounding sources as required by Google Search grounding guidelines.
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
  } catch (error) {
    console.error("Fetch Error:", error);
    throw new Error("擷取資料時發生錯誤。請確保網路連線正常。");
  }
};