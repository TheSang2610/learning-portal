// Lay du lieu cho cac trang khu tai lieu, o MAY CHU.
//
// Backend chet thi tra gia tri rong chu KHONG nem loi (tru getSchools, xem ghi
// chu o do): nem o day se lam hong ca luot build tren Vercel.

import type { DisplayItem } from "@/src/components/features/portal/share-document/parts/DocumentShowcase";
import type { TabKhamPha } from "@/src/components/features/portal/share-document/parts/DocumentExplore";
import type { Filters } from "@/src/components/features/portal/share-document/parts/ShareDocumentClient";
import { ALL_PATH, allPath } from "@/src/lib/document/paths";
import {
  getSchoolDetail,
  getSubjects,
  getGroups,
  getSchoolOptions,
  getFirstPage,
} from "@/src/components/features/portal/share-document/serverDocuments";
import { SHARE_DOCUMENT as C } from "@/src/constants/portal/share-document-page";
import {
  normalizeDocument,
  type SchoolDetail,
  type DocumentCategory,
  type DocumentListResponse,
  type DocumentStats,
  type DocumentSubject,
  type DocumentUniversity,
  type RecommendationResponse,
  type RecommendedDocument,
  type SharedDocument,
} from "@/src/services/document";
import type { FaqItem } from "@/src/services/faq";
import { GOC_API } from "@/src/services/serverFetch";

/**
 * Lay JSON o may chu. Backend chet thi tra gia tri rong chu KHONG nem loi: nem
 * o day se lam hong ca luot build tren Vercel.
 */
async function getJson<T>(route: string, defaults: T): Promise<T> {
  try {
    const res = await fetch(`${GOC_API}${route}`, { next: { revalidate: C.revalidate } });
    if (!res.ok) return defaults;
    return (await res.json()) as T;
  } catch {
    return defaults;
  }
}

/* ------------------------------------------------------------------ */
/* /share-document                                                     */
/* ------------------------------------------------------------------ */

/** Moi thu trang chu khu tai lieu can, da xep san cho tung section. */
export async function getDocumentPageData() {
  const [subjectList, groupList, schoolList, stats, latest, faqs] = await Promise.all([
    getJson<DocumentSubject[]>(C.api.subjects, []),
    getJson<DocumentCategory[]>(C.api.categories, []),
    getJson<DocumentUniversity[]>(C.api.universities, []),
    getJson<DocumentStats | null>(C.api.stats, null),
    getJson<DocumentListResponse | null>(C.api.latest, null),
    getJson<{ data?: FaqItem[] } | null>(C.api.faqs, null),
  ]);

  // Section "Danh rieng cho mon hoc cua ban": moi linh vuc CO tai lieu mot tab,
  // kem mot tai lieu cua no. Toi da 6 tab - hang tab dai hon thi nguoi xem
  // khong doc het, va moi tab la mot luot goi API.
  //
  // Mot tai lieu gan nhieu mon co the thuoc nhieu linh vuc (vd. "toán" +
  // "dữ liệu"): lay vai ung vien moi linh vuc roi chon bai CHUA hien o tab
  // truoc, de cac tab khong lap lai cung mot tai lieu.
  const groupsWithDocuments = groupList
    .filter((n) => n.soTaiLieu > 0)
    .slice(0, C.home.maxCategoryTabs);
  //
  // Cung mot luot goi phuc vu ca section "Kham pha tai lieu" ben duoi (8 bai
  // moi linh vuc), nen lay 8 chu khong phai 4.
  const [candidates, featured] = await Promise.all([
    Promise.all(
      groupsWithDocuments.map((group) =>
        getJson<DocumentListResponse | null>(C.api.byCategory(group.key), null),
      ),
    ),
    getJson<DocumentListResponse | null>(C.api.mostDownloaded, null),
  ]);
  const used = new Set<string>();
  const dsTrinhBay: DisplayItem[] = [];
  groupsWithDocuments.forEach((group, i) => {
    const items = candidates[i]?.documents ?? [];
    const document = items.find((d) => !used.has(d._id)) ?? items[0];
    if (!document) return;
    used.add(document._id);
    dsTrinhBay.push({ nhom: group, taiLieu: normalizeDocument(document) });
  });

  // Section "Kham pha tai lieu tu cong dong": tab Noi bat (tai nhieu nhat) +
  // moi linh vuc co tai lieu.
  const dsTabKhamPha: TabKhamPha[] = [
    {
      khoa: C.home.featuredTab.key,
      ten: C.home.featuredTab.name,
      documentList: (featured?.documents ?? []).map(normalizeDocument),
      viewMore: ALL_PATH,
    },
    ...groupsWithDocuments.map((group, i) => ({
      khoa: group.key,
      ten: group.ten,
      documentList: (candidates[i]?.documents ?? []).map(normalizeDocument),
      viewMore: allPath({ nhom: group.key }),
    })),
  ];

  return {
    subjectList,
    groupList,
    schoolList,
    thongKe: stats,
    latest: (latest?.documents ?? []).map(normalizeDocument),
    faqs: faqs?.data ?? null,
    dsTrinhBay,
    dsTabKhamPha,
  };
}

