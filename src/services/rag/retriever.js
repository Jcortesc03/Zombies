import config from "../../config/env.js";
import { loadKnowledge } from "./knowledge.service.js";

const normalize = (text) =>
  String(text ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // elimina acentos
    .replace(/[^\p{L}\p{N}\s]/gu, " "); // solo letras, números y espacios

const tokenize = (text) =>
  normalize(text)
    .split(/\s+/)
    .filter((word) => word.length > 2);

/** Puntuación simple de relevancia por solapamiento de palabras clave. */
function scoreChunk(chunk, tokens) {
  const haystack = new Set(normalize(`${chunk.titulo} ${chunk.keywords.join(" ")} ${chunk.texto}`).split(/\s+/));

  let hits = 0;
  for (const token of tokens) {
    if (haystack.has(token)) hits += 1;
  }

  const score = hits / Math.max(tokens.length, 1);
  return score;
}

/**
 * Recupera los fragmentos más relevantes para la pregunta.
 * @param {string} question - texto de la consulta del usuario
 * @returns {Promise<Array>} chunks ordenados por relevancia
 */
export async function retrieveContext(question) {
  const chunks = loadKnowledge();
  const tokens = tokenize(question);

  if (tokens.length === 0) return [];

  return chunks
    .map((chunk) => ({ chunk, score: scoreChunk(chunk, tokens) }))
    .filter(({ score }) => score >= config.rag.minRelevance)
    .sort((a, b) => b.score - a.score)
    .slice(0, config.rag.topK)
    .map(({ chunk }) => chunk);
}