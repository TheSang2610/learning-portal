"use client";

import { useEffect, useState } from "react";

import { useNguoiDungLuu } from "@/src/hooks/userStore";
import { getErrorMessage } from "@/src/services/apiHelper";
import {
  documentService,
  type HistoryItem,
  type RecommendedDocument,
  type SharedDocument,
} from "@/src/services/document";
import HangTaiLieu from "./HangTaiLieu";

import styles from "./HangTaiLieu.module.scss";

const SO_TRONG_HANG = 12;

/**
 * Cac hang cuon ngang duoi danh sach tai lieu - dung chung cho trang tat ca
 * tai lieu, trang mot truong va trang linh vuc cua truong:
 *   Goi y cho ban  - rieng tung nguoi (da dang nhap, co lich su, trang chung)
 *   Noi bat        - xem + tai nhieu nhat TRONG pham vi dang xem, cho moi nguoi
 *   Xem gan day    - lich su cua chinh minh (day du, khong theo bo loc)
 *   Moi dang       - bai moi nhat trong pham vi dang xem
 */
export default function CacHangTaiLieu({
  loc = {},
  tenPhamVi,
}: {
  /** Pham vi: truong / linh vuc / mon (khoa). Trong = ca kho. */
  loc?: { truong?: string; nhom?: string; mon?: string };
  /** Ten pham vi de ghi vao tieu de hang, vd. ten truong. */
  tenPhamVi?: string;
}) {
  const user = useNguoiDungLuu();
  const idUser = user?._id;
  const { truong = "", nhom = "", mon = "" } = loc;
  const khoa = `${truong}|${nhom}|${mon}`;
  const trangChung = !truong && !nhom && !mon;

  const [noiBat, setNoiBat] = useState<SharedDocument[]>([]);
  const [moiDang, setMoiDang] = useState<SharedDocument[]>([]);
  // Gan kem id nguoi dung: dang xuat / doi tai khoan thi du lieu cu tu an.
  const [goiY, setGoiY] = useState<{ id: string; ds: RecommendedDocument[] } | null>(
    null,
  );
  const [lichSu, setLichSu] = useState<{ id: string; ds: HistoryItem[] } | null>(null);

  // Hang theo pham vi - giong nhau voi moi nguoi.
  useEffect(() => {
    let huy = false;
    const [t, n, m] = khoa.split("|");
    const pv = { truong: t, nhom: n, mon: m, limit: SO_TRONG_HANG };
    documentService
      .getDocuments({ ...pv, sapXep: "phoBien" })
      .then((kq) => {
        if (!huy) setNoiBat(kq.documents);
      })
      .catch(() => {});
    documentService
      .getDocuments(pv)
      .then((kq) => {
        if (!huy) setMoiDang(kq.documents);
      })
      .catch(() => {});
    return () => {
      huy = true;
    };
  }, [khoa]);

  // Hang rieng tung nguoi.
  useEffect(() => {
    if (!idUser) return;
    let huy = false;
    documentService
      .getRecommendations({ limit: SO_TRONG_HANG })
      .then((kq) => {
        // Chi goi la "goi y cho ban" khi may chu THAT SU dua tren lich su.
        if (!huy) setGoiY({ id: idUser, ds: kq.caNhanHoa ? kq.documents : [] });
      })
      .catch(() => {});
    documentService
      .getMyHistory()
      .then((kq) => {
        if (!huy) setLichSu({ id: idUser, ds: kq.items.slice(0, SO_TRONG_HANG) });
      })
      .catch(() => {});
    return () => {
      huy = true;
    };
  }, [idUser]);

  const xoaLichSu = async () => {
    if (!confirm("Xóa toàn bộ lịch sử xem và tìm tài liệu của bạn?")) return;
    try {
      await documentService.clearMyHistory();
      if (idUser) setLichSu({ id: idUser, ds: [] });
    } catch (err) {
      alert(getErrorMessage(err, "Không xóa được lịch sử."));
    }
  };

  // Kiem idUser truoc: khach thi ca hai deu undefined, so bang nhau van "dung".
  const dsGoiY = trangChung && idUser && goiY && goiY.id === idUser ? goiY.ds : [];
  const dsLichSu = idUser && lichSu?.id === idUser ? lichSu.ds : [];

  return (
    <>
      <HangTaiLieu
        id="goi-y"
        tieuDe="Gợi ý cho bạn"
        phu="Dựa trên những môn bạn hay xem và tải"
        ds={dsGoiY}
      />
      <HangTaiLieu
        id="noi-bat"
        tieuDe={tenPhamVi ? `Nổi bật ở ${tenPhamVi}` : "Nổi bật"}
        phu="Được xem và tải nhiều nhất"
        ds={noiBat}
        chan="phoBien"
      />
      <HangTaiLieu
        id="xem-gan-day"
        tieuDe="Xem gần đây"
        ds={dsLichSu}
        chan="thoiGian"
        hanhDong={
          <button type="button" onClick={xoaLichSu} className={styles.nutChu}>
            Xóa lịch sử
          </button>
        }
      />
      <HangTaiLieu
        id="moi-dang"
        tieuDe={tenPhamVi ? `Mới đăng ở ${tenPhamVi}` : "Mới đăng"}
        ds={moiDang}
        chan="thoiGian"
      />
    </>
  );
}
