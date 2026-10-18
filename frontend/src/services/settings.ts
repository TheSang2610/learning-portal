import { apiRequest } from "./apiHelper";

/** Mau cua mot dai quang cao. Ma hex - may chu da kiem truoc khi luu. */
export interface BannerTheme {
  enabled: boolean;
  bgFrom: string;
  bgTo: string;
  text: string;
  buttonBg: string;
  buttonText: string;
  buttonHoverBg: string;
  buttonHoverText: string;
}

export type HomeSectionKey = "mostPopular" | "newReleases" | "trendingNow";

/** Cai dat giao dien do admin chinh o /admin/appearance. */
export interface Appearance {
  homeSections: Record<HomeSectionKey, boolean>;
  banners: { guestPromo: BannerTheme; memberPromo: BannerTheme };
}

/**
 * Mac dinh - TRUNG voi DEFAULTS o backend/src/utils/appearanceSettings.js.
 * Dung khi may chu chua tra loi duoc, de trang van ve dung mau cu.
 */
export const DEFAULT_APPEARANCE: Appearance = {
  homeSections: { mostPopular: true, newReleases: true, trendingNow: true },
  banners: {
    guestPromo: {
      enabled: true,
      bgFrom: "#4f2bff",
      bgTo: "#00bfb3",
      text: "#ffffff",
      buttonBg: "#ffffff",
      buttonText: "#4f2bff",
      buttonHoverBg: "#ffc93c",
      buttonHoverText: "#0b0c1e",
    },
    memberPromo: {
      enabled: true,
      bgFrom: "#f4f1ff",
      bgTo: "#ffffff",
      text: "#0b0c1e",
      buttonBg: "#0b0c1e",
      buttonText: "#ffffff",
      buttonHoverBg: "#2c14b8",
      buttonHoverText: "#ffffff",
    },
  },
};

export const APPEARANCE_PATH = "/api/settings/appearance";

export const getAppearance = (): Promise<Appearance> =>
  apiRequest("/settings/appearance");

export const updateAppearance = (data: Appearance): Promise<Appearance> =>
  apiRequest("/settings/appearance", { method: "PUT", body: JSON.stringify(data) });

/** Bien CSS cho mot dai quang cao - HomePromo.module.scss doc cac bien nay. */
export const bannerStyle = (t: BannerTheme): React.CSSProperties =>
  ({
    "--promo-from": t.bgFrom,
    "--promo-to": t.bgTo,
    "--promo-text": t.text,
    "--promo-btn-bg": t.buttonBg,
    "--promo-btn-text": t.buttonText,
    "--promo-btn-hover-bg": t.buttonHoverBg,
    "--promo-btn-hover-text": t.buttonHoverText,
  }) as React.CSSProperties;
