"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TopNav() {
  const pathname = usePathname();

  // `nhan` la ten day du, `nhanNgan` la ten dung tren dien thoai.
  //
  // Bon ten day du cong lai rong khoang 533px, trong khi iPhone 12 Pro chi co
  // 390px. Thu gon con chu khoa la vua man hinh, khong phai vuot sang ngang
  // moi thay het muc cuoi - va van doc ra ngay day la muc gi.
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
      nhanNgan: "Cẩm nang",
      href: "/blog",
    },
    {
      title: "Chia sẻ tài liệu",
      nhanNgan: "Tài liệu",
      href: "/share-document",
    },
    {
      title: "Tính điểm GPA",
      nhanNgan: "GPA",
      href: "/gpa-calculator",
    },
  ];

  return (
    <div className="border-b border-[#1d2230] bg-[#0b0f19] text-white">
      {/* Bon muc phai VUA man hinh 390px, khong phai vuot sang ngang moi thay
          het - do la viec cua nhan rut gon o tren.
          overflow-x-auto chi la luoi an toan cho truong hop them muc moi hoac
          co ten dai hon du tinh: luc do no cuon duoc thay vi bop chu xuong
          dong roi bi h-10 cat cut, dung canh cu cua muc "Tinh diem GPA".
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
              className={`relative flex h-full shrink-0 items-center px-3 text-sm font-semibold whitespace-nowrap transition md:px-6 ${
                active ? "text-white" : "text-gray-300 hover:text-white"
              } `}
            >
              {/* Hai the chu khong phai mot chuoi doi theo be ngang: be ngang
                  chi biet duoc sau khi chay, ma doc no trong lan ve dau tien
                  se lam HTML dung san lech voi HTML trinh duyet ve ra. De CSS
                  quyet dinh thi ca hai ben deu ve giong nhau. */}
              <span className="md:hidden">{item.nhanNgan ?? item.title}</span>
              <span className="hidden md:inline">{item.title}</span>

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
