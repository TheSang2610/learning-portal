"use client";
/* eslint-disable @next/next/no-img-element --
   Anh xem truoc o trang nay lay tu URL.createObjectURL nen la URL blob: cuc bo.
   next/image khong toi uu duoc blob vi no phai di qua /_next/image tren may chu,
   nen dung the <img> o day moi dung. */

import { useState, useEffect } from "react";
import { getErrorMessage } from "@/src/services/apiHelper";
import SafeImage from "@/src/components/ui/SafeImage";
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
    <div className="mx-auto min-h-screen max-w-7xl p-6">
      {/* HEADER QUẢN TRỊ */}
      <div className="mb-8 flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Quản lý Đối tác & Trường học
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Quản lý các đơn vị liên kết cấp chứng chỉ và khóa học trên hệ thống.
          </p>
        </div>
        <button
          onClick={loadProviders}
          disabled={fetching}
          className="rounded-xl border bg-white p-2 text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
          title="Làm mới bảng"
        >
          <RefreshCw size={18} className={fetching ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[380px_minmax(0,1fr)]">
        {/* KHỐI 1: BẢNG NHẬP LIỆU (FORM) */}
        <div className="cols-pan-1 sticky top-6 rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-gray-800">
            {editingId ? (
              <Edit3 size={18} className="text-amber-500" />
            ) : (
              <Plus size={18} className="text-blue-600" />
            )}
            {editingId ? "Cập nhật dữ liệu đối tác" : "Thêm đơn vị mới"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Tên đơn vị */}
            <div>
              <label className="mb-1 block text-xs font-semibold tracking-wider text-gray-500 uppercase">
                Tên Đơn Vị
              </label>
              <input
                type="text"
                className="w-full rounded-xl border px-4 py-2.5 text-sm transition outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ví dụ: Google, Đại Học Quốc Gia..."
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Loại hình */}
            <div>
              <label className="mb-1 block text-xs font-semibold tracking-wider text-gray-500 uppercase">
                Phân Loại
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setType("company")}
                  className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition ${
                    type === "company"
                      ? "border-blue-600 bg-blue-50/50 text-blue-600 ring-1 ring-blue-600"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Building2 size={16} /> Doanh nghiệp
                </button>
                <button
                  type="button"
                  onClick={() => setType("university")}
                  className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition ${
                    type === "university"
                      ? "border-orange-600 bg-orange-50/50 text-orange-600 ring-1 ring-orange-600"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <School size={16} /> Trường học
                </button>
              </div>
            </div>

            {/* Đăng tải Logo */}
            <div>
              <label className="mb-1 block text-xs font-semibold tracking-wider text-gray-500 uppercase">
                Logo Thương Hiệu
              </label>
              <div className="group relative rounded-xl border-2 border-dashed bg-gray-50/50 p-4 text-center transition hover:bg-gray-50">
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                  onChange={handleFileChange}
                />
                {previewUrl ? (
                  <div className="flex flex-col items-center justify-center py-2">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="mb-2 h-12 w-auto max-w-full object-contain drop-shadow-sm"
                    />
                    <span className="text-xs font-medium text-blue-600 group-hover:underline">
                      Thay đổi ảnh thương hiệu
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-4 text-gray-500">
                    <UploadCloud size={28} className="mb-2 text-gray-500" />
                    <span className="text-xs font-medium text-gray-600">
                      Click để chọn file logo
                    </span>
                    <span className="mt-0.5 text-[10px] text-gray-500">
                      Định dạng ảnh: PNG, JPG, SVG
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Nút hành động */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {loading
                  ? "Hệ thống đang xử lý..."
                  : editingId
                    ? "Cập nhật dữ liệu"
                    : "Tạo đối tác mới"}
              </button>
              {editingId && (
                <button
                  type="button"
                  className="mt-3 w-full text-center text-xs text-gray-500 hover:underline"
                  onClick={resetForm}
                >
                  Hủy chế độ chỉnh sửa
                </button>
              )}
            </div>
          </form>
        </div>

        {/* KHỐI 2: DATA TABLE HIỂN THỊ DANH SÁCH */}
        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm lg:col-span-2">
          {fetching ? (
            <div className="flex animate-pulse items-center justify-center gap-2 p-12 text-center text-sm text-gray-500">
              <RefreshCw size={16} className="animate-spin text-gray-500" /> Đang lấy dữ
              liệu từ server...
            </div>
          ) : providers.length === 0 ? (
            <div className="p-12 text-center text-sm text-gray-500">
              Hệ thống trống! Chưa có đối tác nào được thiết lập.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b bg-gray-50 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                    <th className="p-4 pl-6">Logo</th>
                    <th className="p-4">Tên đơn vị</th>
                    <th className="p-4">Đường dẫn SEO (Slug)</th>
                    <th className="p-4">Phân loại</th>
                    <th className="p-4 pr-6 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm text-gray-600">
                  {providers.map((p) => (
                    <tr key={p._id} className="transition hover:bg-gray-50/60">
                      <td className="p-4 pl-6">
                        <div className="flex h-10 w-16 items-center justify-center rounded-lg bg-gray-50 p-1.5">
                          <SafeImage
                            src={p.logo}
                            alt={p.name}
                            width={64}
                            height={40}
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                      </td>
                      <td className="p-4 font-semibold text-gray-900">{p.name}</td>
                      <td className="p-4">
                        <span className="rounded bg-gray-100 px-2 py-0.5 font-mono text-xs text-gray-600">
                          {p.slug}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            p.type === "university"
                              ? "border border-orange-100 bg-orange-50 text-orange-700"
                              : "border border-green-100 bg-green-50 text-green-700"
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
                      <td className="p-4 pr-6 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleEdit(p)}
                            className="rounded-lg p-2 text-gray-500 transition hover:bg-blue-50 hover:text-blue-600"
                            title="Sửa"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            onClick={() => p._id && handleDelete(p._id)}
                            className="rounded-lg p-2 text-gray-500 transition hover:bg-red-50 hover:text-red-600"
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
