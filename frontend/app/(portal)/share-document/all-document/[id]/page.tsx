import { notFound } from "next/navigation";
import DocumentDetailClient from "@/src/components/document/DocumentDetailClient";
import {
  chuanHoaTaiLieu,
  type RecommendationResponse,
  type RecommendedDocument,
  type SharedDocument,
} from "@/src/services/document";
import { GOC_API } from "@/src/services/serverFetch";
import { boThe } from "@/src/components/common/postHtml";

export const revalidate = 30;

import styles from "./page.module.scss";
async function layTaiLieu(id: string): Promise<SharedDocument | null> {
  try {
    const res = await fetch(`${GOC_API}/api/documents/${id}`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) return null;
    // Chuan hoa: ban luu cache co the con dang cu - xem chuanHoaTaiLieu.
    return chuanHoaTaiLieu((await res.json()) as SharedDocument);
  } catch {
    return null;
  }
}

// Tai lieu cho cot ben phai: GOI Y lien quan toi tai lieu dang xem (cung mon,
// gan tieu de, duoc tai nhieu). Truoc day chi la 6 tai lieu moi nhat - khong
// lien quan gi den tai lieu dang mo.
//
// Goi o MAY CHU nen khong mang cookie cua nguoi xem: ket qua la ban "khach" -
// chi dua tren tai lieu dang xem, khong dua tren lich su rieng. Dung y do: o
// trang chi tiet thu can la "lien quan toi TAI LIEU NAY", va nho vay ket qua
// giong nhau voi moi nguoi nen luu lai 60 giay duoc. Goi y theo lich su rieng
// nam o tab "Goi y cho ban" trang danh sach.
//
// May chu tu loai chinh tai lieu dang xem ra, khong phai loc o day.
//
// Hong thi tra ve mang rong chu khong nem loi: cot ben phai la phan phu, khong
// duoc phep lam sap ca trang tai lieu chinh.
async function layLienQuan(id: string): Promise<RecommendedDocument[]> {
  try {
    const res = await fetch(`${GOC_API}/api/documents/goi-y?id=${id}&limit=6`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const json = (await res.json()) as RecommendationResponse;
    return (json.documents ?? []).map(chuanHoaTaiLieu);
  } catch {
    return [];
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
    // Chu tran, khong phai HTML: Google hien nguyen van "<p><strong>" neu de the.
    description: boThe(doc.description).slice(0, 160),
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

  // Goi SAU khi chac chan co tai lieu: id sai thi da notFound() o tren, khong
  // ton mot luot goi API cho cot phu.
  const lienQuan = await layLienQuan(id);

  return (
    <div className={styles.page}>
      {/* key theo id: bam sang tai lieu khac o cot lien quan thi React dung
          lai component tu dau, khong mang state cu (vd. binh luan dang go) cua
          tai lieu truoc sang. */}
      <DocumentDetailClient key={doc._id} doc={doc} lienQuan={lienQuan} />
    </div>
  );
}
