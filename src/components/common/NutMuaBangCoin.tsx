"use client";

import { useEffect, useState } from "react";
import { Coins, Loader2 } from "lucide-react";
import { layViCuaToi, muaBangCoin, giaRaCoin } from "@/src/services/coin.api";
import { baoCoinDaDoi } from "./SoDuCoin";
import { getErrorMessage } from "@/src/services/apiHelper";

// Nut "mua bang coin" tren trang khoa hoc.
//
// Chay SONG SONG voi nut chuyen khoan VietQR chu khong thay the: ai co du coin
// thi mo khoa ngay, ai khong thi van dat don va chuyen khoan nhu cu.

interface Props {
  courseId: string;
  /** Gia theo DONG, lay thang tu khoa hoc. Quy doi ra coin lam o day. */
  gia: number;
  /** Goi sau khi mua xong, de trang cha cap nhat trang thai ghi danh. */
  khiMuaXong: () => void;
}

export default function NutMuaBangCoin({ courseId, gia, khiMuaXong }: Props) {
  const [soDu, setSoDu] = useState<number | null>(null);
  const [dangMua, setDangMua] = useState(false);
  const [loi, setLoi] = useState("");

  const giaCoin = giaRaCoin(gia);

  useEffect(() => {
    let conGan = true;
    layViCuaToi()
      .then((vi) => conGan && setSoDu(vi.soDuCoin))
      .catch(() => conGan && setSoDu(null));
    return () => {
      conGan = false;
    };
  }, []);

  // Chua doc duoc vi (chua dang nhap, hoac may chu loi) thi khong hien gi ca.
  // Hien mot nut mua ma bam vao chi ra loi thi te hon la khong hien.
  if (soDu === null || giaCoin <= 0) return null;

  const du = soDu >= giaCoin;
  const thieu = giaCoin - soDu;

  const mua = async () => {
    setDangMua(true);
    setLoi("");
    try {
      await muaBangCoin(courseId);
      baoCoinDaDoi();
      khiMuaXong();
    } catch (e) {
      setLoi(getErrorMessage(e, "Không mua được bằng coin"));
      setDangMua(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={mua}
        disabled={!du || dangMua}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-3 text-sm font-bold tracking-wider text-white uppercase shadow-md transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
      >
        {dangMua ? (
          <>
            <Loader2 size={15} className="animate-spin" /> Đang mở khoá…
          </>
        ) : (
          <>
            <Coins size={15} />
            Mua bằng {giaCoin.toLocaleString("vi-VN")} coin
          </>
        )}
      </button>

      <p className="text-center text-xs text-slate-500 tabular-nums">
        {du ? (
          <>
            Ví của bạn: <b className="text-amber-600">{soDu.toLocaleString("vi-VN")}</b>{" "}
            coin
          </>
        ) : (
          <>
            Ví có {soDu.toLocaleString("vi-VN")} coin — còn thiếu{" "}
            <b className="text-rose-600">{thieu.toLocaleString("vi-VN")}</b> coin
          </>
        )}
      </p>

      {loi && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-center text-xs font-medium text-rose-700">
          {loi}
        </p>
      )}
    </div>
  );
}
