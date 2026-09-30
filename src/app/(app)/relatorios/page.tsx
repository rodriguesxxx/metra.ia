import type { Metadata } from "next";
import { CouncilScreen } from "@/features/councils/council-screen";

export const metadata: Metadata = { title: "Conselho de classe" };

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ classId?: string }> }) {
  const { classId } = await searchParams;
  return <CouncilScreen classId={classId} />;
}
