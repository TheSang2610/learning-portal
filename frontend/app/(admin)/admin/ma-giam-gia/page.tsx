"use client";

import { useCallback, useEffect, useState } from "react";
import { BadgePercent, Plus, Power, Users } from "lucide-react";

import {
  batTatMa,
  danhSachMa,
  luotDungCuaMa,
  suaMa,
  taoMa,
  type LuotDung,
  type MaGiamGia,
  type ThanMaGiamGia,
} from "@/src/services/maGiamGia";

const ngayISO = (lech = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + lech);
  return d.toISOString().slice(0, 10);
};

const MAC_DINH: ThanMaGiamGia = {
  ma: "",
  moTa: "",
  loai: "phanTram",
  giaTri: 10,
  donToiThieu: 0,
  giamToiDa: null,
  batDau: ngayISO(),
  ketThuc: ngayISO(30),
  soLuotToiDa: null,
  moiNguoiMotLan: true,
  hoatDong: true,
};

const dinhDangNgay = (iso: string) => new Date(iso).toLocaleDateString("vi-VN");

// Ma kem co "da het han", tinh MOT LAN luc du lieu ve.
//
// Khong tinh trong luc ve (`new Date(m.ketThuc) < Date.now()` giua JSX): doc
// dong ho la mot phep khong thuan, hai lan ve co the ra hai ket qua khac nhau.
// react-hooks/purity chan dung cho do. Tinh o day thi no la mot gia tri co
// dinh di kem du lieu.
type MaHienThi = MaGiamGia & { hetHan: boolean };

const danhDauHetHan = (ds: MaGiamGia[]): MaHienThi[] => {
  const bayGio = Date.now();
  return ds.map((m) => ({ ...m, hetHan: new Date(m.ketThuc).getTime() < bayGio }));
};

const motMa = (m: MaGiamGia): MaHienThi => danhDauHetHan([m])[0];

