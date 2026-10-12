import type { LucideIcon } from "lucide-react";

import type { RichText } from "./rich-text";

/** Dau trang cua trang phap ly (privacy / terms). */
export interface LegalHeaderData {
  badge: string;
  title: string;
  updated: string;
}

export interface PrivacyContentData {
  intro: RichText;
  sections: { icon: LucideIcon; title: string; body: RichText; list?: string[] }[];
}

export interface TermsContentData {
  intro: RichText;
  /** Danh so theo thu tu trong mang (1, 2, 3...). */
  sections: { title: string; body: RichText }[];
  warning: { title: string; body: string };
}
