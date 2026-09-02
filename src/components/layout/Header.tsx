"use client";

import { usePathname } from "next/navigation";

import TopNav from "./TopNav";
import IndividualsHeader from "./headers/IndividualsHeader";
import BlogHeader from "./headers/BlogHeader";
import ShareDocumentHeader from "./headers/ShareDocumentHeader";
import GpaHeader from "./headers/GpaHeader";

// Ba cong cu diem dung chung mot header de dieu huong qua lai giua chung
const GPA_ROUTES = ["/gpa-calculator", "/calc-point", "/convert-10-to-4"];

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
    <header className="fixed top-0 left-0 z-50 w-full">
      <TopNav />
      {renderHeader()}
    </header>
  );
}
