import { Suspense } from "react";
import { Be_Vietnam_Pro, Lexend } from "next/font/google";
import "../globals.css";
import Header from "@/src/components/layout/Header";
import Footer from "@/src/components/layout/Footer";
import NapNguoiDung from "@/src/components/common/NapNguoiDung";
import { layTuMayChu, hoacNull } from "@/src/services/serverFetch";
import type { Category } from "@/src/services/categoryService";
import type { Course } from "@/src/services/course";
import type { ProviderData } from "@/src/services/provider";

// Hai bo chu nay CHI nap o khu vuc hoc vien. Trang quan tri co layout rieng
// va khong dat hai bien nay, nen no van dung Inter nhu cu - doi giao dien
// trang chu khong keo theo viec doi mau va chu cua ca trang admin.
//
// Be Vietnam Pro: bo chu ve rieng cho dau tieng Viet. Dau mu, dau nga, chu
// "ữ" "ỗ" "ế" trong cac bo chu he thong thuong bi ghep tu font khac nen dat
// lech va nang nhe khong deu.
const chuThan = Be_Vietnam_Pro({
  subsets: ["vietnamese", "latin"],
  weight: ["400", "500", "600"],
  variable: "--chu-than",
  display: "swap",
});

// Lexend: ve ra de tang toc do doc, co nghien cuu kem theo. Dung cho tieu de.
const chuHien = Lexend({
  subsets: ["vietnamese", "latin"],
  weight: ["500", "700", "800"],
  variable: "--chu-hien",
  display: "swap",
});

export default async function PortalRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Footer nam duoi MOI trang portal. Truoc day no tu goi ba API sau khi
  // hydrate, nen trang nao cung keo theo ba luot mang va ba khung xam o chan.
  //
  // Lay o day thi Next dem theo revalidate, va vi trang chu goi dung nhung
  // duong nay voi cung tham so nen hai ben dung chung mot ban dem.
  const [categories, homeSections, providers] = await Promise.all([
    layTuMayChu<Category[]>("/api/categories", [], 300),
    layTuMayChu<{ success?: boolean; data?: { mostPopular?: Course[] } }>(
      "/api/courses/home-sections",
      {},
      120,
    ),
    layTuMayChu<ProviderData[]>("/api/providers", [], 300),
  ]);

  const phoBien = homeSections?.success ? (homeSections.data?.mostPopular ?? []) : [];

  return (
    <html
      lang="vi"
      className={`${chuThan.variable} ${chuHien.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased">
        {/* Hoi may chu "toi la ai" mot lan. Danh tinh nam trong RAM, khong
            con ghi xuong localStorage - xem src/hooks/nguoiDungLuu.ts. */}
        <NapNguoiDung />
        {/* Header goi useSearchParams(). Khong boc Suspense thi TOAN BO trang portal
            khong prerender tinh duoc -> moi luot xem deu ton mot lan chay serverless. */}
        <Suspense fallback={<div className="h-[104px]" />}>
          <Header />
        </Suspense>
        {/* 40px topbar + 64px header */}
        <main className="pt-[104px]">{children}</main>
        <Footer
          initialCategories={hoacNull(categories.slice(0, 5))}
          initialPopular={hoacNull(phoBien.slice(0, 5))}
          initialProviders={hoacNull(providers.slice(0, 5))}
        />
      </body>
    </html>
  );
}
