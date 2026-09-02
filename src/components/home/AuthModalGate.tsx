"use client";

import { useRouter, useSearchParams } from "next/navigation";
import AuthModal from "@/src/components/auth/AuthModal";

// Phan duy nhat cua trang chu can useSearchParams.
//
// Truoc day ca trang chu la "use client" chi vi doan nay, keo theo toan bo
// noi dung phai cho trinh duyet tai xong JS roi goi API moi hien ra. Tach
// rieng ra thi trang chu tro lai la Server Component, con o dang nhap van
// chay y nhu cu.
export default function AuthModalGate() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dangMo = searchParams.get("auth") !== null;

  return <AuthModal open={dangMo} onClose={() => router.replace("/")} />;
}
