import { TrendingDown, TrendingUp } from "lucide-react";

import { ADMIN_DASHBOARD as C } from "@/src/constants/admin/dashboard-page";
import { fillTemplate } from "@/src/lib/format";
import type {
  DashboardActivity,
  DashboardStatistics,
  WindowCompare,
} from "@/src/services/adminService";

import styles from "../AdminDashboard.module.scss";

const nf = new Intl.NumberFormat("vi-VN");

/** Nhan % thay doi 30 ngay; ky truoc bang 0 thi ghi "Moi" (khong chia cho 0). */
function Delta({ c }: { c: WindowCompare }) {
  if (c.change === null) {
    return c.current > 0 ? <span className={styles.badge}>{C.newBadge}</span> : null;
  }
  const up = c.change >= 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span className={styles.badge} title={C.vs30}>
      <Icon size={13} aria-hidden />
      {up ? "+" : ""}
      {c.change}%
    </span>
  );
}

function Card({
  label,
  value,
  badge,
  footer,
  detail,
}: {
  label: string;
  value: number;
  badge: React.ReactNode;
  footer: string;
  detail: string;
}) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statHead}>
        <span className={styles.statLabel}>{label}</span>
        {badge}
      </div>
      <div className={styles.statValue}>{nf.format(value)}</div>
      <div className={styles.statFooter}>
        <span className={styles.statFooterMain}>{footer}</span>
        <span className={styles.statFooterSub}>{detail}</span>
      </div>
    </div>
  );
}

/** Bon the so lieu dau trang, kieu SectionCards cua shadcn. */
export default function SectionCards({
  stats,
  activity,
}: {
  stats: DashboardStatistics;
  activity: DashboardActivity;
}) {
  const k = C.cards;
  const cmp = activity.compare;
  return (
    <div className={styles.cards}>
      <Card
        label={k.users.label}
        value={stats.users.total}
        badge={<Delta c={cmp.users} />}
        footer={fillTemplate(k.users.footer, { n: cmp.users.current })}
        detail={fillTemplate(k.users.detail, {
          s: stats.users.students,
          i: stats.users.instructors,
        })}
      />
      <Card
        label={k.courses.label}
        value={stats.courses.total}
        badge={
          <span className={styles.badge}>
            {fillTemplate(k.courses.badge, { n: stats.courses.published })}
          </span>
        }
        footer={fillTemplate(k.courses.footer, { n: stats.courses.draft })}
        detail={fillTemplate(k.courses.detail, { q: stats.quizzes.total })}
      />
      <Card
        label={k.enrollments.label}
        value={stats.enrollments.total}
        badge={<Delta c={cmp.enrollments} />}
        footer={fillTemplate(k.enrollments.footer, { n: cmp.enrollments.current })}
        detail={fillTemplate(k.enrollments.detail, {
          a: stats.enrollments.active,
          c: stats.enrollments.completed,
        })}
      />
      <Card
        label={k.certificates.label}
        value={stats.certificates.total}
        badge={<Delta c={cmp.certificates} />}
        footer={fillTemplate(k.certificates.footer, { n: cmp.certificates.current })}
        detail={fillTemplate(k.certificates.detail, {
          v: stats.certificates.valid,
          r: (stats.reviews.averageRating || 0).toFixed(1),
        })}
      />
    </div>
  );
}
