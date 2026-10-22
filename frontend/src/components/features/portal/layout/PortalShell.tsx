import { Suspense, type ReactNode } from "react";

import GlobalAssistant from "@/src/components/features/portal/assistant/AssistantWidget";
import UserBootstrap from "@/src/components/common/UserBootstrap";
import AuthModalGate from "@/src/components/features/portal/auth/AuthModalGate";
import Footer from "@/src/components/layout/Footer";
import Header from "@/src/components/layout/Header";

import { getFooterData } from "./data";
import styles from "./PortalShell.module.scss";

/** Noi dung ben trong <body> cua moi trang portal: header, main, footer, tro ly. */
export default async function PortalShell({ children }: { children: ReactNode }) {
  const footer = await getFooterData();

  return (
    <>
      {/* Hoi may chu "toi la ai" mot lan. Danh tinh nam trong RAM, khong
          con ghi xuong localStorage - xem src/hooks/userStore.ts. */}
      <UserBootstrap />
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
      <Footer {...footer} />
      {/* Hop chat noi o goc phai. Dat o layout de hien tren moi trang portal;
          no tu an di o /learn vi trang do da co ban co ngu canh bai hoc. */}
      <GlobalAssistant />
    </>
  );
}
