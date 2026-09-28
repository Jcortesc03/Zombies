import { retrieveContext } from "./rag/retriever.js";
import { generateAssistantResponse } from "./ai/provider.js";
import {
  createConversation,
  updateConversation,
} from "../db/repositories/conversations.repository.js";
import { createMessage } from "../db/repositories/messages.repository.js";
import { AppError } from "../utils/errors.js";

/**
 * Procesa una pregunta de extremo a extremo:
 * RAG (recuperar contexto) -> IA (generar) -> SQLite (persistir).
 */
export async function askQuestion({ question }) {
  let conversation = null;

  try {
    const context = await retrieveContext(question);

    const sources = context.map((c) => ({
      tipo: c.tipo,
      titulo: c.titulo,
      juego: c.juego,
      fuente: c.fuente,
    }));

    const { text: respuesta, model } = await generateAssistantResponse({
      question,
      context,
    });

    conversation = createConversation({
      userMessage: question,
      aiResponse: respuesta,
      sources,
      status: "completada",
      model,
    });

    createMessage({ conversationId: conversation.id, role: "user", content: question });
    createMessage({ conversationId: conversation.id, role: "assistant", content: respuesta });

    return { conversation, respuesta, fuentes: sources, modelo: model };
  } catch (error) {
    if (conversation) {
      updateConversation(conversation.id, {
        status: "error",
        errorCode: error?.code ?? error?.name ?? "UNKNOWN",
      });
    }

    throw new AppError({
      status: 502,
      code: "AI_UNAVAILABLE",
      message: "El proveedor de IA no pudo completar la consulta. Inténtalo de nuevo en unos segundos.",
      cause: error,
    });
  }
}