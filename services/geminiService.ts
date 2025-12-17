import { GoogleGenAI, Type, SchemaType } from "@google/genai";
import { TableData, AnalysisResult, GenerationResponse } from "../types";

// Helper to get client safely
const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key not found");
  return new GoogleGenAI({ apiKey });
};

export const generateTableTemplate = async (topic: string): Promise<GenerationResponse> => {
  const ai = getClient();
  
  // Prompt updated to generate empty rows as requested
  const prompt = `Create a structured table template for the topic: "${topic}". 
  1. Define appropriate column headers (e.g., Date, Item, Quantity, Price, Total).
  2. Generate 5 rows of empty strings ("") for each column to serve as a blank template for the user to fill.
  3. Do NOT generate example values in the rows.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          headers: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "List of column headers"
          },
          rows: {
            type: Type.ARRAY,
            items: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            description: "2D array of empty row data matching headers"
          }
        },
        required: ["headers", "rows"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  return JSON.parse(text) as GenerationResponse;
};

export const analyzeDataTrends = async (data: TableData): Promise<AnalysisResult> => {
  const ai = getClient();

  // Convert table data to a string representation
  const dataString = JSON.stringify({
    headers: data.headers,
    rows: data.rows
  });

  const prompt = `Analyze the following table data titled "${data.title}".
  Data: ${dataString}
  
  If the data is mostly empty or contains only placeholders:
  Return a summary stating that data input is needed, and provide suggestions on what kind of data would be valuable for this topic.

  If data is present:
  1. A general summary of the data.
  2. Specific trends identified (growth, decline, peaks, outliers).
  3. One actionable suggestion based on the data.
  
  Keep the language professional, concise, and use Simplified Chinese.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          trends: { type: Type.ARRAY, items: { type: Type.STRING } },
          suggestion: { type: Type.STRING }
        }
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  return JSON.parse(text) as AnalysisResult;
};