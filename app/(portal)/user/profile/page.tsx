"use client";

import { useEffect, useState } from "react";
import { getErrorMessage } from "@/src/services/apiHelper";
import AnhDaiDien from "@/src/components/ui/AnhDaiDien";
import { Users, Flame, Clock, Loader2 } from "lucide-react";
import ActivityHeatmap from "@/src/components/profile/ActivityHeatmap";
import ViCoinCuaToi from "@/src/components/common/ViCoinCuaToi";
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
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 size={24} className="animate-spin text-slate-500" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <p className="text-sm font-medium text-red-700">
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
    <div className="min-h-screen bg-[#f8fafc] py-8">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-6 lg:grid-cols-12">
          {/* ============ COT TRAI: danh tinh + thong ke ============ */}
          <aside className="lg:col-span-4 xl:col-span-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col items-center text-center">
                <AnhDaiDien
                  src={avatarSrc}
                  ten={user.name}
                  size={96}
                  nenChuCai="bg-blue-600 text-white"
                />

                <h1 className="mt-4 text-xl font-extrabold text-slate-900">
                  {user.fullname || user.name}
                </h1>
                <p className="mt-0.5 text-sm text-blue-600">@{user.name}</p>

                <div className="mt-3 flex flex-wrap justify-center gap-2">
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 capitalize">
                    {user.role}
                  </span>
                  {providerName && (
                    <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                      {providerName}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-6 space-y-3 border-t border-slate-100 pt-5 text-sm">
                {activity && (
                  <div className="flex items-start gap-2.5">
                    <Flame size={16} className="mt-0.5 shrink-0 text-orange-500" />
                    <span className="text-slate-700">
                      <strong className="text-slate-900">{activity.currentStreak}</strong>{" "}
                      ngày học liên tiếp
                      <span className="mx-1.5 text-slate-400">·</span>
                      Dài nhất:{" "}
                      <strong className="text-slate-900">
                        {activity.longestStreak}
                      </strong>{" "}
                      ngày
                    </span>
                  </div>
                )}

                {activity && (
                  <div className="flex items-start gap-2.5">
                    <Users size={16} className="mt-0.5 shrink-0 text-slate-500" />
                    <span className="text-slate-700">
                      <strong className="text-slate-900">{activity.activeDays}</strong>{" "}
                      ngày có hoạt động
                      <span className="mx-1.5 text-slate-400">·</span>
                      <strong className="text-slate-900">{activity.total}</strong> hoạt
                      động
                    </span>
                  </div>
                )}

                <div className="flex items-start gap-2.5">
                  <Clock size={16} className="mt-0.5 shrink-0 text-slate-500" />
                  <span className="text-slate-700">Tham gia {joinedAgo}</span>
                </div>
              </div>
            </div>
          </aside>

          {/* ============ COT PHAI: heatmap + thong tin tai khoan ============ */}
          <section className="space-y-6 lg:col-span-8 xl:col-span-9">
            {activity ? (
              <ActivityHeatmap days={activity.days} total={activity.total} />
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
                Chưa tải được dữ liệu hoạt động.
              </div>
            )}

            <ViCoinCuaToi />

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-base font-bold text-slate-900">
                Thông tin tài khoản
              </h2>

              <div className="grid gap-4 md:grid-cols-2">
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
                  <div className="md:col-span-2">
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
      <label className="mb-1.5 block text-xs font-semibold text-slate-600">{label}</label>
      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900">
        {value}
      </div>
    </div>
  );
}
