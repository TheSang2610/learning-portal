import { Suspense } from "react";
import { Be_Vietnam_Pro, Lexend } from "next/font/google";
import "../globals.css";
import Header from "@/src/components/layout/Header";
import Footer from "@/src/components/layout/Footer";
import NapNguoiDung from "@/src/components/common/UserBootstrap";
import AuthModalGate from "@/src/components/home/AuthModalGate";
import TroLyToanTrang from "@/src/components/assistant/AssistantWidget";
import { layTuMayChu, hoacNull } from "@/src/services/serverFetch";
import { DUONG_HO_SO } from "@/src/services/apiBase";
import type { Category } from "@/src/services/categoryService";
import type { Course } from "@/src/services/course";
import type { ProviderData } from "@/src/services/provider";

import styles from "./layout.module.scss";
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
      <body className={styles.box}>
        {/* Ban luot goi "toi la ai" di NGAY, truoc ca khi React gan vao trang.

            Van de: <NapNguoiDung /> goi trong useEffect, ma useEffect chi chay
            SAU khi toan bo goi JavaScript da tai ve, phan tich xong va hydrate
            xong. Tuc la luot goi mang chi bat dau o cuoi hang doi, roi con
            phai cho may chu tra loi - trong suot thoi gian do goc phai thanh
            dieu huong la mot o TRONG.

            The nay thi luot goi khoi hanh ngay khi trinh duyet doc toi dong
            nay, chay SONG SONG voi viec tai JavaScript thay vi noi duoi no.
            <NapNguoiDung /> chi viec nhan lai loi hua da bay san.

            Trong the nay khong co mot chut du lieu nguoi dung nao - no chi mo
            mot ket noi. An toan de dat thang vao HTML tinh.

            `.catch` gan ngay tai cho: khong co no thi mot loi hua bi tu choi
            ma chua ai bat se thanh "unhandled rejection" do do trong console
            truoc khi NapNguoiDung kip nhan. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              `try{window.__hoSoDangBay=fetch(${JSON.stringify(DUONG_HO_SO)},` +
              `{credentials:"include",cache:"no-store"})` +
              `.then(function(r){return r.ok?r.json():null})` +
              `.catch(function(){return null})}catch(e){}`,
          }}
        />
        {/* Hoi may chu "toi la ai" mot lan. Danh tinh nam trong RAM, khong
            con ghi xuong localStorage - xem src/hooks/userStore.ts. */}
        <NapNguoiDung />
        {/* Hop dang nhap, mo bang ?auth tren dia chi. Dat o layout chu khong
            phai rieng trang chu: moi trang trong khu hoc vien deu co the can
            dang nhap, va khach dang xem mot khoa hoc thi phai dang nhap NGAY
            TAI DO chu khong bi nem ve trang chu. Xem AuthModalGate. */}
        <Suspense fallback={null}>
          <AuthModalGate />
        </Suspense>
        {/* Header goi useSearchParams(). Khong boc Suspense thi TOAN BO trang portal
            khong prerender tinh duoc -> moi luot xem deu ton mot lan chay serverless. */}
        <Suspense fallback={<div className={styles.box2} />}>
          <Header />
        </Suspense>
        {/* 40px topbar + 64px header */}
        <main className={styles.main}>{children}</main>
        <Footer
          initialCategories={hoacNull(categories.slice(0, 5))}
          initialPopular={hoacNull(phoBien.slice(0, 5))}
          initialProviders={hoacNull(providers.slice(0, 5))}
        />
        {/* Hop chat noi o goc phai. Dat o layout de hien tren moi trang portal;
            no tu an di o /learn vi trang do da co ban co ngu canh bai hoc. */}
        <TroLyToanTrang />
      </body>
    </html>
  );
}
