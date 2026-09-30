import "server-only";

import Link from "next/link";
import { Search } from "lucide-react";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { IntegrationNotice } from "@/components/shared/integration-notice";
import { ClassMetrics } from "@/domains/classes/components/class-metrics";
import { StudentList } from "@/domains/students/components/student-list";
import { getClassDetails, getClassStudents } from "@/services/server/classes";
import { canCreatePedagogicalRecord, canReadPedagogicalData } from "@/domains/identity/authorization";
import { getSession } from "@/services/server/session";
import type { ClassDetails } from "@/domains/classes/contracts";
import type { StudentListItem } from "@/domains/students/contracts";

export async function ClassDetailsScreen({ id, q }: { id: string; q?: string }) {
  let details: ClassDetails | undefined;
  let students: StudentListItem[] = [];
  let error: string | undefined;
  const user = await getSession();
  try {
    details = await getClassDetails(id);
    if (user && canReadPedagogicalData(user, { classId: id, courseId: details.courseId })) ({ items: students } = await getClassStudents(id, q));
  } catch (caught) { error = caught instanceof Error ? caught.message : undefined; }
  const isAllowed = Boolean(details && user && canReadPedagogicalData(user, { classId: id, courseId: details.courseId }));
  if (details && !isAllowed) return <><div className="page-header"><div><Breadcrumbs items={[{ label: "Turmas", href: "/turmas" }, { label: "Turma indisponível" }]} /><h1 style={{ marginTop: ".5rem" }}>Turma indisponível</h1><p className="lede">Seu perfil não possui acesso a esta turma.</p></div></div></>;

  return <>
    <div className="page-header"><div><Breadcrumbs items={[{ label: "Turmas", href: "/turmas" }, { label: details?.name ?? "Detalhe da turma" }]} /><h1 style={{ marginTop: ".5rem" }}>{details?.name ?? "Detalhe da turma"}</h1><p className="lede">{details ? `${details.courseName} · ${details.termLabel}` : ""}</p></div>{details && user && canCreatePedagogicalRecord(user, { classId: id, courseId: details.courseId }) && <Link className="button" href="/acompanhamentos">Registrar acompanhamento</Link>}</div>
    {error && <IntegrationNotice message={error} />}
    {details && <ClassMetrics details={details} />}
    <section className="card section" style={{ marginTop: "1rem" }}><form className="filters"><label className="field"><span className="sr-only">Buscar estudante</span><input name="q" defaultValue={q} placeholder="Nome ou matrícula" /></label><button className="button secondary" type="submit"><Search size={16} />Buscar</button></form><div style={{ marginTop: "1rem" }}><StudentList students={students} /></div></section>
  </>;
}
