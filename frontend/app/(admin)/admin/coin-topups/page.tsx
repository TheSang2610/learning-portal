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

const MOI_TRANG = 10;

const NHAN: Record<TrangThaiNap, { chu: string; lop: string }> = {
  pending: { chu: "Đang chờ", lop: "border-amber-200 bg-amber-50 text-amber-700" },
  paid: { chu: "Đã cộng coin", lop: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  cancelled: { chu: "Đã hủy", lop: "border-slate-200 bg-slate-50 text-slate-600" },
  expired: { chu: "Quá hạn", lop: "border-rose-200 bg-rose-50 text-rose-700" },
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
    <div className="space-y-6 px-4 py-4">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
          <Coins size={22} className="text-amber-500" /> Yêu cầu nạp coin
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Mở sao kê ngân hàng, tìm khoản tiền có nội dung trùng mã rồi mới xác nhận. Học
          viên bấm &ldquo;tôi đã chuyển khoản&rdquo; chỉ là lời khai, không phải bằng
          chứng.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["pending", "paid", "cancelled", "expired", ""] as const).map((t) => (
          <button
            key={t || "all"}
            onClick={() => {
              setLoc(t);
              setPage(1);
            }}
            className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
              loc === t
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {t ? NHAN[t].chu : "Tất cả"}
          </button>
        ))}
      </div>

      {loi && (
        <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {loi}
        </p>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-slate-50 text-left text-xs font-bold tracking-wider text-slate-600 uppercase">
              <tr>
                <th className="px-4 py-3">Học viên</th>
                <th className="px-4 py-3">Mã / Nội dung CK</th>
                <th className="px-4 py-3">Số coin</th>
                <th className="px-4 py-3">Số tiền</th>
                <th className="px-4 py-3">Báo đã chuyển</th>
                <th className="px-4 py-3 text-right">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dangTai ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center text-slate-500">
                    <Loader2 size={20} className="mx-auto animate-spin" />
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-16 text-center text-sm text-slate-500"
                  >
                    Không có yêu cầu nào.
                  </td>
                </tr>
              ) : (
                rows.map((yc) => {
                  const nhan = NHAN[yc.status];
                  const choXuLy = yc.status === "pending" || yc.status === "expired";
                  return (
                    <tr key={yc._id} className="transition hover:bg-slate-50/60">
                      <td className="px-4 py-3">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {yc.student?.name || "(đã xóa)"}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {yc.student?.email || "--"}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-mono text-sm font-bold text-slate-900">
                          {yc.code}
                        </p>
                        <p className="text-xs text-slate-500">{gio(yc.createdAt)}</p>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-amber-700 tabular-nums">
                        {yc.soCoin.toLocaleString("vi-VN")}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-slate-900 tabular-nums">
                        {yc.amount.toLocaleString("vi-VN")}đ
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">
                        {yc.daBaoChuyenKhoanLuc ? (
                          <span className="inline-flex items-center gap-1 text-slate-700">
                            <Clock size={12} /> {gio(yc.daBaoChuyenKhoanLuc)}
                          </span>
                        ) : (
                          "chưa báo"
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <span
                            className={`inline-flex items-center rounded-lg border px-2 py-1 text-xs font-semibold ${nhan.lop}`}
                          >
                            {nhan.chu}
                          </span>
                          {choXuLy && (
                            <>
                              <button
                                onClick={() => xacNhan(yc)}
                                disabled={banMa === yc.code}
                                title="Đã thấy tiền trong sao kê — cộng coin"
                                className="rounded-lg p-2 text-emerald-600 transition hover:bg-emerald-50 disabled:text-slate-300"
                              >
                                <Check size={16} />
                              </button>
                              <button
                                onClick={() => tuChoi(yc)}
                                disabled={banMa === yc.code}
                                title="Hủy yêu cầu"
                                className="rounded-lg p-2 text-red-600 transition hover:bg-red-50 disabled:text-slate-300"
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
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
            <p className="text-xs text-slate-600">
              Trang {page} / {pages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((n) => Math.max(1, n - 1))}
                disabled={page <= 1}
                className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 disabled:text-slate-300"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage((n) => Math.min(pages, n + 1))}
                disabled={page >= pages}
                className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 disabled:text-slate-300"
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
