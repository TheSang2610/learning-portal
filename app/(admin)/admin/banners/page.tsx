"use client";

import { useEffect, useState } from "react";
import { bannerService, BannerData } from "@/src/services/banner";
import { apiRequest } from "@/src/services/apiHelper";
import { Image as ImageIcon, Plus, Trash2, Edit2, X, Save, Loader2, Link2 } from "lucide-react";

export default function BannersManagementPage() {
  const [banners, setBanners] = useState<BannerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // States của Form Quản trị
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [buttonText, setButtonText] = useState("Explore");
  const [linkUrl, setLinkUrl] = useState(""); // 🔥 THÊM STATE ĐƯỜNG DẪN LIÊN KẾT
  const [backgroundColor, setBackgroundColor] = useState("#0056d2");
  const [textColor, setTextColor] = useState("#ffffff");
  const [displayType, setDisplayType] = useState<"DEFAULT" | "IMAGE" | "DISCOUNT">("DEFAULT");
  const [discountText, setDiscountText] = useState("");
  const [discountSubtext, setDiscountSubtext] = useState("");
  const [page, setPage] = useState<"HOME" | "COURSE_LIST" | "PRODUCT_LIST" | "CART">("HOME");
  const [order, setOrder] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  async function fetchAllBanners() {
    try {
      const json = await apiRequest("/banners?page=HOME&admin=true", {
        method: "GET",
        cache: "no-store",
      });
      if (json.success) setBanners(json.data);
    } catch (error) {
      console.error("Lỗi khi tải danh sách tất cả banner:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAllBanners();
  }, []);

  const handleEditClick = (banner: BannerData) => {
    setEditingId(banner._id);
    setTitle(banner.title);
    setDescription(banner.description);
    setButtonText(banner.buttonText);
    setLinkUrl((banner as any).linkUrl || ""); // 🔥 GÁN GIÁ TRỊ LINK KHI SỬA
    setBackgroundColor(banner.backgroundColor);
    setTextColor(banner.textColor);
    setDisplayType(banner.displayType);
    setDiscountText(banner.discountText || "");
    setDiscountSubtext(banner.discountSubtext || "");
    setPage(banner.page);
    setOrder((banner as any).order || 0);
    setSelectedFile(null);
    setShowForm(true);
  };

  const handleResetForm = () => {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setButtonText("Explore");
    setLinkUrl(""); // 🔥 RESET STATE LINK
    setBackgroundColor("#0056d2");
    setTextColor("#ffffff");
    setDisplayType("DEFAULT");
    setDiscountText("");
    setDiscountSubtext("");
    setPage("HOME");
    setOrder(0);
    setSelectedFile(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("buttonText", buttonText);
      formData.append("linkUrl", linkUrl); // 🔥 ĐẨY LIÊN KẾT LÊN API thông qua FormData
      formData.append("backgroundColor", backgroundColor);
      formData.append("textColor", textColor);
      formData.append("displayType", displayType);
      formData.append("page", page);
      formData.append("order", String(order));
      
      // Giữ trạng thái kích hoạt khi tạo mới / cập nhật
      if (!editingId) {
        formData.append("isActive", "true");
      }
      
      if (displayType === "DISCOUNT") {
        formData.append("discountText", discountText);
        formData.append("discountSubtext", discountSubtext);
      }
      if (selectedFile) {
        formData.append("image", selectedFile);
      }

      if (editingId) {
        await bannerService.updateBanner(editingId, formData);
      } else {
        await bannerService.createBanner(formData);
      }

      handleResetForm();
      fetchAllBanners();
    } catch (error) {
      alert("Xử lý form banner thất bại!");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa vĩnh viễn banner này khỏi DB và Cloudinary không?")) return;
    try {
      await bannerService.deleteBanner(id);
      fetchAllBanners();
    } catch (error) {
      alert("Xóa banner thất bại!");
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center text-slate-500">
        <Loader2 className="animate-spin mr-2" size={24} /> Đang tải hệ thống dữ liệu Banner...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* TOP HEADER CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 text-blue-600 p-3 rounded-xl">
            <ImageIcon size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Banners Management</h1>
            <p className="text-xs text-slate-500 mt-0.5">Khởi tạo các khối banner quảng cáo và cấu hình đồ họa, đẩy file ảnh trực tiếp lên kho chứa Cloudinary.</p>
          </div>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus size={16} /> Thêm Mới Banner
          </button>
        )}
      </div>

      {/* DOCK FORM POPUP/COLLAPSE */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md space-y-4 transition-all">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-bold text-slate-800">{editingId ? "Cập Nhật Thông Tin Banner" : "Tạo Khung Quảng Cáo Mới"}</h3>
            <button type="button" onClick={handleResetForm} className="text-slate-500 hover:text-slate-600"><X size={18} /></button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tiêu đề Banner *</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full border rounded-xl p-2.5 bg-slate-50 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Chữ trên nút bấm</label>
              <input type="text" value={buttonText} onChange={(e) => setButtonText(e.target.value)} className="w-full border rounded-xl p-2.5 bg-slate-50 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Vị trí Trang hiển thị *</label>
              <select value={page} onChange={(e: any) => setPage(e.target.value)} className="w-full border rounded-xl p-2.5 bg-slate-50 focus:outline-none focus:border-blue-500 font-semibold">
                <option value="HOME">HOME (Trang Chủ)</option>
                <option value="COURSE_LIST">COURSE_LIST (Trang Khóa Học)</option>
                <option value="PRODUCT_LIST">PRODUCT_LIST (Trang Sản Phẩm)</option>
                <option value="CART">CART (Trang Giỏ Hàng)</option>
              </select>
            </div>
          </div>

          {/* 🔥 Ô NHẬP LINK ĐƯỜNG DẪN LIÊN KẾT CHUYỂN TRANG */}
          <div className="text-sm">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Đường dẫn liên kết khi click nút (URL Link)</label>
            <div className="relative">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input 
                type="text" 
                value={linkUrl} 
                onChange={(e) => setLinkUrl(e.target.value)} 
                placeholder="Ví dụ: /courses/nextjs-basic hoặc https://google.com" 
                className="w-full border rounded-xl pl-10 pr-4 py-2.5 bg-slate-50 focus:outline-none focus:border-blue-500 placeholder:text-slate-500"
              />
            </div>
          </div>

          <div className="text-sm">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mô tả chi tiết banner *</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={2} className="w-full border rounded-xl p-2.5 bg-slate-50 focus:outline-none focus:border-blue-500" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Màu Nền (Mã Hex)</label>
              <div className="flex gap-2">
                <input type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} className="w-10 h-10 border rounded-lg cursor-pointer" />
                <input type="text" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} className="flex-1 border rounded-xl px-2.5 bg-slate-50 focus:outline-none text-xs" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Màu Chữ (Mã Hex)</label>
              <div className="flex gap-2">
                <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="w-10 h-10 border rounded-lg cursor-pointer" />
                <input type="text" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="flex-1 border rounded-xl px-2.5 bg-slate-50 focus:outline-none text-xs" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Độ ưu tiên (Order)</label>
              <input type="number" value={order} onChange={(e) => setOrder(Number(e.target.value))} className="w-full border rounded-xl p-2.5 bg-slate-50" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Kiểu họa hình hiển thị</label>
              <select value={displayType} onChange={(e: any) => setDisplayType(e.target.value)} className="w-full border rounded-xl p-2.5 bg-slate-50 font-medium">
                <option value="DEFAULT">DEFAULT (Chỉ có chữ)</option>
                <option value="IMAGE">IMAGE (Upload File ảnh đại diện)</option>
                <option value="DISCOUNT">DISCOUNT (Hộp số giảm giá %)</option>
              </select>
            </div>
          </div>

          {/* CONDITIONAL RENDERING SUBFORM */}
          {displayType === "DISCOUNT" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-amber-50/50 p-4 rounded-xl border border-amber-100">
              <div>
                <label className="block text-xs font-bold text-amber-700 uppercase mb-1">Text số giảm giá (Ví dụ: 40% hoặc $10)</label>
                <input type="text" value={discountText} onChange={(e) => setDiscountText(e.target.value)} className="w-full border rounded-xl p-2 bg-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-amber-700 uppercase mb-1">Text phụ dưới số (Ví dụ: OFF hoặc GIẢM)</label>
                <input type="text" value={discountSubtext} onChange={(e) => setDiscountSubtext(e.target.value)} className="w-full border rounded-xl p-2 bg-white" />
              </div>
            </div>
          )}

          {displayType === "IMAGE" && (
            <div className="text-sm bg-blue-50/50 p-4 rounded-xl border border-blue-100">
              <label className="block text-xs font-bold text-blue-700 uppercase mb-1">Chọn file ảnh Upload lên Cloudinary</label>
              <input type="file" accept="image/*" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer" />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={handleResetForm} className="px-4 py-2 text-sm border font-medium rounded-xl text-slate-500 hover:bg-slate-50">Hủy</button>
            <button type="submit" disabled={submitting} className="flex items-center gap-1.5 px-5 py-2 text-sm bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50">
              {submitting ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Lưu Thiết Cấu Hình
            </button>
          </div>
        </form>
      )}

      {/* CORE DATA DISPLAY TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/70 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <th className="px-6 py-4">Thông tin Banner</th>
              <th className="px-6 py-4">Vị trí hiển thị</th>
              <th className="px-6 py-4">Cấu trúc đồ họa</th>
              <th className="px-6 py-4 text-center">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
            {banners.map((b) => (
              <tr key={b._id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div style={{ backgroundColor: b.backgroundColor, color: b.textColor }} className="w-16 h-10 rounded-lg flex flex-col items-center justify-center font-bold text-[10px] shadow-sm border border-black/5">
                      <span>{b.buttonText}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-800 line-clamp-1">{b.title}</span>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{b.description}</p>
                      {/* 🔥 Hiển thị nhỏ thông tin link dưới tiêu đề để Admin dễ quan sát */}
                      {(b as any).linkUrl && (
                        <p className="text-[11px] text-blue-500 font-medium mt-0.5 flex items-center gap-0.5">
                          <Link2 size={10} /> Link: {(b as any).linkUrl}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 font-bold text-xs text-indigo-600 uppercase tracking-wider">
                  {b.page}
                </td>
                <td className="px-6 py-4">
                  <span className="inline-block px-2 py-1 text-[10px] font-bold rounded-md bg-slate-100 text-slate-600 border uppercase">
                    {b.displayType}
                  </span>
                  {!b.isActive && <span className="ml-2 inline-block px-2 py-1 text-[10px] font-bold rounded-md bg-red-50 text-red-500 border border-red-200">ĐÃ TẮT</span>}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => handleEditClick(b)} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Sửa nội dung"><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(b._id)} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Xóa vĩnh viễn"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}