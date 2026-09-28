import { AppShell } from "@/components/layout/app-shell";
import { redirect } from "next/navigation";
import { getSession } from "@/features/auth/server/session";

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await getSession();
  if (user === null) redirect("/login");
  return <><a className="skip-link" href="#main-content">Pular para o conteúdo</a><AppShell user={user}>{children}</AppShell></>;
}
