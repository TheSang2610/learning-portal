"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  ExternalLink,
  Eye,
  ImageOff,
  ListTree,
  Loader2,
  PenLine,
  Save,
} from "lucide-react";
import SafeImage from "@/src/components/ui/SafeImage";
import { layMucLuc, phanTichNoiDung } from "@/src/components/common/articleOutline";
import { laHtml, neoHoaTieuDe } from "@/src/components/common/htmlBaiViet";
import TrinhSoanBai from "@/src/components/admin/TrinhSoanBai";
import { getErrorMessage } from "@/src/services/apiHelper";
import { postService, type Topic } from "@/src/services/post";

const MAX_TIEU_DE = 200;
const MAX_MO_TA = 400;
// Con so nay do phan NGUOI VIET GO VAO, khong phai phan duoc luu.
//
// Rong tay hon han gioi han 120.000 cua co so du lieu vi viec thuong lam nhat
// la dan ca doan HTML tu mot trang bao vao: doan tho keo theo script, khung
// quang cao va hang tram class, co the gap may lan bai that. May chu se cat
// het truoc khi luu. De maxLength dung bang gioi han luu tru thi cu dan la bi
// cat cut giua mot the, hong ca bai - te hon nhieu.
const MAX_NOI_DUNG = 400000;

function AdminPostEditor() {
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get("id");
  const laSua = Boolean(id);

  const [topics, setTopics] = useState<Topic[]>([]);
  const [dangNap, setDangNap] = useState(laSua);

  const [tieuDe, setTieuDe] = useState("");
  const [moTa, setMoTa] = useState("");
  const [noiDung, setNoiDung] = useState("");
  const [chuDe, setChuDe] = useState("others");
  const [tags, setTags] = useState("");
  const [anh, setAnh] = useState("");
  const [daDang, setDaDang] = useState(true);
  const [slug, setSlug] = useState("");

  const [dangLuu, setDangLuu] = useState(false);
  const [loi, setLoi] = useState("");
  const [thanhCong, setThanhCong] = useState("");

  useEffect(() => {
    postService
      .getTopics()
      .then(setTopics)
      .catch(() => setTopics([]));
  }, []);

  // Lay bai cu khi sua. Dung /admin/:id chu khong phai /:slug vi ham cong khai
  // co dinh loc isPublished: true - ban nhap se ra 404.
  useEffect(() => {
    if (!id) return;
    let huy = false;
    postService
      .getAdminPost(id)
      .then((p) => {
        if (huy) return;
        setTieuDe(p.title);
        setMoTa(p.excerpt);
        setNoiDung(p.content ?? "");
        setChuDe(p.topic);
        setTags(p.tags.join(", "));
        setAnh(p.thumbnail ?? "");
        setDaDang(p.isPublished !== false);
        setSlug(p.slug);
      })
      .catch((err) => {
        if (!huy) setLoi(getErrorMessage(err, "Không tải được bài viết."));
      })
      .finally(() => {
        if (!huy) setDangNap(false);
      });
    return () => {
      huy = true;
    };
  }, [id]);

  useEffect(() => {
    if (!thanhCong) return;
    const t = setTimeout(() => setThanhCong(""), 4000);
    return () => clearTimeout(t);
  }, [thanhCong]);

  // Muc luc o trang doc duoc dung tu chinh nhung dong nay. Hien ra day de
  // nguoi viet biet ngay dong nao da thanh de muc, thay vi dang xong moi phat
  // hien menu ben trai bai trong khong.
  const mucLuc = useMemo(
    () =>
      laHtml(noiDung)
        ? neoHoaTieuDe(noiDung).mucLuc
        : layMucLuc(phanTichNoiDung(noiDung)),
    [noiDung],
  );

  const luu = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoi("");
    setThanhCong("");

    if (!tieuDe.trim() || !moTa.trim() || !noiDung.trim()) {
      setLoi("Vui lòng nhập đầy đủ tiêu đề, mô tả ngắn và nội dung.");
      return;
    }

    const dl = {
      title: tieuDe.trim(),
      excerpt: moTa.trim(),
      content: noiDung.trim(),
      topic: chuDe,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
        .slice(0, 5),
      thumbnail: anh.trim(),
      isPublished: daDang,
    };

    setDangLuu(true);
    try {
      if (id) {
        const p = await postService.updatePost(id, dl);
        setSlug(p.slug);
        setThanhCong("Đã lưu thay đổi.");
      } else {
        const p = await postService.createPost(dl);
        setThanhCong(daDang ? "Đã đăng bài viết." : "Đã lưu bản nháp.");
        // Chuyen sang che do sua, neu khong bam luu lan nua se tao bai thu hai.
        router.replace(`/admin/post-create?id=${p._id}`);
      }
    } catch (err) {
      // Bai bi bo loc noi dung chan cung ve day - thong bao tu may chu noi ro
      // truong nao vi pham.
      setLoi(getErrorMessage(err, "Không lưu được bài viết."));
    } finally {
      setDangLuu(false);
    }
  };

  if (dangNap) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white text-slate-500">
        <Loader2 className="animate-spin text-blue-600" size={32} />
        <p className="text-sm font-medium">Đang mở bài viết...</p>
      </div>
    );
  }

  const oNhap =
    "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 transition-all focus:border-blue-500 focus:bg-white focus:outline-none";

  return (
    <form onSubmit={luu} className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/admin/posts"
            className="mb-1 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-blue-600"
          >
            <ArrowLeft size={15} />
            Về danh sách bài viết
          </Link>
          <h3 className="flex items-center gap-2 text-2xl font-bold text-slate-800">
            <PenLine className="text-blue-600" size={26} />
            {laSua ? "Sửa bài viết" : "Viết bài mới"}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Bài đăng ở đây hiện trên trang Cẩm nang môn học (/blog) cho tất cả mọi người
            đọc.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {laSua && daDang && slug && (
            <Link
              href={`/blog/${slug}`}
              target="_blank"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition-all hover:bg-slate-50"
            >
              <ExternalLink size={16} />
              Xem trang thật
            </Link>
          )}
          <button
            type="submit"
            disabled={dangLuu}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-md shadow-blue-600/10 transition-all hover:bg-blue-700 disabled:bg-blue-400"
          >
            {dangLuu ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <Save size={16} />
            )}
            {laSua ? "Lưu thay đổi" : daDang ? "Đăng bài" : "Lưu bản nháp"}
          </button>
        </div>
      </div>

      {thanhCong && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
          <CheckCircle className="flex-shrink-0 text-emerald-500" size={20} />
          <span className="text-sm font-medium">{thanhCong}</span>
        </div>
      )}
      {loi && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-800">
          <AlertCircle className="mt-0.5 flex-shrink-0 text-rose-500" size={20} />
          <span className="text-sm font-medium">{loi}</span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* ============================ CỘT TRÁI ============================ */}
        <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <label
              htmlFor="tieu-de"
              className="mb-1.5 block text-sm font-semibold text-slate-700"
            >
              Tiêu đề <span className="text-red-500">*</span>
            </label>
            <input
              id="tieu-de"
              value={tieuDe}
              onChange={(e) => setTieuDe(e.target.value)}
              maxLength={MAX_TIEU_DE}
              placeholder="VD: React 19: Server Components, hooks mới và cách tối ưu app web"
              className={`${oNhap} text-base font-semibold`}
            />
            <p className="mt-1 text-right text-xs text-slate-400">
              {tieuDe.length}/{MAX_TIEU_DE}
            </p>
          </div>

          <div>
            <label
              htmlFor="mo-ta"
              className="mb-1.5 block text-sm font-semibold text-slate-700"
            >
              Mô tả ngắn <span className="text-red-500">*</span>
            </label>
            <textarea
              id="mo-ta"
              value={moTa}
              onChange={(e) => setMoTa(e.target.value)}
              maxLength={MAX_MO_TA}
              rows={3}
              placeholder="Hai đến ba câu tóm tắt. Đoạn này hiện ở thẻ ngoài danh sách, nên đừng chép câu mở đầu của bài vào."
              className={`${oNhap} resize-none leading-relaxed`}
            />
            <p className="mt-1 text-right text-xs text-slate-400">
              {moTa.length}/{MAX_MO_TA}
            </p>
          </div>

          <div>
            <label
              htmlFor="noi-dung"
              className="mb-1.5 block text-sm font-semibold text-slate-700"
            >
              Nội dung bài <span className="text-red-500">*</span>
            </label>
            <TrinhSoanBai
              id="noi-dung"
              giaTri={noiDung}
              doiGiaTri={setNoiDung}
              toiDa={MAX_NOI_DUNG}
            />
            <p className="mt-1 flex items-center justify-between gap-4 text-xs text-slate-400">
              <span>
                Gõ chữ thường vẫn chạy như cũ. Dán HTML vào thì máy chủ chỉ giữ lại thẻ
                bài viết — script và khung quảng cáo bị bỏ.
              </span>
              <span className="shrink-0">
                {noiDung.length.toLocaleString("vi-VN")} ký tự
              </span>
            </p>
          </div>
        </div>

        {/* ============================ CỘT PHẢI ============================ */}
        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h4 className="mb-3 text-sm font-bold text-slate-800">Xuất bản</h4>

            <label
              htmlFor="trang-thai"
              className="mb-1.5 block text-xs font-semibold text-slate-600"
            >
              Trạng thái
            </label>
            <select
              id="trang-thai"
              value={daDang ? "published" : "draft"}
              onChange={(e) => setDaDang(e.target.value === "published")}
              className={oNhap}
            >
              <option value="published">Đã đăng — mọi người đọc được</option>
              <option value="draft">Bản nháp — chỉ admin thấy</option>
            </select>

            {laSua && slug && (
              <p className="mt-3 text-xs leading-relaxed break-all text-slate-500">
                Đường dẫn: <code className="rounded bg-slate-100 px-1">/blog/{slug}</code>
                {daDang && (
                  <>
                    <br />
                    Bài đã đăng thì đổi tiêu đề không đổi đường dẫn, nên link đã chia sẻ
                    ra ngoài vẫn sống.
                  </>
                )}
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h4 className="mb-3 text-sm font-bold text-slate-800">Phân loại</h4>

            <label
              htmlFor="chu-de"
              className="mb-1.5 block text-xs font-semibold text-slate-600"
            >
              Chủ đề
            </label>
            <select
              id="chu-de"
              value={chuDe}
              onChange={(e) => setChuDe(e.target.value)}
              className={oNhap}
            >
              {topics.length === 0 && <option value="others">Others</option>}
              {topics.map((t) => (
                <option key={t.slug} value={t.slug}>
                  {t.name}
                </option>
              ))}
            </select>

            <label
              htmlFor="tags"
              className="mt-4 mb-1.5 block text-xs font-semibold text-slate-600"
            >
              Tags{" "}
              <span className="font-normal text-slate-400">
                (cách nhau bằng dấu phẩy)
              </span>
            </label>
            <input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="React 19, hooks"
              className={oNhap}
            />
            <p className="mt-1 text-xs text-slate-400">
              Tối đa 5 tag. Tag đầu tiên hiện trên thẻ ngoài danh sách.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h4 className="mb-3 text-sm font-bold text-slate-800">Ảnh đại diện</h4>
            <input
              value={anh}
              onChange={(e) => setAnh(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              aria-label="Đường dẫn ảnh đại diện"
              className={oNhap}
            />
            <div className="relative mt-3 aspect-[16/9] w-full overflow-hidden rounded-xl bg-slate-100">
              {anh.trim() ? (
                <SafeImage
                  src={anh.trim()}
                  alt="Xem trước ảnh đại diện"
                  fill
                  sizes="320px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-1.5 text-slate-400">
                  <ImageOff size={24} />
                  <span className="text-xs">Chưa có ảnh</span>
                </div>
              )}
            </div>
          </div>

          {/* Kiem tra muc luc */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h4 className="mb-1 flex items-center gap-2 text-sm font-bold text-slate-800">
              <ListTree size={16} className="text-blue-600" />
              Mục lục nhận ra được
              <span className="ml-auto text-xs font-semibold text-slate-400">
                {mucLuc.length}
              </span>
            </h4>
            <p className="mb-3 text-xs leading-relaxed text-slate-500">
              Đây đúng là menu bên trái mà người đọc sẽ thấy.
            </p>

            {mucLuc.length === 0 ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
                Chưa dòng nào thành đề mục. Bấm <b>Tiêu đề lớn</b> để bọc dòng đang chọn
                trong{" "}
                <code className="rounded bg-amber-100 px-1 font-semibold">
                  &lt;h2&gt;
                </code>
                . Nếu gõ chữ thường thì mở đầu dòng bằng{" "}
                <code className="rounded bg-amber-100 px-1 font-semibold">Chương 1:</code>
                , <code className="rounded bg-amber-100 px-1 font-semibold">Mục 1.1</code>{" "}
                hoặc{" "}
                <code className="rounded bg-amber-100 px-1 font-semibold">
                  ## Tiêu đề
                </code>
                .
              </div>
            ) : (
              <ul className="space-y-1.5 text-sm">
                {mucLuc.map((m, i) => (
                  <li
                    key={`${m.id}-${i}`}
                    className="truncate text-slate-700"
                    style={{ paddingLeft: (m.level - 1) * 12 }}
                    title={m.text}
                  >
                    <span className="mr-1.5 text-slate-300">
                      {m.level === 1 ? "●" : m.level === 2 ? "○" : "–"}
                    </span>
                    {m.text}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
            <p className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Eye size={16} className="text-blue-700" />
              Bài phải qua bộ lọc nội dung
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
              Cả tiêu đề, mô tả ngắn lẫn nội dung đều bị kiểm. Bài chửi thề, kỳ thị chủng
              tộc hoặc kích động sẽ bị máy chủ từ chối, kèm thông báo nói rõ trường nào vi
              phạm.
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}

// useSearchParams() phai nam trong Suspense thi Next moi prerender tinh duoc.
export default function AdminPostCreatePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
        </div>
      }
    >
      <AdminPostEditor />
    </Suspense>
  );
}
