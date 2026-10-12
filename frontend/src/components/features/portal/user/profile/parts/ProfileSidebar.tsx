import { Clock, Flame, Users } from "lucide-react";

import Avatar from "@/src/components/ui/Avatar";
import { USER_PROFILE as C } from "@/src/constants/portal/user-profile-page";
import type { ActivitySummary, User } from "@/src/services/userApi";

import styles from "../UserProfile.module.scss";

interface ProfileSidebarProps {
  user: User;
  activity: ActivitySummary | null;
  joinedAgo: string;
  providerName: string | null;
}

/** Cot trai: anh, ten, vai tro, chuoi ngay hoc va ngay tham gia. */
export default function ProfileSidebar({
  user,
  activity,
  joinedAgo,
  providerName,
}: ProfileSidebarProps) {
  return (
    <aside className={styles.aside}>
      <div className={styles.card}>
        <div className={styles.col}>
          <Avatar
            src={user.avatar || user.googlePicture}
            ten={user.name}
            size={96}
            letterBackground={styles.box4}
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
                {C.streak.days}
                <span className={styles.label4}>{C.dot}</span>
                {C.streak.longest}{" "}
                <strong className={styles.strong}>{activity.longestStreak}</strong>{" "}
                {C.streak.unit}
              </span>
            </div>
          )}

          {activity && (
            <div className={styles.row3}>
              <Users size={16} className={styles.box2} />
              <span className={styles.label3}>
                <strong className={styles.strong}>{activity.activeDays}</strong>{" "}
                {C.active.days}
                <span className={styles.label4}>{C.dot}</span>
                <strong className={styles.strong}>{activity.total}</strong>
                {C.active.events}
              </span>
            </div>
          )}

          <div className={styles.row3}>
            <Clock size={16} className={styles.box2} />
            <span className={styles.label3}>{C.joined(joinedAgo)}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
