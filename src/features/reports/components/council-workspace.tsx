"use client";

import { useMemo, useState } from "react";
import { Clock3, MonitorPlay, UsersRound } from "lucide-react";
import type { SyncStatus } from "@/lib/contracts";
import { formatGrade, formatPercent } from "@/lib/formatters";
import { type CouncilFilter, type CouncilReportData, type CouncilStudent, filterCouncilStudents, summarizeCouncilStudents } from "@/features/reports/council-data";
import { CouncilPresentation } from "./council-presentation";

const filterOptions: Array<{ value: CouncilFilter; label: string }> = [
  { value: "above_average", label: "Acima da média" },
  { value: "recovery", label: "Em recuperação" },
  { value: "low_subject", label: "Disciplina abaixo da referência" },
];

type AcademicSnapshot = {
  class?: { name?: string; courseName?: string; termLabel?: string; studentCount?: number; averageGrade?: number; attendanceRate?: number };
  students?: Array<{ id: string; name?: string; registration?: string; courseName?: string; className?: string; averageGrade?: number; attendanceRate?: number; subjects?: CouncilStudent["subjects"] }>;
};

function reportWithSnapshot(report: CouncilReportData, sync: SyncStatus | undefined, snapshot: AcademicSnapshot | undefined): CouncilReportData {
  if (!snapshot) return { ...report, sync };
  const originalById = new Map((report.students ?? []).map((student) => [student.id, student]));
  const academicStudents = snapshot.students?.map((academic) => ({
    ...originalById.get(academic.id),
    id: academic.id,
    name: academic.name ?? originalById.get(academic.id)?.name ?? "Estudante não identificado",
    registration: academic.registration ?? originalById.get(academic.id)?.registration,
    courseName: academic.courseName ?? originalById.get(academic.id)?.courseName,
    className: academic.className ?? originalById.get(academic.id)?.className,
    averageGrade: academic.averageGrade ?? originalById.get(academic.id)?.averageGrade,
    attendanceRate: academic.attendanceRate ?? originalById.get(academic.id)?.attendanceRate,
    subjects: academic.subjects?.length ? academic.subjects : originalById.get(academic.id)?.subjects,
  }));
  return {
    ...report,
    sync,
    className: snapshot.class?.name ?? report.className,
    courseName: snapshot.class?.courseName ?? report.courseName,
    termLabel: snapshot.class?.termLabel ?? report.termLabel,
    summary: {
      ...report.summary,
      studentCount: snapshot.class?.studentCount ?? academicStudents?.length ?? report.summary.studentCount,
      averageGrade: snapshot.class?.averageGrade ?? report.summary.averageGrade,
      attendanceRate: snapshot.class?.attendanceRate ?? report.summary.attendanceRate,
    },
    students: academicStudents,
  };
}

function formatSyncTime(sync?: SyncStatus) {
  if (!sync?.lastSuccessfulSyncAt) return "Dados ainda não sincronizados";
  return `Dados atualizados às ${new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", timeZone: "America/Sao_Paulo" }).format(new Date(sync.lastSuccessfulSyncAt))}`;
}

function StudentInitials({ student, large = false }: { student: CouncilStudent; large?: boolean }) {
  const initials = student.name.split(/\s+/).slice(0, 2).map((name) => name[0]).join("");
  // The photo provider is configurable; a plain image avoids coupling this
  // sensitive-data view to an allowlist of external image hosts.
  // eslint-disable-next-line @next/next/no-img-element
  if (student.photoUrl) return <img src={student.photoUrl} alt={`Foto de ${student.name}`} className={large ? "h-20 w-20 rounded-full object-cover" : "h-9 w-9 rounded-full object-cover"} />;
  return <span aria-label={`Sem foto cadastrada para ${student.name}`} className={`inline-grid place-items-center rounded-full bg-emerald-100 font-extrabold text-emerald-800 ${large ? "h-20 w-20 text-2xl" : "h-9 w-9 text-xs"}`}>{initials}</span>;
}

function StudentList({ students, onOpen }: { students: CouncilStudent[]; onOpen: (id: string) => void }) {
  if (!students.length) return <div className="empty"><UsersRound aria-hidden size={27} /><strong>Nenhum estudante nesta seleção</strong></div>;
  return <div className="table-wrap"><table><caption className="sr-only">Estudantes disponíveis para o Conselho de Classe</caption><thead><tr><th>Estudante</th><th>Média</th><th>Frequência</th><th>Recuperação</th><th>Ação</th></tr></thead><tbody>{students.map((student) => <tr key={student.id}><td><button type="button" onClick={() => onOpen(student.id)} className="flex items-center gap-3 text-left font-bold text-[var(--ink)]"><StudentInitials student={student} />{student.name}</button></td><td>{formatGrade(student.averageGrade)}</td><td>{formatPercent(student.attendanceRate)}</td><td>{student.isInRecovery || student.subjects?.some((subject) => subject.isInRecovery) ? "Sim" : "Não informado"}</td><td><button type="button" className="button secondary !min-h-9 !py-1.5" onClick={() => onOpen(student.id)}><MonitorPlay size={16} aria-hidden />Apresentar</button></td></tr>)}</tbody></table></div>;
}

