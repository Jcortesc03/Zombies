import fs from "node:fs";
import path from "node:path";
import config from "../../config/env.js";
import { chunkJson } from "./chunker.js";

let cache = null;
let cacheSource = "";

/** Lee y trocea todos los documentos JSON de la carpeta de conocimiento. */
export function loadKnowledge({ forceReload = false } = {}) {
  const dataDir = path.resolve(config.rag.dataDir);

  if (cache && !forceReload && cacheSource === dataDir) return cache;

  if (!fs.existsSync(dataDir)) {
    cache = [];
    cacheSource = dataDir;
    return cache;
  }

  const files = fs
    .readdirSync(dataDir)
    .filter((file) => file.endsWith(".json"))
    .sort();

  const chunks = [];

  for (const file of files) {
    const filePath = path.join(dataDir, file);
    try {
      const document = JSON.parse(fs.readFileSync(filePath, "utf8"));
      chunks.push(...chunkJson(document, file));
    } catch (error) {
      console.warn(`[knowledge] No se pudo cargar "${file}": ${error.message}`);
    }
  }

  cache = chunks;
  cacheSource = dataDir;
  return chunks;
}

/** Devuelve el número de documentos/chunks cargados (para el endpoint de salud). */
export function getKnowledgeStats() {
  return { chunks: loadKnowledge().length, dir: config.rag.dataDir };
}