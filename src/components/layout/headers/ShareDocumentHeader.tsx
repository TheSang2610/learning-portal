"use client";

import Link from "next/link";
import { FileUp } from "lucide-react";
import HeaderUserMenu from "./HeaderUserMenu";

export default function ShareDocumentHeader() {
  return (
    <div className="bg-white border-b">
      <div className="max-w-7xl mx-auto h-16 px-6 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <Link href="/share-document" className="flex items-center gap-2.5 shrink-0">
            <FileUp size={22} className="text-blue-600" />
            <span className="text-lg font-extrabold text-slate-900">
              Chia sẻ tài liệu
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-8 text-[15px] text-slate-700">
            <Link href="/blog" className="hover:text-blue-600 transition">
              Cẩm nang môn học
            </Link>
            <Link href="/courses" className="hover:text-blue-600 transition">
              Khóa học
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
