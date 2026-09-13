"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Coins, Copy, Check, Loader2, Clock } from "lucide-react";

import {
  DONG_MOI_COIN,
  baoDaChuyenNap,
  huyYeuCauNap,
  layViCuaToi,
  layYeuCauDangCho,
  taoYeuCauNap,
  type YeuCauNap,
} from "@/src/services/coin.api";
import { baoCoinDaDoi } from "@/src/components/common/SoDuCoin";
import { getErrorMessage } from "@/src/services/apiHelper";

// Cac muc nap goi san. Nguoi dung van go so tuy y duoc, nhung phan lon chon
// mot muc co san nhanh hon go.
const GOI = [100, 200, 500, 1000, 2000, 5000];

const dinhDangDong = (n: number) => `${n.toLocaleString("vi-VN")}đ`;

/** 754 -> "12:34". Luon hai chu so de con so khong nhay qua lai. */
const dangDongHo = (giay: number) => {
  const an = Math.max(0, giay);
  return `${String(Math.floor(an / 60)).padStart(2, "0")}:${String(an % 60).padStart(2, "0")}`;
};

function NutChep({ giaTri, nhan }: { giaTri: string; nhan: string }) {
  const [xong, setXong] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(giaTri);
          setXong(true);
          setTimeout(() => setXong(false), 2000);
        } catch {
          // Trinh duyet chan clipboard (thuong la khi khong chay https) thi
          // khong bao loi - so van hien ngay canh do de go tay.
        }
      }}
      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 transition hover:text-blue-800"
      aria-label={`Sao chép ${nhan}`}
    >
      {xong ? <Check size={12} /> : <Copy size={12} />}
      {xong ? "Đã chép" : "Chép"}
    </button>
  );
}

