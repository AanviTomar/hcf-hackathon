
import { GoogleGenAI, Type } from "@google/genai";
import { ExtractionResult } from "../types.ts";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const extractTagData = async (base64Image: string): Promise<ExtractionResult> => {
  const model = 'gemini-3-flash-preview';
  
  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        parts: [
          {
            text: `Extract machine part details from this industrial tag. 
            Identify the machine name, the type of part, the specific material used, any listed raw materials, and the units (e.g., kg, pcs, meters).
            If a field is missing, use "N/A".`
          },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image.split(',')[1] || base64Image
            }
          }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Machine or Part Name" },
          type: { type: Type.STRING, description: "Type of machine or component" },
          material: { type: Type.STRING, description: "Primary material used" },
          rawMaterials: { type: Type.STRING, description: "List of raw materials mentioned" },
          units: { type: Type.STRING, description: "Measurement units" }
        },
        required: ["name", "type", "material", "rawMaterials", "units"]
      }
    }
  });

  try {
    const text = response.text;
    return JSON.parse(text) as ExtractionResult;
  } catch (error) {
    console.error("Failed to parse Gemini response:", error);
    throw new Error("Could not interpret tag data clearly.");
  }
};
