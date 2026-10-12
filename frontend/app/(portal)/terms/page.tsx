import {
  TermsContent,
  TermsHeader,
  TermsShell,
} from "@/src/components/features/portal/terms";
import { TERMS_PAGE } from "@/src/constants/portal/terms-page";

export default function TermsPage() {
  return (
    <TermsShell>
      <TermsHeader {...TERMS_PAGE.header} />
      <TermsContent {...TERMS_PAGE.content} />
    </TermsShell>
  );
}
