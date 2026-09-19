"use client";

import { useCallback, useEffect, useState } from "react";
import { CircleCheck, MessageCircleQuestion, Send, Trash2 } from "lucide-react";

import AnhDaiDien from "@/src/components/ui/AnhDaiDien";
import {
  dangCauHoi,
  layCauHoi,
  traLoiCauHoi,
  xoaCauHoi,
  type CauHoiHoiDap,
  type VaiTroTraLoi,
} from "@/src/services/hoiDap";

const DAI_TOI_DA = 2000;

// Nhan vai tro. Chi hien voi giang vien va quan tri: "Học viên" la truong hop
// mac dinh, gan nhan cho moi nguoi thi cai nhan mat het tac dung phan biet.
const NHAN_VAI_TRO: Partial<Record<VaiTroTraLoi, { chu: string; lop: string }>> = {
  giangVien: { chu: "Giảng viên", lop: "bg-blue-100 text-blue-700" },
  quanTri: { chu: "Quản trị", lop: "bg-purple-100 text-purple-700" },
};

const khoangCach = (moc: string): string => {
  const giay = Math.floor((Date.now() - new Date(moc).getTime()) / 1000);

  if (giay < 60) return "vừa xong";
  if (giay < 3600) return `${Math.floor(giay / 60)} phút trước`;
  if (giay < 86400) return `${Math.floor(giay / 3600)} giờ trước`;
  if (giay < 604800) return `${Math.floor(giay / 86400)} ngày trước`;

  return new Date(moc).toLocaleDateString("vi-VN");
};

const tenCua = (n: { name?: string; email?: string } | null): string =>
  n?.name?.trim() || n?.email?.split("@")[0] || "Người dùng";

