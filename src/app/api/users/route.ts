import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db, ensureDatabase } from "@/db";
import * as schema from "@/db/schema";
import { auth, ensureAuthSeed } from "@/lib/auth";

function slugFromName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "");
}

async function uniqueLocalEmail(name: string) {
  const base = slugFromName(name) || `operator${Date.now()}`;
  let email = `${base}@yudhistira.local`;
  let counter = 2;

  while (await db.select().from(schema.user).where(eq(schema.user.email, email)).get()) {
    email = `${base}${counter}@yudhistira.local`;
    counter += 1;
  }

  return email;
}

export async function GET() {
  await ensureDatabase();
  await ensureAuthSeed();

  const users = await db
    .select({
      email: schema.user.email,
      id: schema.user.id,
      name: schema.user.name,
      role: schema.user.role
    })
    .from(schema.user)
    .all();

  return NextResponse.json({ users });
}

export async function PATCH(request: Request) {
  await ensureDatabase();

  const body = (await request.json()) as {
    id?: string;
    name?: string;
    resetPassword?: boolean;
    role?: "Admin" | "Operator";
  };

  if (!body.id) {
    return NextResponse.json({ error: "Invalid user payload" }, { status: 400 });
  }

  const targetUser = await db
    .select()
    .from(schema.user)
    .where(eq(schema.user.id, body.id))
    .get();

  if (!targetUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (body.resetPassword) {
    return NextResponse.json({
      ok: true,
      temporaryPassword:
        targetUser.email === "admin@yudhistira.local" ? "admin123" : "operator123"
    });
  }

  if (!body.role && !body.name) {
    return NextResponse.json({ error: "Name or role is required" }, { status: 400 });
  }

  if (
    targetUser.email === "admin@yudhistira.local" &&
    body.role &&
    body.role !== "Admin"
  ) {
    return NextResponse.json(
      { error: "Admin utama tidak boleh diubah menjadi Operator" },
      { status: 400 }
    );
  }

  const updates: Partial<typeof schema.user.$inferInsert> = {
    updatedAt: new Date()
  };

  if (body.name?.trim()) {
    updates.name = body.name.trim();
  }

  if (body.role) {
    updates.role = body.role;
  }

  await db.update(schema.user)
    .set(updates)
    .where(eq(schema.user.id, body.id))
    .run();

  return NextResponse.json({ ok: true });
}

export async function POST(request: Request) {
  await ensureDatabase();
  await ensureAuthSeed();

  const body = (await request.json()) as {
    email?: string;
    name?: string;
    password?: string;
    role?: "Admin" | "Operator";
  };

  if (!body.name || !body.password || !body.role) {
    return NextResponse.json({ error: "Invalid create user payload" }, { status: 400 });
  }

  const email = body.email?.trim() || await uniqueLocalEmail(body.name);

  try {
    const result = await auth.api.signUpEmail({
      body: {
        email,
        name: body.name.trim(),
        password: body.password,
        role: body.role
      }
    });

    await db.update(schema.user)
      .set({ role: body.role, updatedAt: new Date() })
      .where(eq(schema.user.email, email))
      .run();

    return NextResponse.json({ ok: true, user: result.user });
  } catch {
    return NextResponse.json(
      { error: "User sudah ada atau gagal dibuat" },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request) {
  await ensureDatabase();
  await ensureAuthSeed();

  const body = (await request.json()) as { id?: string };

  if (!body.id) {
    return NextResponse.json({ error: "Invalid delete user payload" }, { status: 400 });
  }

  const targetUser = await db
    .select()
    .from(schema.user)
    .where(eq(schema.user.id, body.id))
    .get();

  if (!targetUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (targetUser.email === "admin@yudhistira.local") {
    return NextResponse.json(
      { error: "Admin utama tidak boleh dihapus" },
      { status: 400 }
    );
  }

  await db.delete(schema.user).where(eq(schema.user.id, body.id)).run();

  return NextResponse.json({ ok: true });
}
