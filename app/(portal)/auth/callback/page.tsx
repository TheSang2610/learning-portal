import { Suspense } from "react";
import GoogleCallbackInner from "./CallbackClient";

// Tach server component + Suspense cho phan doc useSearchParams(),
// de trang nay van prerender tinh duoc.
export default function GoogleCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
          <div className="w-full max-w-lg rounded-3xl bg-white p-10 shadow-2xl ring-1 ring-slate-200 text-center">
            <h1 className="text-2xl font-semibold mb-4">Google sign-in</h1>
            <p className="text-sm text-slate-600">Loading Google authentication...</p>
          </div>
        </div>
      }
    >
      <GoogleCallbackInner />
    </Suspense>
  );
}
