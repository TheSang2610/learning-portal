"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { AUTH_CALLBACK as C } from "@/src/constants/portal/auth-callback-page";
import { storeUser, requireReload } from "@/src/hooks/userStore";
import { googleLogin } from "@/src/services/api";

/** Doi ma Google lay phien dang nhap; tra ve dong trang thai de hien. */
export function useGoogleCallback() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const [status, setStatus] = useState<string>(() => {
    if (error) return C.failed;
    if (!code) return C.noCode;
    return C.signingIn;
  });

  useEffect(() => {
    if (error || !code) return;

    const exchangeCode = async () => {
      setStatus(C.finishing);

      try {
        // Buoc 1: doi ma lay id_token. Buoc nay PHAI o may chu vi no can
        // GOOGLE_CLIENT_SECRET.
        //
        // `state` phai duoc chuyen tiep nguyen ven: may chu doi chieu no voi
        // ban luu trong cookie httpOnly truoc khi chiu doi ma. Khong co buoc do
        // thi trang nay nhan bat ky `code` nao ai dat vao dia chi cung duoc -
        // xem ghi chu trong app/api/auth/google/route.ts.
        const response = await fetch(C.tokenUrl(code, state ?? ""));
        const data = await response.json();

        if (!response.ok || !data.idToken) {
          console.error(data);
          setStatus(data?.error || C.failed);
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
            { type: C.messageType, payload: { user } },
            window.location.origin,
          );
          setStatus(C.successClosing);
          setTimeout(() => {
            window.close();
          }, C.closeDelayMs);
          return;
        }

        storeUser(user);
        requireReload();
        setStatus(C.successRedirecting);

        setTimeout(() => {
          router.replace(C.redirectHref);
        }, C.redirectDelayMs);
      } catch (err) {
        console.error("Token exchange error:", err);
        setStatus(C.failed);
      }
    };

    exchangeCode();
  }, [code, state, error, router]);

  return status;
}
