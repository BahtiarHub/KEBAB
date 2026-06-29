import { defineConfig } from "drizzle-kit";

const tursoUrl = process.env.TURSO_DATABASE_URL ?? process.env.DATABASE_URL;
const tursoAuthToken =
  process.env.TURSO_AUTH_TOKEN ?? process.env.DATABASE_AUTH_TOKEN;

export default defineConfig({
  dialect: tursoUrl ? "turso" : "sqlite",
  dbCredentials: tursoUrl
    ? {
        authToken: tursoAuthToken,
        url: tursoUrl
      }
    : {
        url: "./data/kebab.sqlite"
      },
  out: "./drizzle",
  schema: "./src/db/schema.ts"
});
