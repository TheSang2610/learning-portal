"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Coins,
  Loader2,
  Check,
  Ban,
  ChevronLeft,
  ChevronRight,
  Clock,
} from "lucide-react";

import {
  layDanhSachNapAdmin,
  xacNhanNapAdmin,
  tuChoiNapAdmin,
  type TrangThaiNap,
  type YeuCauNapAdmin,
} from "@/src/services/coin.api";
import { getErrorMessage } from "@/src/services/apiHelper";

import styles from "./page.module.scss";
const MOI_TRANG = 10;

const NHAN: Record<TrangThaiNap, { chu: string; lop: string }> = {
  pending: { chu: "Đang chờ", lop: styles.nhanCho },
  paid: { chu: "Đã cộng coin", lop: styles.nhanXong },
  cancelled: { chu: "Đã hủy", lop: styles.nhanHuy },
  expired: { chu: "Quá hạn", lop: styles.nhanQuaHan },
};

const gio = (s?: string | null) =>
  s ? new Date(s).toLocaleString("vi-VN", { hour12: false }) : "--";

export default function AdminCoinTopUpsPage() {
  const [rows, setRows] = useState<YeuCauNapAdmin[]>([]);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  // Mac dinh loc 'pending': day la mot hang doi viec, khong phai so luu tru.
  const [loc, setLoc] = useState<TrangThaiNap | "">("pending");
  const [dangTai, setDangTai] = useState(true);
  const [banMa, setBanMa] = useState<string | null>(null);
  const [loi, setLoi] = useState("");

  const doc = useCallback(async () => {
    setDangTai(true);
    setLoi("");
    try {
      const kq = await layDanhSachNapAdmin({ status: loc, page, limit: MOI_TRANG });
      setRows(kq.yeuCau);
      setPages(kq.pages);
    } catch (e) {
      setLoi(getErrorMessage(e, "Không đọc được danh sách yêu cầu nạp"));
    } finally {
      setDangTai(false);
    }
  }, [loc, page]);

  useEffect(() => {
    void Promise.resolve().then(doc);
  }, [doc]);

  const xacNhan = async (yc: YeuCauNapAdmin) => {
    // Hoi lai vi day la buoc BO TIEN THAT vao vi nguoi khac, va khong co nut
    // hoan tac: coin cong roi thi phai thu hoi tay o trang Coin & Qua tang.
    const dong = window.confirm(
      `Đã thấy ${yc.amount.toLocaleString("vi-VN")}đ với nội dung "${yc.code}" trong sao kê?\n\n` +
        `Xác nhận sẽ cộng ${yc.soCoin.toLocaleString("vi-VN")} coin cho ${yc.student?.name || "học viên"}.`,
    );
    if (!dong) return;

    setBanMa(yc.code);
    try {
      const kq = await xacNhanNapAdmin(yc.code);
      alert(kq.message);
      await doc();
    } catch (e) {
      alert(getErrorMessage(e, "Không xác nhận được yêu cầu"));
    } finally {
      setBanMa(null);
    }
  };

  const tuChoi = async (yc: YeuCauNapAdmin) => {
    const lyDo = window.prompt("Lý do hủy (để trống cũng được):", "");
    if (lyDo === null) return;

    setBanMa(yc.code);
    try {
      await tuChoiNapAdmin(yc.code, lyDo);
      await doc();
    } catch (e) {
      alert(getErrorMessage(e, "Không hủy được yêu cầu"));
    } finally {
      setBanMa(null);
    }
  };

  return (
    <div className={styles.stack}>
      <div>
        <h1 className={styles.title}>
          <Coins size={22} className={styles.box} /> Yêu cầu nạp coin
        </h1>
        <p className={styles.text}>
          Mở sao kê ngân hàng, tìm khoản tiền có nội dung trùng mã rồi mới xác nhận. Học
          viên bấm &ldquo;tôi đã chuyển khoản&rdquo; chỉ là lời khai, không phải bằng
          chứng.
        </p>
      </div>

      <div className={styles.row}>
        {(["pending", "paid", "cancelled", "expired", ""] as const).map((t) => (
          <button
            key={t || "all"}
            onClick={() => {
              setLoc(t);
              setPage(1);
            }}
            className={`${styles.button5} ${loc === t ? styles.button : styles.button2}`}
          >
            {t ? NHAN[t].chu : "Tất cả"}
          </button>
        ))}
      </div>

      {loi && <p className={styles.text2}>{loi}</p>}

      <div className={styles.card}>
        <div className={styles.scroller}>
          <table className={styles.table}>
            <thead className={styles.thead}>
              <tr>
                <th className={styles.headCell}>Học viên</th>
                <th className={styles.headCell}>Mã / Nội dung CK</th>
                <th className={styles.headCell}>Số coin</th>
                <th className={styles.headCell}>Số tiền</th>
                <th className={styles.headCell}>Báo đã chuyển</th>
                <th className={styles.headCell2}>Trạng thái</th>
              </tr>
            </thead>
            <tbody className={styles.tbody}>
              {dangTai ? (
                <tr>
                  <td colSpan={6} className={styles.cell}>
                    <Loader2 size={20} className={styles.spinner} />
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className={styles.cell2}>
                    Không có yêu cầu nào.
                  </td>
                </tr>
              ) : (
                rows.map((yc) => {
                  const nhan = NHAN[yc.status];
                  const choXuLy = yc.status === "pending" || yc.status === "expired";
                  return (
                    <tr key={yc._id} className={styles.row2}>
                      <td className={styles.headCell}>
                        <p className={styles.text3}>{yc.student?.name || "(đã xóa)"}</p>
                        <p className={styles.text4}>{yc.student?.email || "--"}</p>
                      </td>
                      <td className={styles.headCell}>
                        <p className={styles.text5}>{yc.code}</p>
                        <p className={styles.text6}>{gio(yc.createdAt)}</p>
                      </td>
                      <td className={styles.cell3}>
                        {yc.soCoin.toLocaleString("vi-VN")}
                      </td>
                      <td className={styles.cell4}>
                        {yc.amount.toLocaleString("vi-VN")}đ
                      </td>
                      <td className={styles.cell5}>
                        {yc.daBaoChuyenKhoanLuc ? (
                          <span className={styles.label}>
                            <Clock size={12} /> {gio(yc.daBaoChuyenKhoanLuc)}
                          </span>
                        ) : (
                          "chưa báo"
                        )}
                      </td>
                      <td className={styles.headCell}>
                        <div className={styles.row3}>
                          <span className={`${styles.label2} ${nhan.lop}`}>
                            {nhan.chu}
                          </span>
                          {choXuLy && (
                            <>
                              <button
                                onClick={() => xacNhan(yc)}
                                disabled={banMa === yc.code}
                                title="Đã thấy tiền trong sao kê — cộng coin"
                                className={styles.button3}
                              >
                                <Check size={16} />
                              </button>
                              <button
                                onClick={() => tuChoi(yc)}
                                disabled={banMa === yc.code}
                                title="Hủy yêu cầu"
                                className={styles.button4}
                              >
                                <Ban size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {pages > 1 && (
          <div className={styles.row4}>
            <p className={styles.text7}>
              Trang {page} / {pages}
            </p>
            <div className={styles.row5}>
              <button
                onClick={() => setPage((n) => Math.max(1, n - 1))}
                disabled={page <= 1}
                className={styles.box2}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage((n) => Math.min(pages, n + 1))}
                disabled={page >= pages}
                className={styles.box2}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
