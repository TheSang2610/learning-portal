import {
  CalcPoint,
  CalcPointGuide,
  FeatureLinks,
  GpaToolShell,
} from "@/src/components/features/portal/gpa";
import { CALC_POINT_PAGE } from "@/src/constants/portal/gpa-page";

export const metadata = CALC_POINT_PAGE.metadata;

export default function CalcPointPage() {
  return (
    <GpaToolShell {...CALC_POINT_PAGE.hero}>
      <CalcPoint />
      <FeatureLinks {...CALC_POINT_PAGE.related} />
      <CalcPointGuide />
    </GpaToolShell>
  );
}
