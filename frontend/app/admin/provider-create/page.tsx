import { Suspense } from "react";

import { AdminProviderCreate } from "@/src/components/features/admin/providers";

// useSearchParams (?id= de sua) bat buoc nam trong Suspense.
export default function AdminProviderCreatePage() {
  return (
    <Suspense>
      <AdminProviderCreate />
    </Suspense>
  );
}
