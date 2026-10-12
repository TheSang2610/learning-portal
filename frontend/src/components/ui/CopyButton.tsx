"use client";

import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";

import { COPY_TEXT } from "@/src/constants/common";

interface CopyButtonProps {
  /** Chuoi duoc chep vao clipboard. */
  value: string;
  /** Ten thu duoc chep, dung cho aria-label ("Sao chép số tài khoản"). */
  what: string;
  className?: string;
  /** Hien bieu tuong Copy / Check truoc chu. */
  withIcon?: boolean;
}

/**
 * Nut sao chep, tu doi thanh "Đã chép" trong 2 giay roi tra ve nhu cu.
 * Dung chung cho moi cho can chep: so tai khoan, ma don, noi dung chuyen khoan.
 */
export default function CopyButton({
  value,
  what,
  className,
  withIcon = false,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const h = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(h);
  }, [copied]);

  const chep = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch {
      // Trinh duyet cu hoac trang khong chay https thi khong co clipboard API.
      // Khong bao loi: nguoi dung van boi den chu de chep tay duoc.
    }
  };

  return (
    <button
      type="button"
      onClick={chep}
      aria-label={COPY_TEXT.aria(what)}
      className={className}
    >
      {withIcon && (copied ? <Check size={12} /> : <Copy size={12} />)}
      {copied ? COPY_TEXT.copied : COPY_TEXT.copy}
    </button>
  );
}
