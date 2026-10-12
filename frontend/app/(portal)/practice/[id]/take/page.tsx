import type { Metadata } from "next";
import { notFound } from "next/navigation";

import PracticeTest from "@/src/components/features/portal/practice/PracticeTest";
import { PRACTICE_PAGE } from "@/src/constants/portal/practice-page";
import { quizParams, findQuiz } from "@/src/lib/practice";

interface Props {
  params: Promise<{ id: string }>;
}

export const generateStaticParams = quizParams;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const quiz = findQuiz((await params).id);
  // Phong lam bai cua tung nguoi, khong can may tim kiem lap chi muc
  return quiz
    ? { title: PRACTICE_PAGE.takeTitle(quiz.title), robots: { index: false } }
    : {};
}

export default async function PracticeTakePage({ params }: Props) {
  const quiz = findQuiz((await params).id);
  if (!quiz) notFound();
  return <PracticeTest de={quiz} />;
}
