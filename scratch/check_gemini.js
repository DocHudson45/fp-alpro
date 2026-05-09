const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();

async function test() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
    const result = await model.generateContent("test");
    console.log("gemini-2.5-pro: OK");
  } catch (e) {
    console.log("gemini-2.5-pro: Error - " + e.message);
  }
}

test();
