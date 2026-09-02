"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { googleLogin } from "@/src/services/api";

export default function GoogleCallbackInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const [status, setStatus] = useState(() => {
    if (error) return "Google login failed. Please try again.";
    if (!code) return "No Google authorization code received.";
    return "Signing you in with Google...";
  });

  useEffect(() => {
    if (error || !code) return;

    const exchangeCode = async () => {
      setStatus("Finishing Google sign-in...");

      try {
        // Buoc 1: doi ma lay id_token. Buoc nay PHAI o may chu vi no can
        // GOOGLE_CLIENT_SECRET.
        const response = await fetch(
          `/api/auth/google/token?code=${encodeURIComponent(code)}`,
        );
        const data = await response.json();

        if (!response.ok || !data.idToken) {
          console.error(data);
          setStatus("Google login failed. Please try again.");
          return;
        }

        // Buoc 2: trinh duyet tu goi backend.
        //
        // Phai la trinh duyet chu khong phai may chu Next, vi backend dat
        // cookie dang nhap trong phan hoi - may chu Next goi thay thi cookie
        // ve tay may chu Next, trinh duyet chang nhan duoc gi.
        const user = await googleLogin(data.idToken);

        if (typeof window !== "undefined" && window.opener) {
          // Cookie da duoc dat cho ca mien nay nen tab chinh dung duoc ngay,
          // khong can chuyen token qua postMessage nua.
          window.opener.postMessage(
            { type: "google-auth-success", payload: { user } },
            window.location.origin,
          );
          setStatus("Login successful! Closing...");
          setTimeout(() => {
            window.close();
          }, 600);
          return;
        }

        window.dispatchEvent(new Event("userInfoChanged"));
        setStatus("Login successful! Redirecting...");

        setTimeout(() => {
          router.replace("/");
        }, 1000);
      } catch (err) {
        console.error("Token exchange error:", err);
        setStatus("Google login failed. Please try again.");
      }
    };

    exchangeCode();
  }, [code, error, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-lg rounded-3xl bg-white p-10 text-center shadow-2xl ring-1 ring-slate-200">
        <h1 className="mb-4 text-2xl font-semibold">Google sign-in</h1>
        <p className="text-sm text-slate-600">{status}</p>
      </div>
    </div>
  );
}
