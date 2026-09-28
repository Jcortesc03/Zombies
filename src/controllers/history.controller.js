import {
  listConversations,
  findConversationById,
  deleteConversation,
} from "../db/repositories/conversations.repository.js";
import { listMessagesByConversation } from "../db/repositories/messages.repository.js";
import { AppError } from "../utils/errors.js";
import { parseLimit } from "../utils/validation.js";

/** GET /api/history — lista conversaciones con la vista previa del último mensaje. */
export function listHistoryHandler(req, res) {
  const limit = parseLimit(req.query.limit, 20, 100);
  const offset = Math.max(Number(req.query.offset ?? 0) || 0, 0);

  const items = listConversations({ limit, offset });
  res.status(200).json({ ok: true, total: items.length, items });
}

/** GET /api/history/:id — detalle de una conversación con sus mensajes. */
export function showHistoryHandler(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      throw new AppError({ status: 400, code: "VALIDATION", message: "Identificador inválido." });
    }

    const conversation = findConversationById(id);
    if (!conversation) {
      throw new AppError({ status: 404, code: "NOT_FOUND", message: `No existe la conversación ${id}.` });
    }

    const messages = listMessagesByConversation(id);
    res.status(200).json({ ok: true, conversation, messages });
  } catch (error) {
    next(error);
  }
}

/** DELETE /api/history/:id — borra una conversación y sus mensajes. */
export function deleteHistoryHandler(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      throw new AppError({ status: 400, code: "VALIDATION", message: "Identificador inválido." });
    }

    const result = deleteConversation(id);
    if (!result.deleted) {
      throw new AppError({ status: 404, code: "NOT_FOUND", message: `No existe la conversación ${id}.` });
    }

    res.status(200).json({ ok: true, deleted: result.id });
  } catch (error) {
    next(error);
  }
}