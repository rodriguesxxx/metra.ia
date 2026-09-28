import type { Metadata } from "next";
import { Search } from "lucide-react";
import { IntegrationNotice } from "@/components/ui/integration-notice";
import { ClassList } from "@/features/classes/components/class-list";
import { getClasses } from "@/features/classes/server/classes";
import type { ClassSummary } from "@/lib/contracts";

export const metadata: Metadata = { title: "Turmas" };

export default async function ClassesPage() {
  let classes: ClassSummary[] = []; let error: string | undefined;
  try { classes = (await getClasses()).items; } catch (caught) { error = caught instanceof Error ? caught.message : undefined; }
  return <><div className="page-header"><div><h1>Turmas</h1><p className="lede">Acompanhe indicadores e identifique onde uma análise pedagógica é mais necessária.</p></div></div>{error && <IntegrationNotice message={error} />}<section className="card section" style={{ marginTop: error ? "1rem" : 0 }}><div className="section-title"><h2>Lista de turmas</h2></div><form className="filters" action="/turmas"><label className="field">Buscar turma<input name="q" placeholder="Ex.: 8º A" /></label><button className="button secondary" type="submit"><Search size={16} />Buscar</button></form><div style={{ marginTop: "1rem" }}><ClassList classes={classes} /></div></section></>;
}
