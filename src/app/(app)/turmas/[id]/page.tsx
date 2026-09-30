import { ClassDetailsScreen } from "@/features/classes/class-details-screen";

export default async function ClassDetailsPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ q?: string }> }) {
  const [{ id }, { q }] = await Promise.all([params, searchParams]);
  return <ClassDetailsScreen id={id} q={q} />;
}
