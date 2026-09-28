import { describe, expect, it } from "vitest";
import { formatGrade, formatPercent } from "./formatters";

describe("formatters", () => {
  it("apresenta valores numéricos para leitura em pt-BR", () => {
    expect(formatGrade(7.5)).toBe("7,5");
    expect(formatPercent(92.4)).toBe("92,4%");
  });
  it("expõe dados ausentes sem inventar zero", () => {
    expect(formatGrade()).toBe("Não informado");
    expect(formatPercent()).toBe("Não informado");
  });
});
