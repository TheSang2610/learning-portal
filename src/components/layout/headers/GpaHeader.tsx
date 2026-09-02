"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import HeaderUserMenu from "./HeaderUserMenu";

// Ba cong cu diem dung chung header nay, nen dieu huong giua chung ngay tren
// thanh dau trang. Muc dang xem duoc to dam de biet minh dang o dau.
const TOOLS = [
  { href: "/gpa-calculator", label: "Hồ sơ điểm" },
  { href: "/calc-point", label: "Tính điểm tổng kết" },
  { href: "/convert-10-to-4", label: "Quy đổi 10 → 4" },
];

export default function GpaHeader() {
  const pathname = usePathname();

  return (
    <div className="border-b bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-10">
          {/* Cung kieu chu voi logo o IndividualsHeader de dong bo toan trang */}
          <Link
            href="/"
            className="shrink-0 text-[38px] font-bold tracking-tight text-blue-600"
          >
            coursera
          </Link>

          <nav className="hidden items-center gap-8 text-[15px] lg:flex">
            {TOOLS.map((t) => {
              const active = pathname === t.href;
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  aria-current={active ? "page" : undefined}
                  className={
                    active
                      ? "font-bold text-blue-600"
                      : "text-slate-700 transition hover:text-blue-600"
                  }
                >
                  {t.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <HeaderUserMenu />
      </div>
    </div>
  );
}
