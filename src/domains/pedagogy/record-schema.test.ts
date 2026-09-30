import { describe, expect, it } from "vitest";
import { pedagogicalRecordSchema, toPedagogicalRecordInput } from "@/domains/pedagogy/record-schema";

describe("pedagogicalRecordSchema", () => {
  it("aceita uma observação rápida sem categoria rígida", () => {
    const parsed = pedagogicalRecordSchema.parse({ studentId: "stu-ana", category: "evolução", note: "Concluiu as atividades combinadas nesta semana." });
    expect(toPedagogicalRecordInput(parsed)).toEqual({ studentId: "stu-ana", category: "evolução", note: "Concluiu as atividades combinadas nesta semana." });
  });

  it("rejeita observações curtas que não oferecem contexto", () => {
    expect(pedagogicalRecordSchema.safeParse({ studentId: "stu-ana", note: "Pouco" }).success).toBe(false);
  });
});
