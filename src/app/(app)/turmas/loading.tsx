import { LoadingRows } from "@/components/shared/loading-rows";

export default function Loading() { return <div aria-label="Carregando turmas" aria-busy="true"><div className="loading-heading" /><div className="card section"><div className="skeleton" style={{ height: 42, width: 220, marginBottom: 20 }} /><LoadingRows count={4} /></div></div>; }
