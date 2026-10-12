import {
  PrivacyContent,
  PrivacyHeader,
  PrivacyShell,
} from "@/src/components/features/portal/privacy";
import { PRIVACY_PAGE } from "@/src/constants/portal/privacy-page";

export default function PrivacyPage() {
  return (
    <PrivacyShell>
      <PrivacyHeader {...PRIVACY_PAGE.header} />
      <PrivacyContent {...PRIVACY_PAGE.content} />
    </PrivacyShell>
  );
}
