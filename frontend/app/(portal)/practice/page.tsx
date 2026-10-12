import PracticeHome from "@/src/components/features/portal/practice/PracticeHome";
import { PRACTICE_PAGE } from "@/src/constants/portal/practice-page";

export const metadata = PRACTICE_PAGE.metadata;

export default function PracticePage() {
  return <PracticeHome />;
}
