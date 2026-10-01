import type { Metadata } from "next";
import { notFound } from "next/navigation";

import PracticeTest from "@/src/components/practice/PracticeTest";
import { DE_LUYEN_TAP } from "@/src/components/practice/practiceData";

interface Props {
  params: Promise<{ id: string }>;
}

export const generateStaticParams = () => DE_LUYEN_TAP.map((d) => ({ id: d.id }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const de = DE_LUYEN_TAP.find((d) => d.id === id);
  // Phong lam bai cua tung nguoi, khong can may tim kiem lap chi muc
  return de ? { title: `Làm bài: ${de.title}`, robots: { index: false } } : {};
}

export default async function PracticeTakePage({ params }: Props) {
  const { id } = await params;
  const de = DE_LUYEN_TAP.find((d) => d.id === id);
  if (!de) notFound();
  return <PracticeTest de={de} />;
}
