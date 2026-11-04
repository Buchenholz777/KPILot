import { defineConfig } from "vitest/config";

// Nur für `npm run docs` – erzeugt die Formeldokumentation.
export default defineConfig({ test: { include: ["scripts/gen-docs.ts"] } });
