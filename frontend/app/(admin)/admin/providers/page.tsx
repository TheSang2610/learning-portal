"use client";
/* eslint-disable @next/next/no-img-element --
   Anh xem truoc o trang nay lay tu URL.createObjectURL nen la URL blob: cuc bo.
   next/image khong toi uu duoc blob vi no phai di qua /_next/image tren may chu,
   nen dung the <img> o day moi dung. */

import { useState, useEffect } from "react";
import { getErrorMessage } from "@/src/services/apiHelper";
import SafeImage from "@/src/components/ui/SafeImage";

import styles from "./page.module.scss";
import {
  getProviders,
  createProviderAdmin,
  updateProviderAdmin,
  deleteProviderAdmin,
} from "@/src/services/provider";
import {
  Plus,
  Trash2,
  Edit3,
  Building2,
  School,
  UploadCloud,
  RefreshCw,
} from "lucide-react";

interface ProviderType {
  _id?: string;
  name: string;
  type: "company" | "university";
  logo: string;
  slug: string;
}

export default function AdminProvidersPage() {
  const [providers, setProviders] = useState<ProviderType[]>([]);
  const [name, setName] = useState("");
  const [type, setType] = useState<"company" | "university">("company");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // 🔄 Tải danh sách đối tác từ Backend
  const loadProviders = async () => {
    try {
      setFetching(true);
      const data = await getProviders();
      if (Array.isArray(data)) {
        setProviders(data);
      }
    } catch (err) {
      alert(getErrorMessage(err, "Không thể đồng bộ danh sách đối tác!"));
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    // Goi qua mot vong microtask thay vi goi thang. Ham tai du lieu bat dau
    // bang setLoading(true), nen goi thang la setState dong bo ngay trong than
    // effect: React phai chay them mot vong ve lai truoc khi hien man hinh
    // (rule react-hooks/set-state-in-effect canh bao dung cho nay). Hoan mot
    // vong microtask thi mat thuong khong thay khac, ma vong ve thua het.
    void Promise.resolve().then(loadProviders);
  }, []);

  // 📸 Xử lý chọn ảnh & Tạo link xem trước tạm thời (Preview)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  // 🧹 Xóa trắng Form
  const resetForm = () => {
    setName("");
    setType("company");
    setFile(null);
    setPreviewUrl(null);
    setEditingId(null);
  };

  // 💾 Xử lý submit Form (Thêm mới hoặc Cập nhật)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return alert("Vui lòng nhập tên đối tác!");

    setLoading(true);
    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("type", type);
    if (file) {
      formData.append("logo", file); // Key "logo" khớp chuẩn với uploadCloud.single("logo") ở backend
    }

    try {
      if (editingId) {
        await updateProviderAdmin(editingId, formData);
        alert("Cập nhật thông tin đối tác thành công!");
      } else {
        if (!file) {
          return alert("Vui lòng chọn hình ảnh logo thương hiệu cho đối tác mới!");
        }
        await createProviderAdmin(formData);
        alert("Thêm đơn vị đối tác và tải ảnh lên Cloudinary thành công!");
      }
      resetForm();
      loadProviders();
    } catch (err) {
      alert(getErrorMessage(err, "Xảy ra lỗi trong quá trình xử lý dữ liệu!"));
    } finally {
      setLoading(false);
    }
  };

  // ✏️ Kích hoạt trạng thái Chỉnh sửa
  const handleEdit = (provider: ProviderType) => {
    if (!provider._id) return;
    setEditingId(provider._id);
    setName(provider.name);
    setType(provider.type);
    setPreviewUrl(provider.logo); // Hiển thị sẵn ảnh cũ trên Cloudinary làm preview
    setFile(null);
  };

  // 🗑️ Xóa đối tác dữ liệu
  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa đối tác này?")) return;
    try {
      const res = await deleteProviderAdmin(id);
      alert(res.message || "Xóa đối tác thành công!");
      loadProviders();
    } catch (err) {
      alert(getErrorMessage(err, "Không thể xóa đơn vị đối tác này!"));
    }
  };

  return (
    <div className={styles.page}>
      {/* HEADER QUẢN TRỊ */}
      <div className={styles.row}>
        <div>
          <h1 className={styles.title}>Quản lý Đối tác & Trường học</h1>
          <p className={styles.text}>
            Quản lý các đơn vị liên kết cấp chứng chỉ và khóa học trên hệ thống.
          </p>
        </div>
        <button
          onClick={loadProviders}
          disabled={fetching}
          className={styles.button}
          title="Làm mới bảng"
        >
          <RefreshCw size={18} className={fetching ? styles.spinner : ""} />
        </button>
      </div>

      <div className={styles.grid}>
        {/* KHỐI 1: BẢNG NHẬP LIỆU (FORM) */}
        <div className={styles.sticky}>
          <h2 className={styles.heading}>
            {editingId ? (
              <Edit3 size={18} className={styles.box} />
            ) : (
              <Plus size={18} className={styles.box2} />
            )}
            {editingId ? "Cập nhật dữ liệu đối tác" : "Thêm đơn vị mới"}
          </h2>

          <form onSubmit={handleSubmit} className={styles.form}>
            {/* Tên đơn vị */}
            <div>
              <label className={styles.fieldLabel}>Tên Đơn Vị</label>
              <input
                type="text"
                className={styles.input}
                placeholder="Ví dụ: Google, Đại Học Quốc Gia..."
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Loại hình */}
            <div>
              <label className={styles.fieldLabel}>Phân Loại</label>
              <div className={styles.grid2}>
                <button
                  type="button"
                  onClick={() => setType("company")}
                  className={`${styles.button9} ${
                    type === "company" ? styles.button2 : styles.button3
                  }`}
                >
                  <Building2 size={16} /> Doanh nghiệp
                </button>
                <button
                  type="button"
                  onClick={() => setType("university")}
                  className={`${styles.button9} ${
                    type === "university" ? styles.button4 : styles.button3
                  }`}
                >
                  <School size={16} /> Trường học
                </button>
              </div>
            </div>

            {/* Đăng tải Logo */}
            <div>
              <label className={styles.fieldLabel}>Logo Thương Hiệu</label>
              <div className={`group ${styles.box3}`}>
                <input
                  type="file"
                  accept="image/*"
                  className={styles.input2}
                  onChange={handleFileChange}
                />
                {previewUrl ? (
                  <div className={styles.col}>
                    <img src={previewUrl} alt="Preview" className={styles.image} />
                    <span className={styles.label}>Thay đổi ảnh thương hiệu</span>
                  </div>
                ) : (
                  <div className={styles.col2}>
                    <UploadCloud size={28} className={styles.box4} />
                    <span className={styles.label2}>Click để chọn file logo</span>
                    <span className={styles.label3}>Định dạng ảnh: PNG, JPG, SVG</span>
                  </div>
                )}
              </div>
            </div>

            {/* Nút hành động */}
            <div className={styles.box5}>
              <button type="submit" disabled={loading} className={styles.button5}>
                {loading
                  ? "Hệ thống đang xử lý..."
                  : editingId
                    ? "Cập nhật dữ liệu"
                    : "Tạo đối tác mới"}
              </button>
              {editingId && (
                <button type="button" className={styles.button6} onClick={resetForm}>
                  Hủy chế độ chỉnh sửa
                </button>
              )}
            </div>
          </form>
        </div>

        {/* KHỐI 2: DATA TABLE HIỂN THỊ DANH SÁCH */}
        <div className={styles.card}>
          {fetching ? (
            <div className={styles.row2}>
              <RefreshCw size={16} className={styles.spinner2} /> Đang lấy dữ liệu từ
              server...
            </div>
          ) : providers.length === 0 ? (
            <div className={styles.box6}>
              Hệ thống trống! Chưa có đối tác nào được thiết lập.
            </div>
          ) : (
            <div className={styles.scroller}>
              <table className={styles.table}>
                <thead>
                  <tr className={styles.row3}>
                    <th className={styles.headCell}>Logo</th>
                    <th className={styles.headCell2}>Tên đơn vị</th>
                    <th className={styles.headCell2}>Đường dẫn SEO (Slug)</th>
                    <th className={styles.headCell2}>Phân loại</th>
                    <th className={styles.headCell3}>Thao tác</th>
                  </tr>
                </thead>
                <tbody className={styles.tbody}>
                  {providers.map((p) => (
                    <tr key={p._id} className={styles.row4}>
                      <td className={styles.headCell}>
                        <div className={styles.row5}>
                          <SafeImage
                            src={p.logo}
                            alt={p.name}
                            width={64}
                            height={40}
                            className={styles.box7}
                          />
                        </div>
                      </td>
                      <td className={styles.cell}>{p.name}</td>
                      <td className={styles.headCell2}>
                        <span className={styles.label4}>{p.slug}</span>
                      </td>
                      <td className={styles.headCell2}>
                        <span
                          className={`${styles.label7} ${
                            p.type === "university" ? styles.label5 : styles.label6
                          }`}
                        >
                          {p.type === "university" ? (
                            <School size={12} />
                          ) : (
                            <Building2 size={12} />
                          )}
                          {p.type === "university" ? "Trường học" : "Doanh nghiệp"}
                        </span>
                      </td>
                      <td className={styles.headCell3}>
                        <div className={styles.row6}>
                          <button
                            onClick={() => handleEdit(p)}
                            className={styles.button7}
                            title="Sửa"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            onClick={() => p._id && handleDelete(p._id)}
                            className={styles.button8}
                            title="Xóa"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
