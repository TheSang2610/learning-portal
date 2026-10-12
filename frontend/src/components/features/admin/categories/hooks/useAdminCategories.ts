"use client";

import { useEffect, useState } from "react";

import { ADMIN_CATEGORIES as C } from "@/src/constants/admin/categories-page";
import { getErrorMessage } from "@/src/services/apiHelper";
import {
  Category,
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "@/src/services/categoryService";

/** Danh sach danh muc va hop tao/sua; xoa bi backend chan neu con khoa hoc dung. */
export function useAdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  // null = dong modal, "" = tao moi, "<id>" = sua
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(getErrorMessage(e, C.messages.loadFailed));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Goi qua mot vong microtask thay vi goi thang. Ham tai du lieu bat dau
    // bang setLoading(true), nen goi thang la setState dong bo ngay trong than
    // effect: React phai chay them mot vong ve lai truoc khi hien man hinh
    // (rule react-hooks/set-state-in-effect canh bao dung cho nay). Hoan mot
    // vong microtask thi mat thuong khong thay khac, ma vong ve thua het.
    void Promise.resolve().then(load);
  }, []);

  const openCreate = () => {
    setName("");
    setIcon("");
    setFormError("");
    setEditingId("");
  };

  const openEdit = (c: Category) => {
    setName(c.name);
    setIcon(c.icon ?? "");
    setFormError("");
    setEditingId(c._id);
  };

  const closeModal = () => setEditingId(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError(C.messages.needName);
      return;
    }
    try {
      setSaving(true);
      setFormError("");
      if (editingId) {
        await updateCategory(editingId, { name: name.trim(), icon: icon.trim() });
      } else {
        // slug do backend tu sinh, gui chuoi rong cho khop kieu du lieu
        await createCategory({ name: name.trim(), icon: icon.trim(), slug: "" });
      }
      setEditingId(null);
      await load();
    } catch (e) {
      setFormError(getErrorMessage(e, C.messages.saveFailed));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (c: Category) => {
    if (!confirm(C.messages.confirmDelete(c.name))) return;
    try {
      setBusyId(c._id);
      setError("");
      await deleteCategory(c._id);
      await load();
    } catch (e) {
      // Backend chan xoa khi con khoa hoc dang dung danh muc nay
      setError(getErrorMessage(e, C.messages.deleteFailed));
    } finally {
      setBusyId(null);
    }
  };

  return {
    categories,
    loading,
    error,
    busyId,
    editingId,
    name,
    setName,
    icon,
    setIcon,
    saving,
    formError,
    openCreate,
    openEdit,
    closeModal,
    submit,
    remove,
  };
}
