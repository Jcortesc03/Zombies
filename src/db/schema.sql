-- ============================================================
--  Esquema de la base de datos ZOMBI // AI
--  SQLite · se ejecuta al arrancar si las tablas no existen
-- ============================================================

PRAGMA foreign_keys = ON;

-- ------------------------------------------------------------
-- Conversaciones: una petición del usuario y su respuesta IA
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS conversations (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_message TEXT    NOT NULL,
    ai_response  TEXT    NOT NULL DEFAULT '',
    sources      TEXT    NOT NULL DEFAULT '[]',     -- JSON: fuentes/contexto recuperado
    status       TEXT    NOT NULL DEFAULT 'completada'
                 CHECK (status IN ('completada', 'error', 'pendiente')),
    error_code   TEXT,
    model        TEXT,                              -- modelo de IA empleado
    created_at   TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at   TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- ------------------------------------------------------------
-- Mensajes: registro detallado de cada turno (historial)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS messages (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id INTEGER NOT NULL
                    REFERENCES conversations (id) ON DELETE CASCADE,
    role            TEXT    NOT NULL
                    CHECK (role IN ('user', 'assistant', 'system')),
    content         TEXT    NOT NULL,
    created_at      TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Índices de consulta frecuente
CREATE INDEX IF NOT EXISTS idx_messages_conversation
    ON messages (conversation_id);

CREATE INDEX IF NOT EXISTS idx_conversations_created
    ON conversations (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_created
    ON messages (created_at);