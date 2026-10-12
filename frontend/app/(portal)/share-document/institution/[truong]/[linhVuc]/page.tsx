import { notFound } from "next/navigation";

import type { Filters } from "@/src/components/features/portal/share-document/parts/ShareDocumentClient";
import {
  readType,
  readKeyword,
  swapKey,
} from "@/src/components/features/portal/share-document/serverDocuments";
import {
  DocumentBrowser,
  getSchoolFieldData,
  findScope,
} from "@/src/components/features/portal/share-document";
import { SHARE_DOCUMENT } from "@/src/constants/portal/share-document-page";

type Params = Promise<{ truong: string; linhVuc: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/** Truong + linh vuc tren dia chi -> ban ghi that; khong co thi null (404). */
async function scopeFromParams(params: Params) {
  const p = await params;
  return findScope(swapKey(p.truong), swapKey(p.linhVuc));
}

export async function generateMetadata({ params }: { params: Params }) {
  const pv = await scopeFromParams(params);
  const C = SHARE_DOCUMENT.institutionCategory;
  if (!pv) return { title: C.notFoundTitle };
  return {
    title: C.title(pv.nhom.ten, pv.truong.ten),
    description: C.description(pv.nhom.ten, pv.truong.ten),
  };
}

/**
 * Tai lieu mot linh vuc cua mot truong:
 * /share-document/institution/<khoa-truong>/<khoa-linh-vuc>?mon=&q=&loai=
 *
 * Cung giao dien trang tat ca tai lieu, bo loc truong + linh vuc dat san.
 */
export default async function InstitutionCategoryPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const [pv, sp] = await Promise.all([scopeFromParams(params), searchParams]);
  if (!pv) notFound();

  const query: Filters = {
    q: readKeyword(sp.q),
    mon: swapKey(sp.mon),
    nhom: pv.nhom.key,
    truong: pv.truong.key,
    loai: readType(sp.loai),
  };
  const d = await getSchoolFieldData(pv, query);

  return (
    <DocumentBrowser
      initialData={d.initialData}
      initialFilters={query}
      groupList={pv.groupList}
      schoolList={pv.schoolList}
      initialSubjects={d.subjectList}
      scope={{ truong: pv.truong.key, nhom: pv.nhom.key }}
      scopedSubjects={d.scopedSubjects}
    />
  );
}
