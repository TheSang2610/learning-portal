import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Eye, User } from "lucide-react";
import ArticleWithOutline from "@/src/components/common/ArticleWithOutline";
import SafeImage from "@/src/components/ui/SafeImage";
import { thoiGianTuongDoi, phutDoc } from "@/src/components/common/thoiGian";
import type { BlogPost } from "@/src/services/post";
import { GOC_API } from "@/src/services/serverFetch";

export const revalidate = 30;

async function layBai(slug: string): Promise<BlogPost | null> {
  try {
    const res = await fetch(`${GOC_API}/api/posts/${encodeURIComponent(slug)}`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) return null;
    return (await res.json()) as BlogPost;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const bai = await layBai(slug);
  if (!bai) return { title: "Không tìm thấy bài viết" };
  return { title: bai.title, description: bai.excerpt };
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const bai = await layBai(slug);
  if (!bai) notFound();

  return (
    <div className="min-h-screen bg-[#f8fafc] py-8">
      <div className="mx-auto max-w-6xl px-4">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 transition hover:text-blue-700"
        >
          <ArrowLeft size={16} />
          Về danh sách bài viết
        </Link>

        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {bai.thumbnail && (
            // aspect-[16/6] thay vi chieu cao co dinh: anh khong bi bop meo
            // tren man hinh hep, va khong tao khoang trong tren man hinh rong.
            <div className="relative aspect-[16/6] w-full bg-slate-100">
              <SafeImage
                src={bai.thumbnail}
                alt={bai.title}
                fill
                sizes="(max-width: 1152px) 100vw, 1152px"
                className="object-cover"
                priority
              />
            </div>
          )}

          <div className="p-6">
            <div className="flex flex-wrap items-center gap-2">
              {bai.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-md bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700"
                >
                  {t}
                </span>
              ))}
            </div>

            <h1 className="mt-3 text-3xl leading-tight font-extrabold text-slate-900">
              {bai.title}
            </h1>
            <p className="mt-3 text-base leading-relaxed text-slate-600">{bai.excerpt}</p>

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-slate-100 pt-4 text-sm text-slate-600">
              <span className="inline-flex items-center gap-1.5">
                <User size={15} className="text-slate-400" />
                {bai.author?.name || "Ẩn danh"}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays size={15} className="text-slate-400" />
                {thoiGianTuongDoi(bai.createdAt)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Eye size={15} className="text-slate-400" />
                {bai.views} lượt xem
              </span>
              <span>{phutDoc(bai.content ?? "")} phút đọc</span>
            </div>
          </div>
        </div>

        <ArticleWithOutline
          content={bai.content ?? ""}
          goiYKhiTrong="Bài viết này chưa chia mục."
        />
      </div>
    </div>
  );
}
