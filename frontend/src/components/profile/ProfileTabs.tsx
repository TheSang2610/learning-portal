"use client";

import { useEffect, useState } from "react";
import { Bookmark, FileText, LayoutGrid } from "lucide-react";

import styles from "./ProfileTabs.module.scss";

export type TabHoSo = "tong-quan" | "tai-lieu" | "da-luu";

const CAC_TAB: { khoa: TabHoSo; nhan: string; Icon: typeof LayoutGrid }[] = [
  { khoa: "tong-quan", nhan: "Tổng quan", Icon: LayoutGrid },
  { khoa: "tai-lieu", nhan: "Tài liệu của tôi", Icon: FileText },
  { khoa: "da-luu", nhan: "Đã lưu", Icon: Bookmark },
];

const laTab = (v: string | null): v is TabHoSo => CAC_TAB.some((t) => t.khoa === v);

/**
 * Tab dang mo cua trang ca nhan, GHI TREN DIA CHI (?tab=da-luu) - nhu TikTok /
 * Facebook: gui link "/user/profile?tab=da-luu" la mo thang muc Da luu, tai lai
 * trang van o dung tab.
 *
 * Nhan ca neo cu (#tai-lieu-cua-toi, #da-luu) - trang chi tiet tai lieu tung
 * dan chu bai toi day bang neo.
 */
export function useTabHoSo(): [TabHoSo, (t: TabHoSo) => void] {
  const [tab, setTab] = useState<TabHoSo>("tong-quan");

  useEffect(() => {
    // Doc tu window chu khong dung useSearchParams: hook do bat trang phai boc
    // Suspense. Hoan mot vong microtask - tranh setState dong bo trong effect.
    void Promise.resolve().then(() => {
      const u = new URL(window.location.href);
      const q = u.searchParams.get("tab");
      if (laTab(q)) return setTab(q);
      if (u.hash === "#tai-lieu-cua-toi" || u.searchParams.has("sua"))
        return setTab("tai-lieu");
      if (u.hash === "#da-luu") return setTab("da-luu");
    });
  }, []);

  const doiTab = (t: TabHoSo) => {
    setTab(t);
    const u = new URL(window.location.href);
    if (t === "tong-quan") u.searchParams.delete("tab");
    else u.searchParams.set("tab", t);
    // Doi tab thi bo ?sua va neo cu - chung chi co nghia cho lan vao dau.
    u.searchParams.delete("sua");
    u.hash = "";
    // replaceState: doi tab khong nen lap day nut Back cua trinh duyet.
    window.history.replaceState(null, "", u.toString());
  };

  return [tab, doiTab];
}

/** Thanh tab kieu mang xa hoi: bieu tuong + chu, gach chan tab dang mo. */
export default function ProfileTabs({
  tab,
  doiTab,
}: {
  tab: TabHoSo;
  doiTab: (t: TabHoSo) => void;
}) {
  return (
    <div className={styles.thanh} role="tablist" aria-label="Mục trong trang cá nhân">
      {CAC_TAB.map(({ khoa, nhan, Icon }) => (
        <button
          key={khoa}
          type="button"
          role="tab"
          id={`tab-${khoa}`}
          aria-selected={tab === khoa}
          aria-controls={`bang-${khoa}`}
          onClick={() => doiTab(khoa)}
          className={`${styles.tab} ${tab === khoa ? styles.tabOn : ""}`}
        >
          <Icon size={17} />
          <span>{nhan}</span>
        </button>
      ))}
    </div>
  );
}
