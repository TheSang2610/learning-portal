"use client";

import { useState } from "react";
import { Bell, Send, TriangleAlert } from "lucide-react";

import { guiThongBaoHeThong } from "@/src/services/thongBao";

const DAI_TIEU_DE = 200;
const DAI_NOI_DUNG = 1000;

export default function AdminThongBaoPage() {
  const [tieuDe, setTieuDe] = useState("");
  const [noiDung, setNoiDung] = useState("");
  const [duongDan, setDuongDan] = useState("");
  const [vaiTro, setVaiTro] = useState<"" | "student" | "instructor">("");

  const [dangGui, setDangGui] = useState(false);
  const [loi, setLoi] = useState("");
  const [xong, setXong] = useState<number | null>(null);

  // Buoc xac nhan la bat buoc, khong phai trang tri.
  //
  // Day la thao tac KHONG HOAN TAC duoc: gui xong la thong bao nam trong chuong
  // cua tat ca moi nguoi, khong co nut thu hoi. Bam nham mot cai la ca he thong
  // nhan mot thong bao viet do dang.
  const [hoiLai, setHoiLai] = useState(false);

  const gui = async () => {
    if (dangGui) return;

    setDangGui(true);
    setLoi("");
    setXong(null);

    try {
      const kq = await guiThongBaoHeThong({
        tieuDe: tieuDe.trim(),
        noiDung: noiDung.trim(),
        duongDan: duongDan.trim(),
        vaiTro,
      });

      setXong(kq.daGui);
      setTieuDe("");
      setNoiDung("");
      setDuongDan("");
    } catch (e) {
      setLoi(e instanceof Error ? e.message : "Không gửi được thông báo.");
    } finally {
      setDangGui(false);
      setHoiLai(false);
    }
  };

  const sanSang = tieuDe.trim().length > 0;

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-2 flex items-center gap-2">
        <Bell size={22} className="text-blue-600" />
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
          Thông báo hệ thống
        </h1>
      </div>

      <p className="mb-6 max-w-2xl text-sm text-slate-500">
        Thông báo gửi từ đây hiện trong chuông của người nhận. Quản trị viên không nhận
        thông báo này.
      </p>

      <div className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <label className="mb-4 block text-sm">
          <span className="mb-1 block font-semibold text-slate-700">Tiêu đề</span>
          <input
            id="tb-tieude"
            value={tieuDe}
            onChange={(e) => setTieuDe(e.target.value.slice(0, DAI_TIEU_DE))}
            placeholder="Hệ thống bảo trì tối nay"
            className="h-11 w-full rounded-xl border border-slate-300 px-3 outline-none focus:border-blue-500"
          />
          <span className="mt-1 block text-right text-xs text-slate-400 tabular-nums">
            {tieuDe.length}/{DAI_TIEU_DE}
          </span>
        </label>

        <label className="mb-4 block text-sm">
          <span className="mb-1 block font-semibold text-slate-700">Nội dung</span>
          <textarea
            id="tb-noidung"
            value={noiDung}
            onChange={(e) => setNoiDung(e.target.value.slice(0, DAI_NOI_DUNG))}
            rows={4}
            placeholder="Hệ thống sẽ bảo trì từ 23h đến 1h sáng mai."
            className="w-full resize-y rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
          />
          <span className="mt-1 block text-right text-xs text-slate-400 tabular-nums">
            {noiDung.length}/{DAI_NOI_DUNG}
          </span>
        </label>

        <label className="mb-4 block text-sm">
          <span className="mb-1 block font-semibold text-slate-700">
            Đường dẫn khi bấm vào (tùy chọn)
          </span>
          <input
            id="tb-duongdan"
            value={duongDan}
            onChange={(e) => setDuongDan(e.target.value)}
            placeholder="/courses"
            className="h-11 w-full rounded-xl border border-slate-300 px-3 outline-none focus:border-blue-500"
          />
          {/* May chu CHAN moi dia chi ben ngoai (xem duongDanNoiBo trong
              noiDungThongBao.js). Noi truoc o day de quan tri khong go mot dia
              chi ngoai roi thac mac vi sao lien ket bien mat. */}
          <span className="mt-1 block text-xs text-slate-400">
            Chỉ nhận đường dẫn trong trang, bắt đầu bằng dấu gạch chéo. Địa chỉ bên ngoài
            sẽ bị bỏ.
          </span>
        </label>

        <label className="mb-5 block text-sm">
          <span className="mb-1 block font-semibold text-slate-700">Gửi cho</span>
          <select
            id="tb-vaitro"
            value={vaiTro}
            onChange={(e) => setVaiTro(e.target.value as typeof vaiTro)}
            className="h-11 w-full rounded-xl border border-slate-300 px-3 outline-none focus:border-blue-500"
          >
            <option value="">Tất cả học viên và giảng viên</option>
            <option value="student">Chỉ học viên</option>
            <option value="instructor">Chỉ giảng viên</option>
          </select>
        </label>

        {loi && (
          <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {loi}
          </p>
        )}

        {xong !== null && (
          <p className="mb-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            Đã gửi tới <strong className="tabular-nums">{xong}</strong> người.
          </p>
        )}

        {hoiLai ? (
          <div className="rounded-xl border border-amber-300 bg-amber-50 p-4">
            <p className="mb-3 flex items-start gap-2 text-sm text-amber-900">
              <TriangleAlert size={16} className="mt-0.5 shrink-0" />
              <span>
                Thông báo đã gửi thì <strong>không thu hồi được</strong>. Kiểm lại nội
                dung trước khi gửi.
              </span>
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setHoiLai(false)}
                className="h-10 rounded-lg px-4 text-sm font-semibold text-slate-600 transition hover:bg-amber-100"
              >
                Quay lại sửa
              </button>
              <button
                type="button"
                onClick={gui}
                disabled={dangGui}
                className="h-10 rounded-lg bg-amber-600 px-4 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:bg-slate-300"
              >
                {dangGui ? "Đang gửi…" : "Gửi thật"}
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setHoiLai(true)}
            disabled={!sanSang}
            className="flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            <Send size={16} /> Gửi thông báo
          </button>
        )}
      </div>
    </div>
  );
}
