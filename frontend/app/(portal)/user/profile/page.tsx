"use client";

import { useEffect, useState } from "react";
import { getErrorMessage } from "@/src/services/apiHelper";
import AnhDaiDien from "@/src/components/ui/Avatar";
import { Users, Flame, Clock, Loader2 } from "lucide-react";
import ActivityHeatmap from "@/src/components/profile/ActivityHeatmap";
import ViCoinCuaToi from "@/src/components/common/MyCoinWallet";

import styles from "./page.module.scss";
import {
  getMyProfile,
  getMyActivity,
  type User,
  type ActivitySummary,
} from "@/src/services/userApi";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [activity, setActivity] = useState<ActivitySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [joinedAgo, setJoinedAgo] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError("");
        // Hai request doc lap -> goi song song
        const [p, a] = await Promise.all([
          getMyProfile(),
          getMyActivity().catch(() => null), // heatmap loi thi van hien profile
        ]);
        setUser(p);
        setActivity(a);
        setJoinedAgo(describeJoined(p.createdAt));
      } catch (e) {
        setError(getErrorMessage(e, "Không tải được thông tin tài khoản"));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className={styles.row}>
        <Loader2 size={24} className={styles.spinner} />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className={styles.container}>
        <p className={styles.text}>
          {error || "Vui lòng đăng nhập để xem trang cá nhân."}
        </p>
      </div>
    );
  }

  const fmtDate = (v?: string) =>
    v ? new Date(v).toLocaleDateString("vi-VN") : "Chưa cập nhật";

  const avatarSrc = user.avatar || user.googlePicture;
  const providerName =
    typeof user.provider === "object" && user.provider ? user.provider.name : null;

  return (
    <div className={styles.page}>
      <div className={styles.container2}>
        <div className={styles.grid}>
          {/* ============ COT TRAI: danh tinh + thong ke ============ */}
          <aside className={styles.aside}>
            <div className={styles.card}>
              <div className={styles.col}>
                <AnhDaiDien
                  src={avatarSrc}
                  ten={user.name}
                  size={96}
                  nenChuCai={styles.box4}
                />

                <h1 className={styles.title}>{user.fullname || user.name}</h1>
                <p className={styles.text2}>@{user.name}</p>

                <div className={styles.row2}>
                  <span className={styles.label}>{user.role}</span>
                  {providerName && <span className={styles.label2}>{providerName}</span>}
                </div>
              </div>

              <div className={styles.stack}>
                {activity && (
                  <div className={styles.row3}>
                    <Flame size={16} className={styles.box} />
                    <span className={styles.label3}>
                      <strong className={styles.strong}>{activity.currentStreak}</strong>{" "}
                      ngày học liên tiếp
                      <span className={styles.label4}>·</span>
                      Dài nhất:{" "}
                      <strong className={styles.strong}>
                        {activity.longestStreak}
                      </strong>{" "}
                      ngày
                    </span>
                  </div>
                )}

                {activity && (
                  <div className={styles.row3}>
                    <Users size={16} className={styles.box2} />
                    <span className={styles.label3}>
                      <strong className={styles.strong}>{activity.activeDays}</strong>{" "}
                      ngày có hoạt động
                      <span className={styles.label4}>·</span>
                      <strong className={styles.strong}>{activity.total}</strong> hoạt
                      động
                    </span>
                  </div>
                )}

                <div className={styles.row3}>
                  <Clock size={16} className={styles.box2} />
                  <span className={styles.label3}>Tham gia {joinedAgo}</span>
                </div>
              </div>
            </div>
          </aside>

          {/* ============ COT PHAI: heatmap + thong tin tai khoan ============ */}
          <section className={styles.section}>
            {activity ? (
              <ActivityHeatmap days={activity.days} total={activity.total} />
            ) : (
              <div className={styles.card2}>Chưa tải được dữ liệu hoạt động.</div>
            )}

            <ViCoinCuaToi />

            <div className={styles.card}>
              <h2 className={styles.heading}>Thông tin tài khoản</h2>

              <div className={styles.grid2}>
                <Field label="Tên hiển thị" value={user.name} />
                <Field
                  label="Họ và tên đầy đủ"
                  value={user.fullname || "Chưa cập nhật"}
                />
                <Field label="Ngày sinh" value={fmtDate(user.birthday)} />
                <Field label="Email" value={user.email} />
                {user.phone && <Field label="Số điện thoại" value={user.phone} />}
                {providerName && <Field label="Đơn vị công tác" value={providerName} />}
                {user.bio && (
                  <div className={styles.box3}>
                    <Field label="Giới thiệu" value={user.bio} />
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

// Goi trong effect chu khong phai luc render: Date.now() la ham khong thuan khiet,
// goi khi render se lam React canh bao va co the gay lech giua server va client.
function describeJoined(v?: string) {
  if (!v) return "";
  const months = Math.floor(
    (Date.now() - new Date(v).getTime()) / (1000 * 60 * 60 * 24 * 30),
  );
  if (months < 1) return "gần đây";
  if (months < 12) return `${months} tháng trước`;
  const y = Math.floor(months / 12);
  return y === 1 ? "một năm trước" : `${y} năm trước`;
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className={styles.fieldLabel}>{label}</label>
      <div className={styles.card3}>{value}</div>
    </div>
  );
}
