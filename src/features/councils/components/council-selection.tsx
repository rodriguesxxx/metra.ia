"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, FileBarChart, FileDown, Plus, X } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";

type CouncilClass = { id: string; name: string; courseName: string; termLabel: string };

export function CouncilSelection({ classes }: { classes: CouncilClass[] }) {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  return <>
    <div className="page-header"><h1>Conselho de Classe</h1><button type="button" className="button" onClick={() => setOpen(true)}><Plus size={17} aria-hidden /> Novo conselho</button></div>
    <section className="card section" aria-label="Conselhos disponíveis">{classes.length ? <div className="council-class-list">{classes.map((item) => <div className="council-class-row" key={item.id}><span><strong>{item.name}</strong><small>{item.courseName} · {item.termLabel}</small></span><div className="council-class-actions"><Link href={`/relatorios?classId=${encodeURIComponent(item.id)}`} className="button secondary">Abrir <ArrowRight size={16} aria-hidden /></Link><button className="button secondary" type="button" disabled title="Exportação em PDF ainda não disponível"><FileDown size={16} aria-hidden /> Exportar PDF</button></div></div>)}</div> : <EmptyState icon={<FileBarChart aria-hidden size={28} />} title="Nenhuma turma elegível no seu escopo" />}</section>
    {open && <div className="council-modal-layer" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}><section className="council-modal" role="dialog" aria-modal="true" aria-labelledby="council-modal-title"><div className="council-modal-header"><h2 id="council-modal-title">Escolha a turma</h2><button ref={closeRef} type="button" className="council-modal-close" onClick={() => setOpen(false)} aria-label="Fechar"><X size={19} /></button></div>{classes.length ? <div className="council-modal-classes">{classes.map((item) => <Link key={item.id} href={`/relatorios?classId=${encodeURIComponent(item.id)}`}><span><strong>{item.name}</strong><small>{item.courseName} · {item.termLabel}</small></span><ArrowRight size={18} aria-hidden /></Link>)}</div> : <p>Nenhuma turma elegível.</p>}</section></div>}
  </>;
}
