export type ProviderKind = "company" | "university";

/** Mot don vi doi tac / truong hoc trong bang quan tri. */
export interface ProviderRow {
  _id?: string;
  name: string;
  type: ProviderKind;
  logo: string;
  slug: string;
}
