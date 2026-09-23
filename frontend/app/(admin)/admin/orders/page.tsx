"use client";

import { useCallback, useEffect, useState } from "react";

import {
  DonHangAdmin,
  TrangThaiDon,
  dinhDangTien,
  layDonHangAdmin,
  tuChoiDon,
  xacNhanDon,
} from "@/src/services/order";
import { getErrorMessage } from "@/src/services/apiHelper";

import styles from "./page.module.scss";
const BO_LOC: { nhan: string; giaTri: TrangThaiDon | "" }[] = [
  { nhan: "Chờ thanh toán", giaTri: "pending" },
  { nhan: "Đã thanh toán", giaTri: "paid" },
  { nhan: "Đã hủy", giaTri: "cancelled" },
  { nhan: "Hết hạn", giaTri: "expired" },
  { nhan: "Tất cả", giaTri: "" },
];

// Mau nhan trang thai don. Truoc day la chuoi lop Tailwind dat thang o day;
// go Tailwind xong thi bon trang thai don nhin y het nhau.
const KIEU_NHAN: Record<TrangThaiDon, string> = {
  pending: styles.nhanCho,
  paid: styles.nhanXong,
  cancelled: styles.nhanHuy,
  expired: styles.nhanQuaHan,
};

const TEN_TRANG_THAI: Record<TrangThaiDon, string> = {
  pending: "Chờ thanh toán",
  paid: "Đã thanh toán",
  cancelled: "Đã hủy",
  expired: "Hết hạn",
};

