"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Gio hang, luu o localStorage cua TUNG trinh duyet.
 *
 * VI SAO KHONG LUU O MAY CHU:
 *   Gio hang chua duoc tra tien thi khong phai du lieu nghiep vu - no la mot
 *   ghi chu tam cua nguoi dung. Luu len may chu la them mot bang, them mot bo
 *   endpoint, va them mot thu phai don dep khi no cu di. Doi lai duoc dung
 *   chuyen: dong bo giua may tinh va dien thoai. Voi mot he thong ma nguoi ta
 *   mua vai khoa hoc mot lan thi doi do khong dang.
 *
 *   Neu sau nay can dong bo that, doi cho nay sang goi API - moi noi khac dung
 *   hook nay nen khong phai sua theo.
 *
 * MOI PHEP DOC/GHI DEU BOC try/catch: localStorage nem trong cua so an danh,
 * khi nguoi dung chan du lieu trang, hoac khi dung luong day. Khong boc thi ca
 * trang trang xoa vi mot cai gio hang.
 */

const KHOA = "gioHang.aLMS";

export interface MonTrongGio {
  courseId: string;
  title: string;
  slug?: string;
  thumbnail?: string;
  gia: number;
  themLuc: number;
}

// Su kien rieng de moi component dung hook nay cung cap nhat khi gio doi.
//
// Su kien 'storage' cua trinh duyet CHI ban ra o tab KHAC, khong ban ra o
// chinh tab vua ghi - nen chi nghe 'storage' thi cai so tren bieu tuong gio
// hang khong nhuc nhich khi bam Them ngay tren trang do.
const SU_KIEN = "gioHangDoi";

const doc = (): MonTrongGio[] => {
  if (typeof window === "undefined") return [];

  try {
    const tho = window.localStorage.getItem(KHOA);
    if (!tho) return [];

    const ds = JSON.parse(tho);
    if (!Array.isArray(ds)) return [];

    // Loc lai tung phan tu: du lieu nay do trinh duyet giu, co the la ban cu
    // tu mot phien ban truoc hoac bi sua tay.
    return ds.filter(
      (m) => m && typeof m.courseId === "string" && typeof m.title === "string",
    );
  } catch {
    return [];
  }
};

const ghi = (ds: MonTrongGio[]) => {
  try {
    window.localStorage.setItem(KHOA, JSON.stringify(ds));
  } catch {
    // Het dung luong hoac bi chan. Gio hang trong RAM van dung duoc het phien
    // nay, chi la khong song qua lan tai trang.
  }

  window.dispatchEvent(new Event(SU_KIEN));
};

export function useGioHang() {
  // Khoi tao RONG chu khong doc localStorage ngay.
  //
  // Doc ngay thi HTML dung san o may chu (luon rong) lech voi lan ve dau o
  // trinh duyet, va React bao loi khong khop. Doc trong effect thi ca hai ben
  // deu bat dau tu rong.
  const [gio, setGio] = useState<MonTrongGio[]>([]);

  useEffect(() => {
    const capNhat = () => setGio(doc());

    // Lan doc dau tien day sang microtask thay vi goi thang trong than effect:
    // goi thang la mot vong ve lai noi tiep ngay sau lan ve dau, va
    // react-hooks/set-state-in-effect chan dung cho nay.
    queueMicrotask(capNhat);

    window.addEventListener(SU_KIEN, capNhat);
    // 'storage' cho tab khac - mo hai tab thi ca hai cung thay mot gio.
    window.addEventListener("storage", capNhat);

    return () => {
      window.removeEventListener(SU_KIEN, capNhat);
      window.removeEventListener("storage", capNhat);
    };
  }, []);

  const them = useCallback((mon: Omit<MonTrongGio, "themLuc">) => {
    const hienCo = doc();

    // Da co thi khong them lan hai. Khoa hoc khong co so luong - mua hai lan
    // cung mot khoa la vo nghia.
    if (hienCo.some((m) => m.courseId === mon.courseId)) return;

    ghi([...hienCo, { ...mon, themLuc: Date.now() }]);
  }, []);

  const bo = useCallback((courseId: string) => {
    ghi(doc().filter((m) => m.courseId !== courseId));
  }, []);

  const doSach = useCallback(() => ghi([]), []);

  const coTrongGio = useCallback(
    (courseId: string) => gio.some((m) => m.courseId === courseId),
    [gio],
  );

  const tongTien = gio.reduce((t, m) => t + (m.gia || 0), 0);

  return { gio, them, bo, doSach, coTrongGio, tongTien, soMon: gio.length };
}
