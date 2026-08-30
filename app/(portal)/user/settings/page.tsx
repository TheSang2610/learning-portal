"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  User as UserIcon,
  Shield,
  BookOpen,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Link2,
} from "lucide-react";
import SettingRow, { SettingCard } from "@/src/components/settings/SettingRow";
import {
  getMyProfile,
  updateUserProfileApi,
  deactivateMyAccount,
  getProvidersApi,
  type User,
  type Provider,
  type UpdateProfilePayload,
} from "@/src/services/userApi";
import { getMyEnrolledCourses } from "@/src/services/enrollment.api";

type TabKey = "personal" | "security" | "courses";

const NAV: { group: string; items: { key: TabKey; label: string; icon: typeof UserIcon }[] }[] = [
  {
    group: "Tài khoản",
    items: [
      { key: "personal", label: "Thông tin cá nhân", icon: UserIcon },
      { key: "security", label: "Mật khẩu và bảo mật", icon: Shield },
    ],
  },
  {
    group: "Học tập",
    items: [{ key: "courses", label: "Khóa học của tôi", icon: BookOpen }],
  },
];

const TAB_META: Record<TabKey, { title: string; desc: string }> = {
  personal: {
    title: "Thông tin cá nhân",
    desc: "Quản lý tên hiển thị, ảnh đại diện và thông tin liên hệ của bạn.",
  },
  security: {
    title: "Mật khẩu và bảo mật",
    desc: "Quản lý mật khẩu, tài khoản liên kết và trạng thái tài khoản.",
  },
  courses: {
    title: "Khóa học của tôi",
    desc: "Các khóa học bạn đã đăng ký và tiến độ học tập.",
  },
};

// Dinh dang ngay cho <input type="date"> theo gio dia phuong.
// Dung toISOString() se lech mot ngay o cac mui gio am.
const toDateInput = (v?: string) => {
  if (!v) return "";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "";
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
};

const fmtDate = (v?: string) => (v ? new Date(v).toLocaleDateString("vi-VN") : "");

