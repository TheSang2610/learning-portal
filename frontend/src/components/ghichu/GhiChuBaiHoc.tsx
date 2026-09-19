"use client";

import { useCallback, useEffect, useState } from "react";
import { Clock, NotebookPen, Pencil, Trash2 } from "lucide-react";

import {
  layGhiChu,
  suaGhiChu,
  themGhiChu,
  xoaGhiChu,
  type GhiChu,
} from "@/src/services/ghiChu";

const DAI_TOI_DA = 5000;

/** Giay -> "12:07" hoac "1:02:07". Khong bao gio hien "NaN:NaN". */
const dinhDangMoc = (giay: number): string => {
  const g = Math.max(0, Math.floor(giay));
  const gio = Math.floor(g / 3600);
  const phut = Math.floor((g % 3600) / 60);
  const con = g % 60;

  const hai = (n: number) => String(n).padStart(2, "0");

  return gio > 0 ? `${gio}:${hai(phut)}:${hai(con)}` : `${phut}:${hai(con)}`;
};

interface Props {
  courseId: string;
  lessonId: string;
  /**
   * Doc vi tri hien tai cua video, tinh bang giay.
   *
   * Tra ve null khi bai khong co video (bai doc) hoac video chua san sang.
   * Trang hoc truyen ham chu khong truyen con so: con so chup mot thoi diem,
   * ma thoi diem can biet la LUC BAM NUT, khong phai luc ve lai component.
   */
  layViTriVideo?: () => number | null;
  /** Nhay video toi mot moc. Khong co thi moc chi la nhan doc, khong bam duoc. */
  nhayToi?: (giay: number) => void;
}

