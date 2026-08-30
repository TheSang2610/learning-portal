"use client";

import { useState, useEffect } from "react";
import { 
  getProviders, 
  createProviderAdmin, 
  updateProviderAdmin, 
  deleteProviderAdmin 
} from "@/src/services/provider";
import { Plus, Trash2, Edit3, Building2, School, UploadCloud, RefreshCw } from "lucide-react";

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
    } catch (err: any) {
      alert(err.message || "Không thể đồng bộ danh sách đối tác!");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    loadProviders();
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
    } catch (err: any) {
      alert(err.message || "Xảy ra lỗi trong quá trình xử lý dữ liệu!");
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
    } catch (err: any) {
      alert(err.message || "Không thể xóa đơn vị đối tác này!");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen">
      {/* HEADER QUẢN TRỊ */}
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Quản lý Đối tác & Trường học</h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý các đơn vị liên kết cấp chứng chỉ và khóa học trên hệ thống.</p>
        </div>
        <button 
          onClick={loadProviders}
          disabled={fetching}
          className="p-2 border rounded-xl bg-white hover:bg-gray-50 text-gray-600 transition disabled:opacity-50"
          title="Làm mới bảng"
        >
          <RefreshCw size={18} className={fetching ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[380px_minmax(0,1fr)] gap-8 items-start">
        {/* KHỐI 1: BẢNG NHẬP LIỆU (FORM) */}
        <div className="cols-pan-1 bg-white p-6 rounded-2xl border shadow-sm sticky top-6">
          <h2 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
            {editingId ? <Edit3 size={18} className="text-amber-500" /> : <Plus size={18} className="text-blue-600" />}
            {editingId ? "Cập nhật dữ liệu đối tác" : "Thêm đơn vị mới"}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Tên đơn vị */}
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-500 mb-1 tracking-wider">Tên Đơn Vị</label>
              <input
                type="text"
                className="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
                placeholder="Ví dụ: Google, Đại Học Quốc Gia..."
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Loại hình */}
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-500 mb-1 tracking-wider">Phân Loại</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setType("company")}
                  className={`py-2 px-3 border rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition ${
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
                  className={`py-2 px-3 border rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition ${
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
              <label className="block text-xs font-semibold uppercase text-gray-500 mb-1 tracking-wider">Logo Thương Hiệu</label>
              <div className="border-2 border-dashed rounded-xl p-4 text-center bg-gray-50/50 hover:bg-gray-50 transition relative group">
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  onChange={handleFileChange}
                />
                {previewUrl ? (
                  <div className="flex flex-col items-center justify-center py-2">
                    <img src={previewUrl} alt="Preview" className="h-12 w-auto object-contain max-w-full drop-shadow-sm mb-2" />
                    <span className="text-xs text-blue-600 font-medium group-hover:underline">Thay đổi ảnh thương hiệu</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-4 text-gray-500">
                    <UploadCloud size={28} className="mb-2 text-gray-500" />
                    <span className="text-xs font-medium text-gray-600">Click để chọn file logo</span>
                    <span className="text-[10px] text-gray-500 mt-0.5">Định dạng ảnh: PNG, JPG, SVG</span>
                  </div>
                )}
              </div>
            </div>

            {/* Nút hành động */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 text-white py-2.5 px-4 rounded-xl font-medium text-sm hover:bg-slate-800 transition flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {loading ? "Hệ thống đang xử lý..." : editingId ? "Cập nhật dữ liệu" : "Tạo đối tác mới"}
              </button>
              {editingId && (
                <button
                  type="button"
                  className="w-full text-gray-500 text-xs hover:underline mt-3 text-center"
                  onClick={resetForm}
                >
                  Hủy chế độ chỉnh sửa
                </button>
              )}
            </div>
          </form>
        </div>

        {/* KHỐI 2: DATA TABLE HIỂN THỊ DANH SÁCH */}
        <div className="lg:col-span-2 bg-white rounded-2xl border shadow-sm overflow-hidden">
          {fetching ? (
            <div className="p-12 text-center text-gray-500 text-sm animate-pulse flex items-center justify-center gap-2">
              <RefreshCw size={16} className="animate-spin text-gray-500" /> Đang lấy dữ liệu từ server...
            </div>
          ) : providers.length === 0 ? (
            <div className="p-12 text-center text-gray-500 text-sm">
              Hệ thống trống! Chưa có đối tác nào được thiết lập.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b text-gray-500 font-semibold text-xs uppercase tracking-wider">
                    <th className="p-4 pl-6">Logo</th>
                    <th className="p-4">Tên đơn vị</th>
                    <th className="p-4">Đường dẫn SEO (Slug)</th>
                    <th className="p-4">Phân loại</th>
                    <th className="p-4 text-center pr-6">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm text-gray-600">
                  {providers.map((p) => (
                    <tr key={p._id} className="hover:bg-gray-50/60 transition">
                      <td className="p-4 pl-6">
                        <div className="bg-gray-50 p-1.5 rounded-lg w-16 h-10 flex items-center justify-center">
                          <img src={p.logo} alt={p.name} className="max-h-full max-w-full object-contain" />
                        </div>
                      </td>
                      <td className="p-4 font-semibold text-gray-900">{p.name}</td>
                      <td className="p-4">
                        <span className="font-mono text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                          {p.slug}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          p.type === 'university' 
                            ? 'bg-orange-50 text-orange-700 border border-orange-100' 
                            : 'bg-green-50 text-green-700 border border-green-100'
                        }`}>
                          {p.type === "university" ? <School size={12} /> : <Building2 size={12} />}
                          {p.type === "university" ? "Trường học" : "Doanh nghiệp"}
                        </span>
                      </td>
                      <td className="p-4 text-center pr-6">
                        <div className="flex items-center justify-center gap-1">
                          <button 
                            onClick={() => handleEdit(p)} 
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" 
                            title="Sửa"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button 
                            onClick={() => p._id && handleDelete(p._id)} 
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition" 
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