import type { Metadata } from "next";
import { RecordScreen } from "@/features/records/record-screen";

export const metadata: Metadata = { title: "Acompanhamentos" };

export default async function RecordsPage({ searchParams }: { searchParams: Promise<{ studentId?: string }> }) {
  const { studentId } = await searchParams;
  return <RecordScreen studentId={studentId} />;
}
