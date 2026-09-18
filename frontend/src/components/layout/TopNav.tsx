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
      {/* Cuon ngang tren dien thoai thay vi ep bon muc vao 390px.
          Truoc day khong co overflow-x-auto: bon muc x px-6 rong hon man hinh
          iPhone 12 Pro nen chu bi ep xuong dong, roi h-10 cat cut - "Tinh diem
          GPA" chi con thay nua tren. Vuot de xem het thi van doc duoc ca bon.
          An thanh cuon vi day la dai dieu huong, khong phai vung noi dung. */}
      <div className="mx-auto flex h-10 max-w-7xl items-center overflow-x-auto px-4 [-ms-overflow-style:none] [scrollbar-width:none] sm:px-6 [&::-webkit-scrollbar]:hidden">
        {menus.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              // shrink-0 + whitespace-nowrap: khong co hai cai nay thi flex tu
              // bop tung muc lai cho vua man hinh, va do chinh la cai lam chu
              // xuong dong roi bi cat.
              className={`relative flex h-full shrink-0 items-center px-4 text-sm font-semibold whitespace-nowrap transition sm:px-6 ${
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
