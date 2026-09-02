"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Download,
  FileText,
  Loader2,
  LogIn,
  Newspaper,
  Search,
  ShieldAlert,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import FeedCard from "@/src/components/common/FeedCard";
import { thoiGianTuongDoi } from "@/src/components/common/thoiGian";
import {
  documentService,
  type DocumentListResponse,
  type SharedDocument,
} from "@/src/services/document";
import { getErrorMessage } from "@/src/services/apiHelper";

const MAX_MB = 20;
const DUOI_CHO_PHEP = ["pdf", "doc", "docx"];

interface UserInfo {
  _id?: string;
  name?: string;
  role?: string;
}

interface Props {
  /** Trang dau lay san tu server - xem ghi chu trong page.tsx */
  initialData: DocumentListResponse;
}

function doiKichThuoc(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function duoiCuaFile(name: string): string {
  return name.split(".").pop()?.toLowerCase() ?? "";
}

const MAU_LOAI: Record<string, string> = {
  pdf: "bg-red-50 text-red-700",
  doc: "bg-blue-50 text-blue-700",
  docx: "bg-blue-50 text-blue-700",
};

export default function ShareDocumentClient({ initialData }: Props) {
  const [data, setData] = useState<DocumentListResponse>(initialData);
  const [dangTai, setDangTai] = useState(false);
  const [loiDanhSach, setLoiDanhSach] = useState("");

  const [tuKhoa, setTuKhoa] = useState("");
  const [tuKhoaDangDung, setTuKhoaDangDung] = useState("");

  const [user, setUser] = useState<UserInfo | null>(null);
  const [moForm, setMoForm] = useState(false);

  const [tieuDe, setTieuDe] = useState("");
  const [noiDung, setNoiDung] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dangGui, setDangGui] = useState(false);
  const [loiForm, setLoiForm] = useState("");
  const [thanhCong, setThanhCong] = useState("");

  // Doc thong tin dang nhap. Dung dung bo su kien nhu HeaderUserMenu de khi
  // dang nhap o cua so khac / bang nut Back thi form o day cung doi theo.
  useEffect(() => {
    const doc = () => {
      const raw = localStorage.getItem("userInfo");
      if (!raw || raw === "undefined") return setUser(null);
      try {
        setUser(JSON.parse(raw));
      } catch {
        setUser(null);
      }
    };
    doc();
    const khiQuayLai = (e: PageTransitionEvent) => {
      if (e.persisted) doc();
    };
    window.addEventListener("storage", doc);
    window.addEventListener("userInfoChanged", doc);
    window.addEventListener("pageshow", khiQuayLai);
    return () => {
      window.removeEventListener("storage", doc);
      window.removeEventListener("userInfoChanged", doc);
      window.removeEventListener("pageshow", khiQuayLai);
    };
  }, []);

  // Chi goi lai khi nguoi dung bam tim / doi trang / vua dang xong.
  // Danh sach lan dau da co san tu server nen khong fetch luc mount.
  const taiLai = useCallback(async (page: number, q: string) => {
    setDangTai(true);
    setLoiDanhSach("");
    try {
      const res = await documentService.getDocuments({ page, q, limit: 12 });
      setData(res);
    } catch (err) {
      setLoiDanhSach(getErrorMessage(err, "Không tải được danh sách tài liệu."));
    } finally {
      setDangTai(false);
    }
  }, []);

  const timKiem = (e: React.FormEvent) => {
    e.preventDefault();
    setTuKhoaDangDung(tuKhoa);
    taiLai(1, tuKhoa);
  };

  const chonFile = (f: File | null) => {
    setLoiForm("");
    if (!f) return setFile(null);
    if (!DUOI_CHO_PHEP.includes(duoiCuaFile(f.name))) {
      setFile(null);
      return setLoiForm("Chỉ nhận file PDF, DOC hoặc DOCX.");
    }
    if (f.size > MAX_MB * 1024 * 1024) {
      setFile(null);
      return setLoiForm(
        `File tối đa ${MAX_MB}MB. File bạn chọn nặng ${doiKichThuoc(f.size)}.`,
      );
    }
    setFile(f);
  };

  const guiBai = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoiForm("");
    setThanhCong("");

    if (!tieuDe.trim() || !noiDung.trim()) {
      return setLoiForm("Vui lòng nhập đầy đủ tiêu đề và nội dung.");
    }
    if (!file) return setLoiForm("Vui lòng chọn file PDF hoặc Word.");

    setDangGui(true);
    try {
      await documentService.createDocument({
        title: tieuDe.trim(),
        description: noiDung.trim(),
        file,
      });
      setTieuDe("");
      setNoiDung("");
      setFile(null);
      setThanhCong("Đã đăng tài liệu. Cảm ơn bạn đã chia sẻ!");
      await taiLai(1, tuKhoaDangDung);
    } catch (err) {
      // Bai bi bo loc chan cung ve day - thong bao tu may chu noi ro ly do.
      setLoiForm(getErrorMessage(err, "Không đăng được tài liệu."));
    } finally {
      setDangGui(false);
    }
  };

  const xoaBai = async (doc: SharedDocument) => {
    if (!confirm(`Xóa tài liệu "${doc.title}"? Thao tác này không hoàn tác được.`))
      return;
    try {
      await documentService.deleteDocument(doc._id);
      await taiLai(data.page, tuKhoaDangDung);
    } catch (err) {
      alert(getErrorMessage(err, "Không xóa được tài liệu."));
    }
  };

  const coTheXoa = (doc: SharedDocument) =>
    Boolean(user && (user.role === "admin" || user._id === doc.uploader?._id));

  return (
    <div className="mx-auto max-w-7xl px-6">
      {/* ------------------------------------------------------------------ */}
      {/* Khu dang bai - de tren cung, ngoai luoi hai cot                     */}
      {/* ------------------------------------------------------------------ */}
      {!user ? (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50">
              <LogIn size={20} className="text-blue-700" />
            </span>
            <div>
              <p className="text-sm font-bold text-slate-900">
                Đăng nhập để chia sẻ tài liệu
              </p>
              <p className="text-sm text-slate-600">
                Xem và tải thì không cần tài khoản, chỉ khi đăng lên mới cần.
              </p>
            </div>
          </div>
          <Link
            href="/?auth=login"
            className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-blue-700"
          >
            Đăng nhập
          </Link>
        </div>
      ) : !moForm ? (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-5 py-4">
          <p className="text-sm text-slate-700">
            Bạn có đề cương, đề thi hay slide muốn chia sẻ?
          </p>
          <button
            type="button"
            onClick={() => setMoForm(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-blue-700"
          >
            <Upload size={16} />
            Đăng tài liệu
          </button>
        </div>
      ) : (
        <form
          onSubmit={guiBai}
          className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">
                Đăng tài liệu của bạn
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Mọi người đều xem và tải được tài liệu bạn chia sẻ.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setMoForm(false)}
              aria-label="Đóng biểu mẫu"
              className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <X size={18} />
            </button>
          </div>

          <div className="mt-5 space-y-4">
            <div>
              <label
                htmlFor="tieu-de"
                className="block text-sm font-semibold text-slate-800"
              >
                Tiêu đề <span className="text-red-600">*</span>
              </label>
              <input
                id="tieu-de"
                value={tieuDe}
                onChange={(e) => setTieuDe(e.target.value)}
                maxLength={200}
                placeholder="VD: Đề cương ôn tập Cấu trúc dữ liệu và giải thuật"
                className="mt-1.5 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm transition outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
              />
              <p className="mt-1 text-right text-xs text-slate-500">
                {tieuDe.length}/200
              </p>
            </div>

            <div>
              <label
                htmlFor="noi-dung"
                className="block text-sm font-semibold text-slate-800"
              >
                Nội dung <span className="text-red-600">*</span>
              </label>
              <textarea
                id="noi-dung"
                value={noiDung}
                onChange={(e) => setNoiDung(e.target.value)}
                maxLength={5000}
                rows={9}
                placeholder={
                  "Viết toàn bộ nội dung bài ở đây.\n\n" +
                  "Chương 1: Tên chương\n" +
                  "Nội dung của chương...\n\n" +
                  "Mục 1.1 Tên mục nhỏ\n" +
                  "- Ý thứ nhất\n" +
                  "- Ý thứ hai"
                }
                className="mt-1.5 w-full resize-y rounded-xl border border-slate-300 px-4 py-2.5 text-sm leading-relaxed transition outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
              />
              <div className="mt-1 flex flex-wrap items-start justify-between gap-2">
                {/* Muc luc ben trai trang chi tiet duoc dung tu chinh nhung dong
                    nay. Khong noi ro thi nguoi dang go mot khoi van lien, va
                    trang chi tiet khong co gi de dieu huong. */}
                <p className="text-xs leading-relaxed text-slate-500">
                  Dòng bắt đầu bằng{" "}
                  <code className="rounded bg-slate-100 px-1 font-semibold">
                    Chương 1:
                  </code>
                  ,{" "}
                  <code className="rounded bg-slate-100 px-1 font-semibold">Mục 1.1</code>{" "}
                  hoặc{" "}
                  <code className="rounded bg-slate-100 px-1 font-semibold">
                    ## Tiêu đề
                  </code>{" "}
                  sẽ thành mục lục ở trang xem bài.
                </p>
                <p className="text-xs text-slate-500">{noiDung.length}/5000</p>
              </div>
            </div>

            <div>
              <span className="block text-sm font-semibold text-slate-800">
                File tài liệu <span className="text-red-600">*</span>
              </span>

              {file ? (
                <div className="mt-1.5 flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
                  <FileText size={20} className="shrink-0 text-blue-700" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {file.name}
                    </p>
                    <p className="text-xs text-slate-600">{doiKichThuoc(file.size)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    aria-label="Bỏ file đã chọn"
                    className="rounded-lg p-1.5 text-slate-500 transition hover:bg-white hover:text-slate-900"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <label
                  htmlFor="file-tai-lieu"
                  className="mt-1.5 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center transition hover:border-blue-500 hover:bg-blue-50/40"
                >
                  <Upload size={24} className="text-slate-500" />
                  <span className="mt-2 text-sm font-semibold text-slate-800">
                    Bấm để chọn file
                  </span>
                  <span className="mt-0.5 text-xs text-slate-500">
                    PDF, DOC hoặc DOCX &middot; tối đa {MAX_MB}MB
                  </span>
                </label>
              )}
              <input
                id="file-tai-lieu"
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={(e) => chonFile(e.target.files?.[0] ?? null)}
              />
            </div>
          </div>

          {loiForm && (
            <p
              role="alert"
              className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            >
              {loiForm}
            </p>
          )}
          {thanhCong && (
            <p
              role="status"
              className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
            >
              {thanhCong}
            </p>
          )}

          <button
            type="submit"
            disabled={dangGui}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {dangGui ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Upload size={16} />
            )}
            {dangGui ? "Đang đăng..." : "Đăng tài liệu"}
          </button>
        </form>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Luoi hai cot: danh sach ben trai, thong tin phu ben phai            */}
      {/* ------------------------------------------------------------------ */}
      <div className="mt-8 grid gap-x-14 gap-y-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-lg font-extrabold text-slate-900">
              Tài liệu đã chia sẻ{" "}
              <span className="text-sm font-semibold text-slate-500">({data.total})</span>
            </h2>

            <form onSubmit={timKiem} className="flex items-center gap-2">
              <div className="relative">
                <Search
                  size={16}
                  className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={tuKhoa}
                  onChange={(e) => setTuKhoa(e.target.value)}
                  placeholder="Tìm tài liệu"
                  aria-label="Tìm tài liệu"
                  className="w-44 rounded-xl border border-slate-300 py-2 pr-3 pl-9 text-sm transition outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 sm:w-56"
                />
              </div>
              <button
                type="submit"
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-blue-600 hover:text-blue-700"
              >
                Tìm
              </button>
            </form>
          </div>

          {loiDanhSach && (
            <p
              role="alert"
              className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            >
              {loiDanhSach}
            </p>
          )}

          {dangTai ? (
            <div className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-16 text-sm text-slate-600">
              <Loader2 size={18} className="animate-spin" />
              Đang tải...
            </div>
          ) : data.documents.length === 0 ? (
            <div className="mt-4 rounded-xl border border-slate-200 bg-white py-16 text-center">
              <FileText size={32} className="mx-auto text-slate-300" />
              <p className="mt-3 text-sm font-semibold text-slate-800">
                {tuKhoaDangDung
                  ? "Không tìm thấy tài liệu phù hợp"
                  : "Chưa có tài liệu nào"}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {tuKhoaDangDung
                  ? "Thử từ khóa khác xem sao."
                  : "Hãy là người đầu tiên chia sẻ."}
              </p>
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              {data.documents.map((doc) => (
                <FeedCard
                  key={doc._id}
                  href={`/share-document/${doc._id}`}
                  tacGia={doc.uploader?.name || "Người dùng đã xóa"}
                  anhTacGia={doc.uploader?.avatar || null}
                  tieuDe={doc.title}
                  moTa={doc.description}
                  meta={
                    <>
                      <span
                        className={`rounded-md px-2.5 py-1 text-[13px] font-bold ${
                          MAU_LOAI[doc.fileExt] ?? MAU_LOAI.pdf
                        }`}
                      >
                        {doc.fileExt.toUpperCase()}
                      </span>
                      <span>{thoiGianTuongDoi(doc.createdAt)}</span>
                      <span aria-hidden className="text-slate-300">
                        &middot;
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Download size={13} />
                        {doc.downloadCount} lượt tải
                      </span>
                      <span aria-hidden className="text-slate-300">
                        &middot;
                      </span>
                      <span>{doiKichThuoc(doc.fileSize)}</span>
                    </>
                  }
                  themMuc={
                    coTheXoa(doc)
                      ? [
                          {
                            nhan: "Xóa tài liệu",
                            icon: <Trash2 size={15} />,
                            onChon: () => xoaBai(doc),
                            nguyHiem: true,
                          },
                        ]
                      : undefined
                  }
                />
              ))}
            </div>
          )}

          {data.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                type="button"
                disabled={data.page <= 1 || dangTai}
                onClick={() => taiLai(data.page - 1, tuKhoaDangDung)}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Trước
              </button>
              <span className="px-2 text-sm text-slate-600">
                Trang {data.page}/{data.totalPages}
              </span>
              <button
                type="button"
                disabled={data.page >= data.totalPages || dangTai}
                onClick={() => taiLai(data.page + 1, tuKhoaDangDung)}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Sau
              </button>
            </div>
          )}
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Cot phai                                                          */}
        {/* Quy dinh dat o day thay vi mot dai bang ngang phia tren: nguoi   */}
        {/* dung van thay no khi cuon danh sach, khong chi luc vao trang.    */}
        {/* ---------------------------------------------------------------- */}
        <aside className="lg:sticky lg:top-[120px] lg:self-start">
          <h2 className="text-xs font-bold tracking-wide text-slate-500 uppercase">
            Quy định khi đăng
          </h2>
          <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start gap-2.5">
              <ShieldAlert size={18} className="mt-0.5 shrink-0 text-amber-700" />
              <p className="text-sm leading-relaxed text-amber-900">
                Hệ thống tự động từ chối bài có nội dung{" "}
                <strong>chửi thề, tục tĩu</strong>, <strong>kỳ thị chủng tộc</strong>,
                hoặc <strong>kích động gây hấn</strong>.
              </p>
            </div>
          </div>

          <h2 className="mt-6 text-xs font-bold tracking-wide text-slate-500 uppercase">
            Định dạng nhận
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {DUOI_CHO_PHEP.map((d) => (
              <li
                key={d}
                className={`rounded-full px-3 py-1 text-xs font-bold ${MAU_LOAI[d]}`}
              >
                {d.toUpperCase()}
              </li>
            ))}
            <li className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              tối đa {MAX_MB}MB
            </li>
          </ul>

          <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-4">
            <p className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Newspaper size={16} className="text-blue-700" />
              Đọc bài viết
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
              Kinh nghiệm tự học lập trình và các kỹ thuật lập trình web.
            </p>
            <Link
              href="/blog"
              className="mt-3 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-700"
            >
              Xem bài viết
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
