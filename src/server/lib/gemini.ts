import { GoogleGenerativeAI } from "@google/generative-ai";
import {GoogleGenAI} from '@google/genai';
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({apiKey: apiKey});
if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

export const genAI = new GoogleGenerativeAI(apiKey);

// gemini-2.0-flash is on the free tier and fast enough for batch extraction
export const geminiModel = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  generationConfig: {
    responseMimeType: "application/json",
    temperature: 0,
  },
});