import type { Metadata } from "next";
import { ClassDirectoryScreen } from "@/features/classes/class-directory-screen";

export const metadata: Metadata = { title: "Turmas" };

export default async function ClassesPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  return <ClassDirectoryScreen q={q} />;
}
