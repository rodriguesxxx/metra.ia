"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Clock3, ExternalLink, MonitorPlay, RefreshCw, UsersRound } from "lucide-react";
import type { SyncStatus } from "@/lib/contracts";
import { formatGrade, formatPercent } from "@/lib/formatters";
import { type CouncilFilter, type CouncilReportData, type CouncilStudent, filterCouncilStudents, summarizeCouncilStudents } from "@/features/reports/council-data";

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
  return `Dados atualizados às ${new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" }).format(new Date(sync.lastSuccessfulSyncAt))}`;
}

function StudentInitials({ student, large = false }: { student: CouncilStudent; large?: boolean }) {
  const initials = student.name.split(/\s+/).slice(0, 2).map((name) => name[0]).join("");
  // The photo provider is configurable; a plain image avoids coupling this
  // sensitive-data view to an allowlist of external image hosts.
  // eslint-disable-next-line @next/next/no-img-element
  if (student.photoUrl) return <img src={student.photoUrl} alt={`Foto de ${student.name}`} className={large ? "h-20 w-20 rounded-full object-cover" : "h-9 w-9 rounded-full object-cover"} />;
  return <span aria-label={`Sem foto cadastrada para ${student.name}`} className={`inline-grid place-items-center rounded-full bg-violet-100 font-extrabold text-violet-800 ${large ? "h-20 w-20 text-2xl" : "h-9 w-9 text-xs"}`}>{initials}</span>;
}

function StudentList({ students, onOpen }: { students: CouncilStudent[]; onOpen: (id: string) => void }) {
  if (!students.length) return <div className="empty"><UsersRound aria-hidden size={27} /><strong>Nenhum estudante corresponde aos filtros</strong><p>Ajuste os filtros para ampliar a leitura da turma.</p></div>;
  return <div className="table-wrap"><table><caption className="sr-only">Estudantes disponíveis para o Conselho de Classe</caption><thead><tr><th>Estudante</th><th>Média</th><th>Frequência</th><th>Recuperação</th><th>Ação</th></tr></thead><tbody>{students.map((student) => <tr key={student.id}><td><button type="button" onClick={() => onOpen(student.id)} className="flex items-center gap-3 text-left font-bold text-[var(--ink)]"><StudentInitials student={student} />{student.name}</button></td><td>{formatGrade(student.averageGrade)}</td><td>{formatPercent(student.attendanceRate)}</td><td>{student.isInRecovery || student.subjects?.some((subject) => subject.isInRecovery) ? "Sim" : "Não informado"}</td><td><button type="button" className="button secondary !min-h-9 !py-1.5" onClick={() => onOpen(student.id)}>Apresentar</button></td></tr>)}</tbody></table></div>;
}

