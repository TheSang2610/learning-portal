import type { Metadata } from "next";
import { notFound } from "next/navigation";

import PracticeReview from "@/src/components/features/portal/practice/PracticeReview";
import { PRACTICE_PAGE } from "@/src/constants/portal/practice-page";
import { quizParams, findQuiz } from "@/src/lib/practice";

interface Props {
  params: Promise<{ id: string }>;
}

// Ma lan lam bai di qua ?lan= nen trang van dung san duoc theo de
export const generateStaticParams = quizParams;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const quiz = findQuiz((await params).id);
  // Bai lam rieng cua tung nguoi, khong cho may tim kiem lap chi muc
  return quiz
    ? { title: PRACTICE_PAGE.resultTitle(quiz.title), robots: { index: false } }
    : {};
}

export default async function PracticeResultPage({ params }: Props) {
  const quiz = findQuiz((await params).id);
  if (!quiz) notFound();
  return <PracticeReview de={quiz} />;
}