export default function TrangNapCoin() {
  const [soDu, setSoDu] = useState<number | null>(null);
  const [soCoin, setSoCoin] = useState<number>(500);
  const [yeuCau, setYeuCau] = useState<YeuCauNap | null>(null);
  const [conLai, setConLai] = useState(0);
  const [dangTai, setDangTai] = useState(true);
  const [dangTao, setDangTao] = useState(false);
  const [dangBao, setDangBao] = useState(false);
  const [daBao, setDaBao] = useState(false);
  const [loi, setLoi] = useState("");

  const dongBo = useCallback(async () => {
    try {
      const [vi, dang] = await Promise.all([
        layViCuaToi().catch(() => null),
        layYeuCauDangCho(),
      ]);
      if (vi) setSoDu(vi.soDuCoin);
      setYeuCau(dang.yeuCau);
      setConLai(dang.yeuCau?.secondsLeft ?? 0);
      setDaBao(Boolean(dang.yeuCau?.daBaoChuyenKhoanLuc));
    } catch (e) {
      setLoi(getErrorMessage(e, "Không đọc được thông tin ví"));
    } finally {
      setDangTai(false);
    }
  }, []);

  useEffect(() => {
    // Goi qua mot vong microtask thay vi goi thang trong than effect, de
    // setState khong nam dong bo trong do (rule react-hooks/set-state-in-effect).
    void Promise.resolve().then(dongBo);
  }, [dongBo]);

  // Dong ho dem nguoc. Chi dem o may nguoi dung cho muot; con SO GIAY THAT thi
  // lay tu may chu moi lan dong bo, vi dong ho may nguoi dung co the sai gio.
  useEffect(() => {
    if (!yeuCau || yeuCau.status !== "pending") return;
    const id = setInterval(() => setConLai((n) => Math.max(0, n - 1)), 1000);
    return () => clearInterval(id);
  }, [yeuCau]);

  const tao = async () => {
    setLoi("");
    if (!Number.isInteger(soCoin) || soCoin <= 0) {
      setLoi("Số coin phải là số nguyên lớn hơn 0");
      return;
    }
    setDangTao(true);
    try {
      const { yeuCau: moi } = await taoYeuCauNap(soCoin);
      setYeuCau(moi);
      setConLai(moi.secondsLeft);
      setDaBao(Boolean(moi.daBaoChuyenKhoanLuc));
    } catch (e) {
      setLoi(getErrorMessage(e, "Không tạo được yêu cầu nạp"));
    } finally {
      setDangTao(false);
    }
  };

  const huy = async () => {
    if (!yeuCau) return;
    try {
      await huyYeuCauNap(yeuCau.code);
      setYeuCau(null);
      setDaBao(false);
    } catch (e) {
      setLoi(getErrorMessage(e, "Không hủy được yêu cầu"));
    }
  };

  const bao = async () => {
    if (!yeuCau) return;
    setDangBao(true);
    try {
      await baoDaChuyenNap(yeuCau.code);
      setDaBao(true);
    } catch (e) {
      setLoi(getErrorMessage(e, "Không gửi được thông báo"));
    } finally {
      setDangBao(false);
    }
  };

  const ck = yeuCau?.chuyenKhoan;

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <div>
        <Link
          href="/user/profile"
          className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-800"
        >
          <ArrowLeft size={16} /> Về hồ sơ của tôi
        </Link>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
          <Coins size={22} className="text-amber-500" /> Nạp coin
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          1 coin = {dinhDangDong(DONG_MOI_COIN)}. Coin dùng để mở khóa học ngay, không
          phải chờ đối chiếu từng lần mua.
        </p>
      </div>

      {soDu !== null && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
          <p className="text-xs font-semibold text-amber-700">Số dư hiện tại</p>
          <p className="text-2xl font-bold text-amber-900 tabular-nums">
            {soDu.toLocaleString("vi-VN")} coin
          </p>
        </div>
      )}

      {loi && (
        <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {loi}
        </p>
      )}

      {dangTai ? (
        <div className="flex justify-center py-16">
          <Loader2 size={22} className="animate-spin text-slate-400" />
        </div>
      ) : yeuCau && yeuCau.status === "pending" ? (
        <section className="space-y-5 rounded-2xl border border-slate-200 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-slate-900">
              Chuyển khoản {dinhDangDong(yeuCau.amount)} để nhận{" "}
              {yeuCau.soCoin.toLocaleString("vi-VN")} coin
            </h2>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700 tabular-nums">
              <Clock size={13} /> {dangDongHo(conLai)}
            </span>
          </div>

          {ck?.daCauHinh ? (
            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex flex-col items-center gap-2">
                {ck.anhQR && (
                  <Image
                    src={ck.anhQR}
                    alt={`Mã QR chuyển khoản ${dinhDangDong(yeuCau.amount)} nội dung ${yeuCau.code}`}
                    width={280}
                    height={380}
                    unoptimized
                    referrerPolicy="no-referrer"
                    className="h-auto w-full max-w-[260px] rounded-xl border border-slate-200"
                  />
                )}
                <p className="text-center text-xs text-slate-500">
                  Quét mã là mọi ô đã điền sẵn, không phải gõ tay.
                </p>
              </div>

              <dl className="space-y-3 text-sm">
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2">
                  <dt className="text-slate-500">Ngân hàng</dt>
                  <dd className="font-semibold text-slate-900">{ck.nganHang}</dd>
                </div>
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2">
                  <dt className="text-slate-500">Số tài khoản</dt>
                  <dd className="flex items-center gap-2 font-semibold text-slate-900">
                    {ck.soTaiKhoan} <NutChep giaTri={ck.soTaiKhoan} nhan="số tài khoản" />
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2">
                  <dt className="text-slate-500">Tên tài khoản</dt>
                  <dd className="font-semibold text-slate-900">{ck.tenTaiKhoan}</dd>
                </div>
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2">
                  <dt className="text-slate-500">Số tiền</dt>
                  <dd className="flex items-center gap-2 font-semibold text-slate-900">
                    {dinhDangDong(yeuCau.amount)}{" "}
                    <NutChep giaTri={String(yeuCau.amount)} nhan="số tiền" />
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-slate-500">Nội dung</dt>
                  <dd className="flex items-center gap-2 font-mono font-bold text-slate-900">
                    {yeuCau.code} <NutChep giaTri={yeuCau.code} nhan="nội dung" />
                  </dd>
                </div>
              </dl>
            </div>
          ) : (
            <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Máy chủ chưa khai báo tài khoản nhận tiền nên chưa sinh được mã QR. Mã{" "}
              <strong>{yeuCau.code}</strong> vẫn hợp lệ — liên hệ ban quản trị để lấy
              thông tin chuyển khoản.
            </p>
          )}

          {/* Ma nay la thu DUY NHAT noi khoan tien voi yeu cau nap. Nhac rieng
              mot dong vi day la cho hay sai nhat: thieu ma thi tien ve toi noi
              ma khong ai biet la cua ai. */}
          <p className="rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-600">
            Nội dung chuyển khoản <strong>bắt buộc</strong> là <b>{yeuCau.code}</b>. Ghi
            thiếu hoặc ghi sai thì ban quản trị không biết khoản tiền đó là của ai.
          </p>

          {daBao ? (
            <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
              Đã báo cho ban quản trị. Coin sẽ vào ví sau khi đối chiếu sao kê — bạn tải
              lại trang này để xem.
            </p>
          ) : (
            <div className="flex flex-wrap gap-3">
              <button
                onClick={bao}
                disabled={dangBao}
                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:bg-blue-400"
              >
                {dangBao ? "Đang gửi..." : "Tôi đã chuyển khoản"}
              </button>
              <button
                onClick={huy}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
              >
                Hủy yêu cầu
              </button>
            </div>
          )}

          <button
            onClick={() => {
              void dongBo();
              baoCoinDaDoi();
            }}
            className="text-xs font-semibold text-slate-500 underline transition hover:text-slate-800"
          >
            Kiểm tra lại xem coin đã vào chưa
          </button>
        </section>
      ) : (
        <section className="space-y-5 rounded-2xl border border-slate-200 p-5">
          <h2 className="text-sm font-semibold text-slate-900">Chọn số coin muốn nạp</h2>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {GOI.map((g) => (
              <button
                key={g}
                onClick={() => setSoCoin(g)}
                className={`rounded-xl border px-4 py-3 text-left transition ${
                  soCoin === g
                    ? "border-amber-400 bg-amber-50 ring-1 ring-amber-300"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <p className="text-base font-bold text-slate-900 tabular-nums">
                  {g.toLocaleString("vi-VN")} coin
                </p>
                <p className="text-xs text-slate-500 tabular-nums">
                  {dinhDangDong(g * DONG_MOI_COIN)}
                </p>
              </button>
            ))}
          </div>

          <div>
            <label
              htmlFor="so-coin"
              className="mb-1.5 block text-xs font-bold text-slate-600"
            >
              Hoặc nhập số coin khác
            </label>
            <input
              id="so-coin"
              type="number"
              min={1}
              step={1}
              value={soCoin || ""}
              onChange={(e) => setSoCoin(Math.floor(Number(e.target.value)) || 0)}
              className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-blue-500"
            />
            <p className="mt-1.5 text-xs text-slate-500 tabular-nums">
              Phải chuyển: <b>{dinhDangDong(Math.max(0, soCoin) * DONG_MOI_COIN)}</b>
            </p>
          </div>

          <button
            onClick={tao}
            disabled={dangTao || soCoin <= 0}
            className="w-full rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-amber-600 disabled:bg-slate-200 disabled:text-slate-400"
          >
            {dangTao ? "Đang tạo yêu cầu..." : "Tạo yêu cầu nạp"}
          </button>
        </section>
      )}
    </div>
  );
}
