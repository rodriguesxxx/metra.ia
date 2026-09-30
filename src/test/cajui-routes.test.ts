import { beforeEach, describe, expect, it, vi } from "vitest";

const dependencies = vi.hoisted(() => ({
  authorizeCajuiAction: vi.fn(),
  getCajuiSyncStatus: vi.fn(),
  syncCajuiClass: vi.fn(),
  prepareClassCouncil: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/services/server/integrations/authorization", () => ({ authorizeCajuiAction: dependencies.authorizeCajuiAction }));
vi.mock("@/services/server/integrations/cajui", async (importOriginal) => ({
  ...await importOriginal<typeof import("@/services/server/integrations/cajui")>(),
  getCajuiSyncStatus: dependencies.getCajuiSyncStatus,
  syncCajuiClass: dependencies.syncCajuiClass,
}));
vi.mock("@/services/server/prepare-council", () => ({ prepareClassCouncil: dependencies.prepareClassCouncil }));
import { ApiError } from "@/services/server/api";
import { GET as status, dynamic as statusDynamic } from "@/app/api/integrations/cajui/classes/[classId]/status/route";
import { POST as sync, dynamic as syncDynamic } from "@/app/api/integrations/cajui/classes/[classId]/sync/route";
import { POST as prepare, dynamic as prepareDynamic } from "@/app/api/class-councils/[classId]/prepare/route";

const context = (classId: string) => ({ params: Promise.resolve({ classId }) });
const request = (path: string, method: string) => new Request(`https://app.test${path}`, { method });
const statusRequest = () => request("/api/integrations/cajui/classes/class-1/status", "GET");
const syncRequest = () => request("/api/integrations/cajui/classes/class-1/sync", "POST");
const prepareRequest = () => request("/api/class-councils/class-1/prepare", "POST");
const previous = {
  classId: "class-1",
  sync: { status: "success", lastSuccessfulSyncAt: "2026-09-28T14:32:00.000Z" },
  snapshot: { marker: "last-good-snapshot" },
};

beforeEach(() => {
  vi.clearAllMocks();
  dependencies.authorizeCajuiAction.mockResolvedValue({ ok: true, session: { id: "user-1" } });
  dependencies.getCajuiSyncStatus.mockResolvedValue(previous);
  dependencies.syncCajuiClass.mockResolvedValue(previous);
  dependencies.prepareClassCouncil.mockResolvedValue(previous);
});

describe("Cajuí route entrypoints", () => {
  it("keeps all three route handlers dynamic", () => {
    expect(statusDynamic).toBe("force-dynamic");
    expect(syncDynamic).toBe("force-dynamic");
    expect(prepareDynamic).toBe("force-dynamic");
  });

  it("rejects an empty classId before authorization or integration I/O", async () => {
    const responses = await Promise.all([
      status(statusRequest(), context(" ")),
      sync(syncRequest(), context(" ")),
      prepare(prepareRequest(), context(" ")),
    ]);
    for (const response of responses) {
      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({ message: "Turma inválida." });
    }
    expect(dependencies.authorizeCajuiAction).not.toHaveBeenCalled();
    expect(dependencies.getCajuiSyncStatus).not.toHaveBeenCalled();
    expect(dependencies.syncCajuiClass).not.toHaveBeenCalled();
    expect(dependencies.prepareClassCouncil).not.toHaveBeenCalled();
  });

  it("returns authorization failures before integration I/O for each action", async () => {
    dependencies.authorizeCajuiAction.mockResolvedValue({ ok: false, status: 403, message: "Você não possui permissão para esta operação." });
    const responses = await Promise.all([
      status(statusRequest(), context("class-1")),
      sync(syncRequest(), context("class-1")),
      prepare(prepareRequest(), context("class-1")),
    ]);
    expect(dependencies.authorizeCajuiAction.mock.calls).toEqual([
      ["read-status", "class-1"], ["sync", "class-1"], ["prepare-council", "class-1"],
    ]);
    for (const response of responses) {
      expect(response.status).toBe(403);
      expect(await response.json()).toEqual({ message: "Você não possui permissão para esta operação." });
    }
    expect(dependencies.getCajuiSyncStatus).not.toHaveBeenCalled();
    expect(dependencies.syncCajuiClass).not.toHaveBeenCalled();
    expect(dependencies.prepareClassCouncil).not.toHaveBeenCalled();
  });

  it("serves authorized status without caching", async () => {
    const response = await status(statusRequest(), context("class-1"));
    expect(dependencies.authorizeCajuiAction).toHaveBeenCalledWith("read-status", "class-1");
    expect(dependencies.getCajuiSyncStatus).toHaveBeenCalledWith("class-1");
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toEqual(previous);
  });

  it("serves authorized sync and preparation without caching", async () => {
    const synced = await sync(syncRequest(), context("class-1"));
    const prepared = await prepare(prepareRequest(), context("class-1"));
    expect(dependencies.authorizeCajuiAction.mock.calls).toEqual([["sync", "class-1"], ["prepare-council", "class-1"]]);
    expect(dependencies.syncCajuiClass).toHaveBeenCalledWith("class-1");
    expect(dependencies.prepareClassCouncil).toHaveBeenCalledWith("class-1");
    for (const response of [synced, prepared]) {
      expect(response.status).toBe(200);
      expect(response.headers.get("cache-control")).toBe("no-store");
      expect(await response.json()).toEqual(previous);
    }
  });

  it("preserves the original API status on status lookup failure", async () => {
    dependencies.getCajuiSyncStatus.mockRejectedValue(new ApiError(502, "Cajuí indisponível."));
    const response = await status(statusRequest(), context("class-1"));
    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ message: "Cajuí indisponível." });
  });

  it.each([
    ["sync", sync, syncRequest, dependencies.syncCajuiClass],
    ["prepare", prepare, prepareRequest, dependencies.prepareClassCouncil],
  ] as const)("%s preserves the last successful snapshot and timestamp on failure", async (_name, handler, makeRequest, operation) => {
    operation.mockRejectedValue(new ApiError(503, "Cajuí indisponível."));
    const response = await handler(makeRequest(), context("class-1"));
    expect(response.status).toBe(503);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(dependencies.getCajuiSyncStatus).toHaveBeenCalledWith("class-1");
    const body = await response.json();
    expect(body).toMatchObject({
      classId: "class-1", snapshot: previous.snapshot, message: "Cajuí indisponível.",
      sync: { status: "error", lastSuccessfulSyncAt: previous.sync.lastSuccessfulSyncAt, message: "Cajuí indisponível." },
    });
    expect(body.sync.attemptedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });
});
