import { getDb } from "../database.js";

const ROW_FIELDS = `
  c.id,
  c.user_message          AS userMessage,
  c.ai_response           AS aiResponse,
  c.sources,
  c.status,
  c.error_code            AS errorCode,
  c.model,
  c.created_at            AS createdAt,
  c.updated_at            AS updatedAt
`;

const safeParse = (json, fallback) => {
  try {
    const value = JSON.parse(json);
    return Array.isArray(value) ? value : fallback;
  } catch {
    return fallback;
  }
};

const mapRow = (row) =>
  row ? { ...row, sources: safeParse(row.sources, []) } : null;

/** Crea una conversación a partir de la pregunta del usuario. */
export function createConversation({
  userMessage,
  aiResponse = "",
  sources = [],
  status = "pendiente",
  errorCode = null,
  model = null,
}) {
  const db = getDb();
  const result = db
    .prepare(
      `INSERT INTO conversations (user_message, ai_response, sources, status, error_code, model)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(userMessage, aiResponse, JSON.stringify(sources), status, errorCode, model);

  return findConversationById(result.lastInsertRowid);
}

/** Lista conversaciones. Incluye el último mensaje como vista previa. */
export function listConversations({ limit = 20, offset = 0 } = {}) {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT ${ROW_FIELDS},
              (SELECT content FROM messages m
                WHERE m.conversation_id = c.id
                ORDER BY m.id DESC LIMIT 1) AS lastMessage
         FROM conversations c
        ORDER BY c.created_at DESC, c.id DESC
        LIMIT ? OFFSET ?`
    )
    .all(limit, offset);

  return rows.map(mapRow);
}

/** Devuelve una conversación por id o null. */
export function findConversationById(id) {
  const db = getDb();
  const row = db
    .prepare(`SELECT ${ROW_FIELDS} FROM conversations c WHERE c.id = ?`)
    .get(id);
  return mapRow(row);
}

/** Actualiza campos permitidos de una conversación. Devuelve la versión nueva. */
export function updateConversation(id, fields = {}) {
  const allowed = {
    userMessage: "user_message",
    aiResponse: "ai_response",
    sources: "sources",
    status: "status",
    errorCode: "error_code",
    model: "model",
  };

  const assignments = [];
  const params = [];

  for (const [key, column] of Object.entries(allowed)) {
    if (fields[key] !== undefined) {
      assignments.push(`${column} = ?`);
      params.push(column === "sources" ? JSON.stringify(fields[key]) : fields[key]);
    }
  }

  if (assignments.length === 0) return findConversationById(id);

  assignments.push("updated_at = datetime('now')");
  params.push(id);

  getDb()
    .prepare(`UPDATE conversations SET ${assignments.join(", ")} WHERE id = ?`)
    .run(...params);

  return findConversationById(id);
}

/** Elimina una conversación y (por CASCADE) sus mensajes. */
export function deleteConversation(id) {
  const db = getDb();
  const result = db.prepare("DELETE FROM conversations WHERE id = ?").run(id);
  return { deleted: result.changes > 0, id };
}

/** Total de conversaciones almacenadas. */
export function countConversations() {
  const db = getDb();
  return db.prepare("SELECT COUNT(*) AS total FROM conversations").get().total;
}