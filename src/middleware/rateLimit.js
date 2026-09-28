import rateLimit from "express-rate-limit";
import config from "../config/env.js";

/** Limita las peticiones de IA a GEMINI_RPM por minuto (protege la cuota gratuita). */
export function createChatLimiter() {
  return rateLimit({
    windowMs: 60 * 1000,
    limit: Math.max(config.ai.rpm, 1),
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: {
      ok: false,
      error: {
        code: "RATE_LIMITED",
        message: `Demasiadas consultas. El plan gratuito de Gemini permite ${config.ai.rpm} por minuto; espera un momento.`,
      },
    },
  });
}