import "server-only";

import { Search } from "lucide-react";
import { IntegrationNotice } from "@/components/shared/integration-notice";
import { ClassList } from "@/domains/classes/components/class-list";
import { getClasses } from "@/services/server/classes";
import { canReadPedagogicalData, canStartCouncil } from "@/domains/identity/authorization";
import { getSession } from "@/services/server/session";
import type { ClassSummary } from "@/domains/classes/contracts";


export async function ClassDirectoryScreen({ q }: { q?: string }) {
  const query = q?.trim().toLocaleLowerCase("pt-BR") ?? "";
  let classes: ClassSummary[] = []; let error: string | undefined;
  try { classes = (await getClasses()).items; } catch (caught) { error = caught instanceof Error ? caught.message : undefined; }
  const user = await getSession();
  const visibleClasses = user ? classes.filter((item) => canReadPedagogicalData(user, { classId: item.id, courseId: item.courseId })) : [];
  const filteredClasses = query ? visibleClasses.filter((item) => [item.name, item.courseName, item.termLabel].some((value) => value?.toLocaleLowerCase("pt-BR").includes(query))) : visibleClasses;
  const canPrepareAnyCouncil = user ? filteredClasses.some((item) => item.councilEligible && canStartCouncil(user, { classId: item.id, courseId: item.courseId })) : false;
  return <><div className="page-header"><h1>Turmas</h1></div>{error && <IntegrationNotice message={error} />}<section className="card section" style={{ marginTop: error ? "1rem" : 0 }}><form className="filters" action="/turmas"><label className="field"><span className="sr-only">Buscar turma</span><input name="q" defaultValue={q} placeholder="Buscar turma" /></label><button className="button secondary" type="submit"><Search size={16} />Buscar</button></form><div style={{ marginTop: "1rem" }}><ClassList classes={filteredClasses} showCouncilAction={canPrepareAnyCouncil} /></div></section></>;
}
