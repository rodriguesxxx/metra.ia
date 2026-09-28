import "server-only";
import { cookies } from "next/headers";

export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

function apiBaseUrl() {
  const value = process.env.METRA_API_URL;
  if (!value) throw new ApiError(503, "Integração com a API ainda não foi configurada.");
  return value.replace(/\/$/, "");
}

export const isApiConfigured = () => Boolean(process.env.METRA_API_URL);

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const cookieHeader = (await cookies()).toString();
    const response = await fetch(`${apiBaseUrl()}${path}`, {
      ...init,
      headers: { Accept: "application/json", ...(cookieHeader ? { Cookie: cookieHeader } : {}), ...init?.headers },
      signal: controller.signal,
      cache: "no-store",
    });
    if (!response.ok) {
      throw new ApiError(response.status, `Não foi possível concluir a solicitação (${response.status}).`);
    }
    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) throw new ApiError(502, "A API retornou uma resposta inválida.");
    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof DOMException && error.name === "AbortError") throw new ApiError(504, "A API demorou mais que o esperado.");
    throw new ApiError(503, "Não foi possível conectar à API.");
  } finally {
    clearTimeout(timeout);
  }
}
