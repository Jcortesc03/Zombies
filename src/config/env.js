import "dotenv/config";
import path from "node:path";

const toBool = (value, fallback) => {
  if (value === undefined || value === null || value === "") return fallback;
  return ["1", "true", "yes", "on"].includes(String(value).toLowerCase());
};

const config = {
  port: Number(process.env.PORT ?? 3000),
  nodeEnv: process.env.NODE_ENV ?? "development",
  isDev: (process.env.NODE_ENV ?? "development") === "development",

  db: {
    path: process.env.DB_PATH ?? path.resolve("./storage/zombies.db"),
    enabled: toBool(process.env.DB_ENABLED, true),
  },

  ai: {
    apiKey: process.env.GEMINI_API_KEY ?? "",
    model: process.env.GEMINI_MODEL ?? "gemini-2.0-flash",
    rpm: Number(process.env.GEMINI_RPM ?? 10),
    maxTokens: Number(process.env.GEMINI_MAX_TOKENS ?? 2048),
    temperature: Number(process.env.GEMINI_TEMPERATURE ?? 0.7),
  },

  rag: {
    enabled: toBool(process.env.RAG_ENABLED, true),
    topK: Number(process.env.RAG_TOP_K ?? 5),
    minRelevance: Number(process.env.RAG_MIN_RELEVANCE ?? 0.3),
    dataDir: process.env.RAG_DATA_DIR ?? "./data/knowledge",
  },
};

export default config;