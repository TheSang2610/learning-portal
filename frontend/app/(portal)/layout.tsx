import { Be_Vietnam_Pro, Lexend } from "next/font/google";

import { PortalShell, portalShellStyles } from "@/src/components/features/portal/layout";

// Hai bo chu nay CHI nap o khu vuc hoc vien. Trang quan tri co layout rieng
// va khong dat hai bien nay, nen no van dung Inter nhu cu - doi giao dien
// trang chu khong keo theo viec doi mau va chu cua ca trang admin.
//
// Be Vietnam Pro: bo chu ve rieng cho dau tieng Viet. Dau mu, dau nga, chu
// "ữ" "ỗ" "ế" trong cac bo chu he thong thuong bi ghep tu font khac nen dat
// lech va nang nhe khong deu.
const bodyText = Be_Vietnam_Pro({
  subsets: ["vietnamese", "latin"],
  weight: ["400", "500", "600"],
  variable: "--chu-than",
  display: "swap",
});

// Lexend: ve ra de tang toc do doc, co nghien cuu kem theo. Dung cho tieu de.
const displayText = Lexend({
  subsets: ["vietnamese", "latin"],
  weight: ["500", "700", "800"],
  variable: "--chu-hien",
  display: "swap",
});

// Hai bien font dat tren the boc cua portal (khong phai <html>) vi root layout
// gio dung chung voi admin/instructor. CSS cua the boc: PortalShell.module.scss.
export default function PortalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      className={`${bodyText.variable} ${displayText.variable} ${portalShellStyles.box}`}
    >
      <PortalShell>{children}</PortalShell>
    </div>
  );
}