function CouncilPresentation({ report, students, selectedStudentId, onSelectStudent, onExit, onSync, syncing, syncError }: { report: CouncilReportData; students: CouncilStudent[]; selectedStudentId?: string; onSelectStudent: (id: string) => void; onExit: () => void; onSync: () => void; syncing: boolean; syncError?: string }) {
  const selectedIndex = Math.max(0, students.findIndex((student) => student.id === selectedStudentId));
  const student = students[selectedIndex];
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement || event.target instanceof HTMLTextAreaElement) return;
      if (event.key === "ArrowLeft" && selectedIndex > 0) onSelectStudent(students[selectedIndex - 1].id);
      if (event.key === "ArrowRight" && selectedIndex < students.length - 1) onSelectStudent(students[selectedIndex + 1].id);
      if (event.key === "Escape") onExit();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onExit, onSelectStudent, selectedIndex, students]);

  if (!student) return <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950 p-6 text-white"><div className="max-w-lg text-center"><h1 className="text-3xl font-black">Sem estudantes nesta seleção</h1><p className="mt-3 text-slate-300">Retorne e ajuste os filtros antes de iniciar a apresentação.</p><button type="button" className="button mt-6" onClick={onExit}>Voltar aos filtros</button></div></div>;
  const subjectItems = student.subjects ?? [];
  return <section className="fixed inset-0 z-[100] overflow-y-auto bg-slate-950 px-4 py-5 text-white sm:px-8 lg:px-12" aria-label="Modo Conselho">
    <div className="mx-auto flex min-h-full max-w-6xl flex-col">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/15 pb-5">
        <div><p className="text-xs font-extrabold uppercase tracking-[.18em] text-violet-300">Modo Conselho</p><h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">{report.className ?? "Turma selecionada"}</h1><p className="mt-1 text-sm text-slate-300">{report.courseName ?? report.termLabel ?? "Leitura compartilhada de evidências"}</p></div>
        <div className="flex flex-wrap items-center gap-2"><span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-xs text-slate-200"><Clock3 size={14} />{formatSyncTime(report.sync)}</span><button type="button" className="rounded-xl border border-white/20 px-3 py-2 text-sm font-bold text-white hover:bg-white/10 disabled:opacity-50" onClick={onSync} disabled={syncing}><RefreshCw size={15} className={syncing ? "animate-spin" : ""} />{syncing ? "Atualizando" : "Atualizar dados"}</button><button type="button" className="rounded-xl bg-white px-3 py-2 text-sm font-extrabold text-slate-900" onClick={onExit}>Sair da apresentação</button></div>
      </header>
      {syncError && <p role="status" className="mt-4 rounded-xl border border-amber-300/40 bg-amber-100/10 px-4 py-3 text-sm text-amber-100">A atualização não foi concluída. A apresentação mantém os últimos dados disponíveis. {syncError}</p>}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3"><label className="text-sm font-bold text-slate-200">Estudante <select className="ml-2 rounded-lg border border-white/20 bg-slate-900 px-3 py-2 text-white" value={student.id} onChange={(event) => onSelectStudent(event.target.value)}>{students.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label><span className="text-sm text-slate-300">{selectedIndex + 1} de {students.length} · use ← → para navegar</span></div>
      <main className="my-auto grid gap-7 py-8 lg:grid-cols-[1.05fr_.95fr]">
        <article className="rounded-3xl bg-white p-6 text-slate-950 shadow-2xl sm:p-9"><div className="flex items-center gap-5"><StudentInitials student={student} large /><div><p className="text-sm font-bold uppercase tracking-wider text-violet-700">Estudante</p><h2 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">{student.name}</h2><p className="mt-2 text-slate-500">{student.registration ? `Matrícula ${student.registration} · ` : ""}{report.courseName ?? "Curso não informado"}</p></div></div><div className="mt-9 grid grid-cols-2 gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-violet-50 p-4"><p className="text-xs font-extrabold uppercase tracking-wider text-violet-700">Média global</p><p className="mt-1 text-3xl font-black">{formatGrade(student.averageGrade)}</p></div><div className="rounded-2xl bg-emerald-50 p-4"><p className="text-xs font-extrabold uppercase tracking-wider text-emerald-700">Frequência</p><p className="mt-1 text-3xl font-black">{formatPercent(student.attendanceRate)}</p></div><div className="col-span-2 rounded-2xl bg-amber-50 p-4 sm:col-span-1"><p className="text-xs font-extrabold uppercase tracking-wider text-amber-700">Recuperação</p><p className="mt-1 text-xl font-black">{student.isInRecovery || subjectItems.some((subject) => subject.isInRecovery) ? "Em acompanhamento" : "Sem dado"}</p></div></div>{student.pedagogicalContext && <div className="mt-6 border-l-4 border-violet-500 bg-violet-50 px-4 py-3"><p className="text-xs font-extrabold uppercase tracking-wider text-violet-700">Contexto pedagógico</p><p className="mt-1 text-sm leading-6 text-slate-700">{student.pedagogicalContext}</p></div>}</article>
        <article className="rounded-3xl border border-white/15 bg-white/5 p-6 sm:p-8"><p className="text-xs font-extrabold uppercase tracking-[.18em] text-violet-300">Desempenho por disciplina</p><h2 className="mt-1 text-2xl font-black">Evidências acadêmicas</h2><div className="mt-5 grid gap-3">{subjectItems.length ? subjectItems.map((subject) => <div key={subject.id ?? subject.name} className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-4"><div><strong>{subject.name}</strong><p className="mt-1 text-sm text-slate-300">Frequência: {formatPercent(subject.attendanceRate)}</p></div><div className="text-right"><p className="text-2xl font-black">{formatGrade(subject.grade)}</p>{subject.isInRecovery && <p className="text-xs font-bold text-amber-200">Recuperação</p>}</div></div>) : <p className="rounded-2xl border border-dashed border-white/20 p-4 text-slate-300">As disciplinas serão exibidas quando a integração as disponibilizar.</p>}</div></article>
      </main>
      <footer className="flex items-center justify-between gap-3 border-t border-white/15 pt-5"><button type="button" onClick={() => { if (selectedIndex > 0) onSelectStudent(students[selectedIndex - 1].id); }} disabled={selectedIndex === 0} className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-3 font-bold disabled:opacity-40"><ChevronLeft size={18} />Anterior</button><Link href={`/estudantes/${encodeURIComponent(student.id)}`} className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-3 text-sm font-bold">Ver relatório consolidado <ExternalLink size={16} /></Link><button type="button" onClick={() => { if (selectedIndex < students.length - 1) onSelectStudent(students[selectedIndex + 1].id); }} disabled={selectedIndex === students.length - 1} className="inline-flex items-center gap-2 rounded-xl bg-violet-500 px-4 py-3 font-bold disabled:opacity-40">Próximo<ChevronRight size={18} /></button></footer>
    </div>
  </section>;
}

export function CouncilWorkspace({ report }: { report: CouncilReportData }) {
  const [activeFilters, setActiveFilters] = useState<Set<CouncilFilter>>(() => new Set());
  const [isPresentation, setPresentation] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string>();
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
  const startPresentation = () => { setSelectedStudentId(students[0]?.id); void prepare(); };

  return <>
    <section className="card section"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="context-label inline-flex items-center gap-1"><Clock3 size={14} />{formatSyncTime(sync)}</p><h2 className="mt-2 text-xl">Preparação do Conselho</h2><p className="lede">Atualize de forma explícita antes de apresentar. Durante a reunião, os números permanecem estáveis até uma nova atualização manual.</p></div><button type="button" className="button" onClick={startPresentation} disabled={syncing || !students.length}><MonitorPlay size={17} />{syncing ? "Atualizando dados…" : "Iniciar Conselho"}</button></div>{syncError && <p role="status" className="mt-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">Não foi possível atualizar o Cajuí. A última versão disponível foi preservada. {syncError}</p>}</section>
    <section className="card section" style={{ marginTop: "1rem" }} aria-labelledby="filters-title"><div className="section-title"><div><h2 id="filters-title">Leituras para a reunião</h2><p className="lede">Combine filtros para organizar a conversa; eles não determinam conclusões sobre nenhum estudante.</p></div></div><div className="flex flex-wrap gap-2">{filterOptions.map((filter) => <label key={filter.value} className={`cursor-pointer rounded-full border px-3 py-2 text-sm font-bold ${activeFilters.has(filter.value) ? "border-violet-500 bg-violet-100 text-violet-800" : "border-[var(--line)] bg-[var(--surface)] text-[var(--ink)]"}`}><input className="sr-only" type="checkbox" checked={activeFilters.has(filter.value)} onChange={() => toggleFilter(filter.value)} />{filter.label}</label>)}</div></section>
    <section className="metrics mt-4" aria-label="Resumo da seleção atual"><article className="card metric"><div className="metric-label">Estudantes na seleção</div><div className="metric-value">{metrics.studentCount}</div></article><article className="card metric"><div className="metric-label">Média da seleção</div><div className="metric-value">{formatGrade(metrics.averageGrade)}</div></article><article className="card metric"><div className="metric-label">Frequência da seleção</div><div className="metric-value">{formatPercent(metrics.attendanceRate)}</div></article><article className="card metric"><div className="metric-label">Em recuperação</div><div className="metric-value">{metrics.recoveryCount}</div></article></section>
    <section className="card section" style={{ marginTop: "1rem" }}><div className="section-title"><div><h2>Estudantes</h2><p className="lede">Abra qualquer estudante diretamente ou inicie a apresentação pelo primeiro da seleção.</p></div></div><StudentList students={students} onOpen={openStudent} /></section>
    {isPresentation && <CouncilPresentation report={preparedReport} students={students} selectedStudentId={selectedStudentId ?? students[0]?.id} onSelectStudent={setSelectedStudentId} onExit={() => setPresentation(false)} onSync={() => void prepare()} syncing={syncing} syncError={syncError} />}
  </>;
}
