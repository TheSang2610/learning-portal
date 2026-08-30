"use client";

import { ChevronRight, X } from "lucide-react";
import type { ReactNode } from "react";

// Hang cai dat kieu F8: nhan + gia tri hien tai + mui ten.
// Bam vao mo o sua ngay tai cho thay vi do het input ra man hinh -
// trang cai dat co ~10 truong, hien het cung luc thi rat kho doc.

interface Props {
  label: string;
  /** Gia tri hien thi khi hang dang dong */
  value?: string;
  /** Anh hien thay cho chu (dung cho avatar) */
  image?: string;
  /** Kieu ma/dinh danh: chu deu, nen xam */
  mono?: boolean;
  /** Mo ta phu duoi nhan */
  hint?: string;
  /** Hang chi de xem, khong co mui ten va khong bam duoc */
  readOnly?: boolean;
  /** Noi dung ben phai khi chi de xem (vd: huy hieu "Da lien ket") */
  trailing?: ReactNode;
  open?: boolean;
  onToggle?: () => void;
  /** Form hien ra khi hang duoc mo */
  children?: ReactNode;
}

const EMPTY = "Chưa cập nhật";

export default function SettingRow({
  label,
  value,
  image,
  mono,
  hint,
  readOnly,
  trailing,
  open,
  onToggle,
  children,
}: Props) {
  const shown = value?.trim() ? value : EMPTY;
  const isEmpty = !value?.trim();

  return (
    <div className="border-b border-slate-100 last:border-b-0">
      <div
        className={`flex items-center justify-between gap-4 px-5 py-4 ${
          readOnly ? "" : "cursor-pointer hover:bg-slate-50"
        } ${open ? "bg-slate-50" : ""}`}
        onClick={readOnly ? undefined : onToggle}
        role={readOnly ? undefined : "button"}
        tabIndex={readOnly ? undefined : 0}
        onKeyDown={
          readOnly
            ? undefined
            : (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onToggle?.();
                }
              }
        }
      >
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-semibold text-slate-900">{label}</h4>
          {hint && <p className="mt-0.5 text-xs text-slate-600">{hint}</p>}

          {image !== undefined ? (
            image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={image}
                alt={label}
                className="mt-2 h-14 w-14 rounded-full border border-slate-200 object-cover"
              />
            ) : (
              <span className="mt-1 block text-sm text-slate-600">{EMPTY}</span>
            )
          ) : (
            <span
              className={`mt-1 block truncate text-sm ${
                isEmpty ? "text-slate-500" : "text-slate-700"
              } ${mono && !isEmpty ? "font-medium text-slate-800" : ""}`}
              title={shown}
            >
              {shown}
            </span>
          )}
        </div>

        {trailing}

        {!readOnly &&
          (open ? (
            <X size={16} className="shrink-0 text-slate-600" />
          ) : (
            <ChevronRight size={16} className="shrink-0 text-slate-500" />
          ))}
      </div>

      {open && children && (
        <div className="border-t border-slate-100 bg-slate-50 px-5 py-4">{children}</div>
      )}
    </div>
  );
}

/** Khung nhom cac hang, co tieu de va mo ta - giong <section> trong ban mau */
export function SettingCard({
  title,
  desc,
  children,
}: {
  title: string;
  desc?: string;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="text-base font-bold text-slate-900">{title}</h2>
        {desc && <p className="mt-1 text-sm text-slate-600">{desc}</p>}
      </div>
      <div>{children}</div>
    </section>
  );
}