export default function SettingsPage() {
  const [tab, setTab] = useState<TabKey>("personal");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const [providers, setProviders] = useState<Provider[]>([]);

  useEffect(() => {
    (async () => {
      try {
        // Lay tu API chu khong doc localStorage: response dang nhap chi co
        // _id/name/email/role nen fullname, birthday, avatar... se luon trong.
        const p = await getMyProfile();
        setUser(p);
        if (p.role === "instructor") {
          getProvidersApi().then(setProviders).catch(() => {});
        }
      } catch (e) {
        setLoadError(e instanceof Error ? e.message : "Không tải được thông tin tài khoản");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Header doc user tu localStorage va lang nghe su kien "userInfoChanged",
  // nen phai dong bo lai thi ten/anh tren thanh dieu huong moi doi theo.
  const syncLocal = useCallback((u: User) => {
    try {
      const raw = localStorage.getItem("userInfo");
      const prev = raw && raw !== "undefined" ? JSON.parse(raw) : {};
      localStorage.setItem("userInfo", JSON.stringify({ ...prev, ...u }));
      window.dispatchEvent(new Event("userInfoChanged"));
    } catch {
      /* localStorage bi chan (che do rieng tu) - khong anh huong viec luu tren server */
    }
  }, []);

  const save = useCallback(
    async (payload: UpdateProfilePayload) => {
      setSaving(true);
      setMsg(null);
      try {
        const updated = await updateUserProfileApi(payload);
        setUser(updated);
        syncLocal(updated);
        setEditing(null);
        setMsg({ ok: true, text: "Đã lưu thay đổi." });
        return true;
      } catch (e) {
        setMsg({ ok: false, text: e instanceof Error ? e.message : "Lưu thất bại." });
        return false;
      } finally {
        setSaving(false);
      }
    },
    [syncLocal]
  );

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 size={24} className="animate-spin text-slate-500" />
      </div>
    );
  }

  if (loadError || !user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <p className="text-sm font-medium text-red-700">
          {loadError || "Vui lòng đăng nhập để vào phần cài đặt."}
        </p>
      </div>
    );
  }

  const toggle = (key: string) => {
    setMsg(null);
    setEditing((cur) => (cur === key ? null : key));
  };

  const meta = TAB_META[tab];

  return (
    <div className="min-h-screen bg-[#f8fafc] py-8">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-6 lg:grid-cols-12">

          {/* ============ THANH DIEU HUONG ============ */}
          <aside className="lg:col-span-4 xl:col-span-3">
            <div className="lg:sticky lg:top-[120px]">
              <div className="mb-4 hidden lg:block">
                <h1 className="text-lg font-extrabold text-slate-900">Cài đặt tài khoản</h1>
                <p className="mt-1 text-sm text-slate-600">
                  Quản lý hồ sơ, bảo mật và khóa học của bạn.
                </p>
              </div>

              {/* Man hinh nho: thanh ngang cuon duoc. Man hinh lon: danh sach doc */}
              <nav
                aria-label="Cài đặt tài khoản"
                className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 lg:mx-0 lg:block lg:space-y-5 lg:overflow-visible lg:px-0 lg:pb-0"
              >
                {NAV.map((section) => (
                  <div key={section.group} className="contents lg:block">
                    <h3 className="hidden px-1 pb-2 text-xs font-bold uppercase tracking-wide text-slate-500 lg:block">
                      {section.group}
                    </h3>
                    <div className="contents lg:block lg:overflow-hidden lg:rounded-2xl lg:border lg:border-slate-200 lg:bg-white lg:shadow-sm">
                      {section.items.map(({ key, label, icon: Icon }) => {
                        const active = tab === key;
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => {
                              setTab(key);
                              setEditing(null);
                              setMsg(null);
                            }}
                            aria-current={active ? "page" : undefined}
                            className={`flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition lg:w-full lg:rounded-none lg:border-0 lg:border-b lg:border-slate-100 lg:px-5 lg:py-3.5 lg:last:border-b-0 ${
                              active
                                ? "border-blue-600 bg-blue-600 text-white lg:border-slate-100 lg:bg-blue-50 lg:text-blue-700"
                                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 lg:border-slate-100"
                            }`}
                          >
                            <Icon size={16} className="shrink-0" />
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </nav>
            </div>
          </aside>

          {/* ============ NOI DUNG ============ */}
          <main className="space-y-5 lg:col-span-8 xl:col-span-9">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">{meta.title}</h2>
              <p className="mt-1 text-sm text-slate-600">{meta.desc}</p>
            </div>

            {msg && (
              <div
                role="status"
                className={`flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium ${
                  msg.ok
                    ? "border-green-200 bg-green-50 text-green-800"
                    : "border-red-200 bg-red-50 text-red-800"
                }`}
              >
                {msg.ok ? (
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                ) : (
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                )}
                {msg.text}
              </div>
            )}

            {tab === "personal" && (
              // updatedAt doi sau moi lan luu -> React tao lai component,
              // cac o nhap lay lai gia tri that tu server thay vi giu ban nhap cu.
              <PersonalTab
                key={user.updatedAt ?? "personal"}
                user={user}
                providers={providers}
                editing={editing}
                toggle={toggle}
                saving={saving}
                save={save}
              />
            )}

            {tab === "security" && (
              <SecurityTab
                user={user}
                editing={editing}
                toggle={toggle}
                saving={saving}
                save={save}
                setMsg={setMsg}
              />
            )}

            {tab === "courses" && <CoursesTab />}
          </main>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   TAB: THONG TIN CA NHAN
   ========================================================================== */

interface TabProps {
  user: User;
  editing: string | null;
  toggle: (k: string) => void;
  saving: boolean;
  save: (p: UpdateProfilePayload) => Promise<boolean>;
}

function PersonalTab({
  user,
  providers,
  editing,
  toggle,
  saving,
  save,
}: TabProps & { providers: Provider[] }) {
  const [name, setName] = useState(user.name ?? "");
  const [fullname, setFullname] = useState(user.fullname ?? "");
  const [birthday, setBirthday] = useState(toDateInput(user.birthday));
  const [bio, setBio] = useState(user.bio ?? "");
  const [phone, setPhone] = useState(user.phone ?? "");
  const [avatar, setAvatar] = useState(user.avatar ?? "");
  const [providerId, setProviderId] = useState(
    typeof user.provider === "object" && user.provider ? user.provider._id : (user.provider ?? "")
  );

  const providerName =
    typeof user.provider === "object" && user.provider ? user.provider.name : "";

  return (
    <>
      <SettingCard
        title="Thông tin cơ bản"
        desc="Quản lý tên hiển thị, họ tên, ngày sinh, giới thiệu và ảnh đại diện."
      >
        <SettingRow
          label="Tên hiển thị"
          value={user.name}
          mono
          open={editing === "name"}
          onToggle={() => toggle("name")}
        >
          <FieldForm
            saving={saving}
            onSave={() => save({ name })}
            onCancel={() => toggle("name")}
            hint="Từ 2 đến 50 ký tự. Đây là tên hiện trên thanh điều hướng và trang cá nhân."
          >
            <input
              className={inputCls}
              value={name}
              maxLength={50}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </FieldForm>
        </SettingRow>

        <SettingRow
          label="Họ và tên"
          value={user.fullname}
          open={editing === "fullname"}
          onToggle={() => toggle("fullname")}
        >
          <FieldForm
            saving={saving}
            onSave={() => save({ fullname })}
            onCancel={() => toggle("fullname")}
            hint="Để trống nếu bạn không muốn hiển thị họ tên thật."
          >
            <input
              className={inputCls}
              value={fullname}
              maxLength={100}
              placeholder="Nguyễn Văn A"
              onChange={(e) => setFullname(e.target.value)}
              autoFocus
            />
          </FieldForm>
        </SettingRow>

        <SettingRow
          label="Ngày sinh"
          value={fmtDate(user.birthday)}
          open={editing === "birthday"}
          onToggle={() => toggle("birthday")}
        >
          <FieldForm
            saving={saving}
            onSave={() => save({ birthday })}
            onCancel={() => toggle("birthday")}
          >
            <input
              type="date"
              className={inputCls}
              value={birthday}
              max={toDateInput(new Date().toISOString())}
              onChange={(e) => setBirthday(e.target.value)}
              autoFocus
            />
          </FieldForm>
        </SettingRow>

        <SettingRow
          label="Giới thiệu"
          value={user.bio}
          open={editing === "bio"}
          onToggle={() => toggle("bio")}
        >
          <FieldForm
            saving={saving}
            onSave={() => save({ bio })}
            onCancel={() => toggle("bio")}
            hint={`${bio.length}/500 ký tự`}
          >
            <textarea
              className={`${inputCls} min-h-[110px] resize-y`}
              value={bio}
              maxLength={500}
              placeholder="Vài dòng về bản thân bạn..."
              onChange={(e) => setBio(e.target.value)}
              autoFocus
            />
          </FieldForm>
        </SettingRow>

        <SettingRow
          label="Ảnh đại diện"
          image={user.avatar ?? ""}
          open={editing === "avatar"}
          onToggle={() => toggle("avatar")}
        >
          <FieldForm
            saving={saving}
            onSave={() => save({ avatar })}
            onCancel={() => toggle("avatar")}
            hint="Dán đường dẫn ảnh. Hệ thống chưa có chức năng tải ảnh lên, nên hãy dùng link từ nơi khác."
          >
            <input
              className={inputCls}
              value={avatar}
              placeholder="https://..."
              onChange={(e) => setAvatar(e.target.value)}
              autoFocus
            />
            {avatar.trim() && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatar}
                alt="Xem trước ảnh đại diện"
                className="mt-3 h-20 w-20 rounded-full border border-slate-200 object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            )}
          </FieldForm>
        </SettingRow>
      </SettingCard>

      <SettingCard title="Liên hệ" desc="Thông tin dùng để liên lạc và định danh tài khoản.">
        <SettingRow
          label="Số điện thoại"
          value={user.phone}
          open={editing === "phone"}
          onToggle={() => toggle("phone")}
        >
          <FieldForm
            saving={saving}
            onSave={() => save({ phone })}
            onCancel={() => toggle("phone")}
            hint="8-15 chữ số. Mỗi số điện thoại chỉ dùng cho một tài khoản. Để trống để xóa."
          >
            <input
              type="tel"
              className={inputCls}
              value={phone}
              placeholder="0912345678"
              onChange={(e) => setPhone(e.target.value)}
              autoFocus
            />
          </FieldForm>
        </SettingRow>

        <SettingRow
          label="Email"
          value={user.email}
          mono
          readOnly
          hint="Email là định danh đăng nhập nên không thể tự đổi."
        />

        {user.role === "instructor" && (
          <SettingRow
            label="Đơn vị công tác"
            value={providerName}
            hint="Khóa học bạn tạo sẽ được gán về đơn vị này."
            open={editing === "provider"}
            onToggle={() => toggle("provider")}
          >
            <FieldForm
              saving={saving}
              onSave={() => save({ provider: providerId || null })}
              onCancel={() => toggle("provider")}
            >
              <select
                className={inputCls}
                value={typeof providerId === "string" ? providerId : ""}
                onChange={(e) => setProviderId(e.target.value)}
                autoFocus
              >
                <option value="">-- Không thuộc đơn vị nào --</option>
                {providers.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.type === "university" ? "[Trường ĐH] " : "[Doanh nghiệp] "}
                    {p.name}
                  </option>
                ))}
              </select>
            </FieldForm>
          </SettingRow>
        )}
      </SettingCard>

      <SettingCard title="Thông tin hệ thống">
        <SettingRow label="Mã người dùng" value={user.userId} mono readOnly />
        <SettingRow label="Vai trò" value={roleLabel(user.role)} readOnly />
        <SettingRow label="Ngày tham gia" value={fmtDate(user.createdAt)} readOnly />
      </SettingCard>
    </>
  );
}

/* ==========================================================================
   TAB: MAT KHAU VA BAO MAT
   ========================================================================== */

function SecurityTab({
  user,
  editing,
  toggle,
  saving,
  save,
  setMsg,
}: TabProps & { setMsg: (m: { ok: boolean; text: string } | null) => void }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");

  const [delPassword, setDelPassword] = useState("");
  const [deleting, setDeleting] = useState(false);

  // Tai khoan tao bang Google chua tung dat mat khau
  const hasGoogle = Boolean(user.googleId);
  // Mac dinh coi nhu da co mat khau: neu backend cu chua tra truong nay thi
  // van hien o nhap mat khau hien tai (an toan hon la bo qua buoc xac minh).
  const hasPassword = user.hasPassword !== false;

  const submitPassword = async () => {
    if (hasPassword && !current) {
      setMsg({ ok: false, text: "Vui lòng nhập mật khẩu hiện tại." });
      return false;
    }
    if (next.length < 6) {
      setMsg({ ok: false, text: "Mật khẩu mới phải có ít nhất 6 ký tự." });
      return false;
    }
    if (next !== confirm) {
      setMsg({ ok: false, text: "Xác nhận mật khẩu không khớp." });
      return false;
    }
    const ok = await save({ password: next, currentPassword: current });
    if (ok) {
      setCurrent("");
      setNext("");
      setConfirm("");
    }
    return ok;
  };

  const submitDeactivate = async () => {
    setDeleting(true);
    setMsg(null);
    try {
      await deactivateMyAccount(delPassword);
      localStorage.removeItem("authToken");
      localStorage.removeItem("userInfo");
      window.dispatchEvent(new Event("userInfoChanged"));
      window.location.href = "/";
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "Không thể vô hiệu hóa." });
      setDeleting(false);
    }
  };

  return (
    <>
      <SettingCard title="Đăng nhập" desc="Quản lý mật khẩu dùng để đăng nhập vào tài khoản.">
        <SettingRow
          label="Mật khẩu"
          value={hasPassword ? "••••••••" : "Chưa đặt mật khẩu"}
          hint={
            hasPassword
              ? "Đổi mật khẩu định kỳ để giữ an toàn cho tài khoản."
              : "Đặt mật khẩu để có thể đăng nhập bằng email, không chỉ qua Google."
          }
          open={editing === "password"}
          onToggle={() => toggle("password")}
        >
          <FieldForm
            saving={saving}
            onSave={submitPassword}
            onCancel={() => toggle("password")}
            saveLabel={hasPassword ? "Đổi mật khẩu" : "Đặt mật khẩu"}
          >
            <div className="space-y-3">
              {hasPassword ? (
                <div>
                  <label className={labelCls}>Mật khẩu hiện tại</label>
                  <input
                    type="password"
                    className={inputCls}
                    value={current}
                    autoComplete="current-password"
                    onChange={(e) => setCurrent(e.target.value)}
                    autoFocus
                  />
                </div>
              ) : (
                <p className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
                  Tài khoản của bạn đăng nhập bằng Google và chưa có mật khẩu.
                  Đặt mật khẩu để đăng nhập được bằng email.
                </p>
              )}
              <div>
                <label className={labelCls}>Mật khẩu mới</label>
                <input
                  type="password"
                  className={inputCls}
                  value={next}
                  autoComplete="new-password"
                  onChange={(e) => setNext(e.target.value)}
                />
              </div>
              <div>
                <label className={labelCls}>Nhập lại mật khẩu mới</label>
                <input
                  type="password"
                  className={inputCls}
                  value={confirm}
                  autoComplete="new-password"
                  onChange={(e) => setConfirm(e.target.value)}
                />
              </div>
            </div>
          </FieldForm>
        </SettingRow>
      </SettingCard>

      <SettingCard
        title="Tài khoản liên kết"
        desc="Các tài khoản mạng xã hội dùng để đăng nhập nhanh."
      >
        <SettingRow
          label="Google"
          value={hasGoogle ? user.email : "Chưa liên kết"}
          readOnly
          trailing={
            hasGoogle ? (
              <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-800">
                <Link2 size={12} /> Đã liên kết
              </span>
            ) : (
              <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                Chưa liên kết
              </span>
            )
          }
        />
      </SettingCard>

      {/* Admin tu khoa minh thi khong con ai mo khoa duoc -> an han muc nay */}
      {user.role !== "admin" && (
        <SettingCard
          title="Vô hiệu hóa tài khoản"
          desc="Tài khoản sẽ bị khóa và bạn sẽ bị đăng xuất ngay lập tức."
        >
          <SettingRow
            label="Vô hiệu hóa tài khoản"
            value="Chỉ quản trị viên mới có thể mở khóa lại"
            open={editing === "deactivate"}
            onToggle={() => toggle("deactivate")}
          >
            <div className="space-y-3">
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                Dữ liệu học tập của bạn được giữ nguyên, nhưng bạn sẽ không đăng nhập
                lại được cho tới khi quản trị viên mở khóa.
              </div>
              <div>
                <label className={labelCls}>Nhập mật khẩu để xác nhận</label>
                <input
                  type="password"
                  className={inputCls}
                  value={delPassword}
                  autoComplete="current-password"
                  onChange={(e) => setDelPassword(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={deleting || !delPassword}
                  onClick={submitDeactivate}
                  className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  {deleting ? "Đang xử lý..." : "Vô hiệu hóa tài khoản"}
                </button>
                <button
                  type="button"
                  onClick={() => toggle("deactivate")}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Hủy
                </button>
              </div>
            </div>
          </SettingRow>
        </SettingCard>
      )}
    </>
  );
}

/* ==========================================================================
   TAB: KHOA HOC CUA TOI
   ========================================================================== */

interface Enrollment {
  _id: string;
  course: {
    _id: string;
    title: string;
    slug?: string;
    thumbnail?: string;
  } | null;
  totalProgress: number;
  status: "active" | "completed" | "dropped";
  createdAt: string;
  lastAccessedAt?: string;
}

const STATUS_LABEL: Record<Enrollment["status"], { text: string; cls: string }> = {
  active: { text: "Đang học", cls: "bg-blue-50 text-blue-700" },
  completed: { text: "Hoàn thành", cls: "bg-green-50 text-green-800" },
  dropped: { text: "Đã dừng", cls: "bg-slate-100 text-slate-700" },
};

function CoursesTab() {
  const [rows, setRows] = useState<Enrollment[] | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    getMyEnrolledCourses()
      .then((d) => setRows(Array.isArray(d) ? d : []))
      .catch((e) => setErr(e instanceof Error ? e.message : "Không tải được danh sách"));
  }, []);

  if (err) {
    return (
      <SettingCard title="Khóa học đã đăng ký">
        <p className="px-5 py-6 text-sm text-red-700">{err}</p>
      </SettingCard>
    );
  }

  if (!rows) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 size={22} className="animate-spin text-slate-500" />
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <SettingCard title="Khóa học đã đăng ký">
        <div className="px-5 py-10 text-center">
          <p className="text-sm font-semibold text-slate-900">Chưa đăng ký khóa học nào</p>
          <p className="mt-1 text-sm text-slate-600">
            Các khóa học bạn đăng ký sẽ xuất hiện tại đây.
          </p>
          <Link
            href="/courses"
            className="mt-4 inline-block rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Khám phá khóa học
          </Link>
        </div>
      </SettingCard>
    );
  }

  return (
    <SettingCard title="Khóa học đã đăng ký" desc={`${rows.length} khóa học`}>
      {rows.map((r) => {
        const s = STATUS_LABEL[r.status] ?? STATUS_LABEL.active;
        const pct = Math.max(0, Math.min(100, Math.round(r.totalProgress || 0)));

        return (
          <div
            key={r._id}
            className="flex items-center gap-4 border-b border-slate-100 px-5 py-4 last:border-b-0"
          >
            {r.course?.thumbnail ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={r.course.thumbnail}
                alt=""
                className="h-14 w-24 shrink-0 rounded-lg border border-slate-200 object-cover"
              />
            ) : (
              <div className="flex h-14 w-24 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                <BookOpen size={18} className="text-slate-500" />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="truncate text-sm font-semibold text-slate-900">
                  {/* Khoa hoc co the da bi xoa nhung ban ghi dang ky van con */}
                  {r.course?.title ?? "Khóa học không còn tồn tại"}
                </h4>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.cls}`}>
                  {s.text}
                </span>
              </div>

              <div className="mt-2 flex items-center gap-2.5">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full rounded-full bg-blue-600" style={{ width: `${pct}%` }} />
                </div>
                <span className="shrink-0 text-xs font-semibold text-slate-700">{pct}%</span>
              </div>

              <p className="mt-1.5 text-xs text-slate-600">
                Đăng ký {fmtDate(r.createdAt)}
                {r.lastAccessedAt && ` · Học gần nhất ${fmtDate(r.lastAccessedAt)}`}
              </p>
            </div>

            {r.course?.slug && (
              <Link
                href={`/learn?slug=${encodeURIComponent(r.course.slug)}`}
                className="shrink-0 rounded-xl border border-blue-600 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
              >
                Vào học
              </Link>
            )}
          </div>
        );
      })}
    </SettingCard>
  );
}

/* ==========================================================================
   PHAN DUNG CHUNG
   ========================================================================== */

const inputCls =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-100";

const labelCls = "mb-1.5 block text-xs font-semibold text-slate-700";

function FieldForm({
  children,
  hint,
  saving,
  saveLabel = "Lưu",
  onSave,
  onCancel,
}: {
  children: React.ReactNode;
  hint?: string;
  saving: boolean;
  saveLabel?: string;
  onSave: () => void | Promise<unknown>;
  onCancel: () => void;
}) {
  return (
    <div>
      {children}
      {hint && <p className="mt-2 text-xs text-slate-600">{hint}</p>}
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          disabled={saving}
          onClick={() => onSave()}
          className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {saving ? "Đang lưu..." : saveLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Hủy
        </button>
      </div>
    </div>
  );
}

function roleLabel(role: string) {
  if (role === "admin") return "Quản trị viên";
  if (role === "instructor") return "Giảng viên";
  return "Học viên";
}
