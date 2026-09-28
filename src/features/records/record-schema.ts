import { z } from "zod";

/**
 * Categories remain free text deliberately: the pedagogical vocabulary still
 * needs to be agreed with the school and must not become a hard business rule.
 */
export const pedagogicalRecordSchema = z.object({
  studentId: z.string().trim().min(1, "Informe o estudante."),
  category: z.string().trim().max(80, "Use uma categoria com até 80 caracteres.").optional().or(z.literal("")),
  note: z.string().trim().min(10, "Descreva o acompanhamento com pelo menos 10 caracteres.").max(2_000, "Use uma observação com até 2.000 caracteres."),
  subjectId: z.string().trim().max(120).optional().or(z.literal("")),
  period: z.string().trim().max(120).optional().or(z.literal("")),
});

export type PedagogicalRecordFormValues = z.infer<typeof pedagogicalRecordSchema>;

export function toPedagogicalRecordInput(values: PedagogicalRecordFormValues) {
  return {
    studentId: values.studentId.trim(),
    note: values.note.trim(),
    ...(values.category?.trim() ? { category: values.category.trim() } : {}),
    ...(values.subjectId?.trim() ? { subjectId: values.subjectId.trim() } : {}),
    ...(values.period?.trim() ? { period: values.period.trim() } : {}),
  };
}
