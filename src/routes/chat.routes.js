import { Router } from "express";
import { chatHandler } from "../controllers/chat.controller.js";
import { createChatLimiter } from "../middleware/rateLimit.js";

const router = Router();

router.post("/", createChatLimiter(), chatHandler);

export default router;