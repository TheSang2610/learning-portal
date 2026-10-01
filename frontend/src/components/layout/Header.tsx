"use client";

import { usePathname } from "next/navigation";

import TopNav from "./TopNav";
import IndividualsHeader from "./headers/IndividualsHeader";
import BlogHeader from "./headers/BlogHeader";
import ShareDocumentHeader from "./headers/ShareDocumentHeader";
import GpaHeader from "./headers/GpaHeader";

import styles from "./Header.module.scss";
// Cac cong cu diem va trang luyen tap dung chung mot header de dieu huong qua
// lai giua chung. Phai khop danh sach TOOLS trong headers/GpaHeader.tsx.
const GPA_ROUTES = ["/gpa-calculator", "/calc-point", "/convert-10-to-4", "/practice"];

export default function Header() {
  const pathname = usePathname();

  const renderHeader = () => {
    if (pathname.startsWith("/blog")) return <BlogHeader />;
    if (pathname.startsWith("/share-document")) return <ShareDocumentHeader />;
    if (GPA_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"))) {
      return <GpaHeader />;
    }
    return <IndividualsHeader />;
  };

  return (
    <header className={styles.header}>
      <TopNav />
      {renderHeader()}
    </header>
  );
}
