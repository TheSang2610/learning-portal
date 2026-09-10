import { Suspense } from "react";
import VerifyEmailClient from "./VerifyEmailClient";

// Tach server component + Suspense cho phan doc useSearchParams(), de trang
// nay van prerender tinh duoc - cung khuon voi app/(portal)/auth/callback.
export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-4 py-12">
          <div className="w-full max-w-md rounded-3xl bg-white p-10 text-center shadow-xl ring-1 ring-slate-200">
            <h1 className="text-xl font-semibold text-slate-900">Xác minh email</h1>
            <p className="mt-2 text-sm text-slate-600">Đang tải…</p>
          </div>
        </div>
      }
    >
      <VerifyEmailClient />
    </Suspense>
  );
}
