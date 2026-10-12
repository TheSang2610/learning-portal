import UserBootstrap from "@/src/components/common/UserBootstrap";
import { AdminShell } from "@/src/components/features/admin/layout";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <UserBootstrap />
      <AdminShell>{children}</AdminShell>
    </>
  );
}