const ngayGio = (chuoi: string) =>
  new Date(chuoi).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function TrangDonHang() {
  const [ds, setDs] = useState<DonHangAdmin[]>([]);
  const [dangCho, setDangCho] = useState(0);
  const [daBao, setDaBao] = useState(0);
  const [loc, setLoc] = useState<TrangThaiDon | "">("pending");
  const [tim, setTim] = useState("");
  const [dangTai, setDangTai] = useState(true);
  const [loi, setLoi] = useState("");
  // Ma don dang duoc xu ly - de chi khoa dung mot dong, khong khoa ca bang.
  const [dangXuLy, setDangXuLy] = useState("");

  // Tang so nay len la yeu cau tai lai. Xem ghi chu cung kieu o trang
  // thanh toan: tranh setState dong bo trong effect, va co cho huy request.
  const [lanTai, setLanTai] = useState(0);
  const taiLai = useCallback(() => setLanTai((n) => n + 1), []);

  useEffect(() => {
    let daRoiTrang = false;

    void (async () => {
      try {
        const kq = await layDonHangAdmin({ status: loc, search: tim, limit: 50 });
        if (daRoiTrang) return;
        setDs(kq.orders);
        setDangCho(kq.pendingCount);
        setDaBao(kq.daBaoCount ?? 0);
        setLoi("");
      } catch (e) {
        if (!daRoiTrang) setLoi(getErrorMessage(e, "Không đọc được danh sách đơn"));
      } finally {
        if (!daRoiTrang) setDangTai(false);
      }
    })();

    return () => {
      daRoiTrang = true;
    };
  }, [loc, tim, lanTai]);

  const xacNhan = async (don: DonHangAdmin) => {
    const ok = window.confirm(
      `Xác nhận đã nhận ${dinhDangTien(don.amount)} cho đơn ${don.code}?\n\n` +
        `Học viên ${don.student?.name ?? ""} sẽ được mở khóa học ngay.\n` +
        `Hãy đối chiếu sao kê ngân hàng trước khi bấm.`,
    );
    if (!ok) return;

    setDangXuLy(don.code);
    try {
      await xacNhanDon(don.code);
      taiLai();
    } catch (e) {
      setLoi(getErrorMessage(e, "Không xác nhận được đơn"));
    } finally {
      setDangXuLy("");
    }
  };

  const tuChoi = async (don: DonHangAdmin) => {
    const lyDo = window.prompt(`Hủy đơn ${don.code}. Lý do (không bắt buộc):`, "");
    if (lyDo === null) return;

    setDangXuLy(don.code);
    try {
      await tuChoiDon(don.code, lyDo);
      taiLai();
    } catch (e) {
      setLoi(getErrorMessage(e, "Không hủy được đơn"));
    } finally {
      setDangXuLy("");
    }
  };

  return (
    <div className={styles.box}>
      <div className={styles.row}>
        <div>
          <h1 className={styles.title}>Đơn hàng</h1>
          <p className={styles.text}>
            Đối chiếu sao kê ngân hàng rồi xác nhận để mở khóa học cho học viên.
          </p>
        </div>
        {dangCho > 0 && <span className={styles.label}>{dangCho} đơn đang chờ</span>}
        {daBao > 0 && (
          // Dem rieng so don DA CO NGUOI BAO da chuyen khoan.
          //
          // "Dang cho" gom ca don vua mo ra roi bo do - khong co gi de lam voi
          // chung. Con day la nhung nguoi that su dang ngoi doi, va la viec
          // phai mo sao ke ra doi chieu ngay.
          <span className={styles.label2}>{daBao} đơn báo đã chuyển khoản</span>
        )}
      </div>

      <div className={styles.row2}>
        <div className={styles.row3}>
          {BO_LOC.map((b) => (
            <button
              key={b.giaTri || "all"}
              type="button"
              onClick={() => setLoc(b.giaTri)}
              className={`${styles.button5} ${
                loc === b.giaTri ? styles.button : styles.button2
              }`}
            >
              {b.nhan}
            </button>
          ))}
        </div>
        <input
          value={tim}
          onChange={(e) => setTim(e.target.value.toUpperCase())}
          placeholder="Tìm theo mã đơn…"
          className={styles.input}
        />
      </div>

      {loi && <p className={styles.text2}>{loi}</p>}

      <div className={styles.scroller}>
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              <th className={styles.headCell}>Mã đơn</th>
              <th className={styles.headCell}>Học viên</th>
              <th className={styles.headCell}>Khóa học</th>
              <th className={styles.headCell2}>Số tiền</th>
              <th className={styles.headCell}>Trạng thái</th>
              <th className={styles.headCell}>Tạo lúc</th>
              <th className={styles.headCell2}>Thao tác</th>
            </tr>
          </thead>
          <tbody className={styles.tbody}>
            {dangTai && (
              <tr>
                <td colSpan={7} className={styles.cell}>
                  Đang tải…
                </td>
              </tr>
            )}

            {!dangTai && ds.length === 0 && (
              <tr>
                <td colSpan={7} className={styles.cell}>
                  Không có đơn nào ở mục này.
                </td>
              </tr>
            )}

            {!dangTai &&
              ds.map((don) => (
                <tr key={don._id} className={styles.row4}>
                  <td className={styles.cell2}>{don.code}</td>
                  <td className={styles.headCell}>
                    <div className={styles.box2}>{don.student?.name ?? "—"}</div>
                    <div className={styles.box3}>{don.student?.email ?? ""}</div>
                  </td>
                  <td className={styles.cell3}>
                    <div className={styles.box4}>{don.course?.title ?? "—"}</div>
                  </td>
                  <td className={styles.cell4}>{dinhDangTien(don.amount)}</td>
                  <td className={styles.headCell}>
                    <span className={`${styles.label4} ${KIEU_NHAN[don.status]}`}>
                      {TEN_TRANG_THAI[don.status]}
                    </span>
                    {don.confirmedBy && (
                      <div className={styles.box5}>bởi {don.confirmedBy.name}</div>
                    )}
                    {don.daBaoChuyenKhoanLuc && don.status !== "paid" && (
                      <div className={styles.box6}>
                        Đã báo CK {ngayGio(don.daBaoChuyenKhoanLuc)}
                      </div>
                    )}
                  </td>
                  <td className={styles.cell5}>{ngayGio(don.createdAt)}</td>
                  <td className={styles.cell6}>
                    {don.status === "paid" ? (
                      <span className={styles.label3}>Đã xử lý</span>
                    ) : don.status === "cancelled" ? (
                      <span className={styles.label3}>Đã hủy</span>
                    ) : (
                      <div className={styles.row5}>
                        <button
                          type="button"
                          onClick={() => xacNhan(don)}
                          disabled={dangXuLy === don.code}
                          className={styles.button3}
                        >
                          {dangXuLy === don.code ? "…" : "Xác nhận"}
                        </button>
                        <button
                          type="button"
                          onClick={() => tuChoi(don)}
                          disabled={dangXuLy === don.code}
                          className={styles.button4}
                        >
                          Hủy
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <p className={styles.text3}>
        Đơn <strong>hết hạn</strong> vẫn xác nhận được: hạn 15 phút chỉ để đơn thôi treo
        trên màn hình học viên, không phải để từ chối tiền đã chuyển.
      </p>
    </div>
  );
}
