"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Bookmark, Check, Copy, Ellipsis } from "lucide-react";

import { toggleSave, useSaved } from "@/src/hooks/savedStore";
import { useStoredUser } from "@/src/hooks/userStore";
import type { SaveType } from "@/src/services/saved";

import styles from "./CardActions.module.scss";
// Hai nut o goc phai tren cua the: luu bai va menu ba cham.
//
// Nut luu ghi vao TAI KHOAN (bang SavedItem ben backend) va hien lai o trang
// ca nhan - xem src/hooks/savedStore.ts. Truoc day chi nam trong localStorage.

export interface MenuItem {
  nhan: string;
  icon?: ReactNode;
  onSelect: () => void;
  danger?: boolean;
}

interface Props {
  href: string;
  tieuDe: string;
  /** Muc them vao menu ba cham, vi du "Xoa" cho chu bai */
  addItem?: MenuItem[];
  /** Thu gi se duoc luu. Khong truyen thi khong hien nut luu. */
  luu?: { loai: SaveType; id: string };
}

export default function CardActions({
  href,
  tieuDe: title,
  addItem = [],
  luu: save,
}: Props) {
  const user = useStoredUser();
  // Hook khong goi co dieu kien duoc - khong co `luu` thi hoi mot khoa rong,
  // ket qua bo qua vi nut khong hien.
  const saved = useSaved(save?.loai ?? "baiViet", save?.id ?? "");

  const clickSave = () => {
    if (!save) return;
    if (!user) {
      // Mo hop dang nhap ngay tren trang dang xem (AuthModalGate nghe ?auth).
      // pushState chu khong router.push - xem ghi chu trong AuthModalGate.
      const u = new URL(window.location.href);
      u.searchParams.set("auth", "login");
      u.searchParams.set("vi", "luu");
      window.history.pushState(null, "", u.toString());
      return;
    }
    // Hong mang: kho tu tra nut ve nhu cu, khong can bao them.
    toggleSave(save.loai, save.id).catch(() => {});
  };

  const [openMenu, setOpenMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const boc = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!openMenu) return;
    const onClickOutside = (e: MouseEvent) => {
      if (!boc.current?.contains(e.target as Node)) setOpenMenu(false);
    };
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenMenu(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEscape);
    };
  }, [openMenu]);

  const chepLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(
        new URL(href, window.location.origin).toString(),
      );
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard can trang https hoac quyen nguoi dung - im lang, khong bao loi
    }
    setOpenMenu(false);
  }, [href]);

  const item: MenuItem[] = [
    {
      nhan: copied ? "Đã sao chép" : "Sao chép liên kết",
      icon: copied ? <Check size={15} /> : <Copy size={15} />,
      onSelect: chepLink,
    },
    ...addItem,
  ];

  return (
    <div ref={boc} className={styles.row}>
      {save && (
        <button
          type="button"
          onClick={clickSave}
          aria-pressed={saved}
          aria-label={saved ? `Bỏ lưu ${title}` : `Lưu ${title}`}
          title={saved ? "Bỏ lưu" : "Lưu bài"}
          className={`${styles.button6} ${saved ? styles.button : styles.button2}`}
        >
          <Bookmark size={17} className={saved ? styles.box : undefined} />
        </button>
      )}

      <button
        type="button"
        onClick={() => setOpenMenu((v) => !v)}
        aria-expanded={openMenu}
        aria-haspopup="menu"
        aria-label={`Tùy chọn cho ${title}`}
        className={styles.button3}
      >
        <Ellipsis size={17} />
      </button>

      {openMenu && (
        <div role="menu" className={styles.floating}>
          {item.map((m) => (
            <button
              key={m.nhan}
              type="button"
              role="menuitem"
              onClick={() => {
                m.onSelect();
                if (!m.nhan.startsWith("Đã")) setOpenMenu(false);
              }}
              className={`${styles.button7} ${
                m.danger ? styles.button4 : styles.button5
              }`}
            >
              {m.icon}
              {m.nhan}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
