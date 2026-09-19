"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { CircleCheck, MessageCircleQuestion, Send } from "lucide-react";

import AnhDaiDien from "@/src/components/ui/AnhDaiDien";
import {
  layCauHoiChoGiangVien,
  traLoiCauHoi,
  type CauHoiChoGiangVien,
} from "@/src/services/hoiDap";

const DAI_TOI_DA = 2000;

const khoangCach = (moc: string): string => {
  const giay = Math.floor((Date.now() - new Date(moc).getTime()) / 1000);

  if (giay < 60) return "vừa xong";
  if (giay < 3600) return `${Math.floor(giay / 60)} phút trước`;
  if (giay < 86400) return `${Math.floor(giay / 3600)} giờ trước`;
  if (giay < 604800) return `${Math.floor(giay / 86400)} ngày trước`;

  return new Date(moc).toLocaleDateString("vi-VN");
};

const tenCua = (n: { name?: string; email?: string } | null): string =>
  n?.name?.trim() || n?.email?.split("@")[0] || "Học viên";

export default function InstructorHoiDapPage() {
  const [danhSach, setDanhSach] = useState<CauHoiChoGiangVien[]>([]);
  const [tong, setTong] = useState(0);
  const [tatCa, setTatCa] = useState(false);
  const [dangTai, setDangTai] = useState(true);
  const [loi, setLoi] = useState("");

  const [dangTraLoi, setDangTraLoi] = useState<string | null>(null);
  const [chuTraLoi, setChuTraLoi] = useState("");
  const [dangGui, setDangGui] = useState(false);

  const nap = useCallback(async () => {
    setDangTai(true);
    setLoi("");

    try {
      const kq = await layCauHoiChoGiangVien(1, tatCa);
      setDanhSach(kq.danhSach);
      setTong(kq.tong);
    } catch (e) {
      setLoi(e instanceof Error ? e.message : "Không tải được danh sách câu hỏi.");
    } finally {
      setDangTai(false);
    }
  }, [tatCa]);

  useEffect(() => {
    // Day sang microtask thay vi goi thang trong than effect - xem ghi chu
    // cung kieu o ChuongThongBao va HoiDapBaiHoc.
    queueMicrotask(nap);
  }, [nap]);

  const gui = async (id: string) => {
    const cau = chuTraLoi.trim();
    if (!cau || dangGui) return;

    setDangGui(true);

    try {
      const kq = await traLoiCauHoi(id, cau);
      setChuTraLoi("");
      setDangTraLoi(null);

      // Dang o che do "chua tra loi" thi cau vua tra loi phai BIEN KHOI danh
      // sach: day la hang doi viec, tra loi xong la xong viec. Che do "tat ca"
      // thi giu lai va cap nhat tai cho.
      if (!tatCa) {
        setDanhSach((cu) => cu.filter((c) => c._id !== id));
        setTong((n) => Math.max(0, n - 1));
      } else {
        setDanhSach((cu) =>
          cu.map((c) =>
            c._id === id ? { ...c, ...kq.cauHoi, course: c.course, lesson: c.lesson } : c,
          ),
        );
      }
    } catch (e) {
      setLoi(e instanceof Error ? e.message : "Không gửi được câu trả lời.");
    } finally {
      setDangGui(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-2 flex items-center gap-2">
        <MessageCircleQuestion size={22} className="text-blue-600" />
        <h1 className="text-2xl font-bold text-slate-900">Câu hỏi của học viên</h1>
      </div>

      <p className="mb-6 text-sm text-slate-500">
        {dangTai
          ? "Đang tải…"
          : tatCa
            ? `${tong} câu hỏi trong các khóa bạn dạy.`
            : `${tong} câu đang chờ bạn trả lời.`}
      </p>

      <div className="mb-6 flex gap-2">
        <button
          type="button"
          onClick={() => setTatCa(false)}
          className={`h-10 rounded-full px-4 text-sm font-semibold transition ${
            !tatCa
              ? "bg-blue-600 text-white"
              : "bg-white text-slate-600 ring-1 ring-slate-200"
          }`}
        >
          Chờ trả lời
        </button>
        <button
          type="button"
          onClick={() => setTatCa(true)}
          className={`h-10 rounded-full px-4 text-sm font-semibold transition ${
            tatCa
              ? "bg-blue-600 text-white"
              : "bg-white text-slate-600 ring-1 ring-slate-200"
          }`}
        >
          Tất cả
        </button>
      </div>

      {loi && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{loi}</p>
      )}

      {!dangTai && danhSach.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
          <CircleCheck size={30} className="mx-auto mb-3 text-emerald-400" />
          <p className="text-sm text-slate-500">
            {tatCa
              ? "Chưa có câu hỏi nào trong các khóa bạn dạy."
              : "Không còn câu hỏi nào đang chờ. Bạn đã trả lời hết."}
          </p>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {danhSach.map((c) => (
          <article
            key={c._id}
            className="rounded-2xl bg-white p-4 ring-1 ring-slate-200 sm:p-5"
          >
            {/* Ten khoa va ten bai la thu quan trong nhat o man hinh nay: danh
                sach tron cau hoi cua moi khoa, khong biet cau nay o dau thi
                khong tra loi duoc. */}
            <div className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
              <span className="rounded bg-slate-100 px-2 py-0.5 font-semibold text-slate-700">
                {c.course?.title || "Khóa đã xóa"}
              </span>
              {c.lesson?.title && (
                <span className="text-slate-500">· {c.lesson.title}</span>
              )}
              {c.daGiaiQuyet && (
                <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 font-semibold text-emerald-700">
                  <CircleCheck size={11} /> Đã trả lời
                </span>
              )}
            </div>

            <div className="flex gap-3">
              <AnhDaiDien
                src={c.student?.avatar}
                ten={tenCua(c.student)}
                size={36}
                nenChuCai="bg-slate-200 text-slate-700"
              />

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2">
                  <span className="text-sm font-semibold text-slate-900">
                    {tenCua(c.student)}
                  </span>
                  <span className="text-xs text-slate-400">
                    {khoangCach(c.createdAt)}
                  </span>
                </div>

                <p className="mt-1 text-sm whitespace-pre-wrap text-slate-700">
                  {c.noiDung}
                </p>

                {c.traLoi.length > 0 && (
                  <div className="mt-3 flex flex-col gap-2 border-l-2 border-slate-100 pl-3">
                    {c.traLoi.map((t) => (
                      <div key={t._id}>
                        <span className="text-xs font-semibold text-slate-700">
                          {tenCua(t.user)}
                        </span>
                        <p className="text-sm whitespace-pre-wrap text-slate-600">
                          {t.noiDung}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-3 flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setDangTraLoi(dangTraLoi === c._id ? null : c._id);
                      setChuTraLoi("");
                    }}
                    className="py-1 text-xs font-semibold text-blue-600 hover:underline"
                  >
                    Trả lời
                  </button>

                  {c.course?.slug && (
                    <Link
                      href={`/course?slug=${c.course.slug}`}
                      className="py-1 text-xs font-semibold text-slate-500 hover:underline"
                    >
                      Mở khóa học
                    </Link>
                  )}
                </div>

                {dangTraLoi === c._id && (
                  <div className="mt-3">
                    <textarea
                      id={`gv-tra-loi-${c._id}`}
                      value={chuTraLoi}
                      onChange={(e) => setChuTraLoi(e.target.value.slice(0, DAI_TOI_DA))}
                      rows={3}
                      placeholder="Nhập câu trả lời…"
                      className="w-full resize-y rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                    <div className="mt-2 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setDangTraLoi(null)}
                        className="h-10 rounded-lg px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
                      >
                        Hủy
                      </button>
                      <button
                        type="button"
                        onClick={() => gui(c._id)}
                        disabled={!chuTraLoi.trim() || dangGui}
                        className="flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                      >
                        <Send size={14} /> Gửi
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
