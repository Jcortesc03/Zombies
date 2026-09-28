import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import config from "../config/env.js";

const SCHEMA_PATH = new URL("./schema.sql", import.meta.url);

let db = null;

/**
 * Abre (o crea) la base de datos, aplica el esquema y deja todo listo.
 * @returns {Database.Database} instancia de better-sqlite3
 */
export function initDatabase() {
  if (db) return db;

  const dbPath = path.resolve(config.db.path);

  if (config.db.enabled === false) {
    throw new Error("La base de datos está desactivada (DB_ENABLED=false).");
  }

  fs.mkdirSync(path.dirname(dbPath), { recursive: true });

  db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.pragma("busy_timeout = 5000");

  const schema = fs.readFileSync(SCHEMA_PATH, "utf8");
  db.exec(schema);

  return db;
}

/**
 * Devuelve la instancia ya inicializada. Si aún no se ha abierto,
 * la inicializa sobre la marcha.
 */
export function getDb() {
  return db ?? initDatabase();
}

/** Cierra la conexión si está abierta. */
export function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}