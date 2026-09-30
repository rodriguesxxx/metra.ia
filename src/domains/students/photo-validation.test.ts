import { describe, expect, it } from "vitest";
import { MAX_STUDENT_PHOTO_BYTES, hasExpectedImageSignature, validateStudentPhoto } from "@/domains/students/photo-validation";

describe("validateStudentPhoto", () => {
  it("aceita metadados de JPEG compatíveis", () => {
    expect(validateStudentPhoto({ name: "ana.jpeg", type: "image/jpeg", size: 1024 })).toBeUndefined();
    expect(hasExpectedImageSignature("image/jpeg", new Uint8Array([0xff, 0xd8, 0xff]))).toBe(true);
  });

  it("aceita PNG com bytes além da assinatura", () => {
    const bytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);
    expect(validateStudentPhoto({ name: "ana.png", type: "image/png", size: bytes.length })).toBeUndefined();
    expect(hasExpectedImageSignature("image/png", bytes)).toBe(true);
  });

  it("rejeita extensão, MIME, tamanho e assinatura incompatíveis", () => {
    expect(validateStudentPhoto({ name: "ana.pdf", type: "application/pdf", size: 100 })).toBeDefined();
    expect(validateStudentPhoto({ name: "ana.png", type: "image/jpeg", size: 100 })).toContain("extensão");
    expect(validateStudentPhoto({ name: "ana.png", type: "image/png", size: MAX_STUDENT_PHOTO_BYTES + 1 })).toContain("5 MB");
    expect(hasExpectedImageSignature("image/png", new Uint8Array([0xff, 0xd8, 0xff]))).toBe(false);
  });
});
