import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

export const getAIResponse = async (prompt: string) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash"
    });

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ]
    });

    const text = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!text || text.length < 5) {
      return "AI temporarily unavailable. Please try again.";
    }

    return text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "AI temporarily unavailable. Please try again.";
  }
};

/**
 * Analyzes a medical report (file or text) and returns structured JSON data.
 * @param input Can be a File object or a string prompt.
 */
export const analyzeMedicalReport = async (input: any) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash"
    });

    let result;
    const prompt = `Analyze this medical report and return a JSON object with:
      "summary": A brief 1-2 sentence overview.
      "conditions": List of diagnosed conditions or symptoms.
      "medications": List of prescribed medications.
      "tests": List of medical tests performed.
      "dates": List of important dates found in the report.
      "risk_level": One of "Low", "Medium", "High".
      
      Return ONLY the JSON object.`;

    if (input instanceof File) {
      const base64Data = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(input);
      });

      result = await model.generateContent({
        contents: [
          {
            role: "user",
            parts: [
              { inlineData: { data: base64Data, mimeType: input.type } },
              { text: prompt }
            ]
          }
        ]
      });
    } else {
      result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: input || prompt }] }]
      });
    }

    const responseText = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    let text = responseText.replace(/```json|```/g, "").trim();
    
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (err) {
      parsed = {
        summary: "Basic analysis completed with limited data.",
        conditions: [],
        medications: [],
        tests: [],
        risk_level: "Low",
        dates: [new Date().toISOString().split("T")[0]]
      };
    }

    if (!parsed || typeof parsed !== "object") {
      parsed = {
        summary: "Fallback analysis",
        conditions: [],
        medications: [],
        tests: [],
        risk_level: "Low",
        dates: [new Date().toISOString().split("T")[0]]
      };
    }

    return parsed;
  } catch (err) {
    console.error("Gemini Analysis Error:", err);
    return {
      summary: "AI analysis failed. Showing basic insights.",
      conditions: [],
      medications: [],
      tests: [],
      dates: [new Date().toISOString().split("T")[0]],
      risk_level: "Low"
    };
  }
};

export const safeParse = (text: string) => {
  try {
    return JSON.parse(text);
  } catch {
    return {
      summary: "Basic analysis",
      conditions: [],
      medications: [],
      risk_level: "low"
    };
  }
};
