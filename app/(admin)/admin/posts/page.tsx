"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Eye,
  FileText,
  ImageOff,
  Loader2,
  Newspaper,
  PenLine,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import SafeImage from "@/src/components/ui/SafeImage";
import { getErrorMessage } from "@/src/services/apiHelper";
import { postService, type BlogPost, type Topic } from "@/src/services/post";

type TrangThai = "" | "published" | "draft";

const MOI_TRANG = 20;

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [tong, setTong] = useState(0);
  const [trang, setTrang] = useState(1);
  const [tongTrang, setTongTrang] = useState(1);
  const [topics, setTopics] = useState<Topic[]>([]);

  const [dangTai, setDangTai] = useState(true);
  const [loi, setLoi] = useState("");

  const [trangThai, setTrangThai] = useState<TrangThai>("");
  const [chuDe, setChuDe] = useState("");
  const [tuKhoa, setTuKhoa] = useState("");
  const [tuKhoaDangDung, setTuKhoaDangDung] = useState("");

  const tai = async (p: number, tt: TrangThai, cd: string, q: string) => {
    setDangTai(true);
    setLoi("");
    try {
      const res = await postService.getAdminPosts({
        page: p,
        limit: MOI_TRANG,
        status: tt || undefined,
        topic: cd || undefined,
        q,
      });
      setPosts(res.posts);
      setTong(res.total);
      setTrang(res.page);
      setTongTrang(res.totalPages);
    } catch (err) {
      setLoi(getErrorMessage(err, "Không tải được danh sách bài viết."));
    } finally {
      setDangTai(false);
    }
  };

  // Lan tai dau tien. Khong goi tai() o day vi ham do dat setDangTai(true)
  // ngay lap tuc - dat state thang trong than effect gay them mot vong ve lai.
  // dangTai da la true san tu dau nen chi can dat lai state trong callback.
  useEffect(() => {
    let huy = false;

    postService
      .getTopics()
      .then((t) => {
        if (!huy) setTopics(t);
      })
      .catch(() => {
        if (!huy) setTopics([]);
      });

    postService
      .getAdminPosts({ page: 1, limit: MOI_TRANG })
      .then((res) => {
        if (huy) return;
        setPosts(res.posts);
        setTong(res.total);
        setTrang(res.page);
        setTongTrang(res.totalPages);
      })
      .catch((err) => {
        if (!huy) setLoi(getErrorMessage(err, "Không tải được danh sách bài viết."));
      })
      .finally(() => {
        if (!huy) setDangTai(false);
      });

    return () => {
      huy = true;
    };
  }, []);

  // Doi bo loc thi luon ve trang 1: giu nguyen trang 3 khi bo loc chi con mot
  // trang se ra danh sach rong ma khong ro tai sao.
  const doiTrangThai = (v: TrangThai) => {
    setTrangThai(v);
    tai(1, v, chuDe, tuKhoaDangDung);
  };

  const doiChuDe = (v: string) => {
    setChuDe(v);
    tai(1, trangThai, v, tuKhoaDangDung);
  };

  const timKiem = (e: React.FormEvent) => {
    e.preventDefault();
    setTuKhoaDangDung(tuKhoa);
    tai(1, trangThai, chuDe, tuKhoa);
  };

  const xoa = async (p: BlogPost) => {
    if (!window.confirm(`Xóa bài "${p.title}"? Thao tác này không hoàn tác được.`))
      return;
    try {
      await postService.deletePost(p._id);
      // Xoa bai cuoi cung cua trang -> lui ve trang truoc, khong de trang rong.
      const conLai = posts.length - 1;
      tai(
        conLai === 0 && trang > 1 ? trang - 1 : trang,
        trangThai,
        chuDe,
        tuKhoaDangDung,
      );
    } catch (err) {
      alert(getErrorMessage(err, "Xóa thất bại."));
    }
  };

  const tenChuDe = (slug: string) => topics.find((t) => t.slug === slug)?.name ?? slug;

  const oLoc =
    "rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 focus:border-blue-500 focus:outline-none";

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="flex items-center gap-2 text-2xl font-bold text-slate-800">
            <Newspaper className="text-blue-600" size={26} />
            Cẩm nang môn học
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Bài viết do Admin biên tập, hiện ở trang <code>/blog</code>. Tài liệu học viên
            tự đăng nằm ở mục khác.
          </p>
        </div>
        <Link
          href="/admin/post-create"
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-md shadow-blue-600/10 transition-all hover:bg-blue-700"
        >
          <Plus size={18} />
          Viết bài mới
        </Link>
      </div>

      {/* BỘ LỌC */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <form onSubmit={timKiem} className="flex items-center gap-2">
          <div className="relative">
            <Search
              size={16}
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
            />
            <input
              value={tuKhoa}
              onChange={(e) => setTuKhoa(e.target.value)}
              placeholder="Tìm theo tiêu đề"
              aria-label="Tìm bài viết"
              className={`${oLoc} w-56 pl-9`}
            />
          </div>
          <button
            type="submit"
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50"
          >
            Tìm
          </button>
        </form>

        <select
          value={trangThai}
          onChange={(e) => doiTrangThai(e.target.value as TrangThai)}
          aria-label="Lọc theo trạng thái"
          className={oLoc}
        >
          <option value="">Mọi trạng thái</option>
          <option value="published">Đã đăng</option>
          <option value="draft">Bản nháp</option>
        </select>

        <select
          value={chuDe}
          onChange={(e) => doiChuDe(e.target.value)}
          aria-label="Lọc theo chủ đề"
          className={oLoc}
        >
          <option value="">Mọi chủ đề</option>
          {topics.map((t) => (
            <option key={t.slug} value={t.slug}>
              {t.name}
            </option>
          ))}
        </select>

        <span className="ml-auto text-sm text-slate-500">
          {tong} bài{tuKhoaDangDung && ` khớp "${tuKhoaDangDung}"`}
        </span>
      </div>

      {/* DANH SÁCH */}
      {dangTai ? (
        <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white text-slate-500">
          <Loader2 className="animate-spin text-blue-600" size={32} />
          <p className="text-sm font-medium">Đang tải bài viết...</p>
        </div>
      ) : loi ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-rose-100 bg-rose-50 p-6 text-center text-rose-700">
          <AlertCircle size={32} />
          <p className="font-semibold">Đã xảy ra lỗi dữ liệu</p>
          <p className="text-sm">{loi}</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500">
          <FileText className="mx-auto mb-3 text-slate-400" size={48} />
          <p className="font-medium text-slate-600">
            {tuKhoaDangDung || trangThai || chuDe
              ? "Không có bài nào khớp bộ lọc"
              : "Chưa có bài viết nào"}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Bấm &quot;Viết bài mới&quot; ở góc trên để bắt đầu.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((p) => (
            <div
              key={p._id}
              className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-slate-300"
            >
              <div className="relative h-[68px] w-[120px] flex-shrink-0 overflow-hidden rounded-xl bg-slate-100">
                {p.thumbnail ? (
                  <SafeImage
                    src={p.thumbnail}
                    alt=""
                    fill
                    sizes="120px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-300">
                    <ImageOff size={20} />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-lg px-2 py-0.5 text-xs font-bold ${
                      p.isPublished === false
                        ? "bg-amber-50 text-amber-700"
                        : "bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    {p.isPublished === false ? "Bản nháp" : "Đã đăng"}
                  </span>
                  <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                    {tenChuDe(p.topic)}
                  </span>
                </div>

                <h4 className="mt-1.5 truncate text-[16px] font-bold text-slate-800">
                  {p.title}
                </h4>
                <p className="mt-0.5 truncate text-sm text-slate-500">{p.excerpt}</p>

                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                  <span>{p.author?.name || "Ẩn danh"}</span>
                  <span>
                    {new Date(p.createdAt).toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Eye size={13} />
                    {p.views} lượt xem
                  </span>
                </div>
              </div>

              <div className="flex flex-shrink-0 items-center gap-1">
                {p.isPublished !== false && (
                  <Link
                    href={`/blog/${p.slug}`}
                    target="_blank"
                    title="Xem trang thật"
                    className="rounded-xl p-2 text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-800"
                  >
                    <Eye size={18} />
                  </Link>
                )}
                <Link
                  href={`/admin/post-create?id=${p._id}`}
                  title="Sửa bài viết"
                  className="rounded-xl p-2 text-slate-500 transition-all hover:bg-blue-50 hover:text-blue-600"
                >
                  <PenLine size={18} />
                </Link>
                <button
                  type="button"
                  onClick={() => xoa(p)}
                  title="Xóa bài viết"
                  className="rounded-xl p-2 text-slate-500 transition-all hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tongTrang > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            disabled={trang <= 1 || dangTai}
            onClick={() => tai(trang - 1, trangThai, chuDe, tuKhoaDangDung)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Trước
          </button>
          <span className="px-2 text-sm text-slate-500">
            Trang {trang}/{tongTrang}
          </span>
          <button
            type="button"
            disabled={trang >= tongTrang || dangTai}
            onClick={() => tai(trang + 1, trangThai, chuDe, tuKhoaDangDung)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
}
