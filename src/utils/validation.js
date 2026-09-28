/** Valida la pregunta del usuario (texto obligatorio, 1..500 caracteres). */
export function validateQuestion(question) {
  if (typeof question !== "string") {
    return { error: "La pregunta debe ser un texto." };
  }
  const value = question.trim();
  if (value.length === 0) {
    return { error: "Escribe una pregunta antes de consultar." };
  }
  if (value.length > 500) {
    return { error: `La pregunta supera los 500 caracteres (${value.length}).` };
  }
  return { value };
}

/** Recorta y convierte un parámetro numérico opcional con límites seguros. */
export function parseLimit(value, fallback = 20, max = 100) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.min(Math.floor(parsed), max);
}