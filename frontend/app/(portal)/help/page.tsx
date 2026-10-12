import {
  HelpContact,
  HelpFaqList,
  HelpHero,
  HelpShell,
} from "@/src/components/features/portal/help";
import { HELP_PAGE } from "@/src/constants/portal/help-page";

export default function HelpPage() {
  return (
    <HelpShell>
      <HelpHero {...HELP_PAGE.hero} />
      <HelpFaqList {...HELP_PAGE.faq} />
      <HelpContact {...HELP_PAGE.contact} />
    </HelpShell>
  );
}
