import type { Metadata } from "next";
import { Search } from "lucide-react";
import { IntegrationNotice } from "@/components/ui/integration-notice";
import { ClassList } from "@/features/classes/components/class-list";
import { getClasses } from "@/features/classes/server/classes";
import { canReadPedagogicalData, canStartCouncil } from "@/features/auth/server/authorization";
import { getSession } from "@/features/auth/server/session";
import type { ClassSummary } from "@/lib/contracts";

export const metadata: Metadata = { title: "Turmas" };

export default async function ClassesPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const query = q?.trim().toLocaleLowerCase("pt-BR") ?? "";
  let classes: ClassSummary[] = []; let error: string | undefined;
  try { classes = (await getClasses()).items; } catch (caught) { error = caught instanceof Error ? caught.message : undefined; }
  const user = await getSession();
  const visibleClasses = user ? classes.filter((item) => canReadPedagogicalData(user, { classId: item.id, courseId: item.courseId })) : [];
  const filteredClasses = query ? visibleClasses.filter((item) => [item.name, item.courseName, item.termLabel].some((value) => value?.toLocaleLowerCase("pt-BR").includes(query))) : visibleClasses;
  const canPrepareAnyCouncil = user ? filteredClasses.some((item) => item.councilEligible && canStartCouncil(user, { classId: item.id, courseId: item.courseId })) : false;
  return <><div className="page-header"><h1>Turmas</h1></div>{error && <IntegrationNotice message={error} />}<section className="card section" style={{ marginTop: error ? "1rem" : 0 }}><form className="filters" action="/turmas"><label className="field"><span className="sr-only">Buscar turma</span><input name="q" defaultValue={q} placeholder="Buscar turma" /></label><button className="button secondary" type="submit"><Search size={16} />Buscar</button></form><div style={{ marginTop: "1rem" }}><ClassList classes={filteredClasses} showCouncilAction={canPrepareAnyCouncil} /></div></section></>;
}
