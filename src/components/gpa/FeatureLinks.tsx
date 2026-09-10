import Link from "next/link";
import type { LucideIcon } from "lucide-react";

// Dung chung cho ca hai trang: "Các tính năng khác" o trang Ho so diem va
// "Các tính năng liên quan" o trang Tinh diem tong ket.

export interface FeatureLink {
  href: string;
  label: string;
  desc?: string;
  icon: LucideIcon;
}

export default function FeatureLinks({
  title,
  subtitle,
  items,
}: {
  title: string;
  subtitle: string;
  items: FeatureLink[];
}) {
  return (
    <section className="mt-12">
      <div className="text-center">
        <h2 className="text-2xl font-extrabold text-slate-900">{title}</h2>
        <p className="mt-1.5 text-sm text-slate-600">{subtitle}</p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {items.map(({ href, label, desc, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm transition hover:border-blue-600 hover:shadow-md"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100">
              <Icon size={20} className="text-blue-600" />
            </span>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-slate-900">{label}</h3>
              {desc && <p className="mt-0.5 text-sm text-slate-600">{desc}</p>}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
