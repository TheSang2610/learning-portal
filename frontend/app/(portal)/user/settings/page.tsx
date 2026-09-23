"use client";

import { useCallback, useEffect, useState } from "react";
import { datNguoiDung } from "@/src/hooks/userStore";
import { xoaPhien } from "@/src/services/apiHelper";
import Link from "next/link";
import {
  User as UserIcon,
  Shield,
  BookOpen,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Link2,
  Upload,
  X,
} from "lucide-react";
import SettingRow, { SettingCard } from "@/src/components/settings/SettingRow";
import { loiMatKhauMoi } from "@/src/services/rules";

import styles from "./page.module.scss";
import {
  getMyProfile,
  updateUserProfileApi,
  uploadAvatarApi,
  deactivateMyAccount,
  getProvidersApi,
  type User,
  type Provider,
  type UpdateProfilePayload,
} from "@/src/services/userApi";
import {
  getMyEnrolledCourses,
  type EnrolledCourseItem,
  type EnrollmentStatus,
} from "@/src/services/enrollment.api";

type TabKey = "personal" | "security" | "courses";

// Giu dung mot bo luat voi may chu (backend/src/routes/userRoutes.js). Lech
// nhau la nguoi dung chon duoc anh ma tai len lai bi tu choi.
const MAX_ANH_MB = 5;
const MIME_ANH = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const doiKichThuoc = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

