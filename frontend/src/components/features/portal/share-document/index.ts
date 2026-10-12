// Trang chu khu tai lieu: khung + cac section (xep trong app/(portal)/share-document/page.tsx)
export { default as ShareDocumentShell } from "./ShareDocumentShell";
export { default as ShareDocumentIndex } from "./parts/ShareDocumentIndex";
export { default as DocumentShowcase } from "./parts/DocumentShowcase";
export { default as DocumentExplore } from "./parts/DocumentExplore";
export { default as DocumentStats } from "./parts/DocumentStats";
export { default as DocumentUniversities } from "./parts/DocumentUniversities";
export { default as DocumentCategories } from "./parts/DocumentCategories";

// Cac trang con
export { default as DocumentBrowser } from "./browse/DocumentBrowser";
export { default as DocumentDetailPage } from "./detail/DocumentDetailPage";
export { default as InstitutionDirectory } from "./parts/InstitutionDirectory";
export { default as InstitutionDetail } from "./parts/InstitutionDetail";

export {
  getAllDocumentsData,
  getDocumentPageData,
  getSchoolFieldData,
  getRelated,
  getDocument,
  getSchools,
  filterName,
  findScope,
} from "./data";
