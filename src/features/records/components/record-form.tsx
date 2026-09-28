"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { pedagogicalRecordSchema, toPedagogicalRecordInput, type PedagogicalRecordFormValues } from "@/features/records/record-schema";

export function RecordForm({ studentId }: { studentId?: string }) {
  const [status, setStatus] = useState<"idle" | "success" | "demo" | "error">("idle");
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<PedagogicalRecordFormValues>({ resolver: zodResolver(pedagogicalRecordSchema), defaultValues: { studentId: studentId ?? "", category: "" } });
  const onSubmit = async (values: PedagogicalRecordFormValues) => {
    setStatus("idle");
    try {
      const response = await fetch("/api/records", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(toPedagogicalRecordInput(values)), cache: "no-store" });
      const result = await response.json().catch(() => undefined) as { transient?: boolean } | undefined;
      if (!response.ok) { setStatus("error"); return; }
      reset({ studentId: values.studentId, category: "", subjectId: "", period: "", note: "" });
      setStatus(result?.transient ? "demo" : "success");
    } catch { setStatus("error"); }
  };

  return <form onSubmit={handleSubmit(onSubmit)} noValidate>
    <div className="filters">
      <label className="field">Estudante<input {...register("studentId")} aria-invalid={Boolean(errors.studentId)} readOnly={Boolean(studentId)} placeholder="Abra o perfil do estudante" />{errors.studentId && <span role="alert">{errors.studentId.message}</span>}</label>
      <label className="field">Categoria <span className="sr-only">opcional</span><input {...register("category")} list="pedagogical-category-suggestions" placeholder="Opcional" /><datalist id="pedagogical-category-suggestions"><option value="desempenho" /><option value="participação" /><option value="dificuldade" /><option value="evolução" /><option value="acompanhamento" /></datalist>{errors.category && <span role="alert">{errors.category.message}</span>}</label>
      <label className="field">Disciplina <span className="sr-only">opcional</span><input {...register("subjectId")} placeholder="Opcional" /></label>
      <label className="field">Período <span className="sr-only">opcional</span><input {...register("period")} placeholder="Opcional" /></label>
    </div>
    <label className="field" style={{ marginTop: "1rem" }}>Registro objetivo<textarea {...register("note")} aria-invalid={Boolean(errors.note)} placeholder="Descreva o que foi observado e, se houver, o próximo passo combinado." />{errors.note && <span role="alert">{errors.note.message}</span>}</label>
    <div className="error-actions"><button className="button" disabled={isSubmitting}>{isSubmitting ? "Salvando…" : "Salvar acompanhamento"}</button>{status === "success" && <span role="status">Acompanhamento registrado.</span>}{status === "demo" && <span role="status">Acompanhamento registrado nesta sessão de demonstração.</span>}{status === "error" && <span role="alert">Não foi possível salvar. Verifique sua permissão e tente novamente.</span>}</div>
  </form>;
}
