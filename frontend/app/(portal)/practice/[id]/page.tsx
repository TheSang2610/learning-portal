import { notFound } from "next/navigation";

import PracticeSetup from "@/src/components/practice/PracticeSetup";
import { DE_LUYEN_TAP } from "@/src/components/practice/practiceData";

interface Props {
  params: Promise<{ id: string }>;
}

// De la du lieu tinh nen dung san tung trang luc build
export const generateStaticParams = () => DE_LUYEN_TAP.map((d) => ({ id: d.id }));

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const de = DE_LUYEN_TAP.find((d) => d.id === id);
  return de ? { title: de.title, description: de.description } : {};
}

export default async function PracticeDeckPage({ params }: Props) {
  const { id } = await params;
  const de = DE_LUYEN_TAP.find((d) => d.id === id);
  if (!de) notFound();
  return <PracticeSetup de={de} />;
}
