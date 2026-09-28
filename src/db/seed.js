import path from "node:path";
import { fileURLToPath } from "node:url";
import { initDatabase, closeDatabase } from "./database.js";
import {
  createConversation,
  countConversations,
} from "./repositories/conversations.repository.js";
import { createMessage } from "./repositories/messages.repository.js";

/**
 * Si la base está vacía, inserta una conversación de ejemplo para
 * que se pueda ver el CRUD funcionando sin esperar al backend de IA.
 */
export function seedSampleData() {
  initDatabase();

  if (countConversations() > 0) {
    return { seeded: false, reason: "La base ya contiene datos. no se reinserta." };
  }

  const conversation = createConversation({
    userMessage: "¿Quién es Richtofen y qué papel tiene en Origins?",
    aiResponse:
      "Edward Richtofen es uno de los Cuatro Primarios de la saga Zombies. En Origins (Black Ops II) aparecen sus versiones alternativas de la primera y de la segunda guerra mundial; el Richtofen primigenio usa la Gema Roja, manipula al grupo y cierra el ciclo con el proyecto que acabará por reescribir el continuo Aether. Es el antihéroe recurrente de toda la historia de Treyarch.",
    sources: [
      "data/knowledge/blackops2.json",
      "data/knowledge/blackops3.json",
    ],
    status: "completada",
    model: "gemini-2.0-flash",
  });

  createMessage({
    conversationId: conversation.id,
    role: "user",
    content: conversation.userMessage,
  });
  createMessage({
    conversationId: conversation.id,
    role: "assistant",
    content: conversation.aiResponse,
  });

  return { seeded: true, conversationId: conversation.id };
}

// Permite también `node src/db/seed.js` de forma directa.
if (process.argv[1] && import.meta.url.startsWith("file:")) {
  const here = new URL("./seed.js", import.meta.url);
  if (fileURLToPath(here) === path.resolve(process.argv[1])) {
    const result = seedSampleData();
    console.log(result);
    closeDatabase();
  }
}