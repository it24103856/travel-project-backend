import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  try {
    // සටහන: බොහෝ විට SDK එකේ listModels තිබෙන්නේ කෙලින්ම genAI යටතේය.
    // එය වැඩ නොකරන්නේ නම් Google API හරහා කෙලින්ම ලබා ගත හැක.
    const result = await genAI.listModels(); 
    
    console.log("--- පවතින මාදිලි ලැයිස්තුව (Available Models) ---");
    result.models.forEach((model) => {
      console.log(`🔹 Model: ${model.name}`);
    });
  } catch (error) {
    console.error("❌ දෝෂය:", error.message);
    console.log("\n💡 විකල්පය: ඔබේ API Key එකට අවසර ඇත්තේ 'gemini-1.5-flash' සඳහා පමණක් විය හැකියි.");
  }
}

listModels();