const NAV: {
  group: string;
  items: { key: TabKey; label: string; icon: typeof UserIcon }[];
}[] = [
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
          getProvidersApi()
            .then(setProviders)
            .catch(() => {});
        }
      } catch (e) {
        setLoadError(
          e instanceof Error ? e.message : "Không tải được thông tin tài khoản",
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Header doc danh tinh tu kho chung trong RAM, nen phai cap nhat lai thi
  // ten/anh tren thanh dieu huong moi doi theo.
  //
  // Ban cu gop tay vao localStorage roi tu ban su kien. Gio datNguoiDung() lo
  // ca hai. Cung khong con phai gop voi gia tri cu nua: `u` la ban ghi DAY DU
  // may chu vua tra ve sau khi luu, con ban cu buoc phai gop vi trong
  // localStorage chi co bon truong tu luc dang nhap.
  const syncLocal = useCallback((u: User) => {
    datNguoiDung(u);
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
    [syncLocal],
  );

  // Tai anh len di duong rieng (multipart) chu khong qua save() vi save() gui
  // JSON. Phan con lai - cap nhat man hinh, dong bo localStorage, bao thanh
  // cong - giong het nhau.
  const saveAvatarFile = useCallback(
    async (file: File) => {
      setSaving(true);
      setMsg(null);
      try {
        const updated = await uploadAvatarApi(file);
        setUser(updated);
        syncLocal(updated);
        setEditing(null);
        setMsg({ ok: true, text: "Đã cập nhật ảnh đại diện." });
        return true;
      } catch (e) {
        setMsg({ ok: false, text: e instanceof Error ? e.message : "Tải ảnh thất bại." });
        return false;
      } finally {
        setSaving(false);
      }
    },
    [syncLocal],
  );

  if (loading) {
    return (
      <div className={styles.row}>
        <Loader2 size={24} className={styles.spinner} />
      </div>
    );
  }

  if (loadError || !user) {
    return (
      <div className={styles.container}>
        <p className={styles.text}>
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
    <div className={styles.page}>
      <div className={styles.container2}>
        <div className={styles.grid}>
          {/* ============ THANH DIEU HUONG ============ */}
          <aside className={styles.aside}>
            <div className={styles.box}>
              <div className={styles.box2}>
                <h1 className={styles.title}>Cài đặt tài khoản</h1>
                <p className={styles.text2}>
                  Quản lý hồ sơ, bảo mật và khóa học của bạn.
                </p>
              </div>

              {/* Man hinh nho: thanh ngang cuon duoc. Man hinh lon: danh sach doc */}
              <nav aria-label="Cài đặt tài khoản" className={styles.nav}>
                {NAV.map((section) => (
                  <div key={section.group} className={styles.box3}>
                    <h3 className={styles.subheading}>{section.group}</h3>
                    <div className={styles.box4}>
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
                            className={`${styles.button8} ${
                              active ? styles.button : styles.button2
                            }`}
                          >
                            <Icon size={16} className={styles.box5} />
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
          <main className={styles.main}>
            <div>
              <h2 className={styles.heading}>{meta.title}</h2>
              <p className={styles.text2}>{meta.desc}</p>
            </div>

            {msg && (
              <div
                role="status"
                className={`${styles.row11} ${msg.ok ? styles.box6 : styles.box7}`}
              >
                {msg.ok ? (
                  <CheckCircle2 size={16} className={styles.box8} />
                ) : (
                  <AlertCircle size={16} className={styles.box8} />
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
                saveAvatarFile={saveAvatarFile}
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
  saveAvatarFile,
}: TabProps & {
  providers: Provider[];
  saveAvatarFile: (file: File) => Promise<boolean>;
}) {
  const [name, setName] = useState(user.name ?? "");
  const [fullname, setFullname] = useState(user.fullname ?? "");
  const [birthday, setBirthday] = useState(toDateInput(user.birthday));
  const [bio, setBio] = useState(user.bio ?? "");
  const [phone, setPhone] = useState(user.phone ?? "");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState(user.avatar ?? "");
  const [anhChon, setAnhChon] = useState<File | null>(null);
  const [xemTruoc, setXemTruoc] = useState("");
  const [loiAnh, setLoiAnh] = useState("");
  const [providerId, setProviderId] = useState(
    typeof user.provider === "object" && user.provider
      ? user.provider._id
      : (user.provider ?? ""),
  );

  // Doi hoac roi trang -> tra lai bo nho cua anh xem truoc. Khong lam thi moi
  // lan chon anh khac lai bo lai mot blob trong bo nho tab.
  useEffect(() => {
    if (!xemTruoc) return;
    return () => URL.revokeObjectURL(xemTruoc);
  }, [xemTruoc]);

  // Kiem ngay tren trinh duyet bang dung mot bo luat voi may chu, de nguoi
  // dung biet lien thay vi cho tai het 5MB roi moi bi tu choi.
  const chonAnh = (f: File | null) => {
    setLoiAnh("");
    setAnhChon(null);
    setXemTruoc("");
    if (!f) return;

    if (!MIME_ANH.includes(f.type)) {
      setLoiAnh("Chỉ nhận ảnh JPG, PNG, WEBP hoặc GIF.");
      return;
    }
    if (f.size > MAX_ANH_MB * 1024 * 1024) {
      setLoiAnh(`Ảnh tối đa ${MAX_ANH_MB}MB. Ảnh bạn chọn nặng ${doiKichThuoc(f.size)}.`);
      return;
    }

    setAnhChon(f);
    setXemTruoc(URL.createObjectURL(f));
  };

  // Chon file thi day file len (multipart), khong thi luu duong dan (JSON).
  const luuAnh = () => (anhChon ? saveAvatarFile(anhChon) : save({ avatar }));

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
              className={`${inputCls} ${styles.textarea}`}
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
            saveLabel={anhChon ? "Tải ảnh lên" : "Lưu"}
            onSave={luuAnh}
            onCancel={() => toggle("avatar")}
            hint={`Ảnh JPG, PNG, WEBP hoặc GIF, tối đa ${MAX_ANH_MB}MB. Ảnh được cắt vuông về 400×400 khi tải lên.`}
          >
            {anhChon ? (
              /* Da chon file -> an han o dan duong dan, de khong phai doan
                 cai nao se duoc dung khi bam Luu. */
              <div className={styles.card}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={xemTruoc}
                  alt="Xem trước ảnh vừa chọn"
                  className={styles.image}
                />
                <div className={styles.box9}>
                  <p className={styles.text3}>{anhChon.name}</p>
                  <p className={styles.text4}>{doiKichThuoc(anhChon.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => chonAnh(null)}
                  aria-label="Bỏ ảnh đã chọn"
                  className={styles.button3}
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <>
                <label htmlFor="anh-dai-dien" className={styles.fieldLabel}>
                  <Upload size={22} className={styles.box10} />
                  <span className={styles.label}>Bấm để chọn ảnh từ máy</span>
                  <span className={styles.label2}>
                    JPG, PNG, WEBP hoặc GIF &middot; tối đa {MAX_ANH_MB}MB
                  </span>
                </label>

                <div className={styles.row2}>
                  <span className={styles.label3} />
                  <span className={styles.label4}>hoặc dán đường dẫn</span>
                  <span className={styles.label3} />
                </div>

                <input
                  className={inputCls}
                  value={avatar}
                  placeholder="https://..."
                  onChange={(e) => setAvatar(e.target.value)}
                />
                {avatar.trim() && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatar}
                    alt="Xem trước ảnh đại diện"
                    className={styles.image2}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                )}
              </>
            )}

            <input
              id="anh-dai-dien"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className={styles.input}
              onChange={(e) => chonAnh(e.target.files?.[0] ?? null)}
            />

            {loiAnh && (
              <p role="alert" className={styles.text5}>
                {loiAnh}
              </p>
            )}
          </FieldForm>
        </SettingRow>
      </SettingCard>

      <SettingCard
        title="Liên hệ"
        desc="Thông tin dùng để liên lạc và định danh tài khoản."
      >
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
            hint="Số di động 10 chữ số, ví dụ 0901234567. Mỗi số chỉ dùng cho một tài khoản, và đây là cách đăng nhập của bạn nên không xóa trắng được."
          >
            <input
              type="tel"
              inputMode="tel"
              className={inputCls}
              value={phone}
              placeholder="0901234567"
              onChange={(e) => setPhone(e.target.value)}
              autoFocus
            />
          </FieldForm>
        </SettingRow>

        {/* Email THEM DUOC MOT LAN khi tai khoan chua co, sau do khoa lai.
            Dang ky khong bat buoc email nua, nen ai bo trong luc do phai co
            duong bat lai kha nang tu lay lai mat khau. Con doi mot dia chi DA
            dat thi khong cho: doi email la doi luon cho nhan ma dat lai mat
            khau - xem ghi chu day du o updateUserProfile ben may chu. */}
        {user.email ? (
          <SettingRow
            label="Email"
            value={user.email}
            mono
            readOnly
            hint="Email đã đặt thì không tự đổi được, vì đây là nơi nhận mã đặt lại mật khẩu."
          />
        ) : (
          <SettingRow
            label="Email"
            value={undefined}
            mono
            open={editing === "email"}
            onToggle={() => toggle("email")}
          >
            <FieldForm
              saving={saving}
              onSave={() => save({ email })}
              onCancel={() => toggle("email")}
              hint="Thêm email để tự lấy lại mật khẩu khi quên. Thêm xong thì không tự đổi được nữa, nên hãy nhập đúng địa chỉ bạn đang dùng."
            >
              <input
                type="email"
                className={inputCls}
                value={email}
                placeholder="ban@gmail.com"
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
              />
            </FieldForm>
          </SettingRow>
        )}

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
    // Dung chung ham voi backend (services/rules.ts). Truoc day cho nay chi
    // kiem do dai toi thieu; bcrypt thi bo lang moi byte tu 73 tro di, nen mot
    // mat khau dai hon the bi cat am tham ma khong ai duoc bao.
    const loiMk = loiMatKhauMoi(next);
    if (loiMk) {
      setMsg({ ok: false, text: loiMk.replace("Mật khẩu", "Mật khẩu mới") + "." });
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
      await xoaPhien();
      window.location.href = "/";
    } catch (e) {
      setMsg({
        ok: false,
        text: e instanceof Error ? e.message : "Không thể vô hiệu hóa.",
      });
      setDeleting(false);
    }
  };

  return (
    <>
      <SettingCard
        title="Đăng nhập"
        desc="Quản lý mật khẩu dùng để đăng nhập vào tài khoản."
      >
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
            <div className={styles.stack}>
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
                <p className={styles.text6}>
                  Tài khoản của bạn đăng nhập bằng Google và chưa có mật khẩu. Đặt mật
                  khẩu để đăng nhập được bằng email.
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
              <span className={styles.row3}>
                <Link2 size={12} /> Đã liên kết
              </span>
            ) : (
              <span className={styles.label5}>Chưa liên kết</span>
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
            <div className={styles.stack}>
              <div className={styles.card2}>
                Dữ liệu học tập của bạn được giữ nguyên, nhưng bạn sẽ không đăng nhập lại
                được cho tới khi quản trị viên mở khóa.
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
              <div className={styles.row4}>
                <button
                  type="button"
                  disabled={deleting || !delPassword}
                  onClick={submitDeactivate}
                  className={styles.button4}
                >
                  {deleting ? "Đang xử lý..." : "Vô hiệu hóa tài khoản"}
                </button>
                <button
                  type="button"
                  onClick={() => toggle("deactivate")}
                  className={styles.button5}
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

// Kieu nay truoc day khai lai o day mot ban rieng. Nay dung chung voi tang
// service de khi backend doi hinh dang thi chi phai sua mot cho.
const STATUS_LABEL: Record<EnrollmentStatus, { text: string; cls: string }> = {
  active: { text: "Đang học", cls: styles.nhanDangHoc },
  completed: { text: "Hoàn thành", cls: styles.nhanHoanThanh },
  dropped: { text: "Đã dừng", cls: styles.nhanDaDung },
};

function CoursesTab() {
  const [rows, setRows] = useState<EnrolledCourseItem[] | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    getMyEnrolledCourses()
      .then((d) => setRows(Array.isArray(d) ? d : []))
      .catch((e) => setErr(e instanceof Error ? e.message : "Không tải được danh sách"));
  }, []);

  if (err) {
    return (
      <SettingCard title="Khóa học đã đăng ký">
        <p className={styles.text7}>{err}</p>
      </SettingCard>
    );
  }

  if (!rows) {
    return (
      <div className={styles.row5}>
        <Loader2 size={22} className={styles.spinner} />
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <SettingCard title="Khóa học đã đăng ký">
        <div className={styles.box11}>
          <p className={styles.text8}>Chưa đăng ký khóa học nào</p>
          <p className={styles.text2}>Các khóa học bạn đăng ký sẽ xuất hiện tại đây.</p>
          <Link href="/courses" className={styles.box12}>
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
          <div key={r._id} className={styles.row6}>
            {r.course?.thumbnail ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={r.course.thumbnail} alt="" className={styles.image3} />
            ) : (
              <div className={styles.row7}>
                <BookOpen size={18} className={styles.box10} />
              </div>
            )}

            <div className={styles.box9}>
              <div className={styles.row8}>
                <h4 className={styles.text3}>
                  {/* Khoa hoc co the da bi xoa nhung ban ghi dang ky van con */}
                  {r.course?.title ?? "Khóa học không còn tồn tại"}
                </h4>
                <span className={`${styles.label7} ${s.cls}`}>{s.text}</span>
              </div>

              <div className={styles.row9}>
                <div className={styles.box13}>
                  <div className={styles.box14} style={{ width: `${pct}%` }} />
                </div>
                <span className={styles.label6}>{pct}%</span>
              </div>

              <p className={styles.text9}>
                Đăng ký {fmtDate(r.createdAt)}
                {r.lastAccessedAt && ` · Học gần nhất ${fmtDate(r.lastAccessedAt)}`}
              </p>
            </div>

            {r.course?.slug && (
              <Link
                href={`/learn?slug=${encodeURIComponent(r.course.slug)}`}
                className={styles.box15}
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

const inputCls = styles.input2;

const labelCls = styles.box16;

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
      {hint && <p className={styles.text10}>{hint}</p>}
      <div className={styles.row10}>
        <button
          type="button"
          disabled={saving}
          onClick={() => onSave()}
          className={styles.button6}
        >
          {saving ? "Đang lưu..." : saveLabel}
        </button>
        <button type="button" onClick={onCancel} className={styles.button7}>
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
