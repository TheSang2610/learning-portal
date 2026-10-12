import { notFound } from "next/navigation";

import { stripTags } from "@/src/lib/post-html";
import {
  DocumentDetailPage as DocumentDetail,
  getRelated,
  getDocument,
} from "@/src/components/features/portal/share-document";
import { SHARE_DOCUMENT } from "@/src/constants/portal/share-document-page";

export const revalidate = 30;

// Tieu de tab trinh duyet lay theo ten tai lieu. Next goi ham nay va component
// ben duoi cung luc, hai loi goi fetch trung nhau duoc gop lai nen khong ton
// them mot vong goi API.
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const doc = await getDocument(id);
  if (!doc) return { title: SHARE_DOCUMENT.detail.notFoundTitle };
  return {
    title: doc.title,
    // Chu tran, khong phai HTML: Google hien nguyen van "<p><strong>" neu de the.
    description: stripTags(doc.description).slice(
      0,
      SHARE_DOCUMENT.detail.descriptionLength,
    ),
  };
}

export default async function DocumentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const doc = await getDocument(id);
  if (!doc) notFound();

  // Goi SAU khi chac chan co tai lieu: id sai thi da notFound() o tren, khong
  // ton mot luot goi API cho cot phu.
  const related = await getRelated(id);

  return <DocumentDetail doc={doc} related={related} />;
}
