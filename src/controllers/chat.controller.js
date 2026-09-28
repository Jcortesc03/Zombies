import { askQuestion } from "../services/chat.service.js";
import { validateQuestion } from "../utils/validation.js";
import { AppError } from "../utils/errors.js";

/** POST /api/chat — procesa una pregunta del usuario. */
export async function chatHandler(req, res, next) {
  try {
    const validation = validateQuestion(req.body?.pregunta);

    if (validation.error) {
      throw new AppError({ status: 400, code: "VALIDATION", message: validation.error });
    }

    const result = await askQuestion({ question: validation.value });
    res.status(200).json({ ok: true, ...result });
  } catch (error) {
    next(error);
  }
}