"use client";

import { datNguoiDung, yeuCauNapLai } from "@/src/hooks/userStore";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { googleLogin } from "@/src/services/api";

import styles from "./CallbackClient.module.scss";
export default function GoogleCallbackInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = searchParams.get("code");
  const state = searchParams.get("state");
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
        //
        // `state` phai duoc chuyen tiep nguyen ven: may chu doi chieu no voi
        // ban luu trong cookie httpOnly truoc khi chiu doi ma. Khong co buoc do
        // thi trang nay nhan bat ky `code` nao ai dat vao dia chi cung duoc -
        // xem ghi chu trong app/api/auth/google/route.ts.
        const response = await fetch(
          `/api/auth/google/token?code=${encodeURIComponent(code)}` +
            `&state=${encodeURIComponent(state ?? "")}`,
        );
        const data = await response.json();

        if (!response.ok || !data.idToken) {
          console.error(data);
          setStatus(data?.error || "Google login failed. Please try again.");
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

        datNguoiDung(user);
        yeuCauNapLai();
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
  }, [code, state, error, router]);

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Google sign-in</h1>
        <p className={styles.text}>{status}</p>
      </div>
    </div>
  );
}
