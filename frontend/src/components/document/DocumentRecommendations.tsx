"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";

import { getErrorMessage } from "@/src/services/apiHelper";
import { documentService, type RecommendationResponse } from "@/src/services/document";
import DocumentRow from "./DocumentRow";

import styles from "./DocumentPanels.module.scss";

/** Tab "Goi y cho ban" o trang Chia se tai lieu. Chi hien khi da dang nhap. */
export default function DocumentRecommendations() {
  const [kq, setKq] = useState<RecommendationResponse | null>(null);
  const [dangTai, setDangTai] = useState(true);
  const [loi, setLoi] = useState("");

  const tai = useCallback(async () => {
    setDangTai(true);
    setLoi("");
    try {
      setKq(await documentService.getRecommendations({ limit: 12 }));
    } catch (err) {
      setLoi(getErrorMessage(err, "Không tải được gợi ý."));
    } finally {
      setDangTai(false);
    }
  }, []);

  useEffect(() => {
    // Hoan mot vong microtask - cung cach app/(admin)/admin/faqs/page.tsx: goi
    // thang thi setDangTai chay dong bo trong than effect (rule
    // react-hooks/set-state-in-effect).
    void Promise.resolve().then(tai);
  }, [tai]);

  if (dangTai) {
    return (
      <div className={styles.empty}>
        <Loader2 size={18} className={styles.spin} />
        Đang tìm tài liệu hợp với bạn…
      </div>
    );
  }
  if (loi)
    return (
      <p role="alert" className={styles.error}>
        {loi}
      </p>
    );
  if (!kq || kq.documents.length === 0) {
    return <div className={styles.empty}>Kho chưa có tài liệu nào để gợi ý.</div>;
  }

  return (
    <div>
      {/* Noi that voi nguoi dung dieu gi dang xay ra. Chua co lich su gi thi
          may chu chi tra moi nhat / pho bien - goi do la "danh cho ban" la
          noi qua su that, va nguoi ta se khong tin muc nay nua. */}
      <p className={styles.note}>
        <Sparkles size={15} />
        {kq.caNhanHoa
          ? "Dựa trên các tài liệu bạn đã xem, đã tải và từ khóa bạn đã tìm."
          : "Bạn chưa xem hay tìm tài liệu nào, nên đây là tài liệu mới và được tải nhiều. Gợi ý sẽ sát hơn khi bạn dùng kho nhiều hơn."}
      </p>
      <ul className={styles.list}>
        {kq.documents.map((d) => (
          <DocumentRow key={d._id} doc={d} phu={<span>{d.viSaoGoiY}</span>} />
        ))}
      </ul>
    </div>
  );
}
