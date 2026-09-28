import ShareDocumentIndex from "@/src/components/document/ShareDocumentIndex";
import DocumentCategories from "@/src/components/document/DocumentCategories";
import DocumentShowcase, {
  type MucTrinhBay,
} from "@/src/components/document/DocumentShowcase";
import DocumentExplore, {
  type TabKhamPha,
} from "@/src/components/document/DocumentExplore";
import DocumentStats from "@/src/components/document/DocumentStats";
import DocumentUniversities from "@/src/components/document/DocumentUniversities";
import FaqSection from "@/src/components/home/FaqSection";
import type { FaqItem } from "@/src/services/faq";
import { DUONG_TAT_CA, duongTatCa } from "@/src/components/document/duongDan";
import {
  chuanHoaTaiLieu,
  type DocumentCategory,
  type DocumentListResponse,
  type DocumentStats as ThongKe,
  type DocumentSubject,
  type DocumentUniversity,
} from "@/src/services/document";
import { GOC_API } from "@/src/services/serverFetch";

import styles from "./page.module.scss";

export const metadata = {
  title: "Chia sẻ tài liệu",
  description:
    "Tải lên và tải về tài liệu học tập miễn phí: đề cương, đề thi, bài giải, slide bài giảng — xếp theo lĩnh vực và môn học.",
};

// So dem linh vuc / mon doi theo bai dang moi - luu 60 giay, giong API.
export const revalidate = 60;

/**
 * Lay JSON o may chu. Backend chet thi tra gia tri rong chu KHONG nem loi: nem
 * o day se lam hong ca luot build tren Vercel.
 */
async function layJson<T>(duong: string, macDinh: T): Promise<T> {
  try {
    const res = await fetch(`${GOC_API}${duong}`, { next: { revalidate: 60 } });
    if (!res.ok) return macDinh;
    return (await res.json()) as T;
  } catch {
    return macDinh;
  }
}

/**
 * Trang CHU cua khu tai lieu: dai dau (tha file / tim), roi cac section.
 * Danh sach tat ca tai lieu nam o /share-document/browse.
 */
export default async function ShareDocumentPage() {
  const [dsMon, dsNhom, dsTruong, thongKe, moiNhat, faqs] = await Promise.all([
    layJson<DocumentSubject[]>("/api/documents/mon-hoc", []),
    layJson<DocumentCategory[]>("/api/documents/linh-vuc", []),
    layJson<DocumentUniversity[]>("/api/documents/truong", []),
    layJson<ThongKe | null>("/api/documents/thong-ke", null),
    layJson<DocumentListResponse | null>("/api/documents?limit=12", null),
    layJson<{ data?: FaqItem[] } | null>("/api/faqs/tai-lieu", null),
  ]);

  // Section "Danh rieng cho mon hoc cua ban": moi linh vuc CO tai lieu mot tab,
  // kem mot tai lieu cua no. Toi da 6 tab - hang tab dai hon thi nguoi xem
  // khong doc het, va moi tab la mot luot goi API.
  //
  // Mot tai lieu gan nhieu mon co the thuoc nhieu linh vuc (vd. "toán" +
  // "dữ liệu"): lay vai ung vien moi linh vuc roi chon bai CHUA hien o tab
  // truoc, de cac tab khong lap lai cung mot tai lieu.
  const nhomCoTaiLieu = dsNhom.filter((n) => n.soTaiLieu > 0).slice(0, 6);
  //
  // Cung mot luot goi phuc vu ca section "Kham pha tai lieu" ben duoi (8 bai
  // moi linh vuc), nen lay 8 chu khong phai 4.
  const [ungVien, noiBat] = await Promise.all([
    Promise.all(
      nhomCoTaiLieu.map((nhom) =>
        layJson<DocumentListResponse | null>(
          `/api/documents?limit=8&nhom=${encodeURIComponent(nhom.key)}`,
          null,
        ),
      ),
    ),
    layJson<DocumentListResponse | null>("/api/documents?limit=8&sapXep=luotTai", null),
  ]);
  const daDung = new Set<string>();
  const dsTrinhBay: MucTrinhBay[] = [];
  nhomCoTaiLieu.forEach((nhom, i) => {
    const ds = ungVien[i]?.documents ?? [];
    const taiLieu = ds.find((d) => !daDung.has(d._id)) ?? ds[0];
    if (!taiLieu) return;
    daDung.add(taiLieu._id);
    dsTrinhBay.push({ nhom, taiLieu: chuanHoaTaiLieu(taiLieu) });
  });

  // Section "Kham pha tai lieu tu cong dong": tab Noi bat (tai nhieu nhat) +
  // moi linh vuc co tai lieu.
  const dsTabKhamPha: TabKhamPha[] = [
    {
      khoa: "noi-bat",
      ten: "Nổi bật",
      dsTaiLieu: (noiBat?.documents ?? []).map(chuanHoaTaiLieu),
      xemThem: DUONG_TAT_CA,
    },
    ...nhomCoTaiLieu.map((nhom, i) => ({
      khoa: nhom.key,
      ten: nhom.ten,
      dsTaiLieu: (ungVien[i]?.documents ?? []).map(chuanHoaTaiLieu),
      xemThem: duongTatCa({ nhom: nhom.key }),
    })),
  ];

  return (
    <div className={styles.page}>
      <ShareDocumentIndex dsMon={dsMon} />
      <DocumentShowcase dsMuc={dsTrinhBay} />
      <DocumentExplore dsTab={dsTabKhamPha} />
      {thongKe && <DocumentStats tk={thongKe} />}
      <DocumentUniversities
        dsTruong={dsTruong}
        dsTaiLieu={(moiNhat?.documents ?? []).map(chuanHoaTaiLieu)}
      />
      <DocumentCategories dsNhom={dsNhom} />
      {/* Cuoi trang: FAQ rieng cua khu tai lieu (admin: /admin/faqs, tab
          "Chia se tai lieu"). Loi mang thi truyen null de component tu goi lai. */}
      <FaqSection viTri="taiLieu" initialData={faqs?.data ?? null} />
    </div>
  );
}
