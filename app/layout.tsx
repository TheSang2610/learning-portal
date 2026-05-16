import "./globals.css";
import Header from "@/src/components/layout/Header"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>

        <Header />

        {/* 40px topbar + 64px header */}
        <main className="pt-[104px]">
          {children}
        </main>

      </body>
    </html>
  );
}