import { Suspense } from "react";
import "../globals.css";
import Header from "@/src/components/layout/Header";
import Footer from "@/src/components/layout/Footer";
export default function PortalRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        {/* Header goi useSearchParams(). Khong boc Suspense thi TOAN BO trang portal
            khong prerender tinh duoc -> moi luot xem deu ton mot lan chay serverless. */}
        <Suspense fallback={<div className="h-[104px]" />}>
          <Header />
        </Suspense>
        {/* 40px topbar + 64px header */}
        <main className="pt-[104px] ">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
