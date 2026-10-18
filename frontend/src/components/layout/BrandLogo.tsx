import Link from "next/link";

import styles from "./BrandLogo.module.scss";

/** Ba thuong hieu con cua trang: nen tang chung, cam nang, kho tai lieu. */
export type Brand = "platform" | "guide" | "document";

export const BRANDS: Record<Brand, { name: string; href: string }> = {
  platform: { name: "Learning Platform", href: "/" },
  guide: { name: "Learning Guide", href: "/blog" },
  document: { name: "Learning Document", href: "/share-document" },
};

/** Khu nao dang mo -> logo nao (dung cho footer, header dung chung). */
export const brandForPath = (pathname: string | null): Brand =>
  pathname?.startsWith("/blog")
    ? "guide"
    : pathname?.startsWith("/share-document")
      ? "document"
      : "platform";

/**
 * Chu logo DUNG CHUNG cho moi header va footer: cung phong (Be Vietnam Pro
 * dam), cung co chu, chi khac ten va mau theo khu. Doi ten / kieu logo chi sua
 * o day.
 */
export default function BrandLogo({
  brand = "platform",
  size = "header",
  className = "",
  children,
}: {
  brand?: Brand;
  /** "header" 20/26px, "footer" 24px. */
  size?: "header" | "footer";
  className?: string;
  /** Dong phu sau ten (vd. "Quan ly diem" o khu GPA). */
  children?: React.ReactNode;
}) {
  const b = BRANDS[brand];
  return (
    <Link
      href={b.href}
      className={`${styles.logo} ${styles[brand]} ${styles[size]} ${className}`}
    >
      {b.name}
      {children}
    </Link>
  );
}
