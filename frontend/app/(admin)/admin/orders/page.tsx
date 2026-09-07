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

const BO_LOC: { nhan: string; giaTri: TrangThaiDon | "" }[] = [
  { nhan: "Chờ thanh toán", giaTri: "pending" },
  { nhan: "Đã thanh toán", giaTri: "paid" },
  { nhan: "Đã hủy", giaTri: "cancelled" },
  { nhan: "Hết hạn", giaTri: "expired" },
  { nhan: "Tất cả", giaTri: "" },
];

const KIEU_NHAN: Record<TrangThaiDon, string> = {
  pending: "bg-amber-100 text-amber-800",
  paid: "bg-green-100 text-green-800",
  cancelled: "bg-slate-200 text-slate-700",
  expired: "bg-red-100 text-red-700",
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
    <div className="p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Đơn hàng</h1>
          <p className="mt-1 text-sm text-slate-500">
            Đối chiếu sao kê ngân hàng rồi xác nhận để mở khóa học cho học viên.
          </p>
        </div>
        {dangCho > 0 && (
          <span className="rounded-full bg-amber-100 px-3 py-1.5 text-sm font-semibold text-amber-800">
            {dangCho} đơn đang chờ
          </span>
        )}
        {daBao > 0 && (
          // Dem rieng so don DA CO NGUOI BAO da chuyen khoan.
          //
          // "Dang cho" gom ca don vua mo ra roi bo do - khong co gi de lam voi
          // chung. Con day la nhung nguoi that su dang ngoi doi, va la viec
          // phai mo sao ke ra doi chieu ngay.
          <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-sm font-semibold text-emerald-800">
            {daBao} đơn báo đã chuyển khoản
          </span>
        )}
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1.5">
          {BO_LOC.map((b) => (
            <button
              key={b.giaTri || "all"}
              type="button"
              onClick={() => setLoc(b.giaTri)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                loc === b.giaTri
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
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
          className="ml-auto w-52 rounded-xl border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-blue-600"
        />
      </div>

      {loi && (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {loi}
        </p>
      )}

      <div className="overflow-x-auto rounded-2xl border border-slate-200">
        <table className="w-full min-w-[860px] text-sm">
          <thead className="bg-slate-50 text-left text-xs tracking-wide text-slate-500 uppercase">
            <tr>
              <th className="px-4 py-3">Mã đơn</th>
              <th className="px-4 py-3">Học viên</th>
              <th className="px-4 py-3">Khóa học</th>
              <th className="px-4 py-3 text-right">Số tiền</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3">Tạo lúc</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {dangTai && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                  Đang tải…
                </td>
              </tr>
            )}

            {!dangTai && ds.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                  Không có đơn nào ở mục này.
                </td>
              </tr>
            )}

            {!dangTai &&
              ds.map((don) => (
                <tr key={don._id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono font-semibold text-slate-900">
                    {don.code}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">
                      {don.student?.name ?? "—"}
                    </div>
                    <div className="text-xs text-slate-500">
                      {don.student?.email ?? ""}
                    </div>
                  </td>
                  <td className="max-w-[240px] px-4 py-3">
                    <div className="truncate text-slate-700">
                      {don.course?.title ?? "—"}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-900 tabular-nums">
                    {dinhDangTien(don.amount)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${KIEU_NHAN[don.status]}`}
                    >
                      {TEN_TRANG_THAI[don.status]}
                    </span>
                    {don.confirmedBy && (
                      <div className="mt-1 text-xs text-slate-400">
                        bởi {don.confirmedBy.name}
                      </div>
                    )}
                    {don.daBaoChuyenKhoanLuc && don.status !== "paid" && (
                      <div className="mt-1 text-xs font-semibold text-emerald-700">
                        Đã báo CK {ngayGio(don.daBaoChuyenKhoanLuc)}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs whitespace-nowrap text-slate-500">
                    {ngayGio(don.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    {don.status === "paid" ? (
                      <span className="text-xs text-slate-400">Đã xử lý</span>
                    ) : don.status === "cancelled" ? (
                      <span className="text-xs text-slate-400">Đã hủy</span>
                    ) : (
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => xacNhan(don)}
                          disabled={dangXuLy === don.code}
                          className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
                        >
                          {dangXuLy === don.code ? "…" : "Xác nhận"}
                        </button>
                        <button
                          type="button"
                          onClick={() => tuChoi(don)}
                          disabled={dangXuLy === don.code}
                          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
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

      <p className="mt-4 text-xs text-slate-500">
        Đơn <strong>hết hạn</strong> vẫn xác nhận được: hạn 15 phút chỉ để đơn thôi treo
        trên màn hình học viên, không phải để từ chối tiền đã chuyển.
      </p>
    </div>
  );
}
