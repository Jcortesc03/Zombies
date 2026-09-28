import express from "express";
import path from "node:path";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";

import config from "./config/env.js";
import { initDatabase } from "./db/database.js";
import chatRoutes from "./routes/chat.routes.js";
import historyRoutes from "./routes/history.routes.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { getKnowledgeStats } from "./services/rag/knowledge.service.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "50kb" }));
app.use(morgan(config.isDev ? "dev" : "combined"));

// Frontend estático
app.use(express.static(path.resolve("public")));

// API de salud
app.get("/api/health", (_req, res) => {
  res.status(200).json({
    ok: true,
    servicio: "zombi-ai",
    estadoDb: config.db.enabled ? "conectada" : "desactivada",
    ai: {
      proveedor: "gemini",
      configurada: Boolean(config.ai.apiKey),
      modelo: config.ai.model,
      resumen: config.ai.apiKey ? "real" : "mock",
    },
    knowledge: getKnowledgeStats(),
  });
});

// API
app.use("/api/chat", chatRoutes);
app.use("/api/history", historyRoutes);

// 404 y errores
app.use(notFoundHandler);
app.use(errorHandler);

const server = app.listen(config.port, () => {
  console.log(`\n  ZOMBI // AI en http://localhost:${config.port}`);
  console.log(
    `  IA: ${config.ai.apiKey ? "Gemini (" + config.ai.model + ")" : "MODO SIMULACRO (sin GEMINI_API_KEY)"}`
  );
  console.log(`  Base de datos: ${config.db.enabled ? config.db.path : "desactivada"}\n`);
});

async function shutdown() {
  server.close(() => process.exit(0));
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

initDatabase();