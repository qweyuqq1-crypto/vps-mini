
import { GoogleGenAI } from "@google/genai";

// Explains a specific Gost protocol using Gemini AI
export async function explainGostProtocol(protocol: string): Promise<string> {
  // Always initialize with process.env.API_KEY directly as a named parameter
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      // Using 'gemini-3-flash-preview' for basic text explanation tasks
      model: 'gemini-3-flash-preview',
      contents: `Explain the Gost tunnel protocol "${protocol}" and its common use cases in VPS traffic forwarding. Keep it concise and professional.`,
    });
    // Directly access the .text property from the response object
    return response.text || "No explanation available.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Failed to fetch explanation from AI assistant.";
  }
}

// Suggests a Gost configuration based on a target destination
export async function suggestGostConfig(target: string): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
        const response = await ai.models.generateContent({
            // Using 'gemini-3-flash-preview' for basic text tasks
            model: 'gemini-3-flash-preview',
            contents: `The user wants to forward traffic to ${target}. Suggest a secure and efficient Gost configuration command (e.g., gost -L=...).`,
        });
        // Directly access the .text property from the response object
        return response.text || "No suggestion available.";
    } catch (error) {
        console.error("Gemini Suggestion Error:", error);
        return "Failed to generate config suggestion.";
    }
}
