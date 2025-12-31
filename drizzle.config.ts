import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./lib/db/schema/index.ts", // Sesuaikan lokasi file schema kamu nanti
  out: "./drizzle", // Folder output migrasi (otomatis dibuat)
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
