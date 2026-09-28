"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({ email: z.email("Informe um e-mail válido."), password: z.string().min(1, "Informe sua senha.") });
type Credentials = z.infer<typeof schema>;

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string>();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Credentials>({ resolver: zodResolver(schema) });
  const submit = async (values: Credentials) => {
    setError(undefined);
    try {
      const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
      if (!response.ok) {
        const result = await response.json().catch(() => null) as { message?: string } | null;
        setError(result?.message ?? "Não foi possível entrar. Verifique os dados e tente novamente.");
        return;
      }
      router.replace("/dashboard");
      router.refresh();
    } catch {
      setError("Não foi possível conectar ao servidor. Tente novamente.");
    }
  };
  return <form onSubmit={handleSubmit(submit)} noValidate><label className="field">E-mail<input {...register("email")} type="email" autoComplete="email" aria-invalid={Boolean(errors.email)} />{errors.email && <span role="alert">{errors.email.message}</span>}</label><label className="field" style={{ marginTop: "1rem" }}>Senha<input {...register("password")} type="password" autoComplete="current-password" aria-invalid={Boolean(errors.password)} />{errors.password && <span role="alert">{errors.password.message}</span>}</label>{error && <p role="alert">{error}</p>}<button className="button" type="submit" disabled={isSubmitting} style={{ marginTop: "1.25rem", width: "100%" }}>{isSubmitting ? "Entrando…" : "Entrar"}</button></form>;
}
