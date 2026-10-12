import {
  Convert10To4,
  FeatureLinks,
  GpaToolShell,
} from "@/src/components/features/portal/gpa";
import { CONVERT_10_TO_4_PAGE } from "@/src/constants/portal/gpa-page";

export const metadata = CONVERT_10_TO_4_PAGE.metadata;

export default function Convert10To4Page() {
  return (
    <GpaToolShell {...CONVERT_10_TO_4_PAGE.hero}>
      {/* Phan "tinh nang lien quan" nam giua cong cu va huong dan */}
      <Convert10To4>
        <FeatureLinks {...CONVERT_10_TO_4_PAGE.related} />
      </Convert10To4>
    </GpaToolShell>
  );
}
