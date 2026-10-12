"use client";

import { Loader2 } from "lucide-react";

import ActivityHeatmap from "@/src/components/features/portal/user/profile/parts/ActivityHeatmap";
import MyDocuments from "@/src/components/features/portal/user/profile/parts/MyDocuments";
import ProfileTabs, {
  useProfileTab,
} from "@/src/components/features/portal/user/profile/parts/ProfileTabs";
import SavedItems from "@/src/components/features/portal/user/profile/parts/SavedItems";
import { USER_PROFILE as C } from "@/src/constants/portal/user-profile-page";

import { useUserProfile } from "./hooks/useUserProfile";
import AccountInfoCard from "./parts/AccountInfoCard";
import ProfileSidebar from "./parts/ProfileSidebar";
import styles from "./UserProfile.module.scss";

/** Trang /user/profile - ho so, tab Tong quan / Tai lieu cua toi / Da luu. */
export default function UserProfile() {
  const { user, activity, loading, error, joinedAgo } = useUserProfile();
  // Tab dang mo: Tong quan / Tai lieu cua toi / Da luu - ghi tren ?tab=.
  const [tab, changeTab] = useProfileTab();

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
        <p className={styles.text}>{error || C.needLogin}</p>
      </div>
    );
  }

  const providerName =
    typeof user.provider === "object" && user.provider ? user.provider.name : null;

  return (
    <div className={styles.page}>
      <div className={styles.container2}>
        <div className={styles.grid}>
          <ProfileSidebar
            user={user}
            activity={activity}
            joinedAgo={joinedAgo}
            providerName={providerName}
          />

          <section className={styles.section}>
            <ProfileTabs tab={tab} changeTab={changeTab} />

            {/* Chi dung noi dung cua tab dang mo: tab Da luu / Tai lieu goi API
                rieng, khong can goi khi nguoi dung chua bam vao. */}
            <div
              role="tabpanel"
              id={`bang-${tab}`}
              aria-labelledby={`tab-${tab}`}
              className={styles.bangTab}
            >
              {tab === "tai-lieu" ? (
                <MyDocuments />
              ) : tab === "da-luu" ? (
                <SavedItems />
              ) : (
                <>
                  {activity ? (
                    <ActivityHeatmap days={activity.days} total={activity.total} />
                  ) : (
                    <div className={styles.card2}>{C.noActivity}</div>
                  )}

                  <AccountInfoCard user={user} providerName={providerName} />
                </>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
