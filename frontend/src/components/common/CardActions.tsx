"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Bookmark, Check, Copy, Ellipsis } from "lucide-react";

import { doiLuu, useDaLuu } from "@/src/hooks/savedStore";
import { useNguoiDungLuu } from "@/src/hooks/userStore";
import type { LoaiLuu } from "@/src/services/saved";

import styles from "./CardActions.module.scss";
// Hai nut o goc phai tren cua the: luu bai va menu ba cham.
//
// Nut luu ghi vao TAI KHOAN (bang SavedItem ben backend) va hien lai o trang
// ca nhan - xem src/hooks/savedStore.ts. Truoc day chi nam trong localStorage.

export interface MucMenu {
  nhan: string;
  icon?: ReactNode;
  onChon: () => void;
  nguyHiem?: boolean;
}

interface Props {
  href: string;
  tieuDe: string;
  /** Muc them vao menu ba cham, vi du "Xoa" cho chu bai */
  themMuc?: MucMenu[];
  /** Thu gi se duoc luu. Khong truyen thi khong hien nut luu. */
  luu?: { loai: LoaiLuu; id: string };
}

export default function CardActions({ href, tieuDe, themMuc = [], luu }: Props) {
  const user = useNguoiDungLuu();
  // Hook khong goi co dieu kien duoc - khong co `luu` thi hoi mot khoa rong,
  // ket qua bo qua vi nut khong hien.
  const daLuu = useDaLuu(luu?.loai ?? "baiViet", luu?.id ?? "");

  const bamLuu = () => {
    if (!luu) return;
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
    doiLuu(luu.loai, luu.id).catch(() => {});
  };

  const [moMenu, setMoMenu] = useState(false);
  const [daChep, setDaChep] = useState(false);
  const boc = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!moMenu) return;
    const khiBamNgoai = (e: MouseEvent) => {
      if (!boc.current?.contains(e.target as Node)) setMoMenu(false);
    };
    const khiEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMoMenu(false);
    };
    document.addEventListener("mousedown", khiBamNgoai);
    document.addEventListener("keydown", khiEsc);
    return () => {
      document.removeEventListener("mousedown", khiBamNgoai);
      document.removeEventListener("keydown", khiEsc);
    };
  }, [moMenu]);

  const chepLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(
        new URL(href, window.location.origin).toString(),
      );
      setDaChep(true);
      window.setTimeout(() => setDaChep(false), 1500);
    } catch {
      // clipboard can trang https hoac quyen nguoi dung - im lang, khong bao loi
    }
    setMoMenu(false);
  }, [href]);

  const muc: MucMenu[] = [
    {
      nhan: daChep ? "Đã sao chép" : "Sao chép liên kết",
      icon: daChep ? <Check size={15} /> : <Copy size={15} />,
      onChon: chepLink,
    },
    ...themMuc,
  ];

  return (
    <div ref={boc} className={styles.row}>
      {luu && (
        <button
          type="button"
          onClick={bamLuu}
          aria-pressed={daLuu}
          aria-label={daLuu ? `Bỏ lưu ${tieuDe}` : `Lưu ${tieuDe}`}
          title={daLuu ? "Bỏ lưu" : "Lưu bài"}
          className={`${styles.button6} ${daLuu ? styles.button : styles.button2}`}
        >
          <Bookmark size={17} className={daLuu ? styles.box : undefined} />
        </button>
      )}

      <button
        type="button"
        onClick={() => setMoMenu((v) => !v)}
        aria-expanded={moMenu}
        aria-haspopup="menu"
        aria-label={`Tùy chọn cho ${tieuDe}`}
        className={styles.button3}
      >
        <Ellipsis size={17} />
      </button>

      {moMenu && (
        <div role="menu" className={styles.floating}>
          {muc.map((m) => (
            <button
              key={m.nhan}
              type="button"
              role="menuitem"
              onClick={() => {
                m.onChon();
                if (!m.nhan.startsWith("Đã")) setMoMenu(false);
              }}
              className={`${styles.button7} ${
                m.nguyHiem ? styles.button4 : styles.button5
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
