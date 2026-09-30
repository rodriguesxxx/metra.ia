import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

function check(files) {
  const root = mkdtempSync(path.join(tmpdir(), "metra-boundaries-"));
  try {
    for (const [file, content] of Object.entries(files)) {
      const target = path.join(root, file);
      mkdirSync(path.dirname(target), { recursive: true });
      writeFileSync(target, content);
    }
    const env = { ...process.env };
    delete env.NODE_TEST_CONTEXT;
    return spawnSync(process.execPath, [fileURLToPath(new URL("./check-boundaries.mjs", import.meta.url)), root], { encoding: "utf8", env });
  } finally { rmSync(root, { recursive: true, force: true }); }
}

test("allows pure contracts in client graphs and server composition", () => {
  const result = check({
    "app/page.tsx": 'import { load } from "@/services/server/data";',
    "services/server/data.ts": 'import "server-only"; export const load = () => 1;',
    "features/editor.tsx": '"use client"; import type { Item } from "@/domains/students/contracts";',
    "domains/students/contracts.ts": 'export interface Item { id: string }',
  });
  assert.equal(result.status, 0, result.stderr);
});

test("rejects transitive dynamic imports of server code from clients", () => {
  const result = check({
    "features/editor.tsx": '"use client"; import "./helper";',
    "features/helper.ts": 'export const run = () => import("@/services/server/data");',
    "services/server/data.ts": 'import "server-only"; export const secret = 1;',
  });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /client reaches server:.*helper.ts.*data.ts/);
});

test("rejects inverted layers, server types in mocks, and unresolved imports", () => {
  const result = check({
    "domains/students/view.ts": 'import "@/features/editor";',
    "features/editor.ts": 'import "./missing";',
    "mocks/student.ts": 'import type { Item } from "@/services/server/data";',
    "services/server/data.ts": 'export interface Item { id: string }',
  });
  assert.equal(result.status, 1);
  for (const message of [/lower layer imports feature/, /unresolved import/, /mock imports server/, /lacks server-only marker/]) assert.match(result.stderr, message);
});
