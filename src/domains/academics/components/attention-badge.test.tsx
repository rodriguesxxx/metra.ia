import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AttentionBadge } from "@/domains/academics/components/attention-badge";

describe("AttentionBadge", () => {
  it("não depende apenas de cor para informar situação", () => {
    render(<AttentionBadge level="critical" />);
    expect(screen.getByText("Crítico")).toBeInTheDocument();
  });
});
