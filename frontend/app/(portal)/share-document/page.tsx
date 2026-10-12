import FaqSection from "@/src/components/common/FaqSection";
import {
  DocumentCategories,
  DocumentExplore,
  DocumentShowcase,
  DocumentStats,
  DocumentUniversities,
  getDocumentPageData,
  ShareDocumentIndex,
  ShareDocumentShell,
} from "@/src/components/features/portal/share-document";
import { SHARE_DOCUMENT } from "@/src/constants/portal/share-document-page";

export const metadata = SHARE_DOCUMENT.home.metadata;

// So dem linh vuc / mon doi theo bai dang moi - luu 60 giay, giong API.
export const revalidate = 60;

/**
 * Trang CHU cua khu tai lieu: dai dau (tha file / tim), roi cac section.
 * Danh sach tat ca tai lieu nam o /share-document/all-document.
 */
export default async function ShareDocumentPage() {
  const d = await getDocumentPageData();

  return (
    <ShareDocumentShell>
      <ShareDocumentIndex subjectList={d.subjectList} />
      <DocumentShowcase itemList={d.dsTrinhBay} />
      <DocumentExplore dsTab={d.dsTabKhamPha} />
      {d.thongKe && <DocumentStats tk={d.thongKe} />}
      <DocumentUniversities schoolList={d.schoolList} documentList={d.latest} />
      <DocumentCategories groupList={d.groupList} />
      {/* Cuoi trang: FAQ rieng cua khu tai lieu (admin: /admin/faqs, tab
          "Chia se tai lieu"). Loi mang thi truyen null de component tu goi lai. */}
      <FaqSection viTri="taiLieu" initialData={d.faqs} />
    </ShareDocumentShell>
  );
}
