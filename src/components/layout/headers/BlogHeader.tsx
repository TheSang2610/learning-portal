"use client";

import Link from "next/link";
import { BookMarked } from "lucide-react";
import HeaderUserMenu from "./HeaderUserMenu";

export default function BlogHeader() {
  return (
    <div className="bg-white border-b">
      <div className="max-w-7xl mx-auto h-16 px-6 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <Link href="/blog" className="flex items-center gap-2.5 shrink-0">
            <BookMarked size={22} className="text-blue-600" />
            <span className="text-lg font-extrabold text-slate-900">
              Cẩm nang môn học
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-8 text-[15px] text-slate-700">
            <Link href="/courses" className="hover:text-blue-600 transition">
              Khóa học
            </Link>
            <Link href="/share-document" className="hover:text-blue-600 transition">
              Chia sẻ tài liệu
            </Link>
            <Link href="/help" className="hover:text-blue-600 transition">
              Trợ giúp
            </Link>
          </nav>
        </div>

        <HeaderUserMenu />
      </div>
    </div>
  );
}
