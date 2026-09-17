"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import AuthModal from "@/src/components/auth/AuthModal";

// Hop dang nhap, mo bang tham so ?auth tren dia chi.
//
// Truoc day chi trang chu gan cai nay, nen moi cho can dang nhap deu phai
// day nguoi dung ve "/?auth=login" - khach dang xem mot khoa hoc, bam "Vào
// học", va bi nem ve trang chu. Dang nhap xong thi ho dung o trang chu, phai
// tu tim lai khoa hoc luc nay.
//
// Nay no nam o layout cua ca khu hoc vien (app/(portal)/layout.tsx) nen ?auth
// mo duoc hop ngay tren trang dang xem, va dong lai la ve dung cho cu.
//
// Tach rieng khoi layout vi no goi useSearchParams(): khong boc Suspense thi
// TOAN BO khu portal mat kha nang prerender tinh.

// Vi sao hop nay hien ra. Tham so `vi` tren dia chi -> cau giai thich.
//
// Chi nhan cac ma DA BIET TRUOC, khong bao gio hien thang gia tri tren dia
// chi ra man hinh: tham so URL la thu bat ky ai cung dat duoc, va mot cau
// kieu "Phiên của bạn hết hạn, hãy nhập lại thẻ ngân hàng" nhet vao day roi
// gui link cho nguoi khac la mot cai bay hoan chinh.
const CAU_GIAI_THICH: Record<string, string> = {
  hoc: "Bạn cần đăng nhập để vào học khóa này.",
  ghidanh: "Bạn cần đăng nhập để đăng ký khóa học.",
};

export default function AuthModalGate() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const dangMo = searchParams.get("auth") !== null;
  const loiNhan = CAU_GIAI_THICH[searchParams.get("vi") || ""] || undefined;

  // Dong hop = bo hai tham so nay, GIU nguyen cac tham so khac. Truoc day cho
  // nay lam router.replace("/") - tuc la dong hop dang nhap tren trang khoa
  // hoc se nem nguoi dung ve trang chu, mat ca ?slug dang xem.
  const dong = () => {
    const con = new URLSearchParams(searchParams.toString());
    con.delete("auth");
    con.delete("vi");
    const duoi = con.toString();
    router.replace(duoi ? `${pathname}?${duoi}` : pathname);
  };

  return <AuthModal open={dangMo} onClose={dong} loiNhan={loiNhan} />;
}
