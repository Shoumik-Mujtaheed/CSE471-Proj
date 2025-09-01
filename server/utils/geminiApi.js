// Gemini API helper using official Google GenAI SDK
import { GoogleGenerativeAI } from "@google/generative-ai";

async function callGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  
  console.log('🔑 Gemini API Key:', apiKey ? 'Set' : 'Not set');
  
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not found in environment variables');
    return null;
  }

  try {
    console.log('🚀 Initializing GoogleGenerativeAI...');
    
    // Initialize the GoogleGenerativeAI client
    const genAI = new GoogleGenerativeAI(apiKey);
    
    console.log('✅ GoogleGenerativeAI initialized');
    
    // Get the model
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.1, // Low temperature for consistent specialty recommendations
        maxOutputTokens: 30, // Keep response very short - just specialty name
      }
    });

    console.log('✅ Model configured, generating content...');

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    
    console.log('✅ Gemini API call successful');
    console.log('📝 Raw response text:', text);
    console.log('📏 Response length:', text.length);
    
    return text;

  } catch (error) {
    console.error('❌ Gemini API error:', error);
    console.error('❌ Error details:', error.message);
    return null;
  }
}

export { callGemini };
