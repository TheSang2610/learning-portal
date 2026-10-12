import type { Filters } from "@/src/components/features/portal/share-document/parts/ShareDocumentClient";
import {
  readType,
  readKeyword,
  swapKey,
} from "@/src/components/features/portal/share-document/serverDocuments";
import {
  DocumentBrowser,
  getAllDocumentsData,
  filterName,
} from "@/src/components/features/portal/share-document";
import { SHARE_DOCUMENT } from "@/src/constants/portal/share-document-page";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const name = await filterName({
    mon: swapKey(sp.mon),
    nhom: swapKey(sp.nhom),
    truong: swapKey(sp.truong),
  });
  return {
    title: SHARE_DOCUMENT.browse.titleFor(name),
    description: SHARE_DOCUMENT.browse.description,
  };
}

/** Tat ca tai lieu: /share-document/all-document?q=&mon=&nhom=&truong=&loai= */
export default async function AllDocumentsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const query: Filters = {
    q: readKeyword(sp.q),
    mon: swapKey(sp.mon),
    nhom: swapKey(sp.nhom),
    truong: swapKey(sp.truong),
    loai: readType(sp.loai),
  };
  const d = await getAllDocumentsData(query);

  return (
    <DocumentBrowser
      initialData={d.initialData}
      initialFilters={query}
      groupList={d.groupList}
      schoolList={d.schoolList}
      initialSubjects={d.subjectList}
    />
  );
}