export default function HoiDapBaiHoc({
  courseId,
  lessonId,
}: {
  courseId: string;
  lessonId: string;
}) {
  const [danhSach, setDanhSach] = useState<CauHoiHoiDap[]>([]);
  const [vaiTro, setVaiTro] = useState<VaiTroTraLoi>("hocVien");
  const [dangTai, setDangTai] = useState(true);
  const [loi, setLoi] = useState("");

  const [cauMoi, setCauMoi] = useState("");
  const [dangGui, setDangGui] = useState(false);

  // Dang mo o tra loi cua cau nao. Mot o duy nhat tai mot thoi diem: mo tat ca
  // cung luc thi tren dien thoai man hinh day o nhap, khong con thay cau hoi.
  const [dangTraLoi, setDangTraLoi] = useState<string | null>(null);
  const [chuTraLoi, setChuTraLoi] = useState("");

  const nap = useCallback(async () => {
    setDangTai(true);
    setLoi("");

    try {
      const kq = await layCauHoi(courseId, lessonId);
      setDanhSach(kq.danhSach);
      setVaiTro(kq.vaiTro);
    } catch (e) {
      setLoi(e instanceof Error ? e.message : "Không tải được phần hỏi đáp.");
    } finally {
      setDangTai(false);
    }
  }, [courseId, lessonId]);

  useEffect(() => {
    if (!courseId || !lessonId) return;

    // Day sang microtask thay vi goi thang trong than effect: goi thang la mot
    // vong ve lai noi tiep ngay sau lan ve dau, va react-hooks/set-state-in-effect
    // chan dung cho nay. Khong ai thay khac biet - nap() la mot luot goi mang,
    // luon cham hon mot khung hinh.
    queueMicrotask(nap);
  }, [courseId, lessonId, nap]);

  const guiCauHoi = async () => {
    const cau = cauMoi.trim();
    if (cau.length < 5 || dangGui) return;

    setDangGui(true);
    setLoi("");

    try {
      const kq = await dangCauHoi({ courseId, lessonId, noiDung: cau });
      // Chen len dau thay vi nap lai ca danh sach: nguoi dung thay ngay cau vua
      // gui, va khong mat vi tri cuon.
      setDanhSach((cu) => [kq.cauHoi, ...cu]);
      setCauMoi("");
    } catch (e) {
      setLoi(e instanceof Error ? e.message : "Không đăng được câu hỏi.");
    } finally {
      setDangGui(false);
    }
  };

  const guiTraLoi = async (id: string) => {
    const cau = chuTraLoi.trim();
    if (!cau || dangGui) return;

    setDangGui(true);
    setLoi("");

    try {
      const kq = await traLoiCauHoi(id, cau);
      setDanhSach((cu) => cu.map((c) => (c._id === id ? kq.cauHoi : c)));
      setChuTraLoi("");
      setDangTraLoi(null);
    } catch (e) {
      setLoi(e instanceof Error ? e.message : "Không gửi được câu trả lời.");
    } finally {
      setDangGui(false);
    }
  };

  const xoa = async (id: string) => {
    // Bo khoi danh sach ngay roi moi goi may chu. Hong thi nap lai - trang thai
    // that luon o may chu, cai tren man hinh chi la ban sao.
    const cu = danhSach;
    setDanhSach((ds) => ds.filter((c) => c._id !== id));

    try {
      await xoaCauHoi(id);
    } catch {
      setDanhSach(cu);
      setLoi("Không xóa được câu hỏi.");
    }
  };

  return (
    <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        <MessageCircleQuestion size={20} className="text-blue-600" />
        <h2 className="text-lg font-bold text-slate-900">Hỏi đáp với giảng viên</h2>
      </div>

      {/* Noi ro day khong phai tro ly AI. Hai cho hoi nam canh nhau trong cung
          mot trang, khong phan biet thi hoc vien hoi nguoi that roi ngoi cho
          cau tra loi tuc thi. */}
      <p className="mb-5 text-sm text-slate-500">
        Câu hỏi ở đây do giảng viên trả lời nên cần thời gian. Muốn có câu trả lời ngay,
        bạn dùng trợ lý AI ở góc màn hình.
      </p>

      <div className="mb-6">
        <textarea
          id="hoi-dap-cau-moi"
          value={cauMoi}
          onChange={(e) => setCauMoi(e.target.value.slice(0, DAI_TOI_DA))}
          rows={3}
          placeholder="Bạn chưa hiểu chỗ nào trong bài này?"
          className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />

        <div className="mt-2 flex items-center justify-between gap-3">
          <span className="text-xs text-slate-400 tabular-nums">
            {cauMoi.length}/{DAI_TOI_DA}
          </span>

          <button
            type="button"
            onClick={guiCauHoi}
            disabled={cauMoi.trim().length < 5 || dangGui}
            className="flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            <Send size={16} /> Gửi câu hỏi
          </button>
        </div>
      </div>

      {loi && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{loi}</p>
      )}

      {dangTai && <p className="py-6 text-center text-sm text-slate-500">Đang tải…</p>}

      {!dangTai && danhSach.length === 0 && (
        <p className="py-6 text-center text-sm text-slate-500">
          Chưa có câu hỏi nào cho bài này. Bạn hỏi câu đầu tiên nhé.
        </p>
      )}

      <div className="flex flex-col gap-5">
        {danhSach.map((c) => (
          <article key={c._id} className="border-t border-slate-100 pt-5">
            <div className="flex gap-3">
              <AnhDaiDien
                src={c.student?.avatar}
                ten={tenCua(c.student)}
                size={36}
                nenChuCai="bg-slate-200 text-slate-700"
              />

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="text-sm font-semibold text-slate-900">
                    {tenCua(c.student)}
                  </span>
                  <span className="text-xs text-slate-400">
                    {khoangCach(c.createdAt)}
                  </span>

                  {c.daGiaiQuyet && (
                    <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                      <CircleCheck size={12} /> Đã trả lời
                    </span>
                  )}
                </div>

                {/* whitespace-pre-wrap: hoc vien xuong dong de tach y, ep mot
                    dong lam cau hoi dai thanh mot khoi chu khong doc noi. */}
                <p className="mt-1 text-sm whitespace-pre-wrap text-slate-700">
                  {c.noiDung}
                </p>

                <div className="mt-2 flex items-center gap-4">
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

                  {/* Nut xoa chi hien voi nguoi co the xoa duoc. May chu van kiem
                      lai lan nua - an nut khong phai la kiem quyen. */}
                  {vaiTro !== "hocVien" && (
                    <button
                      type="button"
                      onClick={() => xoa(c._id)}
                      className="flex items-center gap-1 py-1 text-xs font-semibold text-red-600 hover:underline"
                    >
                      <Trash2 size={12} /> Xóa
                    </button>
                  )}
                </div>

                {c.traLoi.length > 0 && (
                  <div className="mt-3 flex flex-col gap-3 border-l-2 border-slate-100 pl-3">
                    {c.traLoi.map((t) => {
                      const nhan = NHAN_VAI_TRO[t.vaiTro];

                      return (
                        <div key={t._id} className="flex gap-2">
                          <AnhDaiDien
                            src={t.user?.avatar}
                            ten={tenCua(t.user)}
                            size={28}
                            nenChuCai="bg-slate-200 text-slate-700"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                              <span className="text-sm font-semibold text-slate-900">
                                {tenCua(t.user)}
                              </span>
                              {nhan && (
                                <span
                                  className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${nhan.lop}`}
                                >
                                  {nhan.chu}
                                </span>
                              )}
                              <span className="text-xs text-slate-400">
                                {khoangCach(t.createdAt)}
                              </span>
                            </div>
                            <p className="mt-0.5 text-sm whitespace-pre-wrap text-slate-700">
                              {t.noiDung}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {dangTraLoi === c._id && (
                  <div className="mt-3">
                    <textarea
                      id={`hoi-dap-tra-loi-${c._id}`}
                      value={chuTraLoi}
                      onChange={(e) => setChuTraLoi(e.target.value.slice(0, DAI_TOI_DA))}
                      rows={2}
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
                        onClick={() => guiTraLoi(c._id)}
                        disabled={!chuTraLoi.trim() || dangGui}
                        className="h-10 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                      >
                        Gửi
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
