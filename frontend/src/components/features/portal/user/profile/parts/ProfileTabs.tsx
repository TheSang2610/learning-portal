"use client";

import { useEffect, useState } from "react";
import { Bookmark, FileText, LayoutGrid } from "lucide-react";

import styles from "./ProfileTabs.module.scss";

export type ProfileTab = "tong-quan" | "tai-lieu" | "da-luu";

const TABS: { khoa: ProfileTab; nhan: string; Icon: typeof LayoutGrid }[] = [
  { khoa: "tong-quan", nhan: "Tổng quan", Icon: LayoutGrid },
  { khoa: "tai-lieu", nhan: "Tài liệu của tôi", Icon: FileText },
  { khoa: "da-luu", nhan: "Đã lưu", Icon: Bookmark },
];

const laTab = (v: string | null): v is ProfileTab => TABS.some((t) => t.khoa === v);

/**
 * Tab dang mo cua trang ca nhan, GHI TREN DIA CHI (?tab=da-luu) - nhu TikTok /
 * Facebook: gui link "/user/profile?tab=da-luu" la mo thang muc Da luu, tai lai
 * trang van o dung tab.
 *
 * Nhan ca neo cu (#tai-lieu-cua-toi, #da-luu) - trang chi tiet tai lieu tung
 * dan chu bai toi day bang neo.
 */
export function useProfileTab(): [ProfileTab, (t: ProfileTab) => void] {
  const [tab, setTab] = useState<ProfileTab>("tong-quan");

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

  const changeTab = (t: ProfileTab) => {
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

  return [tab, changeTab];
}

/** Thanh tab kieu mang xa hoi: bieu tuong + chu, gach chan tab dang mo. */
export default function ProfileTabs({
  tab,
  changeTab,
}: {
  tab: ProfileTab;
  changeTab: (t: ProfileTab) => void;
}) {
  return (
    <div className={styles.thanh} role="tablist" aria-label="Mục trong trang cá nhân">
      {TABS.map(({ khoa: course, nhan: label, Icon }) => (
        <button
          key={course}
          type="button"
          role="tab"
          id={`tab-${course}`}
          aria-selected={tab === course}
          aria-controls={`bang-${course}`}
          onClick={() => changeTab(course)}
          className={`${styles.tab} ${tab === course ? styles.tabOn : ""}`}
        >
          <Icon size={17} />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}
