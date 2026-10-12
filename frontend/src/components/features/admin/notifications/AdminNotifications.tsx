"use client";

import { Bell } from "lucide-react";

import { ADMIN_NOTIFICATIONS as C } from "@/src/constants/admin/notifications-page";

import { useAdminAnnouncements } from "./hooks/useAdminAnnouncements";
import AnnouncementForm from "./parts/AnnouncementForm";
import AnnouncementList from "./parts/AnnouncementList";
import styles from "./AdminNotifications.module.scss";

/** Trang /admin/notifications - gui va quan ly thong bao he thong. */
export default function AdminNotifications() {
  const s = useAdminAnnouncements();

  return (
    <div className={styles.box}>
      <div className={styles.row}>
        <Bell size={22} className={styles.box2} />
        <h1 className={styles.title}>{C.title}</h1>
      </div>

      <p className={styles.text}>{C.intro}</p>

      <AnnouncementForm s={s} />
      <AnnouncementList s={s} />
    </div>
  );
}
