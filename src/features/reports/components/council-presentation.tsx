"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Clock3, ExternalLink, RefreshCw, X } from "lucide-react";
import { StudentAvatar } from "../../students/components/student-avatar";
import { formatGrade, formatPercent } from "../../../lib/formatters";
import type { CouncilFilter, CouncilReportData, CouncilStudent } from "../council-data";
import { summarizeCouncilStudents } from "../council-data";
import styles from "./council-presentation.module.css";

const filters: Array<{ value: CouncilFilter; label: string }> = [
  { value: "above_average", label: "Acima da média" },
  { value: "recovery", label: "Em recuperação" },
  { value: "low_subject", label: "Baixo rendimento por disciplina" },
];

type Props = {
  report: CouncilReportData;
  students: CouncilStudent[];
  activeFilters: ReadonlySet<CouncilFilter>;
  onToggleFilter: (filter: CouncilFilter) => void;
  onClearFilters: () => void;
  selectedStudentId: string | null;
  onSelectStudent: (id: string | null) => void;
  onExit: () => void;
  onSync: () => void;
  syncing: boolean;
  syncError?: string;
};

function syncLabel(report: CouncilReportData) {
  if (!report.sync?.lastSuccessfulSyncAt) return "Sem sincronização disponível";
  const date = new Date(report.sync.lastSuccessfulSyncAt);
  if (Number.isNaN(date.getTime())) return "Horário da atualização indisponível";
  return `Dados de ${new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" }).format(date)}`;
}

