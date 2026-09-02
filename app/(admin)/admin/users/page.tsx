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
import { useNguoiDungLuu } from "@/src/hooks/nguoiDungLuu";
import AnhDaiDien from "@/src/components/ui/AnhDaiDien";
import SafeImage from "@/src/components/ui/SafeImage";
import { DAI_MAT_KHAU_TOI_THIEU } from "@/src/services/quyDinh";

// Truoc day cho nay khai lai mot ban AdminUser rieng, gan trung voi User cua
// tang service nhung khai status la bat buoc. Dung chung mot kieu de khi backend
// doi hinh dang thi chi phai sua mot noi.
type AdminUser = User;

const ROLES = ["student", "instructor", "admin"] as const;

const ROLE_STYLE: Record<string, { cls: string; Icon: LucideIcon }> = {
  admin: { cls: "bg-violet-50 text-violet-700 border-violet-200", Icon: ShieldCheck },
  instructor: { cls: "bg-blue-50 text-blue-700 border-blue-200", Icon: GraduationCap },
  student: { cls: "bg-slate-100 text-slate-700 border-slate-200", Icon: UserIcon },
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
      <div className="flex w-full flex-col items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-12 text-slate-600">
        <ImageOff size={32} />
        <p className="text-sm font-semibold">Không tải được ảnh</p>
        <p className="max-w-full truncate text-xs text-slate-500">{src}</p>
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
      className="max-h-[55vh] w-auto max-w-full rounded-xl object-contain"
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
    if (!editingId && form.password.length < DAI_MAT_KHAU_TOI_THIEU) {
      setFormError(`Mật khẩu phải có ít nhất ${DAI_MAT_KHAU_TOI_THIEU} ký tự`);
      return;
    }
    if (editingId && form.password && form.password.length < DAI_MAT_KHAU_TOI_THIEU) {
      setFormError(`Mật khẩu mới phải có ít nhất ${DAI_MAT_KHAU_TOI_THIEU} ký tự`);
      return;
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

  const inputCls =
    "w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 " +
    "placeholder:text-slate-500 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Người dùng</h1>
          <p className="mt-1 text-sm text-slate-500">
            {fetching ? "Đang tải..." : `${total} tài khoản`}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          <Plus size={16} /> Thêm người dùng
        </button>
      </div>

      {/* BO LOC */}
      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-[240px] flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-500"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên, email hoặc mã user..."
            className={inputCls + " pl-9"}
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(1);
          }}
          className={inputCls + " w-auto"}
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
          className={inputCls + " w-auto"}
        >
          <option value="">Mọi trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="banned">Đã khóa</option>
        </select>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {/* BANG */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead className="bg-slate-50 text-left text-xs font-bold tracking-wider text-slate-600 uppercase">
              <tr>
                <th className="px-4 py-3">Người dùng</th>
                <th className="px-4 py-3">Quyền</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3">Ngày tạo</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {fetching ? (
                <tr>
                  <td colSpan={5} className="px-4 py-16 text-center text-slate-500">
                    <Loader2 size={20} className="mx-auto animate-spin" />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-16 text-center text-sm text-slate-500"
                  >
                    Không tìm thấy người dùng nào.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const { cls, Icon } = ROLE_STYLE[u.role] ?? ROLE_STYLE.student;
                  const isSelf = u._id === myId;
                  const busy = busyId === u._id;
                  return (
                    <tr key={u._id} className="transition hover:bg-slate-50/60">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {u.avatar ? (
                            <button
                              type="button"
                              onClick={() => setXemAnh(u)}
                              title="Xem ảnh đại diện"
                              className="rounded-full transition hover:opacity-80 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 focus:outline-none"
                            >
                              <AnhDaiDien src={u.avatar} ten={u.name} size={36} />
                            </button>
                          ) : (
                            <AnhDaiDien ten={u.name} size={36} />
                          )}
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900">
                              {u.name}
                              {isSelf && (
                                <span className="ml-2 rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-700">
                                  BẠN
                                </span>
                              )}
                            </p>
                            <p className="truncate text-xs text-slate-500">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-xs font-semibold capitalize ${cls}`}
                        >
                          <Icon size={12} /> {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-semibold ${(u.status ?? true) ? "text-emerald-700" : "text-red-700"}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${u.status ? "bg-emerald-500" : "bg-red-500"}`}
                          />
                          {u.status ? "Hoạt động" : "Đã khóa"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">
                        {u.createdAt
                          ? new Date(u.createdAt).toLocaleDateString("vi-VN")
                          : "--"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEdit(u)}
                            title="Sửa"
                            className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
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
                            className="rounded-lg p-2 text-amber-700 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:text-slate-400 disabled:hover:bg-transparent"
                          >
                            {u.status ? <Lock size={16} /> : <Unlock size={16} />}
                          </button>
                          <button
                            onClick={() => remove(u)}
                            disabled={isSelf || busy}
                            title={isSelf ? "Không thể tự xóa chính mình" : "Xóa"}
                            className="rounded-lg p-2 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:text-slate-400 disabled:hover:bg-transparent"
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
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
            <p className="text-xs text-slate-600">
              Trang {page} / {pages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
              >
                <ChevronLeft size={14} /> Trước
              </button>
              <button
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page >= pages}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
              >
                Sau <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* KHUNG XEM ANH DAI DIEN */}
      {xemAnh?.avatar && (
        <div
          onClick={() => setXemAnh(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div className="min-w-0">
                <h2 className="truncate text-base font-bold text-slate-900">
                  {xemAnh.name}
                </h2>
                <p className="truncate text-xs text-slate-500">{xemAnh.email}</p>
              </div>
              <button
                onClick={() => setXemAnh(null)}
                className="rounded-lg p-1.5 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex justify-center bg-slate-50 px-5 py-6">
              <AnhPhongTo key={xemAnh._id} src={xemAnh.avatar} ten={xemAnh.name} />
            </div>

            <div className="space-y-2 border-t border-slate-100 px-5 py-4">
              <p className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                {xemAnh.avatarPublicId ? (
                  <>
                    <UploadCloud size={14} className="text-emerald-600" />
                    Người dùng tự tải ảnh này lên
                  </>
                ) : (
                  <>
                    <Link2 size={14} className="text-slate-500" />
                    Ảnh dẫn từ liên kết ngoài, không phải người dùng tải lên
                  </>
                )}
              </p>
              <a
                href={xemAnh.avatar}
                target="_blank"
                rel="noopener noreferrer"
                className="block truncate text-xs text-blue-600 underline-offset-2 hover:underline"
              >
                {xemAnh.avatar}
              </a>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TAO / SUA */}
      {editingId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div className="flex min-w-0 items-center gap-3">
                {editingId && dangSua && (
                  <AnhDaiDien src={dangSua.avatar} ten={dangSua.name} size={40} />
                )}
                <div className="min-w-0">
                  <h2 className="text-base font-bold text-slate-900">
                    {editingId ? "Sửa người dùng" : "Thêm người dùng"}
                  </h2>
                  {editingId && dangSua && (
                    <p className="truncate text-xs text-slate-500">
                      {dangSua.avatar
                        ? dangSua.avatarPublicId
                          ? "Ảnh do người dùng tự tải lên"
                          : "Ảnh dẫn từ liên kết ngoài"
                        : "Chưa có ảnh đại diện"}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setEditingId(null)}
                className="rounded-lg p-1.5 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={submit} className="space-y-4 px-5 py-5">
              {formError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700">
                  {formError}
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">
                  Tên *
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={inputCls}
                  placeholder="Nguyễn Văn A"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">
                  Email *
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={inputCls}
                  placeholder="user@example.com"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">
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
                <label className="mb-1.5 block text-xs font-bold text-slate-700">
                  Số điện thoại
                </label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className={inputCls}
                  placeholder="Không bắt buộc"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700">
                    Quyền
                  </label>
                  <select
                    value={form.role}
                    onChange={(e) =>
                      setForm({ ...form, role: e.target.value as AdminUser["role"] })
                    }
                    disabled={editingId === myId && editingId !== ""}
                    className={inputCls + " disabled:bg-slate-50 disabled:text-slate-500"}
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700">
                    Trạng thái
                  </label>
                  <select
                    value={form.status ? "active" : "banned"}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value === "active" })
                    }
                    disabled={editingId === myId && editingId !== ""}
                    className={inputCls + " disabled:bg-slate-50 disabled:text-slate-500"}
                  >
                    <option value="active">Hoạt động</option>
                    <option value="banned">Khóa</option>
                  </select>
                </div>
              </div>

              {editingId === myId && editingId !== "" && (
                <p className="text-xs text-slate-600">
                  Không thể tự đổi quyền hoặc tự khóa tài khoản của chính bạn.
                </p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:bg-slate-400"
                >
                  {saving && <Loader2 size={14} className="animate-spin" />}
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