export default function AdminMaGiamGiaPage() {
  const [danhSach, setDanhSach] = useState<MaHienThi[]>([]);
  const [dangTai, setDangTai] = useState(true);
  const [loi, setLoi] = useState("");

  const [moForm, setMoForm] = useState(false);
  const [suaId, setSuaId] = useState<string | null>(null);
  const [than, setThan] = useState<ThanMaGiamGia>(MAC_DINH);
  const [dangLuu, setDangLuu] = useState(false);

  const [xemLuot, setXemLuot] = useState<string | null>(null);
  const [luot, setLuot] = useState<{ danhSach: LuotDung[]; tongGiam: number } | null>(
    null,
  );

  const nap = useCallback(async () => {
    setDangTai(true);
    setLoi("");

    try {
      const kq = await danhSachMa(1);
      setDanhSach(danhDauHetHan(kq.danhSach));
    } catch (e) {
      setLoi(e instanceof Error ? e.message : "Không tải được danh sách mã.");
    } finally {
      setDangTai(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(nap);
  }, [nap]);

  const luu = async () => {
    if (dangLuu) return;
    setDangLuu(true);
    setLoi("");

    try {
      if (suaId) {
        // `ma` khong duoc gui khi sua: may chu khong cho doi chuoi ma sau khi
        // da phat, vi doi la lam hong moi cho da chia se ma do.
        const { ma: _bo, ...conLai } = than;
        void _bo;
        const kq = await suaMa(suaId, conLai as ThanMaGiamGia);
        setDanhSach((cu) => cu.map((m) => (m._id === suaId ? motMa(kq.ma) : m)));
      } else {
        const kq = await taoMa(than);
        setDanhSach((cu) => [motMa(kq.ma), ...cu]);
      }

      setMoForm(false);
      setSuaId(null);
      setThan(MAC_DINH);
    } catch (e) {
      setLoi(e instanceof Error ? e.message : "Không lưu được mã giảm giá.");
    } finally {
      setDangLuu(false);
    }
  };

  const batTat = async (id: string) => {
    try {
      const kq = await batTatMa(id);
      setDanhSach((cu) => cu.map((m) => (m._id === id ? motMa(kq.ma) : m)));
    } catch (e) {
      setLoi(e instanceof Error ? e.message : "Không đổi được trạng thái.");
    }
  };

  const moLuot = async (id: string) => {
    setXemLuot(id);
    setLuot(null);

    try {
      setLuot(await luotDungCuaMa(id));
    } catch {
      setLuot({ danhSach: [], tongGiam: 0 });
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BadgePercent size={22} className="text-blue-600" />
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Mã giảm giá</h1>
        </div>

        <button
          type="button"
          onClick={() => {
            setSuaId(null);
            setThan(MAC_DINH);
            setMoForm(true);
          }}
          className="flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <Plus size={16} /> Tạo mã mới
        </button>
      </div>

      {loi && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{loi}</p>
      )}

      {moForm && (
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
          <h2 className="mb-4 font-bold text-slate-900">
            {suaId ? "Sửa mã giảm giá" : "Tạo mã giảm giá"}
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {!suaId && (
              <label className="text-sm">
                <span className="mb-1 block font-semibold text-slate-700">Mã</span>
                <input
                  id="mgg-ma"
                  value={than.ma ?? ""}
                  onChange={(e) =>
                    setThan({ ...than, ma: e.target.value.toUpperCase().slice(0, 32) })
                  }
                  placeholder="GIAM10"
                  className="h-11 w-full rounded-xl border border-slate-300 px-3 uppercase outline-none focus:border-blue-500"
                />
              </label>
            )}

            <label className="text-sm">
              <span className="mb-1 block font-semibold text-slate-700">Mô tả</span>
              <input
                id="mgg-mota"
                value={than.moTa ?? ""}
                onChange={(e) => setThan({ ...than, moTa: e.target.value })}
                placeholder="Khuyến mãi khai giảng"
                className="h-11 w-full rounded-xl border border-slate-300 px-3 outline-none focus:border-blue-500"
              />
            </label>

            <label className="text-sm">
              <span className="mb-1 block font-semibold text-slate-700">Loại</span>
              <select
                id="mgg-loai"
                value={than.loai}
                onChange={(e) =>
                  setThan({
                    ...than,
                    loai: e.target.value as ThanMaGiamGia["loai"],
                    // Doi sang so tien thi tran giam khong con nghia - xoa luon
                    // de khong luu mot gia tri vo nghia vao CSDL.
                    giamToiDa: e.target.value === "phanTram" ? than.giamToiDa : null,
                  })
                }
                className="h-11 w-full rounded-xl border border-slate-300 px-3 outline-none focus:border-blue-500"
              >
                <option value="phanTram">Phần trăm (%)</option>
                <option value="soTien">Số tiền (đ)</option>
              </select>
            </label>

            <label className="text-sm">
              <span className="mb-1 block font-semibold text-slate-700">
                Giá trị {than.loai === "phanTram" ? "(%)" : "(đ)"}
              </span>
              <input
                id="mgg-giatri"
                type="number"
                min={than.loai === "phanTram" ? 1 : 0}
                max={than.loai === "phanTram" ? 100 : undefined}
                value={than.giaTri}
                onChange={(e) => setThan({ ...than, giaTri: Number(e.target.value) })}
                className="h-11 w-full rounded-xl border border-slate-300 px-3 outline-none focus:border-blue-500"
              />
            </label>

            {/* Tran giam chi co nghia voi ma phan tram. Hien no o ma so tien la
                mot o khong bao gio duoc dung toi - nguoi go se phan van. */}
            {than.loai === "phanTram" && (
              <label className="text-sm">
                <span className="mb-1 block font-semibold text-slate-700">
                  Giảm tối đa (đ) — để trống là không chặn
                </span>
                <input
                  id="mgg-tran"
                  type="number"
                  min={0}
                  value={than.giamToiDa ?? ""}
                  onChange={(e) =>
                    setThan({
                      ...than,
                      giamToiDa: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                  className="h-11 w-full rounded-xl border border-slate-300 px-3 outline-none focus:border-blue-500"
                />
              </label>
            )}

            <label className="text-sm">
              <span className="mb-1 block font-semibold text-slate-700">
                Đơn tối thiểu (đ)
              </span>
              <input
                id="mgg-toithieu"
                type="number"
                min={0}
                value={than.donToiThieu ?? 0}
                onChange={(e) =>
                  setThan({ ...than, donToiThieu: Number(e.target.value) })
                }
                className="h-11 w-full rounded-xl border border-slate-300 px-3 outline-none focus:border-blue-500"
              />
            </label>

            <label className="text-sm">
              <span className="mb-1 block font-semibold text-slate-700">Bắt đầu</span>
              <input
                id="mgg-batdau"
                type="date"
                value={(than.batDau ?? "").slice(0, 10)}
                onChange={(e) => setThan({ ...than, batDau: e.target.value })}
                className="h-11 w-full rounded-xl border border-slate-300 px-3 outline-none focus:border-blue-500"
              />
            </label>

            <label className="text-sm">
              <span className="mb-1 block font-semibold text-slate-700">Kết thúc</span>
              <input
                id="mgg-ketthuc"
                type="date"
                value={(than.ketThuc ?? "").slice(0, 10)}
                onChange={(e) => setThan({ ...than, ketThuc: e.target.value })}
                className="h-11 w-full rounded-xl border border-slate-300 px-3 outline-none focus:border-blue-500"
              />
            </label>

            <label className="text-sm">
              <span className="mb-1 block font-semibold text-slate-700">
                Tổng số lượt — để trống là không giới hạn
              </span>
              <input
                id="mgg-soluot"
                type="number"
                min={1}
                value={than.soLuotToiDa ?? ""}
                onChange={(e) =>
                  setThan({
                    ...than,
                    soLuotToiDa: e.target.value ? Number(e.target.value) : null,
                  })
                }
                className="h-11 w-full rounded-xl border border-slate-300 px-3 outline-none focus:border-blue-500"
              />
            </label>

            <label className="flex items-center gap-2 text-sm sm:col-span-2">
              <input
                id="mgg-motlan"
                type="checkbox"
                checked={than.moiNguoiMotLan !== false}
                onChange={(e) => setThan({ ...than, moiNguoiMotLan: e.target.checked })}
                className="h-4 w-4"
              />
              <span className="text-slate-700">
                Mỗi người chỉ dùng một lần
                <span className="ml-1 text-slate-400">
                  (bỏ chọn là một người dùng mã này bao nhiêu lần cũng được)
                </span>
              </span>
            </label>
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setMoForm(false);
                setSuaId(null);
              }}
              className="h-11 rounded-xl px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={luu}
              disabled={dangLuu || (!suaId && !than.ma?.trim())}
              className="h-11 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:bg-slate-300"
            >
              {dangLuu ? "Đang lưu…" : "Lưu"}
            </button>
          </div>
        </div>
      )}

      {dangTai && <p className="py-10 text-center text-sm text-slate-500">Đang tải…</p>}

      {!dangTai && danhSach.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-sm text-slate-500">
          Chưa có mã giảm giá nào.
        </div>
      )}

      {/* overflow-x-auto: bang nay 7 cot, khong the vua man hinh dien thoai.
          Cuon rieng trong khung chu khong day ca trang di ngang. */}
      {!dangTai && danhSach.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="bg-slate-50 text-left text-xs text-slate-500 uppercase">
              <tr>
                <th className="px-4 py-3">Mã</th>
                <th className="px-4 py-3">Giảm</th>
                <th className="px-4 py-3">Điều kiện</th>
                <th className="px-4 py-3">Hiệu lực</th>
                <th className="px-4 py-3 text-right">Đã dùng</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {danhSach.map((m) => {
                const hetHan = m.hetHan;

                return (
                  <tr key={m._id} className="border-t border-slate-100">
                    <td className="px-4 py-3">
                      <p className="font-bold text-slate-900">{m.ma}</p>
                      {m.moTa && <p className="text-xs text-slate-500">{m.moTa}</p>}
                    </td>
                    <td className="px-4 py-3 tabular-nums">
                      {m.loai === "phanTram"
                        ? `${m.giaTri}%`
                        : `${m.giaTri.toLocaleString("vi-VN")}đ`}
                      {m.giamToiDa ? (
                        <span className="block text-xs text-slate-400">
                          tối đa {m.giamToiDa.toLocaleString("vi-VN")}đ
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {m.donToiThieu > 0
                        ? `Đơn từ ${m.donToiThieu.toLocaleString("vi-VN")}đ`
                        : "Không"}
                      <span className="block">
                        {m.moiNguoiMotLan ? "1 lần/người" : "Không giới hạn/người"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap text-slate-500">
                      {dinhDangNgay(m.batDau)} → {dinhDangNgay(m.ketThuc)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {m.daDung}
                      {m.soLuotToiDa ? ` / ${m.soLuotToiDa}` : ""}
                    </td>
                    <td className="px-4 py-3">
                      {/* Het han va bi tat la HAI chuyen khac nhau: mot cai tu
                          het theo ngay, mot cai do quan tri chu dong tat. Gop
                          lam mot nhan la quan tri khong biet co can bam gi khong. */}
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          !m.hoatDong
                            ? "bg-slate-200 text-slate-600"
                            : hetHan
                              ? "bg-amber-100 text-amber-700"
                              : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {!m.hoatDong ? "Đã tắt" : hetHan ? "Hết hạn" : "Đang chạy"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => moLuot(m._id)}
                          aria-label="Xem lượt dùng"
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100"
                        >
                          <Users size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => batTat(m._id)}
                          aria-label={m.hoatDong ? "Tắt mã" : "Bật mã"}
                          className={`flex h-9 w-9 items-center justify-center rounded-lg transition hover:bg-slate-100 ${
                            m.hoatDong ? "text-emerald-600" : "text-slate-400"
                          }`}
                        >
                          <Power size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {xemLuot && (
        <div
          className="fixed inset-0 z-50 flex justify-center overflow-y-auto bg-black/50 p-4"
          onClick={() => setXemLuot(null)}
        >
          <div
            className="my-auto w-full max-w-2xl rounded-2xl bg-white p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-bold text-slate-900">Lượt dùng mã</h2>
              <button
                type="button"
                onClick={() => setXemLuot(null)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600"
              >
                ✕
              </button>
            </div>

            {!luot && (
              <p className="py-8 text-center text-sm text-slate-500">Đang tải…</p>
            )}

            {luot && luot.danhSach.length === 0 && (
              <p className="py-8 text-center text-sm text-slate-500">
                Chưa có ai dùng mã này.
              </p>
            )}

            {luot && luot.danhSach.length > 0 && (
              <>
                <p className="mb-3 text-sm text-slate-600">
                  Tổng đã giảm:{" "}
                  <strong className="tabular-nums">
                    {luot.tongGiam.toLocaleString("vi-VN")}đ
                  </strong>
                </p>
                <div className="max-h-[50vh] overflow-y-auto">
                  {luot.danhSach.map((l) => (
                    <div
                      key={l._id}
                      className="flex items-center justify-between gap-3 border-b border-slate-100 py-2 text-sm"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-800">
                          {l.user?.name || l.user?.email || "Người dùng đã xóa"}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {l.course?.title || "—"}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs text-slate-600 tabular-nums">
                        −{l.soTienGiam.toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
