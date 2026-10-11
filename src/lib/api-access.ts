import { and, eq, gt } from "drizzle-orm";
import { db, ensureDatabase } from "@/db";
import * as schema from "@/db/schema";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export class ApiError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}

export async function requireUser(request: Request, adminOnly = false) {
  await ensureDatabase();
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) throw new ApiError("Silakan login kembali.", 401);
  // Read the current database role and session, not a cached client-side role.
  const valid = await db.select({ id: schema.user.id, name: schema.user.name, role: schema.user.role })
    .from(schema.session).innerJoin(schema.user, eq(schema.user.id, schema.session.userId))
    .where(and(eq(schema.session.id, session.session.id), gt(schema.session.expiresAt, new Date())))
    .get();
  if (!valid) throw new ApiError("Sesi sudah berakhir. Silakan login kembali.", 401);
  if (valid.role !== "Admin" && valid.role !== "Operator") throw new ApiError("Akses ditolak.", 403);
  if (adminOnly && valid.role !== "Admin") throw new ApiError("Hanya Admin yang dapat melakukan tindakan ini.", 403);
  return valid;
}

export async function accessResponse(request: Request, adminOnly = false) {
  try { await requireUser(request, adminOnly); return null; }
  catch (error) {
    if (error instanceof ApiError) return NextResponse.json({ error: error.message }, { status: error.status });
    throw error;
  }
}
