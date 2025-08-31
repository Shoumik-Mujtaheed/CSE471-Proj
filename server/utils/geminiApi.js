// Gemini API helper using official Google GenAI SDK
import { GoogleGenerativeAI } from "@google/generative-ai";

async function callGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('GEMINI_API_KEY not found in environment variables');
    return null;
  }

  try {
    // Initialize the GoogleGenerativeAI client
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Get the model
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.1, // Low temperature for consistent medical advice
        maxOutputTokens: 50, // Keep response short to save tokens
      }
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
    
  } catch (error) {
    console.error('Gemini API error:', error);
    return null;
  }
}

export { callGemini };