export function CouncilWorkspace({ report }: { report: CouncilReportData }) {
  const [activeFilters, setActiveFilters] = useState<Set<CouncilFilter>>(() => new Set());
  const [isPresentation, setPresentation] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [sync, setSync] = useState<SyncStatus | undefined>(report.sync);
  const [snapshot, setSnapshot] = useState<AcademicSnapshot>();
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string>();
  const preparedReport = useMemo(() => reportWithSnapshot(report, sync, snapshot), [report, snapshot, sync]);
  const students = useMemo(() => filterCouncilStudents(preparedReport, activeFilters), [activeFilters, preparedReport]);
  const metrics = useMemo(() => summarizeCouncilStudents(students), [students]);

  const toggleFilter = (filter: CouncilFilter) => setActiveFilters((current) => {
    const next = new Set(current);
    if (next.has(filter)) next.delete(filter);
    else next.add(filter);
    return next;
  });
  const prepare = async () => {
    setSyncing(true); setSyncError(undefined);
    try {
      const response = await fetch(`/api/class-councils/${encodeURIComponent(report.classId)}/prepare`, { method: "POST", headers: { Accept: "application/json" }, cache: "no-store" });
      const payload = await response.json().catch(() => ({})) as { sync?: SyncStatus; snapshot?: AcademicSnapshot; message?: string };
      if (payload.sync) setSync(payload.sync);
      if (payload.snapshot) setSnapshot(payload.snapshot);
      if (!response.ok || payload.sync?.status === "error" || !payload.snapshot) throw new Error(payload.message ?? payload.sync?.message ?? "Não foi possível atualizar os dados no Cajuí.");
      setPresentation(true);
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : "Não foi possível atualizar os dados no Cajuí.");
      if (sync?.lastSuccessfulSyncAt) setPresentation(true);
    } finally { setSyncing(false); }
  };
  const openStudent = (id: string) => { setSelectedStudentId(id); void prepare(); };
  const startPresentation = () => { setSelectedStudentId(null); void prepare(); };

  return <>
    <div className="council-controls"><p className="context-label inline-flex items-center gap-1"><Clock3 size={14} />{formatSyncTime(sync)}</p><button type="button" className="button" onClick={startPresentation} disabled={syncing || !students.length}><MonitorPlay size={17} />{syncing ? "Atualizando dados…" : "Iniciar Conselho"}</button></div>{syncError && <p role="status" className="mt-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">Não foi possível atualizar o Cajuí. A última versão disponível foi preservada. {syncError}</p>}
    <div className="mt-4 flex flex-wrap items-center gap-2" aria-label="Filtros de estudantes">{filterOptions.map((filter) => <label key={filter.value} className={`cursor-pointer rounded-full border px-3 py-2 text-sm font-bold ${activeFilters.has(filter.value) ? "border-emerald-600 bg-emerald-100 text-emerald-800" : "border-[var(--line)] bg-[var(--surface)] text-[var(--ink)]"}`}><input className="sr-only" type="checkbox" checked={activeFilters.has(filter.value)} onChange={() => toggleFilter(filter.value)} />{filter.label}</label>)}</div>
    <section className="metrics mt-4" aria-label="Resumo da seleção atual"><article className="card metric"><div className="metric-label">Estudantes na seleção</div><div className="metric-value">{metrics.studentCount}</div></article><article className="card metric"><div className="metric-label">Média da seleção</div><div className="metric-value">{formatGrade(metrics.averageGrade)}</div></article><article className="card metric"><div className="metric-label">Frequência da seleção</div><div className="metric-value">{formatPercent(metrics.attendanceRate)}</div></article><article className="card metric"><div className="metric-label">Em recuperação</div><div className="metric-value">{metrics.recoveryCount}</div></article></section>
    <section className="card section" style={{ marginTop: "1rem" }} aria-label="Estudantes"><StudentList students={students} onOpen={openStudent} /></section>
    {isPresentation && <CouncilPresentation report={preparedReport} students={students} activeFilters={activeFilters} onToggleFilter={toggleFilter} onClearFilters={() => setActiveFilters(new Set())} selectedStudentId={selectedStudentId} onSelectStudent={setSelectedStudentId} onExit={() => setPresentation(false)} onSync={() => void prepare()} syncing={syncing} syncError={syncError} />}
  </>;
}
