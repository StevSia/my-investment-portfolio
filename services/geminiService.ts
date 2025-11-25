import { GoogleGenAI, Type } from "@google/genai";
import { GeminiStockInfo } from "../types";

// Initialize Gemini client
// Note: In a real production app, you might proxy this through a backend to hide the key,
// but for this client-side demo, we use the env var directly as instructed.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getStockDetails = async (symbol: string): Promise<GeminiStockInfo | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Provide financial details for the stock symbol: ${symbol}. 
      Return a JSON object with the company name, sector, an estimated current price (number only), and estimated annual dividend yield percentage (number only, e.g. 0.04 for 4%).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            sector: { type: Type.STRING },
            price: { type: Type.NUMBER },
            dividendYield: { type: Type.NUMBER }
          },
          required: ["name", "sector", "price"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as GeminiStockInfo;
    }
    return null;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return null;
  }
};

export const getPortfolioInsight = async (totalWorth: number, assets: {symbol: string, quantity: number, sector?: string}[]) => {
  try {
    const assetSummary = assets.map(a => `${a.symbol} (${a.quantity} shares, ${a.sector || 'Unknown'})`).join(', ');
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analyze this portfolio summary: Total Worth $${totalWorth}. Holdings: ${assetSummary}.
      Provide a concise, 1-sentence friendly observation or tip in the style of a financial assistant.`,
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return "Keep accurate records to track your wealth growth!";
  }
};

export const estimateDividends = async (symbol: string): Promise<{ annualAmount: number, frequency: string } | null> => {
    try {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: `Estimate the annual dividend payment per share for ${symbol} in USD.
          Return JSON with 'annualAmount' (number) and 'frequency' (string, e.g. "Quarterly", "Monthly", "Irregular").
          If it does not pay dividends, set annualAmount to 0.`,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    annualAmount: { type: Type.NUMBER },
                    frequency: { type: Type.STRING }
                }
            }
          }
        });
    
        if (response.text) {
          return JSON.parse(response.text);
        }
        return null;
      } catch (error) {
        return null;
      }
}