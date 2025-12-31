import "dotenv/config";
import postgres from "postgres";

async function main() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error("DATABASE_URL env variable is missing!");
    process.exit(1);
  }

  console.log("Creating connection to database...");
  const sql = postgres(connectionString);

  try {
    console.log("🗑️  Dropping 'public' schema...");
    await sql`DROP SCHEMA IF EXISTS public CASCADE`;

    console.log("✨ Re-creating 'public' schema...");
    await sql`CREATE SCHEMA public`;

    // Optional: Restore default grants
    await sql`GRANT ALL ON SCHEMA public TO postgres`;
    await sql`GRANT ALL ON SCHEMA public TO public`;

    console.log("✅ Database reset successfully (Tables dropped).");
  } catch (error) {
    console.error("❌ Error resetting database:", error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

main();
