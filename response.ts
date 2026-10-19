import { NextResponse } from "next/server";

export function ok<T>(data: T, meta?: Record<string, unknown>, init?: ResponseInit) {
  return NextResponse.json({ data, ...(meta ? { meta } : {}) }, init);
}

export function fail(status: number, code: string, message: string, details?: unknown, headers?: HeadersInit) {
  return NextResponse.json({ error: { code, message, ...(details ? { details } : {}) } }, { status, headers });
}
