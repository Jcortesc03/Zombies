import { GoogleGenAI } from "@google/genai";
import config from "../../config/env.js";

let client = null;

function getClient() {
  if (!client) client = new GoogleGenAI({ apiKey: config.ai.apiKey });
  return client;
}

/**
 * Llama a Gemini (plan gratuito de Google AI Studio).
 * @param {object} params
 * @param {string} params.systemPrompt - instrucciones de sistema
 * @param {string} params.userPrompt - contexto + pregunta del usuario
 */
export async function generateGeminiText({ systemPrompt, userPrompt }) {
  if (!config.ai.apiKey) {
    throw new Error("No hay GEMINI_API_KEY configurada. Usa el proveedor mock o rellena el .env.");
  }

  const response = await getClient()
    .models.generateContent({
      model: config.ai.model,
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        maxOutputTokens: config.ai.maxTokens,
        temperature: config.ai.temperature,
      },
    });

  return {
    text: (response?.text ?? "").trim(),
    model: config.ai.model,
  };
}