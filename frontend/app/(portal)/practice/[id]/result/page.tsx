import type { Metadata } from "next";
import { notFound } from "next/navigation";

import PracticeReview from "@/src/components/practice/PracticeReview";
import { DE_LUYEN_TAP } from "@/src/components/practice/practiceData";

interface Props {
  params: Promise<{ id: string }>;
}

// Ma lan lam bai di qua ?lan= nen trang van dung san duoc theo de
export const generateStaticParams = () => DE_LUYEN_TAP.map((d) => ({ id: d.id }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const de = DE_LUYEN_TAP.find((d) => d.id === id);
  // Bai lam rieng cua tung nguoi, khong cho may tim kiem lap chi muc
  return de ? { title: `Bài làm: ${de.title}`, robots: { index: false } } : {};
}

export default async function PracticeResultPage({ params }: Props) {
  const { id } = await params;
  const de = DE_LUYEN_TAP.find((d) => d.id === id);
  if (!de) notFound();
  return <PracticeReview de={de} />;
}
