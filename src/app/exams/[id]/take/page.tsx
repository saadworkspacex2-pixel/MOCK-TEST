import TakeExamClient from "./TakeExamClient";

export default async function TakeExamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TakeExamClient examId={Number(id)} />;
}
