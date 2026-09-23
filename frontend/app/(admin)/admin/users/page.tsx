"use client";

import { useCallback, useEffect, useState } from "react";
import { getErrorMessage } from "@/src/services/apiHelper";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Lock,
  Unlock,
  X,
  Loader2,
  ShieldCheck,
  GraduationCap,
  User as UserIcon,
  ChevronLeft,
  ChevronRight,
  ImageOff,
  UploadCloud,
  Link2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import {
  getAllUsersAdmin,
  createUserAdmin,
  updateUserAdmin,
  deleteUserAdmin,
  updateUserStatusAdmin,
} from "@/src/services/adminService";
import type { User } from "@/src/services/userApi";
import { useNguoiDungLuu } from "@/src/hooks/userStore";
import AnhDaiDien from "@/src/components/ui/Avatar";
import SafeImage from "@/src/components/ui/SafeImage";
import { DAI_MAT_KHAU_TOI_THIEU, loiMatKhauMoi } from "@/src/services/rules";

import styles from "./page.module.scss";
// Truoc day cho nay khai lai mot ban AdminUser rieng, gan trung voi User cua
// tang service nhung khai status la bat buoc. Dung chung mot kieu de khi backend
// doi hinh dang thi chi phai sua mot noi.
type AdminUser = User;

const ROLES = ["student", "instructor", "admin"] as const;

const ROLE_STYLE: Record<string, { cls: string; Icon: LucideIcon }> = {
  admin: { cls: styles.nhanAdmin, Icon: ShieldCheck },
  instructor: { cls: styles.nhanGiangVien, Icon: GraduationCap },
  student: { cls: styles.nhanHocVien, Icon: UserIcon },
};

const PAGE_SIZE = 10;

const emptyForm = {
  name: "",
  email: "",
  password: "",
  phone: "",
  role: "student" as AdminUser["role"],
  status: true,
};

/**
 * Anh trong khung xem phong to.
 *
 * Tach rieng de state loi tu reset: khung xem duoc gan key theo _id, doi nguoi
 * la component nay unmount roi mount lai, khong can effect nao de xoa co loi.
 */
