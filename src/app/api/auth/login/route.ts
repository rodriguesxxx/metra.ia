import { NextResponse } from "next/server";
import { isMockDataEnabled } from "@/lib/data-source";

export async function POST(request: Request) {
  if (isMockDataEnabled()) {
    await request.text();
    return NextResponse.json({ ok: true });
  }
  const baseUrl = process.env.METRA_API_URL;
  if (!baseUrl) return NextResponse.json({ message: "API não configurada" }, { status: 503 });
  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/auth/login`, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: await request.text(), cache: "no-store" });
  const headers = new Headers();
  const setCookie = response.headers.get("set-cookie");
  if (setCookie) headers.set("set-cookie", setCookie);
  headers.set("content-type", response.headers.get("content-type") ?? "application/json");
  return new NextResponse(response.body, { status: response.status, headers });
}
