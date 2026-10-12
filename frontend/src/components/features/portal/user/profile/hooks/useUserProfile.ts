"use client";

import { useEffect, useState } from "react";

import { USER_PROFILE as C } from "@/src/constants/portal/user-profile-page";
import { getErrorMessage } from "@/src/services/apiHelper";
import {
  getMyActivity,
  getMyProfile,
  type ActivitySummary,
  type User,
} from "@/src/services/userApi";

// Goi trong effect chu khong phai luc render: Date.now() la ham khong thuan khiet,
// goi khi render se lam React canh bao va co the gay lech giua server va client.
function describeJoined(v?: string) {
  if (!v) return "";
  const months = Math.floor(
    (Date.now() - new Date(v).getTime()) / (1000 * 60 * 60 * 24 * 30),
  );
  if (months < 1) return C.joinedAgo.recent;
  if (months < 12) return C.joinedAgo.months(months);
  const y = Math.floor(months / 12);
  return y === 1 ? C.joinedAgo.oneYear : C.joinedAgo.years(y);
}

/** Ho so + tong hop hoat dong (heatmap) cua nguoi dang dang nhap. */
export function useUserProfile() {
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
        setError(getErrorMessage(e, C.loadFailed));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { user, activity, loading, error, joinedAgo };
}
