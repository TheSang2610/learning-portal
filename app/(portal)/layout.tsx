import "../globals.css";
import Header from "@/src/components/layout/Header";
import Footer from "@/src/components/layout/Footer";
export const dynamic = 'force-dynamic';
export default function PortalRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <Header />
        {/* 40px topbar + 64px header */}
        <main className="pt-[104px] ">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
