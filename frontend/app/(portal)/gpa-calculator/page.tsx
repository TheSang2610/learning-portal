import {
  FeatureLinks,
  GradeProfile,
  GradeProfileGuide,
  GradeProfileHero,
  GradeProfileMore,
  GradeProfileShell,
} from "@/src/components/features/portal/gpa";
import { GRADE_PROFILE_PAGE } from "@/src/constants/portal/gpa-page";

export const metadata = GRADE_PROFILE_PAGE.metadata;

// Server component de giu metadata va de phan tieu de duoc dung san trong HTML.
// Phan tinh toan can trang thai nen tach ra client component (GradeProfile).
export default function GradeProfilePage() {
  return (
    <GradeProfileShell>
      <GradeProfileHero {...GRADE_PROFILE_PAGE.hero} />
      <GradeProfile />
      <GradeProfileMore>
        <FeatureLinks {...GRADE_PROFILE_PAGE.related} />
        <GradeProfileGuide />
      </GradeProfileMore>
    </GradeProfileShell>
  );
}
