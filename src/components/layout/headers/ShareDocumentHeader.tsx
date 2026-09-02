"use client";

import Link from "next/link";
import { FileUp } from "lucide-react";
import HeaderUserMenu from "./HeaderUserMenu";

export default function ShareDocumentHeader() {
  return (
    <div className="border-b bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-10">
          <Link href="/share-document" className="flex shrink-0 items-center gap-2.5">
            <FileUp size={22} className="text-blue-600" />
            <span className="text-lg font-extrabold text-slate-900">
              Chia sẻ tài liệu
            </span>
          </Link>

          <nav className="hidden items-center gap-8 text-[15px] text-slate-700 lg:flex">
            <Link href="/blog" className="transition hover:text-blue-600">
              Cẩm nang môn học
            </Link>
            <Link href="/courses" className="transition hover:text-blue-600">
              Khóa học
            </Link>
            <Link href="/help" className="transition hover:text-blue-600">
              Trợ giúp
            </Link>
          </nav>
        </div>

        <HeaderUserMenu />
      </div>
    </div>
  );
}
