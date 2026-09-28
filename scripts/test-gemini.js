import config from "../src/config/env.js";

const run = async () => {
  console.log("─ ZOMBI // AI · Prueba de conexión con Gemini ─");

  if (!config.ai.apiKey) {
    console.log("✗ No hay GEMINI_API_KEY en el entorno (o en .env).");
    console.log("  Configúrala en https://aistudio.google.com/apikey y vuelve a intentarlo.");
    process.exit(1);
  }

  const { generateGeminiText } = await import("../src/services/ai/gemini.service.js");

  const { text, model } = await generateGeminiText({
    systemPrompt: "Responde en una sola frase.",
    userPrompt: "¿Cuál es el mapa de apertura de Black Ops 3 Zombies?",
  });

  console.log(`✓ Modelo: ${model}`);
  console.log(`✓ Respuesta: ${text}`);
};

run().catch((error) => {
  console.error("✗ Error de conexión:", error?.message ?? error);
  console.error("  status:", error?.status ?? "?", "| name:", error?.name ?? "?");
  process.exit(1);
});