import "../globals.css";
import Header from "@/src/components/layout/Header";

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
      </body>
    </html>
  );
}
