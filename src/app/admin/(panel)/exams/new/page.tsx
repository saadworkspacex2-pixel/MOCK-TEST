import Link from "next/link";
import ExamForm from "../ExamForm";

export default function NewExamPage() {
  return (
    <div className="anim-fade-up">
      <Link
        href="/admin/exams"
        className="text-sm text-[#6C757D] hover:text-[#E51A24]"
      >
        ← পরীক্ষার তালিকায় ফিরুন
      </Link>
      <h1 className="mt-3 text-2xl font-bold">নতুন পরীক্ষা তৈরি</h1>
      <p className="mt-1 text-sm text-[#6C757D]">
        পরীক্ষা তৈরির পর প্রশ্ন যোগ করতে পারবেন।
      </p>
      <div className="mt-7">
        <ExamForm />
      </div>
    </div>
  );
}
