"use client";

import { useEffect, useState } from "react";
import { getErrorMessage } from "@/src/services/apiHelper";
import { Plus, Edit3, Trash2, X, Loader2, FolderOpen } from "lucide-react";

import styles from "./page.module.scss";
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
    } catch (e) {
      setError(getErrorMessage(e, "Không tải được danh mục"));
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

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError("Tên danh mục là bắt buộc");
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
      setFormError(getErrorMessage(e, "Lưu thất bại"));
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
    } catch (e) {
      // Backend chan xoa khi con khoa hoc dang dung danh muc nay
      setError(getErrorMessage(e, "Xóa thất bại"));
    } finally {
      setBusyId(null);
    }
  };

  const inputCls = styles.input;

  return (
    <div className={styles.stack}>
      <div className={styles.row}>
        <div>
          <h1 className={styles.title}>Danh mục</h1>
          <p className={styles.text}>
            {loading ? "Đang tải..." : `${categories.length} danh mục`}
          </p>
        </div>
        <button onClick={openCreate} className={styles.button}>
          <Plus size={16} /> Thêm danh mục
        </button>
      </div>

      {error && <div className={styles.card}>{error}</div>}

      <div className={styles.card2}>
        <div className={styles.scroller}>
          <table className={styles.table}>
            <thead className={styles.thead}>
              <tr>
                <th className={styles.headCell}>Tên</th>
                <th className={styles.headCell}>Slug (tự sinh)</th>
                <th className={styles.headCell}>Icon</th>
                <th className={styles.headCell2}>Thao tác</th>
              </tr>
            </thead>
            <tbody className={styles.tbody}>
              {loading ? (
                <tr>
                  <td colSpan={4} className={styles.cell}>
                    <Loader2 size={20} className={styles.spinner} />
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={4} className={styles.cell2}>
                    Chưa có danh mục nào.
                  </td>
                </tr>
              ) : (
                categories.map((c) => (
                  <tr key={c._id} className={styles.row2}>
                    <td className={styles.headCell}>
                      <div className={styles.row3}>
                        <span className={styles.row4}>
                          <FolderOpen size={15} />
                        </span>
                        <span className={styles.label}>{c.name}</span>
                      </div>
                    </td>
                    <td className={styles.cell3}>{c.slug}</td>
                    <td className={styles.cell4}>{c.icon || "--"}</td>
                    <td className={styles.headCell}>
                      <div className={styles.row5}>
                        <button
                          onClick={() => openEdit(c)}
                          title="Sửa"
                          className={styles.button2}
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => remove(c)}
                          disabled={busyId === c._id}
                          title="Xóa"
                          className={styles.button3}
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
        <div className={styles.overlay}>
          <div className={styles.card3}>
            <div className={styles.row6}>
              <h2 className={styles.heading}>
                {editingId ? "Sửa danh mục" : "Thêm danh mục"}
              </h2>
              <button onClick={() => setEditingId(null)} className={styles.button4}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={submit} className={styles.form}>
              {formError && <div className={styles.card4}>{formError}</div>}

              <div>
                <label className={styles.fieldLabel}>Tên danh mục *</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputCls}
                  placeholder="Ví dụ: Trí tuệ nhân tạo"
                />
                <p className={styles.text2}>
                  Slug được backend tự sinh từ tên, không cần nhập.
                </p>
              </div>

              <div>
                <label className={styles.fieldLabel}>Icon</label>
                <input
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  className={inputCls}
                  placeholder="code, cloud, megaphone..."
                />
              </div>

              <div className={styles.row7}>
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className={styles.button5}
                >
                  Hủy
                </button>
                <button type="submit" disabled={saving} className={styles.button6}>
                  {saving && <Loader2 size={14} className={styles.spinner2} />}
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
