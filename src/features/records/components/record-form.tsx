"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const recordSchema = z.object({ studentId: z.string().min(1, "Informe o estudante."), category: z.enum(["performance", "attendance", "behavior", "guidance"]), note: z.string().trim().min(10, "Descreva o acompanhamento com pelo menos 10 caracteres.").max(2000) });
type RecordFormValues = z.infer<typeof recordSchema>;

export function RecordForm() {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<RecordFormValues>({ resolver: zodResolver(recordSchema), defaultValues: { category: "performance" } });
  const onSubmit = async (values: RecordFormValues) => { setStatus("idle"); const response = await fetch("/api/records", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) }); if (!response.ok) { setStatus("error"); return; } reset({ category: "performance" }); setStatus("success"); };
  return <form onSubmit={handleSubmit(onSubmit)} noValidate><div className="filters"><label className="field">ID do estudante<input {...register("studentId")} aria-invalid={Boolean(errors.studentId)} placeholder="Informe após abrir o perfil" />{errors.studentId && <span role="alert">{errors.studentId.message}</span>}</label><label className="field">Categoria<select {...register("category")}><option value="performance">Desempenho</option><option value="attendance">Frequência</option><option value="behavior">Comportamento</option><option value="guidance">Encaminhamento</option></select></label></div><label className="field" style={{ marginTop: "1rem" }}>Registro objetivo<textarea {...register("note")} aria-invalid={Boolean(errors.note)} placeholder="Contexto, evidências observadas e próximo encaminhamento." />{errors.note && <span role="alert">{errors.note.message}</span>}</label><div className="error-actions"><button className="button" disabled={isSubmitting}>{isSubmitting ? "Salvando…" : "Salvar acompanhamento"}</button>{status === "success" && <span role="status">Acompanhamento registrado com sucesso.</span>}{status === "error" && <span role="alert">Não foi possível salvar. Verifique a integração e tente novamente.</span>}</div></form>;
}
