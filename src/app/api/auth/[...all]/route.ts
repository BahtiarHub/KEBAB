import { toNextJsHandler } from "better-auth/next-js";

import { auth, ensureAuthSeed } from "@/lib/auth";
import { NextResponse } from "next/server";

const handlers = toNextJsHandler(auth);

export async function GET(request: Request) {
  await ensureAuthSeed();
  return handlers.GET(request);
}

export async function POST(request: Request) {
  if (/\/sign-up\/email\/?$/.test(new URL(request.url).pathname)) {
    return NextResponse.json({ error: "Pembuatan user hanya melalui Maintenance User oleh Admin." }, { status: 403 });
  }
  await ensureAuthSeed();
  return handlers.POST(request);
}

export async function PATCH(request: Request) {
  await ensureAuthSeed();
  return handlers.PATCH(request);
}

export async function PUT(request: Request) {
  await ensureAuthSeed();
  return handlers.PUT(request);
}

export async function DELETE(request: Request) {
  await ensureAuthSeed();
  return handlers.DELETE(request);
}
