import { getDb } from "../database.js";

/** Inserta un mensaje en una conversación. */
export function createMessage({ conversationId, role, content }) {
  const db = getDb();
  const result = db
    .prepare(
      `INSERT INTO messages (conversation_id, role, content)
       VALUES (?, ?, ?)`
    )
    .run(conversationId, role, content);

  return db
    .prepare(
      `SELECT id, conversation_id AS conversationId, role, content, created_at AS createdAt
         FROM messages WHERE id = ?`
    )
    .get(result.lastInsertRowid);
}

/** Mensajes de una conversación, en orden cronológico. */
export function listMessagesByConversation(conversationId) {
  const db = getDb();
  return db
    .prepare(
      `SELECT id, conversation_id AS conversationId, role, content, created_at AS createdAt
         FROM messages
        WHERE conversation_id = ?
        ORDER BY id ASC`
    )
    .all(conversationId);
}

/** Elimina todos los mensajes de una conversación. */
export function deleteMessagesByConversation(conversationId) {
  const db = getDb();
  const result = db
    .prepare("DELETE FROM messages WHERE conversation_id = ?")
    .run(conversationId);
  return { deleted: result.changes > 0, conversationId };
}

/** Número de mensajes de una conversación. */
export function countMessagesByConversation(conversationId) {
  const db = getDb();
  return db
    .prepare("SELECT COUNT(*) AS total FROM messages WHERE conversation_id = ?")
    .get(conversationId).total;
}