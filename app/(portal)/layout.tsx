import { Suspense } from "react";
import "../globals.css";
import Header from "@/src/components/layout/Header";
import Footer from "@/src/components/layout/Footer";
import { layTuMayChu, hoacNull } from "@/src/services/serverFetch";
import type { Category } from "@/src/services/categoryService";
import type { Course } from "@/src/services/course";
import type { ProviderData } from "@/src/services/provider";

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
    <html lang="vi" suppressHydrationWarning>
      <body className="antialiased">
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
