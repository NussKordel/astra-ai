import OpenAI from "openai";

export const openrouter = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

export const MODELS = {
  default: "deepseek/deepseek-v4-pro",
  vision: "google/gemini-3-flash-preview",
};