export default function GhiChuBaiHoc({
  courseId,
  lessonId,
  layViTriVideo,
  nhayToi,
}: Props) {
  const [danhSach, setDanhSach] = useState<GhiChu[]>([]);
  const [dangTai, setDangTai] = useState(true);
  const [loi, setLoi] = useState("");

  const [chuMoi, setChuMoi] = useState("");
  const [dangGui, setDangGui] = useState(false);

  const [dangSua, setDangSua] = useState<string | null>(null);
  const [chuSua, setChuSua] = useState("");

  const nap = useCallback(async () => {
    setDangTai(true);
    setLoi("");

    try {
      const kq = await layGhiChu(courseId, lessonId);
      setDanhSach(kq.danhSach);
    } catch (e) {
      setLoi(e instanceof Error ? e.message : "Không tải được ghi chú.");
    } finally {
      setDangTai(false);
    }
  }, [courseId, lessonId]);

  useEffect(() => {
    if (!courseId || !lessonId) return;
    // Day sang microtask - xem ghi chu cung kieu o ChuongThongBao.
    queueMicrotask(nap);
  }, [courseId, lessonId, nap]);

  const them = async () => {
    const chu = chuMoi.trim();
    if (!chu || dangGui) return;

    setDangGui(true);
    setLoi("");

    try {
      // Doc vi tri video NGAY LUC NAY, khong phai luc ve component.
      const moc = layViTriVideo?.() ?? null;

      const kq = await themGhiChu({ courseId, lessonId, noiDung: chu, mocGiay: moc });

      // Chen dung cho theo moc thoi gian de danh sach luon khop voi video.
      // Nap lai ca danh sach cho chuyen nay la mot luot mang thua.
      setDanhSach((cu) =>
        [...cu, kq.ghiChu].sort((a, b) => {
          const ma = a.mocGiay ?? Number.MAX_SAFE_INTEGER;
          const mb = b.mocGiay ?? Number.MAX_SAFE_INTEGER;
          if (ma !== mb) return ma - mb;
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }),
      );
      setChuMoi("");
    } catch (e) {
      setLoi(e instanceof Error ? e.message : "Không lưu được ghi chú.");
    } finally {
      setDangGui(false);
    }
  };

  const luuSua = async (id: string) => {
    const chu = chuSua.trim();
    if (!chu || dangGui) return;

    setDangGui(true);

    try {
      const kq = await suaGhiChu(id, chu);
      setDanhSach((cu) => cu.map((g) => (g._id === id ? kq.ghiChu : g)));
      setDangSua(null);
      setChuSua("");
    } catch (e) {
      setLoi(e instanceof Error ? e.message : "Không sửa được ghi chú.");
    } finally {
      setDangGui(false);
    }
  };

  const xoa = async (id: string) => {
    const cu = danhSach;
    setDanhSach((ds) => ds.filter((g) => g._id !== id));

    try {
      await xoaGhiChu(id);
    } catch {
      setDanhSach(cu);
      setLoi("Không xóa được ghi chú.");
    }
  };

  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
      <div className="mb-2 flex items-center gap-2">
        <NotebookPen size={20} className="text-amber-600" />
        <h2 className="text-lg font-bold text-slate-900">Ghi chú của bạn</h2>
      </div>

      {/* Noi ro day la rieng tu. Khung hoi dap nam ngay duoi va trong giong
          nhau - khong phan biet thi hoc vien go ghi chu ca nhan vao cho cong
          khai, hoac nguoc lai khong dam go gi vi so nguoi khac doc duoc. */}
      <p className="mb-4 text-sm text-slate-500">
        Chỉ mình bạn đọc được. Ghi chú lưu kèm mốc thời gian trong video để bấm vào là
        quay lại đúng đoạn.
      </p>

      <div className="mb-5">
        <textarea
          id="ghi-chu-moi"
          value={chuMoi}
          onChange={(e) => setChuMoi(e.target.value.slice(0, DAI_TOI_DA))}
          rows={2}
          placeholder="Ghi lại điều bạn muốn nhớ…"
          className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
        />

        <div className="mt-2 flex items-center justify-between gap-3">
          <span className="text-xs text-slate-400 tabular-nums">
            {chuMoi.length}/{DAI_TOI_DA}
          </span>

          <button
            type="button"
            onClick={them}
            disabled={!chuMoi.trim() || dangGui}
            className="h-11 rounded-xl bg-amber-600 px-5 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Lưu ghi chú
          </button>
        </div>
      </div>

      {loi && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{loi}</p>
      )}

      {dangTai && <p className="py-4 text-center text-sm text-slate-500">Đang tải…</p>}

      {!dangTai && danhSach.length === 0 && (
        <p className="py-4 text-center text-sm text-slate-500">
          Chưa có ghi chú nào cho bài này.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {danhSach.map((g) => (
          <div
            key={g._id}
            className="rounded-xl border border-slate-200 bg-slate-50/60 p-3"
          >
            {dangSua === g._id ? (
              <>
                <textarea
                  id={`ghi-chu-sua-${g._id}`}
                  value={chuSua}
                  onChange={(e) => setChuSua(e.target.value.slice(0, DAI_TOI_DA))}
                  rows={3}
                  className="w-full resize-y rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500"
                />
                <div className="mt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setDangSua(null)}
                    className="h-9 rounded-lg px-3 text-xs font-semibold text-slate-600 hover:bg-slate-200"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={() => luuSua(g._id)}
                    disabled={!chuSua.trim() || dangGui}
                    className="h-9 rounded-lg bg-amber-600 px-3 text-xs font-semibold text-white disabled:bg-slate-300"
                  >
                    Lưu
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="mb-1 flex items-center justify-between gap-2">
                  {/* Moc thoi gian chi bam duoc khi trang hoc co truyen nhayToi.
                      Khong co thi ve <span> - mot cai nut bam vao khong lam gi
                      te hon han mot cai nhan doc. */}
                  {g.mocGiay !== null && nhayToi ? (
                    <button
                      type="button"
                      onClick={() => nhayToi(g.mocGiay as number)}
                      className="flex items-center gap-1 rounded bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800 transition hover:bg-amber-200"
                    >
                      <Clock size={11} /> {dinhDangMoc(g.mocGiay)}
                    </button>
                  ) : g.mocGiay !== null ? (
                    <span className="flex items-center gap-1 rounded bg-slate-200 px-2 py-1 text-xs font-semibold text-slate-600">
                      <Clock size={11} /> {dinhDangMoc(g.mocGiay)}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">
                      {new Date(g.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                  )}

                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setDangSua(g._id);
                        setChuSua(g.noiDung);
                      }}
                      aria-label="Sửa ghi chú"
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-200"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => xoa(g._id)}
                      aria-label="Xóa ghi chú"
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <p className="text-sm whitespace-pre-wrap text-slate-700">{g.noiDung}</p>
              </>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
