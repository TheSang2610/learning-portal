import { notFound } from "next/navigation";

import PracticeSetup from "@/src/components/features/portal/practice/PracticeSetup";
import { quizParams, findQuiz } from "@/src/lib/practice";

interface Props {
  params: Promise<{ id: string }>;
}

// De la du lieu tinh nen dung san tung trang luc build
export const generateStaticParams = quizParams;

export async function generateMetadata({ params }: Props) {
  const quiz = findQuiz((await params).id);
  return quiz ? { title: quiz.title, description: quiz.description } : {};
}

export default async function PracticeDeckPage({ params }: Props) {
  const quiz = findQuiz((await params).id);
  if (!quiz) notFound();
  return <PracticeSetup de={quiz} />;
}
