"use client";

import { useCallback, useEffect, useState } from "react";
import { Download, Eye, History, Loader2, Trash2 } from "lucide-react";

import { getErrorMessage } from "@/src/services/apiHelper";
import { documentService, type HistoryItem } from "@/src/services/document";
import { thoiGianTuongDoi } from "@/src/components/common/time";
import DocumentRow from "./DocumentRow";

import styles from "./DocumentPanels.module.scss";

/**
 * Tab "Lich su" o trang Chia se tai lieu: tai lieu da xem va da tai cua CHINH
 * nguoi dang dang nhap. Chi hien khi da dang nhap.
 */
export default function DocumentHistory() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [dangTai, setDangTai] = useState(true);
  const [dangXoa, setDangXoa] = useState(false);
  const [loi, setLoi] = useState("");

  const tai = useCallback(async () => {
    setDangTai(true);
    setLoi("");
    try {
      const res = await documentService.getMyHistory();
      setItems(res.items ?? []);
    } catch (err) {
      setLoi(getErrorMessage(err, "Không tải được lịch sử."));
    } finally {
      setDangTai(false);
    }
  }, []);

  useEffect(() => {
    // Xem ghi chu cung cho o DocumentRecommendations.
    void Promise.resolve().then(tai);
  }, [tai]);

  const xoaHet = async () => {
    // Noi ro ca goi y cung mat theo: nguoi dung co the chi nghi la xoa mot danh
    // sach, khong biet no la du lieu goi y dang dua vao.
    if (
      !confirm(
        "Xóa toàn bộ lịch sử xem, tải và tìm kiếm tài liệu của bạn?\n\n" +
          "Gợi ý dành cho bạn cũng sẽ bắt đầu lại từ đầu. Không hoàn tác được.",
      )
    )
      return;
    setDangXoa(true);
    try {
      await documentService.clearMyHistory();
      setItems([]);
    } catch (err) {
      setLoi(getErrorMessage(err, "Không xóa được lịch sử."));
    } finally {
      setDangXoa(false);
    }
  };

  if (dangTai) {
    return (
      <div className={styles.empty}>
        <Loader2 size={18} className={styles.spin} />
        Đang tải lịch sử…
      </div>
    );
  }

  return (
    <div>
      {loi && (
        <p role="alert" className={styles.error}>
          {loi}
        </p>
      )}

      {items.length === 0 ? (
        <div className={styles.empty}>
          <History size={22} />
          <span>Bạn chưa xem hay tải tài liệu nào.</span>
          <span className={styles.emptySub}>
            Mở một tài liệu bất kỳ là nó sẽ hiện ở đây.
          </span>
        </div>
      ) : (
        <>
          <div className={styles.toolbar}>
            <span className={styles.count}>{items.length} tài liệu gần đây</span>
            <button
              type="button"
              onClick={xoaHet}
              disabled={dangXoa}
              className={styles.clear}
            >
              {dangXoa ? (
                <Loader2 size={14} className={styles.spin} />
              ) : (
                <Trash2 size={14} />
              )}
              Xóa lịch sử
            </button>
          </div>
          <ul className={styles.list}>
            {items.map((d) => (
              <DocumentRow
                key={d._id}
                doc={d}
                phu={<span>Lần cuối {thoiGianTuongDoi(d.lanCuoi)}</span>}
                benPhai={
                  d.daTai ? (
                    <span className={styles.tagTai}>
                      <Download size={12} />
                      Đã tải
                    </span>
                  ) : (
                    <span className={styles.tagXem}>
                      <Eye size={12} />
                      Đã xem
                    </span>
                  )
                }
              />
            ))}
          </ul>
          <p className={styles.fine}>
            Lịch sử tự xóa sau 180 ngày. Chỉ bạn nhìn thấy danh sách này.
          </p>
        </>
      )}
    </div>
  );
}
