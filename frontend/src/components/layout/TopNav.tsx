"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TopNav() {
  const pathname = usePathname();

  const menus = [
    {
      // Truoc day ghi "Individuals" - chu tieng Anh duy nhat nam giua ba muc
      // tieng Viet, va cung khong dung nghia: duong dan la "/" nen day la tab
      // trang chu chu khong phai muc phan loai nguoi dung.
      title: "Trang chủ",
      href: "/",
    },
    {
      title: "Cẩm nang môn học",
      href: "/blog",
    },
    {
      title: "Chia sẻ tài liệu",
      href: "/share-document",
    },
    {
      title: "Tính điểm GPA",
      href: "/gpa-calculator",
    },
  ];

  return (
    <div className="border-b border-[#1d2230] bg-[#0b0f19] text-white">
      <div className="mx-auto flex h-10 max-w-7xl items-center px-6">
        {menus.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex h-full items-center px-6 text-sm font-semibold transition ${
                active ? "text-white" : "text-gray-300 hover:text-white"
              } `}
            >
              {item.title}

              {active && (
                <span className="absolute bottom-0 left-0 h-[3px] w-full bg-white" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
