import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { auth, ensureAuthSeed } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  await ensureAuthSeed();
  const body = await request.json().catch(() => null);
  if (typeof body?.username !== "string" || typeof body?.password !== "string") return NextResponse.json({ error: "Username dan password wajib diisi." }, { status: 400 });
  const username = body.username.trim().toLowerCase();
  const user = await db.select({ email: schema.user.email }).from(schema.user)
    .where(username.includes("@") ? eq(sql`lower(${schema.user.email})`, username) : eq(sql`lower(trim(${schema.user.name}))`, username)).get();
  const fallback = `${username.replace(/[^a-z0-9]+/g, ".").replace(/^\.+|\.+$/g, "")}@yudhistira.local`;
  return auth.api.signInEmail({ headers: request.headers, body: { email: user?.email ?? fallback, password: body.password, rememberMe: true }, asResponse: true });
}
