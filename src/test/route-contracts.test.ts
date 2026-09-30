import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const dependencies = vi.hoisted(() => ({
  isMockDataEnabled: vi.fn<() => boolean>(),
  getSession: vi.fn(),
  getStudentAcademicScope: vi.fn(),
  canCreatePedagogicalRecord: vi.fn(),
  canManageStudentPhoto: vi.fn(),
  canReadPedagogicalData: vi.fn(),
  createMockPedagogicalRecord: vi.fn(),
  getMockStudentPhoto: vi.fn(),
  setMockStudentPhoto: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/config/data-source", () => ({ isMockDataEnabled: dependencies.isMockDataEnabled }));
vi.mock("@/services/server/session", () => ({ getSession: dependencies.getSession }));
vi.mock("@/services/server/students", () => ({ getStudentAcademicScope: dependencies.getStudentAcademicScope }));
vi.mock("@/domains/identity/authorization", () => ({
  canCreatePedagogicalRecord: dependencies.canCreatePedagogicalRecord,
  canManageStudentPhoto: dependencies.canManageStudentPhoto,
  canReadPedagogicalData: dependencies.canReadPedagogicalData,
}));
vi.mock("@/mocks/students", () => ({
  createMockPedagogicalRecord: dependencies.createMockPedagogicalRecord,
  getMockStudentPhoto: dependencies.getMockStudentPhoto,
  setMockStudentPhoto: dependencies.setMockStudentPhoto,
}));

import { POST as login } from "@/app/api/auth/login/route";
import { POST as logout } from "@/app/api/auth/logout/route";
import { POST as createRecord } from "@/app/api/records/route";
import { GET as getPhoto, POST as uploadPhoto, dynamic } from "@/app/api/students/[id]/photo/route";

const user = {
  id: "teacher-1", name: "Rafael", role: "teacher" as const,
  permissions: [], courseIds: [], classIds: ["class-1"], subjectIds: ["math"],
};
const scope = { classId: "class-1", courseId: "course-1" };
const validRecord = { studentId: " stu-1 ", category: " apoio ", note: " Acompanhamento semanal. ", subjectId: " math ", period: " " };
const normalizedRecord = { studentId: "stu-1", note: "Acompanhamento semanal.", category: "apoio", subjectId: "math" };
const photoContext = (id = "stu-1") => ({ params: Promise.resolve({ id }) }) as Parameters<typeof getPhoto>[1];
const photoRequest = (formData: () => Promise<FormData>, cookie?: string) => ({
  headers: new Headers(cookie ? { cookie } : undefined), formData,
}) as unknown as Request;
function imageFile(bytes: Uint8Array, name = "ana.jpeg", type = "image/jpeg") {
  const file = new File([bytes], name, { type });
  // jsdom's File omits Blob.arrayBuffer(), which the route uses in Node.
  Object.defineProperties(file, {
    arrayBuffer: { value: async () => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) },
    slice: { value: (start = 0, end = bytes.length) => ({ arrayBuffer: async () => bytes.slice(start, end).buffer }) },
  });
  return file;
}
const jpeg = () => imageFile(new Uint8Array([0xff, 0xd8, 0xff, 0x01]));

beforeEach(() => {
  vi.clearAllMocks();
  dependencies.isMockDataEnabled.mockReturnValue(false);
  dependencies.getSession.mockResolvedValue(user);
  dependencies.getStudentAcademicScope.mockResolvedValue(scope);
  dependencies.canCreatePedagogicalRecord.mockReturnValue(true);
  dependencies.canManageStudentPhoto.mockReturnValue(true);
  dependencies.canReadPedagogicalData.mockReturnValue(true);
  vi.stubGlobal("fetch", vi.fn());
  vi.stubEnv("METRA_API_URL", "https://api.example.test/");
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("POST /api/auth/login", () => {
  it("consumes the body in mock mode and returns ok without contacting the API", async () => {
    dependencies.isMockDataEnabled.mockReturnValue(true);
    const request = new Request("https://app.test/api/auth/login", { method: "POST", body: "credentials" });
    const response = await login(request);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(request.bodyUsed).toBe(true);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("returns 503 before reading the body when no API is configured", async () => {
    vi.stubEnv("METRA_API_URL", "");
    const request = new Request("https://app.test/api/auth/login", { method: "POST", body: "credentials" });
    const response = await login(request);
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ message: "API não configurada" });
    expect(request.bodyUsed).toBe(false);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("forwards the raw body and preserves upstream status, content type and cookie", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response("denied", { status: 401, headers: { "content-type": "text/plain", "set-cookie": "session=abc; HttpOnly" } }));
    const response = await login(new Request("https://app.test/api/auth/login", { method: "POST", body: '{"raw":true}' }));
    expect(fetch).toHaveBeenCalledWith("https://api.example.test/auth/login", {
      method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: '{"raw":true}', cache: "no-store",
    });
    expect(response.status).toBe(401);
    expect(response.headers.get("content-type")).toBe("text/plain");
    expect(response.headers.get("set-cookie")).toBe("session=abc; HttpOnly");
    expect(await response.text()).toBe("denied");
  });
});

describe("POST /api/auth/logout", () => {
  it("returns ok in mock mode without clearing a cookie or calling upstream", async () => {
    dependencies.isMockDataEnabled.mockReturnValue(true);
    const response = await logout(new Request("https://app.test/api/auth/logout", { method: "POST" }));
    expect(await response.json()).toEqual({ ok: true });
    expect(response.headers.has("set-cookie")).toBe(false);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("forwards the cookie, ignores upstream status and clears the local session", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 500 }));
    const response = await logout(new Request("https://app.test/api/auth/logout", { method: "POST", headers: { cookie: "session=abc" } }));
    expect(fetch).toHaveBeenCalledWith("https://api.example.test/auth/logout", {
      method: "POST", headers: { Cookie: "session=abc" }, cache: "no-store",
    });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(response.headers.get("set-cookie")).toBe("session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0");
  });

  it("clears the local cookie even without an API URL", async () => {
    vi.stubEnv("METRA_API_URL", "");
    const response = await logout(new Request("https://app.test/api/auth/logout", { method: "POST" }));
    expect(response.status).toBe(200);
    expect(response.headers.get("set-cookie")).toContain("Max-Age=0");
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe("POST /api/records", () => {
  it("rejects malformed or invalid JSON before looking up the session", async () => {
    for (const body of ["{", JSON.stringify({ studentId: "stu-1", note: "short" })]) {
      const response = await createRecord(new Request("https://app.test/api/records", { method: "POST", body }));
      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({ message: "Dados do acompanhamento inválidos." });
    }
    expect(dependencies.getSession).not.toHaveBeenCalled();
    expect(dependencies.getStudentAcademicScope).not.toHaveBeenCalled();
  });

  it("requires a session before student lookup", async () => {
    dependencies.getSession.mockResolvedValue(null);
    const response = await createRecord(new Request("https://app.test/api/records", { method: "POST", body: JSON.stringify(validRecord) }));
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ message: "Sessão necessária." });
    expect(dependencies.getStudentAcademicScope).not.toHaveBeenCalled();
  });

  it("maps scope lookup errors to 404 and denies permission before data-source work", async () => {
    dependencies.getStudentAcademicScope.mockRejectedValueOnce(new Error("unavailable"));
    const request = () => new Request("https://app.test/api/records", { method: "POST", body: JSON.stringify(validRecord) });
    const missing = await createRecord(request());
    expect(missing.status).toBe(404);
    expect(await missing.json()).toEqual({ message: "Estudante não encontrado." });
    expect(dependencies.canCreatePedagogicalRecord).not.toHaveBeenCalled();
    dependencies.canCreatePedagogicalRecord.mockReturnValue(false);
    const denied = await createRecord(request());
    expect(dependencies.getStudentAcademicScope).toHaveBeenLastCalledWith("stu-1");
    expect(dependencies.canCreatePedagogicalRecord).toHaveBeenCalledWith(user, { ...scope, subjectId: "math" });
    expect(denied.status).toBe(403);
    expect(await denied.json()).toEqual({ message: "Você não possui acesso a este estudante." });
    expect(dependencies.isMockDataEnabled).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("creates a transient mock record with the normalized payload", async () => {
    dependencies.isMockDataEnabled.mockReturnValue(true);
    dependencies.createMockPedagogicalRecord.mockReturnValue({ id: "mock-1" });
    const response = await createRecord(new Request("https://app.test/api/records", { method: "POST", body: JSON.stringify(validRecord) }));
    expect(dependencies.createMockPedagogicalRecord).toHaveBeenCalledWith(normalizedRecord, { id: "teacher-1", name: "Rafael" });
    expect(response.status).toBe(201);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toEqual({ id: "mock-1", transient: true });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("forwards a normalized record and cookie, returning only the upstream id", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ id: "record-7", ignored: true }), { status: 200 }));
    const response = await createRecord(new Request("https://app.test/api/records", { method: "POST", headers: { cookie: "session=abc" }, body: JSON.stringify(validRecord) }));
    expect(fetch).toHaveBeenCalledWith("https://api.example.test/pedagogical-records", {
      method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json", Cookie: "session=abc" },
      body: JSON.stringify(normalizedRecord), cache: "no-store",
    });
    expect(response.status).toBe(201);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toEqual({ id: "record-7" });
  });

  it("returns a sanitized upstream failure with its status", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response("private details", { status: 422 }));
    const response = await createRecord(new Request("https://app.test/api/records", { method: "POST", body: JSON.stringify(validRecord) }));
    expect(response.status).toBe(422);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toEqual({ message: "Não foi possível salvar o acompanhamento." });
  });
});

describe("/api/students/[id]/photo", () => {
  it("keeps GET dynamic and hides photos outside mock mode before session lookup", async () => {
    expect(dynamic).toBe("force-dynamic");
    const response = await getPhoto(new Request("https://app.test/api/students/stu-1/photo"), photoContext());
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ message: "Imagem não disponível." });
    expect(dependencies.getSession).not.toHaveBeenCalled();
  });

  it("requires a session and read permission before loading a mock photo", async () => {
    dependencies.isMockDataEnabled.mockReturnValue(true);
    dependencies.getSession.mockResolvedValueOnce(null);
    const request = () => new Request("https://app.test/api/students/stu-1/photo");
    const unauthenticated = await getPhoto(request(), photoContext());
    expect(unauthenticated.status).toBe(401);
    expect(dependencies.getStudentAcademicScope).not.toHaveBeenCalled();
    dependencies.canReadPedagogicalData.mockReturnValue(false);
    const forbidden = await getPhoto(request(), photoContext());
    expect(dependencies.canReadPedagogicalData).toHaveBeenCalledWith(user, scope);
    expect(forbidden.status).toBe(403);
    expect(await forbidden.json()).toEqual({ message: "Você não possui acesso a esta foto." });
    expect(dependencies.getMockStudentPhoto).not.toHaveBeenCalled();
  });

  it("returns 404 for missing mock photos and streams found bytes without caching", async () => {
    dependencies.isMockDataEnabled.mockReturnValue(true);
    const request = () => new Request("https://app.test/api/students/stu-1/photo");
    const missing = await getPhoto(request(), photoContext());
    expect(missing.status).toBe(404);
    expect(await missing.json()).toEqual({ message: "Imagem não cadastrada." });
    dependencies.getMockStudentPhoto.mockReturnValue({ contentType: "image/jpeg", data: new Uint8Array([1, 2, 3]) });
    const found = await getPhoto(request(), photoContext());
    expect(dependencies.getMockStudentPhoto).toHaveBeenLastCalledWith("stu-1");
    expect(found.status).toBe(200);
    expect(found.headers.get("content-type")).toBe("image/jpeg");
    expect(found.headers.get("cache-control")).toBe("no-store");
    expect(new Uint8Array(await found.arrayBuffer())).toEqual(new Uint8Array([1, 2, 3]));
  });

  it("authorizes POST before reading the form and reports form and file errors", async () => {
    const formData = vi.fn(async () => new FormData());
    dependencies.getSession.mockResolvedValueOnce(null);
    const unauthenticated = await uploadPhoto(photoRequest(formData), photoContext());
    expect(unauthenticated.status).toBe(401);
    expect(formData).not.toHaveBeenCalled();
    dependencies.canManageStudentPhoto.mockReturnValueOnce(false);
    const forbidden = await uploadPhoto(photoRequest(formData), photoContext());
    expect(forbidden.status).toBe(403);
    expect(await forbidden.json()).toEqual({ message: "Você não possui permissão para alterar esta foto." });
    expect(formData).not.toHaveBeenCalled();
    const malformed = await uploadPhoto(photoRequest(async () => { throw new Error("bad multipart"); }), photoContext());
    expect(malformed.status).toBe(400);
    expect(await malformed.json()).toEqual({ message: "Não foi possível processar a imagem." });
    const missing = await uploadPhoto(photoRequest(formData), photoContext());
    expect(missing.status).toBe(400);
    expect(await missing.json()).toEqual({ message: "Selecione uma imagem para continuar." });
  });

  it("rejects a mismatched image signature before mock or upstream work", async () => {
    const form = new FormData();
    form.set("photo", imageFile(new Uint8Array([1, 2, 3])));
    const response = await uploadPhoto(photoRequest(async () => form), photoContext());
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ message: "O conteúdo da imagem não corresponde ao formato informado." });
    expect(dependencies.isMockDataEnabled).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("stores a valid mock photo and returns an encoded transient URL", async () => {
    dependencies.isMockDataEnabled.mockReturnValue(true);
    const form = new FormData();
    form.set("photo", jpeg());
    const response = await uploadPhoto(photoRequest(async () => form), photoContext("stu /1"));
    expect(dependencies.setMockStudentPhoto).toHaveBeenCalledWith("stu /1", "image/jpeg", new Uint8Array([0xff, 0xd8, 0xff, 0x01]));
    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ photoUrl: "/api/students/stu%20%2F1/photo", transient: true });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("forwards the form and cookie, then uses the fallback URL for invalid upstream data", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ photoUrl: 7 }), { status: 200 }));
    const form = new FormData();
    form.set("photo", jpeg());
    const response = await uploadPhoto(photoRequest(async () => form, "session=abc"), photoContext("stu /1"));
    expect(fetch).toHaveBeenCalledWith("https://api.example.test/students/stu%20%2F1/photo", {
      method: "POST", headers: { Accept: "application/json", Cookie: "session=abc" }, body: form, cache: "no-store",
    });
    expect(response.status).toBe(201);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toEqual({ photoUrl: "/api/students/stu%20%2F1/photo" });
  });

  it("returns a sanitized upstream photo failure with its status", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response("private details", { status: 413 }));
    const form = new FormData();
    form.set("photo", jpeg());
    const response = await uploadPhoto(photoRequest(async () => form), photoContext());
    expect(response.status).toBe(413);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toEqual({ message: "Não foi possível atualizar a foto." });
  });
});
