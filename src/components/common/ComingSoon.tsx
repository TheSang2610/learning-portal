import Link from "next/link";
import type { LucideIcon } from "lucide-react";

// Khung dung chung cho cac trang da co trong thanh dieu huong nhung chua co
// chuc nang. Tot hon la de link 404, va noi ro trang se lam gi de nguoi dung
// khong tuong la trang bi loi.

interface Props {
  icon: LucideIcon;
  title: string;
  desc: string;
  /** Nhung viec trang nay se lam khi hoan thien */
  planned: string[];
}

export default function ComingSoon({ icon: Icon, title, desc, planned }: Props) {
  return (
    <div className="min-h-screen bg-[#f8fafc] py-12">
      <div className="mx-auto max-w-3xl px-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
            <Icon size={26} className="text-blue-700" />
          </div>

          <h1 className="mt-5 text-2xl font-extrabold text-slate-900">{title}</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-700">{desc}</p>

          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-sm font-semibold text-amber-900">Trang đang được xây dựng</p>
            <p className="mt-1 text-sm text-amber-900">
              Nội dung dưới đây là những gì trang sẽ có, hiện chưa hoạt động.
            </p>
          </div>

          <ul className="mt-5 space-y-2.5">
            {planned.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-slate-700">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                {item}
              </li>
            ))}
          </ul>

          <Link
            href="/"
            className="mt-7 inline-block rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
