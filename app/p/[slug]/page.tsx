import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DynamicSections from "@/components/DynamicSections";

export const dynamic = "force-dynamic";

export default async function CustomPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <Navbar />
      <div className="pt-20">
        <DynamicSections page={slug} />
      </div>
      <Footer />
    </div>
  );
}