function AnhPhongTo({ src, ten }: { src: string; ten?: string }) {
  const [loi, setLoi] = useState(false);

  if (loi) {
    return (
      <div className={styles.col}>
        <ImageOff size={32} />
        <p className={styles.text}>Không tải được ảnh</p>
        <p className={styles.text2}>{src}</p>
      </div>
    );
  }

  return (
    <SafeImage
      src={src}
      alt={ten ? `Ảnh đại diện của ${ten}` : "Ảnh đại diện"}
      width={512}
      height={512}
      onError={() => setLoi(true)}
      className={styles.box}
    />
  );
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);

  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  // null = dong modal, "" = tao moi, "<id>" = sua
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");

  // Id cua chinh minh -> khong cho tu khoa / tu xoa (backend cung chan)
  const myId = useNguoiDungLuu()?._id ?? null;

  // Nguoi dung dang duoc xem anh phong to. null = dong.
  const [xemAnh, setXemAnh] = useState<AdminUser | null>(null);

  // Ban ghi dang sua - chi de hien anh dai dien trong modal. Form khong giu
  // avatar vi man hinh nay khong sua anh: anh do chinh nguoi dung tu doi.
  const [dangSua, setDangSua] = useState<AdminUser | null>(null);

  // Esc de dong khung xem anh. Chi gan listener khi khung dang mo.
  useEffect(() => {
    if (!xemAnh) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setXemAnh(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [xemAnh]);

  // Go phim xong 400ms moi goi API
  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    try {
      setFetching(true);
      setError("");
      const data = await getAllUsersAdmin({
        page,
        limit: PAGE_SIZE,
        search: debounced || undefined,
        role: roleFilter || undefined,
        status: statusFilter === "" ? undefined : statusFilter === "active",
      });
      setUsers(Array.isArray(data?.users) ? data.users : []);
      setTotal(data?.pagination?.total ?? 0);
      setPages(data?.pagination?.pages ?? 1);
    } catch (e) {
      setError(getErrorMessage(e, "Không tải được danh sách người dùng"));
      setUsers([]);
    } finally {
      setFetching(false);
    }
  }, [page, debounced, roleFilter, statusFilter]);

  useEffect(() => {
    // Goi qua mot vong microtask thay vi goi thang. Ham tai du lieu bat dau
    // bang setLoading(true), nen goi thang la setState dong bo ngay trong than
    // effect: React phai chay them mot vong ve lai truoc khi hien man hinh
    // (rule react-hooks/set-state-in-effect canh bao dung cho nay). Hoan mot
    // vong microtask thi mat thuong khong thay khac, ma vong ve thua het.
    void Promise.resolve().then(load);
  }, [load]);

  const openCreate = () => {
    setDangSua(null);
    setForm(emptyForm);
    setFormError("");
    setEditingId("");
  };

  const openEdit = (u: AdminUser) => {
    setDangSua(u);
    setForm({
      name: u.name ?? "",
      email: u.email ?? "",
      password: "",
      phone: u.phone ?? "",
      role: u.role,
      status: u.status ?? true,
    });
    setFormError("");
    setEditingId(u._id);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!form.name.trim() || !form.email.trim()) {
      setFormError("Tên và email là bắt buộc");
      return;
    }
    // Tao moi thi bat buoc co mat khau; sua thi de trong nghia la khong doi.
    // Ca hai truong hop, khi CO mat khau thi phai qua dung bo quy tac ma backend
    // dung (services/rules.ts) - truoc day cho nay chi kiem do dai toi thieu.
    if (!editingId || form.password) {
      const loiMk = loiMatKhauMoi(form.password);
      if (loiMk) {
        setFormError(editingId ? loiMk.replace("Mật khẩu", "Mật khẩu mới") : loiMk);
        return;
      }
    }

    try {
      setSaving(true);
      if (editingId) {
        await updateUserAdmin(editingId, {
          name: form.name.trim(),
          email: form.email.trim(),
          role: form.role,
          status: form.status,
          phone: form.phone.trim() || undefined,
          ...(form.password ? { password: form.password } : {}),
        });
      } else {
        await createUserAdmin({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          role: form.role,
          status: form.status,
          phone: form.phone.trim() || undefined,
        });
      }
      setEditingId(null);
      await load();
    } catch (e) {
      setFormError(getErrorMessage(e, "Lưu thất bại"));
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (u: AdminUser) => {
    try {
      setBusyId(u._id);
      setError("");
      await updateUserStatusAdmin(u._id, !(u.status ?? true));
      await load();
    } catch (e) {
      setError(getErrorMessage(e, "Không đổi được trạng thái"));
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (u: AdminUser) => {
    const ok = confirm(
      `Xóa "${u.name}" (${u.email})?\n\n` +
        `Thao tác này xóa luôn các khóa học user tạo và toàn bộ lượt ghi danh. Không hoàn tác được.`,
    );
    if (!ok) return;
    try {
      setBusyId(u._id);
      setError("");
      await deleteUserAdmin(u._id);
      if (users.length === 1 && page > 1) setPage(page - 1);
      else await load();
    } catch (e) {
      setError(getErrorMessage(e, "Xóa thất bại"));
    } finally {
      setBusyId(null);
    }
  };

  const inputCls = styles.input2;

  return (
    <div className={styles.stack}>
      {/* HEADER */}
      <div className={styles.row}>
        <div>
          <h1 className={styles.title}>Người dùng</h1>
          <p className={styles.text3}>
            {fetching ? "Đang tải..." : `${total} tài khoản`}
          </p>
        </div>
        <button onClick={openCreate} className={styles.button}>
          <Plus size={16} /> Thêm người dùng
        </button>
      </div>

      {/* BO LOC */}
      <div className={styles.row2}>
        <div className={styles.box2}>
          <Search size={16} className={styles.floating} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên, email hoặc mã user..."
            className={`${inputCls} ${styles.input}`}
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(1);
          }}
          className={`${inputCls} ${styles.select}`}
        >
          <option value="">Mọi quyền</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className={`${inputCls} ${styles.select}`}
        >
          <option value="">Mọi trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="banned">Đã khóa</option>
        </select>
      </div>

      {error && <div className={styles.card}>{error}</div>}

      {/* BANG */}
      <div className={styles.card2}>
        <div className={styles.scroller}>
          <table className={styles.table}>
            <thead className={styles.thead}>
              <tr>
                <th className={styles.headCell}>Người dùng</th>
                <th className={styles.headCell}>Quyền</th>
                <th className={styles.headCell}>Trạng thái</th>
                <th className={styles.headCell}>Ngày tạo</th>
                <th className={styles.headCell2}>Thao tác</th>
              </tr>
            </thead>
            <tbody className={styles.tbody}>
              {fetching ? (
                <tr>
                  <td colSpan={5} className={styles.cell}>
                    <Loader2 size={20} className={styles.spinner} />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className={styles.cell2}>
                    Không tìm thấy người dùng nào.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const { cls, Icon } = ROLE_STYLE[u.role] ?? ROLE_STYLE.student;
                  const isSelf = u._id === myId;
                  const busy = busyId === u._id;
                  return (
                    <tr key={u._id} className={styles.row3}>
                      <td className={styles.headCell}>
                        <div className={styles.row4}>
                          {u.avatar ? (
                            <button
                              type="button"
                              onClick={() => setXemAnh(u)}
                              title="Xem ảnh đại diện"
                              className={styles.button2}
                            >
                              <AnhDaiDien src={u.avatar} ten={u.name} size={36} />
                            </button>
                          ) : (
                            <AnhDaiDien ten={u.name} size={36} />
                          )}
                          <div className={styles.box3}>
                            <p className={styles.text4}>
                              {u.name}
                              {isSelf && <span className={styles.label}>BẠN</span>}
                            </p>
                            <p className={styles.text5}>{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className={styles.headCell}>
                        <span className={`${styles.label6} ${cls}`}>
                          <Icon size={12} /> {u.role}
                        </span>
                      </td>
                      <td className={styles.headCell}>
                        <span
                          className={`${styles.label7} ${(u.status ?? true) ? styles.label2 : styles.label3}`}
                        >
                          <span
                            className={`${styles.label8} ${u.status ? styles.label4 : styles.label5}`}
                          />
                          {u.status ? "Hoạt động" : "Đã khóa"}
                        </span>
                      </td>
                      <td className={styles.cell3}>
                        {u.createdAt
                          ? new Date(u.createdAt).toLocaleDateString("vi-VN")
                          : "--"}
                      </td>
                      <td className={styles.headCell}>
                        <div className={styles.row5}>
                          <button
                            onClick={() => openEdit(u)}
                            title="Sửa"
                            className={styles.button3}
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => toggleStatus(u)}
                            disabled={isSelf || busy}
                            title={
                              isSelf
                                ? "Không thể tự khóa chính mình"
                                : u.status
                                  ? "Khóa"
                                  : "Mở khóa"
                            }
                            className={styles.button4}
                          >
                            {u.status ? <Lock size={16} /> : <Unlock size={16} />}
                          </button>
                          <button
                            onClick={() => remove(u)}
                            disabled={isSelf || busy}
                            title={isSelf ? "Không thể tự xóa chính mình" : "Xóa"}
                            className={styles.button5}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PHAN TRANG */}
        {pages > 1 && (
          <div className={styles.row6}>
            <p className={styles.text6}>
              Trang {page} / {pages}
            </p>
            <div className={styles.row7}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className={styles.box4}
              >
                <ChevronLeft size={14} /> Trước
              </button>
              <button
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page >= pages}
                className={styles.box4}
              >
                Sau <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* KHUNG XEM ANH DAI DIEN */}
      {xemAnh?.avatar && (
        <div onClick={() => setXemAnh(null)} className={styles.overlay}>
          <div onClick={(e) => e.stopPropagation()} className={styles.card3}>
            <div className={styles.row8}>
              <div className={styles.box3}>
                <h2 className={styles.heading}>{xemAnh.name}</h2>
                <p className={styles.text5}>{xemAnh.email}</p>
              </div>
              <button onClick={() => setXemAnh(null)} className={styles.button6}>
                <X size={18} />
              </button>
            </div>

            <div className={styles.row9}>
              <AnhPhongTo key={xemAnh._id} src={xemAnh.avatar} ten={xemAnh.name} />
            </div>

            <div className={styles.stack2}>
              <p className={styles.text7}>
                {xemAnh.avatarPublicId ? (
                  <>
                    <UploadCloud size={14} className={styles.box5} />
                    Người dùng tự tải ảnh này lên
                  </>
                ) : (
                  <>
                    <Link2 size={14} className={styles.box6} />
                    Ảnh dẫn từ liên kết ngoài, không phải người dùng tải lên
                  </>
                )}
              </p>
              <a
                href={xemAnh.avatar}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                {xemAnh.avatar}
              </a>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TAO / SUA */}
      {editingId !== null && (
        <div className={styles.overlay2}>
          <div className={styles.card4}>
            <div className={styles.row8}>
              <div className={styles.row10}>
                {editingId && dangSua && (
                  <AnhDaiDien src={dangSua.avatar} ten={dangSua.name} size={40} />
                )}
                <div className={styles.box3}>
                  <h2 className={styles.heading2}>
                    {editingId ? "Sửa người dùng" : "Thêm người dùng"}
                  </h2>
                  {editingId && dangSua && (
                    <p className={styles.text5}>
                      {dangSua.avatar
                        ? dangSua.avatarPublicId
                          ? "Ảnh do người dùng tự tải lên"
                          : "Ảnh dẫn từ liên kết ngoài"
                        : "Chưa có ảnh đại diện"}
                    </p>
                  )}
                </div>
              </div>
              <button onClick={() => setEditingId(null)} className={styles.button6}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={submit} className={styles.form}>
              {formError && <div className={styles.card5}>{formError}</div>}

              <div>
                <label className={styles.fieldLabel}>Tên *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={inputCls}
                  placeholder="Nguyễn Văn A"
                />
              </div>

              <div>
                <label className={styles.fieldLabel}>Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={inputCls}
                  placeholder="user@example.com"
                />
              </div>

              <div>
                <label className={styles.fieldLabel}>
                  Mật khẩu {editingId ? "(để trống nếu không đổi)" : "*"}
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className={inputCls}
                  placeholder={
                    editingId ? "Không đổi" : `Tối thiểu ${DAI_MAT_KHAU_TOI_THIEU} ký tự`
                  }
                />
              </div>

              <div>
                <label className={styles.fieldLabel}>Số điện thoại</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className={inputCls}
                  placeholder="Không bắt buộc"
                />
              </div>

              <div className={styles.grid}>
                <div>
                  <label className={styles.fieldLabel}>Quyền</label>
                  <select
                    value={form.role}
                    onChange={(e) =>
                      setForm({ ...form, role: e.target.value as AdminUser["role"] })
                    }
                    disabled={editingId === myId && editingId !== ""}
                    className={`${inputCls} ${styles.select2}`}
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={styles.fieldLabel}>Trạng thái</label>
                  <select
                    value={form.status ? "active" : "banned"}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value === "active" })
                    }
                    disabled={editingId === myId && editingId !== ""}
                    className={`${inputCls} ${styles.select2}`}
                  >
                    <option value="active">Hoạt động</option>
                    <option value="banned">Khóa</option>
                  </select>
                </div>
              </div>

              {editingId === myId && editingId !== "" && (
                <p className={styles.text6}>
                  Không thể tự đổi quyền hoặc tự khóa tài khoản của chính bạn.
                </p>
              )}

              <div className={styles.row11}>
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className={styles.button7}
                >
                  Hủy
                </button>
                <button type="submit" disabled={saving} className={styles.button8}>
                  {saving && <Loader2 size={14} className={styles.spinner2} />}
                  {editingId ? "Lưu thay đổi" : "Tạo người dùng"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
