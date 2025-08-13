const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv/config");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const AVAILABLE_MODELS = [
  "gemini-1.5-flash",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite-preview-02-05",
  "gemini-2.0-flash-exp",
  "gemini-1.5-flash-8b",
];

async function generateAI(content) {
  console.log('LAGI DI PROSES...')
  let res = "";
  for (const model of AVAILABLE_MODELS) {
    const ai = genAI.getGenerativeModel({ model });

    const result = await ai.generateContent(content);
    const response = await result.response;
    res = response.text();
    break;
  }

  console.log("SELESAI...");
  return res;
}

module.exports = {
  generateAI,
};
