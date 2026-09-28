import { seedSampleData } from "../src/db/seed.js";
import { closeDatabase } from "../src/db/database.js";

try {
  const result = seedSampleData();
  if (result.seeded) {
    console.log(`[seed] Conversación de ejemplo creada con id=${result.conversationId}.`);
  } else {
    console.log(`[seed] Nada que insertar: ${result.reason}`);
  }
} finally {
  closeDatabase();
}