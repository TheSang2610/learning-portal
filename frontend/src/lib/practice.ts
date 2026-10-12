import { PRACTICE_QUIZZES } from "@/src/components/features/portal/practice/practiceData";

/** De luyen tap theo id; undefined khi khong co (trang goi notFound()). */
export const findQuiz = (id: string) => PRACTICE_QUIZZES.find((d) => d.id === id);

// De la du lieu tinh nen dung san tung trang luc build. Ba trang /practice/[id]
// (gioi thieu, lam bai, ket qua) dung chung danh sach tham so nay.
export const quizParams = () => PRACTICE_QUIZZES.map((d) => ({ id: d.id }));
