import { Suspense } from "react";
import GoogleCallbackInner from "./CallbackClient";

// Tach server component + Suspense cho phan doc useSearchParams(),
// de trang nay van prerender tinh duoc.
export default function GoogleCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
          <div className="w-full max-w-lg rounded-3xl bg-white p-10 text-center shadow-2xl ring-1 ring-slate-200">
            <h1 className="mb-4 text-2xl font-semibold">Google sign-in</h1>
            <p className="text-sm text-slate-600">Loading Google authentication...</p>
          </div>
        </div>
      }
    >
      <GoogleCallbackInner />
    </Suspense>
  );
}
