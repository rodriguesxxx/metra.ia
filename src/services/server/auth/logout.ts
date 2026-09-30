import "server-only";

import { NextResponse } from "next/server";
import { isMockDataEnabled } from "@/config/data-source";

export async function logout(request: Request) {
  if (isMockDataEnabled()) return NextResponse.json({ ok: true });
  const baseUrl = process.env.METRA_API_URL;
  if (baseUrl) await fetch(`${baseUrl.replace(/\/$/, "")}/auth/logout`, { method: "POST", headers: { Cookie: request.headers.get("cookie") ?? "" }, cache: "no-store" });
  const response = NextResponse.json({ ok: true });
  response.headers.append("set-cookie", "session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0");
  return response;
}
