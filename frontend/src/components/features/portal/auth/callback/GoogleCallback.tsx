import { Suspense } from "react";

import { AUTH_CALLBACK } from "@/src/constants/portal/auth-callback-page";

import CallbackCard from "./parts/CallbackCard";
import GoogleCallbackStatus from "./parts/GoogleCallbackStatus";

// Tach server component + Suspense cho phan doc useSearchParams(),
// de trang nay van prerender tinh duoc.
export default function GoogleCallback() {
  return (
    <Suspense fallback={<CallbackCard status={AUTH_CALLBACK.loading} />}>
      <GoogleCallbackStatus />
    </Suspense>
  );
}
