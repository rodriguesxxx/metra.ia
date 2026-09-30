import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { CouncilReportData } from "@/domains/councils/contracts";
import { CouncilPresentation } from "@/features/councils/components/council-presentation";

const report: CouncilReportData = {
  classId: "turma-1", className: "2º Técnico A", courseName: "Informática",
  summary: { averageGrade: 7 }, priorities: [], trends: [], referrals: [],
  students: [
    { id: "ana", name: "Ana Ribeiro", averageGrade: 8, attendanceRate: 95 },
    { id: "bia", name: "Bia Costa", averageGrade: 5, attendanceRate: 80, isInRecovery: true },
  ],
};

afterEach(cleanup);

function present(overrides: Partial<Parameters<typeof CouncilPresentation>[0]> = {}) {
  const onSelectStudent = vi.fn();
  const onToggleFilter = vi.fn();
  const onSync = vi.fn();
  render(<CouncilPresentation report={report} students={report.students!} activeFilters={new Set()} onToggleFilter={onToggleFilter} onClearFilters={vi.fn()} selectedStudentId={null} onSelectStudent={onSelectStudent} onExit={vi.fn()} onSync={onSync} syncing={false} {...overrides} />);
  return { onSelectStudent, onToggleFilter, onSync };
}

describe("apresentação da turma", () => {
  it("começa pela turma e navega para estudantes", () => {
    const { onSelectStudent } = present();
    expect(screen.getByText("Estudantes da turma")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Ana Ribeiro/ }));
    expect(onSelectStudent).toHaveBeenCalledWith("ana");
    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(onSelectStudent).toHaveBeenCalledWith("ana");
  });

  it("expõe filtros e só atualiza depois de confirmação", () => {
    const { onToggleFilter, onSync } = present();
    fireEvent.click(screen.getByLabelText("Em recuperação"));
    expect(onToggleFilter).toHaveBeenCalledWith("recovery");
    fireEvent.click(screen.getByRole("button", { name: "Atualizar dados" }));
    expect(onSync).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: /^Atualizar$/ }));
    expect(onSync).toHaveBeenCalledOnce();
  });
});