export function CouncilPresentation({ report, students, activeFilters, onToggleFilter, onClearFilters, selectedStudentId, onSelectStudent, onExit, onSync, syncing, syncError }: Props) {
  const [confirmSync, setConfirmSync] = useState(false);
  const studentIndex = students.findIndex((item) => item.id === selectedStudentId);
  const slideIndex = studentIndex + 1;
  const student = studentIndex >= 0 ? students[studentIndex] : undefined;
  const metrics = summarizeCouncilStudents(students);
  const totalSlides = students.length + 1;

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const target = event.target;
      if (event.altKey || event.ctrlKey || event.metaKey || target instanceof HTMLInputElement || target instanceof HTMLSelectElement || target instanceof HTMLTextAreaElement || (target instanceof HTMLElement && target.isContentEditable)) return;
      if (event.key === "Escape") onExit();
      if (event.key === "Home") onSelectStudent(null);
      if (event.key === "End" && students.length) onSelectStudent(students[students.length - 1].id);
      if (event.key === "ArrowLeft" && slideIndex > 0) onSelectStudent(slideIndex === 1 ? null : students[slideIndex - 2].id);
      if (event.key === "ArrowRight" && slideIndex < students.length) onSelectStudent(students[slideIndex].id);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onExit, onSelectStudent, slideIndex, students]);

  return <section className={styles.shell} role="dialog" aria-modal="true" aria-label={`Apresentação da turma ${report.className ?? "selecionada"}`}>
    <header className={styles.toolbar}>
      <div className={styles.identity}>
        <span className={styles.mark} aria-hidden="true"><span /><span /><span /></span>
        <div><strong>{report.className ?? "Turma selecionada"}</strong><span>{[report.courseName, report.termLabel].filter(Boolean).join(" · ")}</span></div>
      </div>
      <div className={styles.actions}>
        <span className={styles.syncTime}><Clock3 size={15} aria-hidden="true" />{syncLabel(report)}</span>
        <button type="button" className={styles.iconAction} onClick={() => setConfirmSync(true)} disabled={syncing} title="Atualizar dados" aria-label="Atualizar dados"><RefreshCw size={18} className={syncing ? styles.spinning : ""} /></button>
        <button type="button" className={styles.close} onClick={onExit}><X size={17} aria-hidden="true" /><span>Sair</span></button>
      </div>
    </header>

    <div className={styles.filterBar} aria-label="Filtros da apresentação">
      <span className={styles.filterIntro}>Mostrar</span>
      <div className={styles.filterList}>{filters.map((filter) => <label key={filter.value} className={`${styles.filter} ${activeFilters.has(filter.value) ? styles.filterActive : ""}`}><input type="checkbox" checked={activeFilters.has(filter.value)} onChange={() => onToggleFilter(filter.value)} />{filter.label}</label>)}</div>
      {activeFilters.size > 0 && <button type="button" className={styles.clear} onClick={onClearFilters}>Limpar</button>}
    </div>

    {(syncError || confirmSync) && <div className={styles.notice} role="status">{confirmSync ? <><span>Atualizar agora pode mudar os números apresentados. A reunião continuará com os dados atuais até você confirmar.</span><div><button type="button" onClick={() => setConfirmSync(false)}>Cancelar</button><button type="button" className={styles.confirm} onClick={() => { setConfirmSync(false); onSync(); }}>Atualizar</button></div></> : <span>Não foi possível atualizar. Os últimos dados foram mantidos. {syncError}</span>}</div>}

    <div className={styles.stage} key={student?.id ?? "class"}>
      {student ? <div className={styles.studentSlide}>
        <div className={styles.studentMain}>
          <div className={styles.studentIdentity}><StudentAvatar name={student.name} photoUrl={student.photoUrl} size={88} /><div><span className={styles.eyebrow}>{String(slideIndex).padStart(2, "0")} / {String(students.length).padStart(2, "0")}</span><h1>{student.name}</h1><p>{[student.courseName ?? report.courseName, student.className ?? report.className].filter(Boolean).join(" · ")}</p></div></div>
          <div className={styles.studentNumbers}><div><span>Média global</span><strong>{formatGrade(student.averageGrade)}</strong></div><div><span>Frequência</span><strong>{formatPercent(student.attendanceRate)}</strong></div><div><span>Recuperação</span><strong className={styles.statusText}>{student.isInRecovery || student.subjects?.some((subject) => subject.isInRecovery) ? "Sim" : "Não informada"}</strong></div></div>
          {student.pedagogicalContext && <div className={styles.context}><span>Registro pedagógico</span><p>{student.pedagogicalContext}</p></div>}
          <Link className={styles.reportLink} href={`/estudantes/${encodeURIComponent(student.id)}`}>Abrir histórico completo <ExternalLink size={15} aria-hidden="true" /></Link>
        </div>
        <div className={styles.subjects}><div className={styles.sectionHead}><h2>Disciplinas</h2><span>{student.subjects?.length ?? 0} disponíveis</span></div>{student.subjects?.length ? <div className={styles.subjectList}>{student.subjects.map((subject) => <div className={styles.subjectRow} key={subject.id ?? subject.name}><div><strong>{subject.name}</strong><span>{subject.isInRecovery ? "Em recuperação" : `Frequência ${formatPercent(subject.attendanceRate)}`}</span></div><b>{formatGrade(subject.grade)}</b></div>)}</div> : <p className={styles.empty}>Ainda não há dados de disciplinas para este estudante.</p>}</div>
      </div> : <div className={styles.classSlide}>
        <div className={styles.classIntro}>{report.termLabel && <span className={styles.eyebrow}>{report.termLabel}</span>}<h1>{report.className ?? "Turma selecionada"}</h1><p>{report.courseName ?? "Curso não informado"}</p><div className={styles.introLine} /></div>
        <div className={styles.classContent}><div className={styles.classNumbers}><div><span>Estudantes</span><strong>{metrics.studentCount}</strong></div><div><span>Média da seleção</span><strong>{formatGrade(metrics.averageGrade)}</strong></div><div><span>Frequência</span><strong>{formatPercent(metrics.attendanceRate)}</strong></div><div><span>Em recuperação</span><strong>{metrics.recoveryCount}</strong></div></div><div className={styles.roster}><div className={styles.sectionHead}><h2>{activeFilters.size ? "Na seleção" : "Estudantes da turma"}</h2><span>{students.length} estudantes</span></div>{students.length ? <div className={styles.rosterList}>{students.map((item) => <button type="button" key={item.id} onClick={() => onSelectStudent(item.id)}><span>{item.name}</span><span>{formatGrade(item.averageGrade)} <ArrowRight size={15} aria-hidden="true" /></span></button>)}</div> : <p className={styles.empty}>Nenhum estudante corresponde aos filtros. Limpe ou ajuste a seleção.</p>}</div></div>
      </div>}
    </div>

    <footer className={styles.footer}><button type="button" className={styles.navigation} onClick={() => onSelectStudent(slideIndex === 1 ? null : students[slideIndex - 2].id)} disabled={slideIndex === 0}><ArrowLeft size={19} aria-hidden="true" /><span>Anterior</span></button><div className={styles.position}><span>{slideIndex + 1} / {totalSlides}</span><select aria-label="Ir para slide" value={student?.id ?? "class"} onChange={(event) => onSelectStudent(event.target.value === "class" ? null : event.target.value)}><option value="class">Turma</option>{students.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></div><button type="button" className={styles.navigation} onClick={() => onSelectStudent(students[slideIndex].id)} disabled={slideIndex >= students.length}><span>Próximo</span><ArrowRight size={19} aria-hidden="true" /></button></footer>
  </section>;
}
