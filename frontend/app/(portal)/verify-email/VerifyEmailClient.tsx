"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

import { verifyEmail } from "@/src/services/api";
import { getErrorMessage } from "@/src/services/apiHelper";

type TrangThai = "dangChay" | "xong" | "hong";

export default function VerifyEmailClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [trangThai, setTrangThai] = useState<TrangThai>(token ? "dangChay" : "hong");
  const [loi, setLoi] = useState(token ? "" : "Liên kết thiếu mã xác minh.");
  const [ten, setTen] = useState("");

  // React 18 goi useEffect HAI LAN o che do Strict khi dev. Khong chan lai thi
  // luot thu hai gui token da bi xoa o luot dau -> nguoi dung thay bao loi
  // ngay sau khi vua kich hoat thanh cong.
  const daGoi = useRef(false);

  useEffect(() => {
    if (!token || daGoi.current) return;
    daGoi.current = true;

    verifyEmail(token)
      .then((nguoiDung) => {
        setTen(nguoiDung?.name || "");
        setTrangThai("xong");
        // May chu da dat cookie phien, nen vao thang duoc. Cho mot nhip de
        // nguoi dung kip doc cau bao roi hay chuyen.
        setTimeout(() => router.replace("/"), 2000);
      })
      .catch((e) => {
        setLoi(getErrorMessage(e, "Không xác minh được email."));
        setTrangThai("hong");
      });
  }, [token, router]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md rounded-3xl bg-white p-10 text-center shadow-xl ring-1 ring-slate-200">
        {trangThai === "dangChay" && (
          <>
            <Loader2 className="mx-auto mb-4 animate-spin text-blue-600" size={40} />
            <h1 className="text-xl font-semibold text-slate-900">Đang xác minh email…</h1>
            <p className="mt-2 text-sm text-slate-600">Chỉ mất một lát thôi.</p>
          </>
        )}

        {trangThai === "xong" && (
          <>
            <CheckCircle2 className="mx-auto mb-4 text-emerald-600" size={44} />
            <h1 className="text-xl font-semibold text-slate-900">
              Đã kích hoạt tài khoản
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              {ten ? `Chào ${ten}, bạn ` : "Bạn "}đã đăng nhập. Đang đưa bạn về trang chủ…
            </p>
            <Link
              href="/"
              className="mt-6 inline-block rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Về trang chủ ngay
            </Link>
          </>
        )}

        {trangThai === "hong" && (
          <>
            <XCircle className="mx-auto mb-4 text-rose-600" size={44} />
            <h1 className="text-xl font-semibold text-slate-900">Không xác minh được</h1>
            <p className="mt-2 text-sm text-slate-600">{loi}</p>
            <p className="mt-4 text-sm text-slate-500">
              Liên kết chỉ dùng được một lần và có hiệu lực trong 24 giờ. Nếu đã quá hạn,
              hãy đăng ký lại bằng chính địa chỉ đó để nhận liên kết mới.
            </p>
            <Link
              href="/?auth=register"
              className="mt-6 inline-block rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Đăng ký lại
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
