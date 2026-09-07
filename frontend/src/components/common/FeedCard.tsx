import Link from "next/link";
import { CircleCheck } from "lucide-react";
import SafeImage from "@/src/components/ui/SafeImage";
import AnhDaiDien from "@/src/components/ui/AnhDaiDien";
import CardActions, { type MucMenu } from "@/src/components/common/CardActions";
import type { ReactNode } from "react";

// The dung chung cho danh sach bai viet (blog) va danh sach tai lieu chia se.
// Hai noi cung mot hinh dang: tac gia + nut luu / menu o hang tren, tieu de +
// mo ta + dong thong tin ben trai, anh xem truoc ben phai.
//
// Phan khac nhau (tag / dinh dang file / luot tai) truyen vao qua `meta`, nen
// khong phai nhoi them co dieu kien vao trong the.

interface Props {
  href: string;
  tacGia: string;
  anhTacGia?: string | null;
  /** Dau tich xanh canh ten - danh cho giang vien / quan tri */
  daXacThuc?: boolean;
  tieuDe: string;
  moTa: string;
  /** Dong duoi cung: tag, thoi gian, so luot... */
  meta: ReactNode;
  anh?: { src: string; alt: string } | null;
  /** Muc rieng cua tung trang trong menu ba cham, vi du "Xoa" */
  themMuc?: MucMenu[];
}

export default function FeedCard({
  href,
  tacGia,
  anhTacGia,
  daXacThuc = false,
  tieuDe,
  moTa,
  meta,
  anh,
  themMuc,
}: Props) {
  return (
    <article className="relative rounded-xl border border-slate-200 bg-white px-6 py-5 transition focus-within:border-blue-500 hover:border-slate-300 hover:shadow-sm">
      {/* Hang tac gia */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span
            aria-hidden
            className={`shrink-0 rounded-full ${daXacThuc ? "ring-2 ring-orange-400" : ""}`}
          >
            <AnhDaiDien
              src={anhTacGia}
              ten={tacGia}
              size={28}
              nenChuCai="bg-slate-200 text-slate-600"
            />
          </span>

          <span className="truncate text-sm font-semibold text-slate-800">{tacGia}</span>

          {daXacThuc && (
            // fill + stroke trang: ra dung dau tich tron dac nhu ban mau,
            // thay vi vien rong mac dinh cua lucide.
            <CircleCheck
              size={15}
              className="shrink-0 fill-blue-600 text-white"
              aria-label="Tài khoản đã xác thực"
            />
          )}
        </div>

        {/* Nam tren lop phu cua tieu de (z-10), neu khong thi bam nut lai
            dieu huong sang trang chi tiet. */}
        <div className="relative z-10">
          <CardActions href={href} tieuDe={tieuDe} themMuc={themMuc} />
        </div>
      </div>

      {/* Than the */}
      <div className="mt-4 flex items-start gap-6">
        <div className="min-w-0 flex-1">
          {/* Neo that nam o tieu de - nguoi dung ban phim tab toi day, bo doc
              man hinh doc ra ten bai thay vi "lien ket". Lop phu tuyet doi cho
              phep bam vao cho trong cua the. */}
          <h2 className="text-[20px] leading-snug font-bold text-slate-900">
            <Link href={href} className="transition hover:text-blue-700">
              <span className="absolute inset-0" aria-hidden />
              {tieuDe}
            </Link>
          </h2>

          {moTa && (
            <p className="mt-2 line-clamp-2 text-[15px] leading-relaxed text-slate-600">
              {moTa}
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-sm text-slate-500">
            {meta}
          </div>
        </div>

        {anh && (
          <Link
            href={href}
            tabIndex={-1}
            aria-hidden
            className="relative hidden h-[100px] w-[196px] shrink-0 overflow-hidden rounded-lg bg-slate-100 sm:block"
          >
            <SafeImage
              src={anh.src}
              alt={anh.alt}
              fill
              sizes="196px"
              className="object-cover"
            />
          </Link>
        )}
      </div>
    </article>
  );
}
