import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface AnalysisResult {
  post: string;
  riskLevel: "Low" | "Medium" | "High";
  riskScore: number;
  reason: string;
  suggestedAction: "Delete" | "Archive" | "Safe";
}

export async function analyzePost(post: string): Promise<AnalysisResult> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the following social media post for potential visa risk (e.g., extremist views, illegal activities, intent to work illegally, or controversial political statements that might trigger secondary inspection).
      
      POST CONTENT: "${post}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            riskLevel: {
              type: Type.STRING,
              description: "Risk level: Low, Medium, or High",
            },
            riskScore: {
              type: Type.NUMBER,
              description: "Risk score from 0 to 100",
            },
            reason: {
              type: Type.STRING,
              description: "Short explanation of the risk",
            },
            suggestedAction: {
              type: Type.STRING,
              description: "Action: Delete, Archive, or Safe",
            },
          },
          required: ["riskLevel", "riskScore", "reason", "suggestedAction"],
        },
      },
    });

    const result = JSON.parse(response.text || "{}");
    return {
      post,
      riskLevel: result.riskLevel || "Low",
      riskScore: result.riskScore || 0,
      reason: result.reason || "No risk detected.",
      suggestedAction: result.suggestedAction || "Safe",
    };
  } catch (error) {
    console.error("Gemini analysis error:", error);
    return {
      post,
      riskLevel: "Low",
      riskScore: 0,
      reason: "Analysis failed.",
      suggestedAction: "Safe",
    };
  }
}
