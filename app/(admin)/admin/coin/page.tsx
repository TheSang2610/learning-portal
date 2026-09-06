"use client";

import { useCallback, useEffect, useState } from "react";
import { Coins, Gift, Search, Loader2 } from "lucide-react";
import { getAllUsersAdmin } from "@/src/services/adminService";
import { getCourses, Course } from "@/src/services/course";
import type { User } from "@/src/services/userApi";
import {
  layViHocVien,
  napCoin,
  tangKhoa,
  giaRaCoin,
  type ThongTinVi,
} from "@/src/services/coin.api";
import { getErrorMessage } from "@/src/services/apiHelper";
import DongGiaoDichCoin from "@/src/components/common/DongGiaoDichCoin";

const dinhDang = (n: number) => n.toLocaleString("vi-VN");

export default function AdminCoinPage() {
  const [dsNguoi, setDsNguoi] = useState<User[]>([]);
  const [tuKhoa, setTuKhoa] = useState("");
  const [dangTimNguoi, setDangTimNguoi] = useState(false);

  const [dsKhoa, setDsKhoa] = useState<Course[]>([]);
  const [chon, setChon] = useState<User | null>(null);
  const [vi, setVi] = useState<ThongTinVi | null>(null);
  const [dangTaiVi, setDangTaiVi] = useState(false);

  const [soCoin, setSoCoin] = useState("");
  const [ghiChuCoin, setGhiChuCoin] = useState("");
  const [khoaTang, setKhoaTang] = useState("");
  const [dangGui, setDangGui] = useState(false);
  const [bao, setBao] = useState<{ loai: "ok" | "loi"; chu: string } | null>(null);

  useEffect(() => {
    getCourses()
      .then(setDsKhoa)
      .catch(() => setDsKhoa([]));
  }, []);

  const timNguoi = useCallback(async (tu: string) => {
    setDangTimNguoi(true);
    try {
      const r = await getAllUsersAdmin({ limit: 20, search: tu || undefined });
      setDsNguoi(r.users || []);
    } catch {
      setDsNguoi([]);
    } finally {
      setDangTimNguoi(false);
    }
  }, []);

  useEffect(() => {
    // Cho 350ms sau lan go cuoi. Khong co doan nay thi go "nguyen" la ban di
    // sau luot goi may chu, va ket qua ve khong theo thu tu - man hinh nhap
    // nhay giua cac ket qua cu.
    const h = setTimeout(() => timNguoi(tuKhoa), 350);
    return () => clearTimeout(h);
  }, [tuKhoa, timNguoi]);

  const moVi = async (nguoi: User) => {
    setChon(nguoi);
    setVi(null);
    setBao(null);
    setDangTaiVi(true);
    try {
      setVi(await layViHocVien(nguoi._id));
    } catch (e) {
      setBao({ loai: "loi", chu: getErrorMessage(e, "Không đọc được ví") });
    } finally {
      setDangTaiVi(false);
    }
  };

  const taiLaiVi = async () => {
    if (!chon) return;
    try {
      setVi(await layViHocVien(chon._id));
    } catch {
      /* giu nguyen so lieu cu tren man hinh con hon xoa trang */
    }
  };

  const guiNapCoin = async () => {
    if (!chon) return;
    setDangGui(true);
    setBao(null);
    try {
      const r = await napCoin(chon._id, Number(soCoin), ghiChuCoin);
      setBao({ loai: "ok", chu: r.message });
      setSoCoin("");
      setGhiChuCoin("");
      await taiLaiVi();
    } catch (e) {
      setBao({ loai: "loi", chu: getErrorMessage(e, "Không nạp được coin") });
    } finally {
      setDangGui(false);
    }
  };

  const guiTangKhoa = async () => {
    if (!chon || !khoaTang) return;
    setDangGui(true);
    setBao(null);
    try {
      const r = await tangKhoa(chon._id, khoaTang);
      setBao({ loai: "ok", chu: r.message });
      setKhoaTang("");
      await taiLaiVi();
    } catch (e) {
      setBao({ loai: "loi", chu: getErrorMessage(e, "Không tặng được khoá") });
    } finally {
      setDangGui(false);
    }
  };

  // So coin phai la so nguyen khac 0 - trung dieu kien ben may chu, de nguoi
  // dung biet ngay chu khong phai bam roi doi loi tra ve.
  const soHopLe = Number.isInteger(Number(soCoin)) && Number(soCoin) !== 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
          <Coins className="text-amber-500" size={26} />
          Coin &amp; Quà tặng
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Nạp coin hoặc tặng thẳng khoá học cho học viên. 1 coin = 1.000đ.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        {/* ------------------------- Chọn học viên ------------------------- */}
        <div className="rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 p-4">
            <div className="relative">
              <Search
                size={16}
                className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
              />
              <input
                value={tuKhoa}
                onChange={(e) => setTuKhoa(e.target.value)}
                placeholder="Tìm theo tên hoặc email"
                className="w-full rounded-xl border border-slate-200 py-2.5 pr-3 pl-9 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="max-h-[28rem] overflow-y-auto">
            {dangTimNguoi && dsNguoi.length === 0 ? (
              <p className="p-4 text-sm text-slate-400">Đang tìm…</p>
            ) : dsNguoi.length === 0 ? (
              <p className="p-4 text-sm text-slate-400">Không có ai khớp.</p>
            ) : (
              dsNguoi.map((u) => (
                <button
                  key={u._id}
                  onClick={() => moVi(u)}
                  className={`flex w-full items-center gap-3 border-b border-slate-50 px-4 py-3 text-left transition hover:bg-slate-50 ${
                    chon?._id === u._id ? "bg-blue-50/70" : ""
                  }`}
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-slate-100 text-sm font-bold text-slate-500">
                    {u.name?.[0]?.toUpperCase() ?? "?"}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-slate-900">
                      {u.name}
                    </span>
                    <span className="block truncate text-xs text-slate-500">
                      {u.email}
                    </span>
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* ---------------------------- Ví + thao tác ---------------------- */}
        {!chon ? (
          <div className="grid place-items-center rounded-2xl border border-dashed border-slate-300 bg-white p-16 text-center text-sm text-slate-500">
            Chọn một học viên ở cột bên trái để xem ví và nạp coin.
          </div>
        ) : (
          <div className="space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-sm font-semibold text-slate-900">{chon.name}</p>
              <p className="text-xs text-slate-500">{chon.email}</p>

              {dangTaiVi ? (
                <p className="mt-4 flex items-center gap-2 text-sm text-slate-400">
                  <Loader2 size={15} className="animate-spin" /> Đang đọc ví…
                </p>
              ) : vi ? (
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <ODem
                    nhan="Số dư"
                    chinh={`${dinhDang(vi.soDuCoin)} coin`}
                    phu={`≈ ${dinhDang(vi.soDuQuyDoi)}đ`}
                    noiBat
                  />
                  <ODem nhan="Tổng đã nạp" chinh={`${dinhDang(vi.tongDaNap)} coin`} />
                  <ODem nhan="Số giao dịch" chinh={dinhDang(vi.soGiaoDich)} />
                </div>
              ) : null}
            </div>

            {bao && (
              <p
                className={`rounded-xl px-4 py-3 text-sm font-medium ${
                  bao.loai === "ok"
                    ? "bg-emerald-50 text-emerald-800"
                    : "bg-rose-50 text-rose-800"
                }`}
              >
                {bao.chu}
              </p>
            )}

            <div className="grid gap-5 md:grid-cols-2">
              {/* Nạp / thu hồi coin */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                  <Coins size={16} className="text-amber-500" />
                  Nạp / thu hồi coin
                </h2>

                <input
                  type="number"
                  step={1}
                  value={soCoin}
                  onChange={(e) => setSoCoin(e.target.value)}
                  placeholder="Ví dụ 500"
                  className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
                />
                <p className="mt-1.5 text-xs text-slate-500">
                  {soHopLe ? (
                    Number(soCoin) > 0 ? (
                      <>
                        Cộng <b>{dinhDang(Number(soCoin))}</b> coin (≈{" "}
                        {dinhDang(Number(soCoin) * 1000)}đ)
                      </>
                    ) : (
                      <>
                        Thu hồi <b>{dinhDang(-Number(soCoin))}</b> coin
                      </>
                    )
                  ) : (
                    "Nhập số nguyên. Số âm là thu hồi."
                  )}
                </p>

                <input
                  value={ghiChuCoin}
                  onChange={(e) => setGhiChuCoin(e.target.value)}
                  placeholder="Ghi chú (không bắt buộc)"
                  maxLength={300}
                  className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
                />

                <button
                  onClick={guiNapCoin}
                  disabled={!soHopLe || dangGui}
                  className="mt-4 w-full rounded-xl bg-blue-600 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                >
                  {dangGui ? "Đang xử lý…" : "Xác nhận"}
                </button>
              </div>

              {/* Tặng khoá học */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                  <Gift size={16} className="text-violet-500" />
                  Tặng khoá học
                </h2>

                <select
                  value={khoaTang}
                  onChange={(e) => setKhoaTang(e.target.value)}
                  className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
                >
                  <option value="">— Chọn khoá học —</option>
                  {dsKhoa.map((k) => (
                    <option key={k._id} value={k._id}>
                      {k.title}
                      {k.price > 0 ? ` (${giaRaCoin(k.price)} coin)` : " (miễn phí)"}
                    </option>
                  ))}
                </select>

                <p className="mt-1.5 text-xs text-slate-500">
                  Mở khoá thẳng, <b>không trừ coin</b> của học viên.
                </p>

                <button
                  onClick={guiTangKhoa}
                  disabled={!khoaTang || dangGui}
                  className="mt-4 w-full rounded-xl bg-violet-600 py-2.5 text-sm font-bold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                >
                  {dangGui ? "Đang xử lý…" : "Tặng khoá này"}
                </button>
              </div>
            </div>

            {/* Sổ nhật ký */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <h2 className="border-b border-slate-100 px-5 py-4 text-sm font-bold text-slate-900">
                Lịch sử giao dịch
              </h2>

              {!vi || vi.nhatKy.length === 0 ? (
                <p className="px-5 py-10 text-center text-sm text-slate-400">
                  Chưa có giao dịch nào.
                </p>
              ) : (
                <div className="divide-y divide-slate-50">
                  {vi.nhatKy.map((g) => (
                    // hienNguoiTao bat: quan tri can biet dong nghiep nao vua
                    // nap coin cho nguoi nay.
                    <DongGiaoDichCoin key={g._id} giaoDich={g} hienNguoiTao />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ODem({
  nhan,
  chinh,
  phu,
  noiBat,
}: {
  nhan: string;
  chinh: string;
  phu?: string;
  noiBat?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-3 ${
        noiBat ? "border-amber-200 bg-amber-50" : "border-slate-200 bg-slate-50"
      }`}
    >
      <p className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
        {nhan}
      </p>
      <p className="mt-1 text-lg font-bold text-slate-900 tabular-nums">{chinh}</p>
      {phu && <p className="text-xs text-slate-500 tabular-nums">{phu}</p>}
    </div>
  );
}
