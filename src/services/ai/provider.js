import config from "../../config/env.js";
import { generateGeminiText } from "./gemini.service.js";
import { buildSystemPrompt, buildUserPrompt } from "./prompt.builder.js";

const MOCK_DELAY_MS = 1300;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Respuesta simulada para desarrollar sin GEMINI_API_KEY. */
function mockResponse({ question, context }) {
  if (context.length === 0) {
    return {
      text: [
        `No tengo información suficiente en mi base de conocimiento sobre: "${question}".`,
        "",
        "Esto es una respuesta de SIMULACRO: no hay GEMINI_API_KEY configurada en el archivo .env.",
        "Configura tu clave en https://aistudio.google.com/apikey para obtener respuestas reales de Gemini.",
        "",
        'Prueba a preguntar por "Shadows of Evil", "Der Eisendrache" o "Richtofen".',
      ].join("\n"),
    };
  }

  const first = context[0];
  const extra = context.length > 1 ? `\n\n(Simulacro usando ${context.length} fragmentos recuperados por similitud.)` : "";

  return {
    text: [
      `Simulacro de respuesta sobre "${first.titulo}" (${first.juego}):`,
      "",
      first.texto,
      "",
      "Añade GEMINI_API_KEY en el .env para recibir esta información redactada y contextualizada por Gemini.",
      extra,
    ].join("\n"),
  };
}

/**
 * Orquesta la generación de la respuesta:
 *  - Si hay GEMINI_API_KEY, llama a Gemini con el contexto recuperado.
 *  - Si no, responde con un simulacro para desarrollo (nunca rompe la demo).
 */
export async function generateAssistantResponse({ question, context = [] }) {
  const systemPrompt = buildSystemPrompt({ hasContext: context.length > 0 });
  const userPrompt = buildUserPrompt({ question, context });

  if (config.ai.apiKey) {
    return generateGeminiText({ systemPrompt, userPrompt });
  }

  await delay(MOCK_DELAY_MS);
  return { ...mockResponse({ question, context }), model: "mock-local" };
}