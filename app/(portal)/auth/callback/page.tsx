"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export const dynamic = 'force-dynamic';

function GoogleCallbackInner() {
  const [status, setStatus] = useState("Signing you in with Google...");
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      setStatus("Google login failed. Please try again.");
      return;
    }

    if (!code) {
      setStatus("No Google authorization code received.");
      return;
    }

    const exchangeCode = async () => {
      setStatus("Finishing Google sign-in...");

      const response = await fetch(`/api/auth/google/token?code=${encodeURIComponent(code)}`);
      const data = await response.json();

      if (!response.ok) {
        console.error(data);
        setStatus("Google login failed. Please try again.");
        return;
      }

      // If opened as a popup, post message back to opener and close.
      if (typeof window !== "undefined" && window.opener) {
        window.opener.postMessage({ type: "google-auth-success", payload: { user: data.user, token: data.token } }, window.location.origin);
        setStatus("Login successful! Closing...");
        setTimeout(() => {
          window.close();
        }, 600);
        return;
      }

      // Fallback: normal redirect flow
      localStorage.setItem("userInfo", JSON.stringify(data.user));
      window.dispatchEvent(new Event("userInfoChanged"));
      setStatus("Login successful! Redirecting...");

      setTimeout(() => {
        router.replace("/");
      }, 1000);
    };

    exchangeCode();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-lg rounded-3xl bg-white p-10 shadow-2xl ring-1 ring-slate-200 text-center">
        <h1 className="text-2xl font-semibold mb-4">Google sign-in</h1>
        <p className="text-sm text-slate-600">{status}</p>
      </div>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
        <div className="w-full max-w-lg rounded-3xl bg-white p-10 shadow-2xl ring-1 ring-slate-200 text-center">
          <h1 className="text-2xl font-semibold mb-4">Google sign-in</h1>
          <p className="text-sm text-slate-600">Loading Google authentication...</p>
        </div>
      </div>
    }>
      <GoogleCallbackInner />
    </Suspense>
  );
}
