import { getStudentMaterialDetail } from "./_action";
import { StudentLearningClient } from "./_components/student-learning-client";

export default async function StudentLearningPage({
  params,
}: {
  params: Promise<{ classId: string; materiId: string }>;
}) {
  const { classId, materiId } = await params;

  // Fetch data on the server
  const data = await getStudentMaterialDetail(materiId, classId);

  if (!data) {
    return (
      <div className="p-6">
        Materi tidak ditemukan atau Anda tidak memiliki akses.
      </div>
    );
  }

  return (
    <StudentLearningClient data={data} classId={classId} materiId={materiId} />
  );
}
