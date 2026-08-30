"use client";

import { useEffect, useState } from "react";
import { Plus, Edit3, Trash2, X, Loader2, FolderOpen } from "lucide-react";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  Category,
} from "@/src/services/categoryService";

export default function AdminCategoriesPage() {
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
    } catch (e: any) {
      setError(e?.message || "Không tải được danh mục");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setName(""); setIcon(""); setFormError(""); setEditingId("");
  };

  const openEdit = (c: Category) => {
    setName(c.name); setIcon(c.icon ?? ""); setFormError(""); setEditingId(c._id);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setFormError("Tên danh mục là bắt buộc"); return; }
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
    } catch (e: any) {
      setFormError(e?.message || "Lưu thất bại");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (c: Category) => {
    if (!confirm(`Xóa danh mục "${c.name}"?`)) return;
    try {
      setBusyId(c._id);
      setError("");
      await deleteCategory(c._id);
      await load();
    } catch (e: any) {
      // Backend chan xoa khi con khoa hoc dang dung danh muc nay
      setError(e?.message || "Xóa thất bại");
    } finally {
      setBusyId(null);
    }
  };

  const inputCls =
    "w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 " +
    "placeholder:text-slate-500 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Danh mục</h1>
          <p className="mt-1 text-sm text-slate-500">
            {loading ? "Đang tải..." : `${categories.length} danh mục`}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          <Plus size={16} /> Thêm danh mục
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px]">
            <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wider text-slate-600">
              <tr>
                <th className="px-4 py-3">Tên</th>
                <th className="px-4 py-3">Slug (tự sinh)</th>
                <th className="px-4 py-3">Icon</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-16 text-center text-slate-500">
                    <Loader2 size={20} className="mx-auto animate-spin" />
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-16 text-center text-sm text-slate-500">
                    Chưa có danh mục nào.
                  </td>
                </tr>
              ) : (
                categories.map((c) => (
                  <tr key={c._id} className="transition hover:bg-slate-50/60">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                          <FolderOpen size={15} />
                        </span>
                        <span className="text-sm font-semibold text-slate-900">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">{c.slug}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">{c.icon || "--"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEdit(c)}
                          title="Sửa"
                          className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => remove(c)}
                          disabled={busyId === c._id}
                          title="Xóa"
                          className="rounded-lg p-2 text-red-600 transition hover:bg-red-50 disabled:text-slate-400"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editingId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h2 className="text-base font-bold text-slate-900">
                {editingId ? "Sửa danh mục" : "Thêm danh mục"}
              </h2>
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
                <label className="mb-1.5 block text-xs font-bold text-slate-700">Tên danh mục *</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputCls}
                  placeholder="Ví dụ: Trí tuệ nhân tạo"
                />
                <p className="mt-1.5 text-xs text-slate-600">
                  Slug được backend tự sinh từ tên, không cần nhập.
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">Icon</label>
                <input
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  className={inputCls}
                  placeholder="code, cloud, megaphone..."
                />
              </div>

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
                  {editingId ? "Lưu thay đổi" : "Tạo danh mục"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
