import { NextResponse } from "next/server";
import { isMockDataEnabled } from "@/lib/data-source";

export async function POST(request: Request) {
  if (isMockDataEnabled()) return NextResponse.json({ id: `record-${Date.now()}`, ...await request.json() }, { status: 201 });
  const baseUrl = process.env.METRA_API_URL;
  if (!baseUrl) return NextResponse.json({ message: "API não configurada" }, { status: 503 });
  const payload = await request.json();
  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/pedagogical-records`, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(payload), cache: "no-store" });
  return new NextResponse(response.body, { status: response.status, headers: { "Content-Type": response.headers.get("content-type") ?? "application/json" } });
}
