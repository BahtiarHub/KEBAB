import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { eq } from "drizzle-orm";

import { db, ensureDatabase } from "@/db";
import * as schema from "@/db/schema";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ?? "http://127.0.0.1:3000",
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema
  }),
  emailAndPassword: {
    enabled: true
  },
  plugins: [nextCookies()],
  secret:
    process.env.BETTER_AUTH_SECRET ??
    "development-only-secret-yudhistira-kebab-change-in-production",
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "Operator",
        input: true
      }
    }
  }
});

const seedUsers = [
  {
    email: "admin@yudhistira.local",
    name: "Admin",
    password: "admin123",
    role: "Admin"
  },
  {
    email: "operator@yudhistira.local",
    name: "Operator",
    password: "operator123",
    role: "Operator"
  }
];

let seeded = false;

export async function ensureAuthSeed() {
  await ensureDatabase();

  if (seeded) {
    return;
  }

  for (const user of seedUsers) {
    try {
      await auth.api.signUpEmail({
        body: user
      });
    } catch {
      // Existing users are fine; seeding should be idempotent.
    }

    await db.update(schema.user)
      .set({ role: user.role as "Admin" | "Operator", updatedAt: new Date() })
      .where(eq(schema.user.email, user.email))
      .run();
  }

  seeded = true;
}
