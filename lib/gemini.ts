import { GoogleGenerativeAI } from "@google/generative-ai";

export const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy-key-for-build");

// Helper function with retry logic as specified in SRS §6.6
export async function callGeminiWithRetry<T>(
  fn: () => Promise<{ responseMimeType?: string; text: string } | any>,
  maxRetries = 1
): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await fn();
      
      // If it's expected to be JSON, try to parse it
      if (result.responseMimeType === "application/json" || typeof result === "string") {
         const text = typeof result === "string" ? result : result.text;
         try {
           return JSON.parse(text) as T;
         } catch (e) {
           // Rethrow to trigger retry if JSON is malformed
           throw new Error("Malformed JSON response");
         }
      }
      
      return result as T;
    } catch (err) {
      if (attempt === maxRetries) throw err;
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  throw new Error("Unreachable");
}