/* ------------------------------------------------------------------ */
/* /share-document/all-document                                        */
/* ------------------------------------------------------------------ */

/** Ten hien tren tieu de: mon > linh vuc > truong (cung thu tu uu tien voi trang). */
export async function filterName(query: Pick<Filters, "mon" | "nhom" | "truong">) {
  return query.mon
    ? (await getSubjects()).find((m) => m.key === query.mon)?.ten
    : query.nhom
      ? (await getGroups()).find((n) => n.key === query.nhom)?.ten
      : query.truong
        ? (await getSchoolOptions()).find((t) => t.key === query.truong)?.ten
        : undefined;
}

/** Trang dau theo bo loc + cac danh sach cho o chon. */
export async function getAllDocumentsData(query: Filters) {
  const [initialData, groupList, schoolList, subjectList] = await Promise.all([
    getFirstPage(query),
    getGroups(),
    getSchoolOptions(),
    getSubjects(),
  ]);
  return { initialData, groupList, schoolList, subjectList };
}

/* ------------------------------------------------------------------ */
/* /share-document/all-document/[id]                                   */
/* ------------------------------------------------------------------ */

export async function getDocument(id: string): Promise<SharedDocument | null> {
  try {
    const res = await fetch(`${GOC_API}${C.api.document(id)}`, {
      next: { revalidate: C.documentRevalidate },
    });
    if (!res.ok) return null;
    // Chuan hoa: ban luu cache co the con dang cu - xem normalizeDocument.
    return normalizeDocument((await res.json()) as SharedDocument);
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
export async function getRelated(id: string): Promise<RecommendedDocument[]> {
  try {
    const res = await fetch(`${GOC_API}${C.api.related(id)}`, {
      next: { revalidate: C.revalidate },
    });
    if (!res.ok) return [];
    const json = (await res.json()) as RecommendationResponse;
    return (json.documents ?? []).map(normalizeDocument);
  } catch {
    return [];
  }
}

/* ------------------------------------------------------------------ */
/* /share-document/institution/...                                     */
/* ------------------------------------------------------------------ */

/**
 * Mot truong cho trang /share-document/institution/<khoa>.
 *
 * null = khong co truong nay (404). Loi khac (backend chet...) thi NEM: bao
 * "khong co truong" trong khi truong co that se lam nguoi dung tuong link sai.
 */
export async function getSchools(course: string): Promise<SchoolDetail | null> {
  const res = await fetch(`${GOC_API}${C.api.university(course)}`, {
    next: { revalidate: C.revalidate },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(C.institution.loadFailed(res.status));
  return (await res.json()) as SchoolDetail;
}

/** Truong + linh vuc tren dia chi -> ban ghi that; khong co thi null (404). */
export async function findScope(schoolKey: string, groupKey: string) {
  const [schoolList, groupList] = await Promise.all([getSchoolOptions(), getGroups()]);
  const school = schoolList.find((t) => t.key === schoolKey);
  const group = groupList.find((n) => n.key === groupKey);
  return school && group ? { truong: school, nhom: group, schoolList, groupList } : null;
}

export type SchoolFieldScope = NonNullable<Awaited<ReturnType<typeof findScope>>>;

/** Trang dau + mon cua truong trong linh vuc nay (o chon mon va o "N môn học"). */
export async function getSchoolFieldData(pv: SchoolFieldScope, query: Filters) {
  const [initialData, subjectList, ct] = await Promise.all([
    getFirstPage(query),
    getSubjects(),
    getSchoolDetail(pv.truong.key),
  ]);
  const scopedSubjects = (ct?.monHoc ?? [])
    .filter((m) => m.nhom === pv.nhom._id)
    .map(({ key, ten: name, soTaiLieu: documentCount }) => ({
      key,
      ten: name,
      soTaiLieu: documentCount,
    }));
  return { initialData, subjectList, scopedSubjects };
}
