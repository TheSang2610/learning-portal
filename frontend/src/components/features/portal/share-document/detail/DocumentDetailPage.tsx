import DocumentDetailClient from "@/src/components/features/portal/share-document/parts/DocumentDetailClient";
import type { RecommendedDocument, SharedDocument } from "@/src/services/document";

import styles from "./DocumentDetailPage.module.scss";

/** Trang mot tai lieu: noi dung chinh + cot lien quan. */
export default function DocumentDetailPage({
  doc,
  related,
}: {
  doc: SharedDocument;
  related: RecommendedDocument[];
}) {
  return (
    <div className={styles.page}>
      {/* key theo id: bam sang tai lieu khac o cot lien quan thi React dung
          lai component tu dau, khong mang state cu (vd. binh luan dang go) cua
          tai lieu truoc sang. */}
      <DocumentDetailClient key={doc._id} doc={doc} related={related} />
    </div>
  );
}
