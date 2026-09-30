import { StudentProfileScreen } from "@/features/students/student-profile-screen";

export default async function StudentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <StudentProfileScreen id={id} />;
}
