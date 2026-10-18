"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { loginUrl, updateUrl } from "@/src/components/features/portal/auth/loginUrl";
import { bannerStyle, type BannerTheme } from "@/src/services/settings";
import type { HomePromoData } from "@/src/types/home";

import styles from "./HomePromo.module.scss";

/**
 * Dai quang cao noi bo: mot cau, mot nut. Hai kieu:
 *   - "guest"  : to, nen dam - moi tao tai khoan (dat o landing).
 *   - "member" : gon, nen nhat - gioi thieu tinh nang moi (dat o dashboard).
 *
 * Client component chi vi nut "Tao tai khoan" mo hop dang ky NGAY TREN TRANG
 * (pushState ?auth=register) thay vi chuyen trang - xem updateUrl.
 */
export default function HomePromo({
  variant,
  badge,
  title,
  text,
  cta,
  secondary,
  theme,
}: HomePromoData & {
  variant: "guest" | "member";
  /** Mau do admin dat (/admin/appearance). Bo trong = mau mac dinh. */
  theme?: BannerTheme;
}) {
  const openRegister = () =>
    updateUrl(
      loginUrl(
        window.location.pathname,
        new URLSearchParams(window.location.search),
        undefined,
        "register",
      ),
    );

  return (
    <section
      className={`${styles.wrap} ${variant === "guest" ? styles.guest : styles.member}`}
      aria-label={badge}
      style={theme ? bannerStyle(theme) : undefined}
    >
      <div className={styles.banner}>
        <span aria-hidden className={styles.glow} />

        <div className={styles.body}>
          <span className={styles.badge}>
            <Sparkles size={13} aria-hidden />
            {badge}
          </span>
          <p className={styles.title}>{title}</p>
          <p className={styles.text}>{text}</p>
        </div>

        <div className={styles.actions}>
          {cta.action === "register" ? (
            <button
              type="button"
              onClick={openRegister}
              className={`group ${styles.primary}`}
            >
              {cta.label}
              <ArrowRight size={17} className={styles.arrow} />
            </button>
          ) : (
            <Link href={cta.href ?? "/"} className={`group ${styles.primary}`}>
              {cta.label}
              <ArrowRight size={17} className={styles.arrow} />
            </Link>
          )}
          {secondary && (
            <Link href={secondary.href} className={styles.secondary}>
              {secondary.label}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
