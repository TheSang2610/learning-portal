"use client";

import { useCallback, useEffect, useState } from "react";

import { ADMIN_USERS as C } from "@/src/constants/admin/users-page";
import { useStoredUser } from "@/src/hooks/userStore";
import {
  createUserAdmin,
  deleteUserAdmin,
  getAllUsersAdmin,
  updateUserAdmin,
  updateUserStatusAdmin,
} from "@/src/services/adminService";
import { getErrorMessage } from "@/src/services/apiHelper";
import { newPasswordError } from "@/src/services/rules";
import type { User } from "@/src/services/userApi";

// Dung chung kieu User cua tang service (truoc day khai lai mot ban rieng)
// de khi backend doi hinh dang thi chi phai sua mot noi.
export type AdminUser = User;

export const emptyForm = {
  name: "",
  email: "",
  password: "",
  phone: "",
  role: "student" as AdminUser["role"],
  status: true,
};

export type UserForm = typeof emptyForm;

/** Danh sach nguoi dung: tim (tre 400ms), loc, phan trang, tao/sua, khoa, xoa. */
export function useAdminUsers() {
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
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [formError, setFormError] = useState("");

  // Id cua chinh minh -> khong cho tu khoa / tu xoa (backend cung chan)
  const myId = useStoredUser()?._id ?? null;

  // Nguoi dung dang duoc xem anh phong to. null = dong.
  const [viewImage, setViewImage] = useState<AdminUser | null>(null);

  // Ban ghi dang sua - chi de hien anh dai dien trong modal. Form khong giu
  // avatar vi man hinh nay khong sua anh: anh do chinh nguoi dung tu doi.
  const [editing, setEditing] = useState<AdminUser | null>(null);

  // Esc de dong khung xem anh. Chi gan listener khi khung dang mo.
  useEffect(() => {
    if (!viewImage) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setViewImage(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [viewImage]);

  // Go phim xong 400ms moi goi API
  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(search);
      setPage(1);
    }, C.searchDelay);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    try {
      setFetching(true);
      setError("");
      const data = await getAllUsersAdmin({
        page,
        limit: C.pageSize,
        search: debounced || undefined,
        role: roleFilter || undefined,
        status: statusFilter === "" ? undefined : statusFilter === "active",
      });
      setUsers(Array.isArray(data?.users) ? data.users : []);
      setTotal(data?.pagination?.total ?? 0);
      setPages(data?.pagination?.pages ?? 1);
    } catch (e) {
      setError(getErrorMessage(e, C.messages.loadFailed));
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

  const changeRoleFilter = (v: string) => {
    setRoleFilter(v);
    setPage(1);
  };

  const changeStatusFilter = (v: string) => {
    setStatusFilter(v);
    setPage(1);
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormError("");
    setEditingId("");
  };

  const openEdit = (u: AdminUser) => {
    setEditing(u);
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

  const closeModal = () => setEditingId(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!form.name.trim() || !form.email.trim()) {
      setFormError(C.messages.required);
      return;
    }
    // Tao moi thi bat buoc co mat khau; sua thi de trong nghia la khong doi.
    // Ca hai truong hop, khi CO mat khau thi phai qua dung bo quy tac ma backend
    // dung (services/rules.ts) - truoc day cho nay chi kiem do dai toi thieu.
    if (!editingId || form.password) {
      const passwordError = newPasswordError(form.password);
      if (passwordError) {
        setFormError(
          editingId ? passwordError.replace("Mật khẩu", "Mật khẩu mới") : passwordError,
        );
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
      setFormError(getErrorMessage(e, C.messages.saveFailed));
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
      setError(getErrorMessage(e, C.messages.statusFailed));
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (u: AdminUser) => {
    const ok = confirm(C.messages.confirmDelete(u.name, u.email));
    if (!ok) return;
    try {
      setBusyId(u._id);
      setError("");
      await deleteUserAdmin(u._id);
      if (users.length === 1 && page > 1) setPage(page - 1);
      else await load();
    } catch (e) {
      setError(getErrorMessage(e, C.messages.deleteFailed));
    } finally {
      setBusyId(null);
    }
  };

  return {
    users,
    total,
    pages,
    page,
    setPage,
    search,
    setSearch,
    roleFilter,
    statusFilter,
    changeRoleFilter,
    changeStatusFilter,
    fetching,
    saving,
    busyId,
    error,
    editingId,
    form,
    setForm,
    formError,
    myId,
    viewImage,
    setViewImage,
    editing,
    openCreate,
    openEdit,
    closeModal,
    submit,
    toggleStatus,
    remove,
  };
}

export type AdminUsersState = ReturnType<typeof useAdminUsers>;
