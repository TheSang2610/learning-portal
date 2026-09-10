"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import { Bookmark, Check, Copy, Ellipsis } from "lucide-react";

// Hai nut o goc phai tren cua the: luu bai va menu ba cham.
//
// Danh sach da luu nam trong localStorage cua tung trinh duyet - khong co bang
// nao o may chu de gan no vao tai khoan. Doi cho nay sang API sau thi chi phai
// sua ba ham duoi day.

const KHOA = "feedBookmarks";

// getSnapshot bat buoc phai tra ve gia tri on dinh giua hai lan goi lien tiep,
// nen phai giu ban sao o day. Doc thang localStorage moi lan se lam React
// nghi trang thai luon thay doi va lap vo han.
let bo: string[] | null = null;
const nguoiNghe = new Set<() => void>();

function docBo(): string[] {
  if (bo) return bo;
  try {
    const raw = localStorage.getItem(KHOA);
    const ds: unknown = raw ? JSON.parse(raw) : [];
    bo = Array.isArray(ds) ? (ds as string[]) : [];
  } catch {
    bo = [];
  }
  return bo;
}

function dangKy(bao: () => void) {
  nguoiNghe.add(bao);
  // Luu o tab khac -> bo nho dem o tab nay da cu, phai bo di roi ve lai.
  const khiTabKhac = (e: StorageEvent) => {
    if (e.key === KHOA) {
      bo = null;
      nguoiNghe.forEach((f) => f());
    }
  };
  window.addEventListener("storage", khiTabKhac);
  return () => {
    nguoiNghe.delete(bao);
    window.removeEventListener("storage", khiTabKhac);
  };
}

function doiLuu(href: string) {
  const ds = docBo();
  bo = ds.includes(href) ? ds.filter((x) => x !== href) : [...ds, href];
  try {
    localStorage.setItem(KHOA, JSON.stringify(bo));
  } catch {
    // Trinh duyet chan luu tru (che do rieng tu) - van doi trang thai tren
    // man hinh, chi la khong nho sau khi tai lai trang.
  }
  nguoiNghe.forEach((f) => f());
}

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
}

export default function CardActions({ href, tieuDe, themMuc = [] }: Props) {
  const daLuu = useSyncExternalStore(
    dangKy,
    () => docBo().includes(href),
    () => false, // May chu khong co localStorage -> luon dung "chua luu"
  );

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
    <div ref={boc} className="relative flex shrink-0 items-center gap-0.5">
      <button
        type="button"
        onClick={() => doiLuu(href)}
        aria-pressed={daLuu}
        aria-label={daLuu ? `Bỏ lưu ${tieuDe}` : `Lưu ${tieuDe}`}
        title={daLuu ? "Bỏ lưu" : "Lưu bài"}
        className={`rounded-lg p-2 transition hover:bg-slate-100 ${
          daLuu ? "text-blue-600" : "text-slate-400 hover:text-slate-700"
        }`}
      >
        <Bookmark size={17} className={daLuu ? "fill-blue-600" : undefined} />
      </button>

      <button
        type="button"
        onClick={() => setMoMenu((v) => !v)}
        aria-expanded={moMenu}
        aria-haspopup="menu"
        aria-label={`Tùy chọn cho ${tieuDe}`}
        className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
      >
        <Ellipsis size={17} />
      </button>

      {moMenu && (
        <div
          role="menu"
          className="absolute top-full right-0 z-20 mt-1 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
        >
          {muc.map((m) => (
            <button
              key={m.nhan}
              type="button"
              role="menuitem"
              onClick={() => {
                m.onChon();
                if (!m.nhan.startsWith("Đã")) setMoMenu(false);
              }}
              className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium transition ${
                m.nguyHiem
                  ? "text-red-700 hover:bg-red-50"
                  : "text-slate-700 hover:bg-slate-50"
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
