import { notFound } from "next/navigation";

import { swapKey } from "@/src/components/features/portal/share-document/serverDocuments";
import {
  InstitutionDetail,
  getSchools,
} from "@/src/components/features/portal/share-document";
import { SHARE_DOCUMENT } from "@/src/constants/portal/share-document-page";

// Mon hoc va so tai lieu doi cham - luu 60 giay nhu API.
export const revalidate = 60;

// Dia chi dung "hoc-vien-cong-nghe-..."; may chu doc duoc ca dang co "-".
type Params = Promise<{ truong: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { truong: school } = await params;
  const outcome = await getSchools(swapKey(school)).catch(() => null);
  if (!outcome) return { title: SHARE_DOCUMENT.institution.notFoundTitle };
  return {
    title: SHARE_DOCUMENT.institution.title(outcome.truong.ten),
    description: SHARE_DOCUMENT.institution.description(outcome.truong.ten),
  };
}

/** Trang mot truong: /share-document/institution/<khoa>. */
export default async function InstitutionDetailPage({ params }: { params: Params }) {
  const course = swapKey((await params).truong);
  const outcome = await getSchools(course);
  if (!outcome) notFound();
  return <InstitutionDetail {...outcome} />;
}
