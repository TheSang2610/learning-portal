import { notFound } from "next/navigation";
import DocumentDetailClient from "@/src/components/document/DocumentDetailClient";
import type { SharedDocument } from "@/src/services/document";
import { GOC_API } from "@/src/services/serverFetch";

export const revalidate = 30;

async function layTaiLieu(id: string): Promise<SharedDocument | null> {
  try {
    const res = await fetch(`${GOC_API}/api/documents/${id}`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) return null;
    return (await res.json()) as SharedDocument;
  } catch {
    return null;
  }
}

// Tieu de tab trinh duyet lay theo ten tai lieu. Next goi ham nay va component
// ben duoi cung luc, hai loi goi fetch trung nhau duoc gop lai nen khong ton
// them mot vong goi API.
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const doc = await layTaiLieu(id);
  if (!doc) return { title: "Không tìm thấy tài liệu" };
  return {
    title: doc.title,
    description: doc.description.slice(0, 160),
  };
}

export default async function DocumentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const doc = await layTaiLieu(id);
  if (!doc) notFound();

  return (
    <div className="min-h-screen bg-[#f8fafc] py-8">
      <DocumentDetailClient doc={doc} />
    </div>
  );
}
