import { describe, expect, it } from "vitest";
import { academicTone, attentionTone } from "./class-metric-tone";

describe("tons dos indicadores", () => {
  it("usa uma escala contínua limitada aos valores possíveis", () => {
    expect(academicTone(0, 10)).toBe("hsl(5 65% 34%)");
    expect(academicTone(10, 10)).toBe("hsl(145 65% 34%)");
    expect(academicTone(20, 10)).toBe(academicTone(10, 10));
    expect(academicTone()).toBeUndefined();
  });

  it("trata a proporção de atenção sem atribuir classificação", () => {
    expect(attentionTone(0, 28)).toBe(academicTone(100));
    expect(attentionTone(4, 28)).toBe("hsl(34 70% 36%)");
    expect(attentionTone(4, 0)).toBeUndefined();
  });
});
