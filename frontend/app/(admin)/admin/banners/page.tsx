"use client";

import { useEffect, useState } from "react";
import { bannerService, BannerData } from "@/src/services/banner";
import { apiRequest } from "@/src/services/apiHelper";
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  Edit2,
  X,
  Save,
  Loader2,
  Link2,
} from "lucide-react";

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
  const [displayType, setDisplayType] = useState<"DEFAULT" | "IMAGE" | "DISCOUNT">(
    "DEFAULT",
  );
  const [discountText, setDiscountText] = useState("");
  const [discountSubtext, setDiscountSubtext] = useState("");
  const [page, setPage] = useState<"HOME" | "COURSE_LIST" | "PRODUCT_LIST" | "CART">(
    "HOME",
  );
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
    // Goi qua mot vong microtask thay vi goi thang. Ham tai du lieu bat dau
    // bang setLoading(true), nen goi thang la setState dong bo ngay trong than
    // effect: React phai chay them mot vong ve lai truoc khi hien man hinh
    // (rule react-hooks/set-state-in-effect canh bao dung cho nay). Hoan mot
    // vong microtask thi mat thuong khong thay khac, ma vong ve thua het.
    void Promise.resolve().then(fetchAllBanners);
  }, []);

  const handleEditClick = (banner: BannerData) => {
    setEditingId(banner._id);
    setTitle(banner.title);
    setDescription(banner.description);
    setButtonText(banner.buttonText);
    setLinkUrl(banner.linkUrl || ""); // 🔥 GÁN GIÁ TRỊ LINK KHI SỬA
    setBackgroundColor(banner.backgroundColor);
    setTextColor(banner.textColor);
    setDisplayType(banner.displayType);
    setDiscountText(banner.discountText || "");
    setDiscountSubtext(banner.discountSubtext || "");
    setPage(banner.page);
    setOrder(banner.order || 0);
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
    } catch {
      alert("Xử lý form banner thất bại!");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Bạn có chắc chắn muốn xóa vĩnh viễn banner này khỏi DB và Cloudinary không?",
      )
    )
      return;
    try {
      await bannerService.deleteBanner(id);
      fetchAllBanners();
    } catch {
      alert("Xóa banner thất bại!");
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center text-slate-500">
        <Loader2 className="mr-2 animate-spin" size={24} /> Đang tải hệ thống dữ liệu
        Banner...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* TOP HEADER CONTROLS */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
            <ImageIcon size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Banners Management</h1>
            <p className="mt-0.5 text-xs text-slate-500">
              Khởi tạo các khối banner quảng cáo và cấu hình đồ họa, đẩy file ảnh trực
              tiếp lên kho chứa Cloudinary.
            </p>
          </div>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            <Plus size={16} /> Thêm Mới Banner
          </button>
        )}
      </div>

      {/* DOCK FORM POPUP/COLLAPSE */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-md transition-all"
        >
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-bold text-slate-800">
              {editingId ? "Cập Nhật Thông Tin Banner" : "Tạo Khung Quảng Cáo Mới"}
            </h3>
            <button
              type="button"
              onClick={handleResetForm}
              className="text-slate-500 hover:text-slate-600"
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-4">
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-bold text-slate-500 uppercase">
                Tiêu đề Banner *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full rounded-xl border bg-slate-50 p-2.5 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-500 uppercase">
                Chữ trên nút bấm
              </label>
              <input
                type="text"
                value={buttonText}
                onChange={(e) => setButtonText(e.target.value)}
                className="w-full rounded-xl border bg-slate-50 p-2.5 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-500 uppercase">
                Vị trí Trang hiển thị *
              </label>
              <select
                value={page}
                onChange={(e) => setPage(e.target.value as BannerData["page"])}
                className="w-full rounded-xl border bg-slate-50 p-2.5 font-semibold focus:border-blue-500 focus:outline-none"
              >
                <option value="HOME">HOME (Trang Chủ)</option>
                <option value="COURSE_LIST">COURSE_LIST (Trang Khóa Học)</option>
                <option value="PRODUCT_LIST">PRODUCT_LIST (Trang Sản Phẩm)</option>
                <option value="CART">CART (Trang Giỏ Hàng)</option>
              </select>
            </div>
          </div>

          {/* 🔥 Ô NHẬP LINK ĐƯỜNG DẪN LIÊN KẾT CHUYỂN TRANG */}
          <div className="text-sm">
            <label className="mb-1 block text-xs font-bold text-slate-500 uppercase">
              Đường dẫn liên kết khi click nút (URL Link)
            </label>
            <div className="relative">
              <Link2
                className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-500"
                size={16}
              />
              <input
                type="text"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="Ví dụ: /courses/nextjs-basic hoặc https://google.com"
                className="w-full rounded-xl border bg-slate-50 py-2.5 pr-4 pl-10 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="text-sm">
            <label className="mb-1 block text-xs font-bold text-slate-500 uppercase">
              Mô tả chi tiết banner *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={2}
              className="w-full rounded-xl border bg-slate-50 p-2.5 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-4">
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-500 uppercase">
                Màu Nền (Mã Hex)
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="h-10 w-10 cursor-pointer rounded-lg border"
                />
                <input
                  type="text"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="flex-1 rounded-xl border bg-slate-50 px-2.5 text-xs focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-500 uppercase">
                Màu Chữ (Mã Hex)
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="h-10 w-10 cursor-pointer rounded-lg border"
                />
                <input
                  type="text"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="flex-1 rounded-xl border bg-slate-50 px-2.5 text-xs focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-500 uppercase">
                Độ ưu tiên (Order)
              </label>
              <input
                type="number"
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
                className="w-full rounded-xl border bg-slate-50 p-2.5"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-500 uppercase">
                Kiểu họa hình hiển thị
              </label>
              <select
                value={displayType}
                onChange={(e) =>
                  setDisplayType(e.target.value as BannerData["displayType"])
                }
                className="w-full rounded-xl border bg-slate-50 p-2.5 font-medium"
              >
                <option value="DEFAULT">DEFAULT (Chỉ có chữ)</option>
                <option value="IMAGE">IMAGE (Upload File ảnh đại diện)</option>
                <option value="DISCOUNT">DISCOUNT (Hộp số giảm giá %)</option>
              </select>
            </div>
          </div>

          {/* CONDITIONAL RENDERING SUBFORM */}
          {displayType === "DISCOUNT" && (
            <div className="grid grid-cols-1 gap-4 rounded-xl border border-amber-100 bg-amber-50/50 p-4 text-sm md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-bold text-amber-700 uppercase">
                  Text số giảm giá (Ví dụ: 40% hoặc $10)
                </label>
                <input
                  type="text"
                  value={discountText}
                  onChange={(e) => setDiscountText(e.target.value)}
                  className="w-full rounded-xl border bg-white p-2"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-amber-700 uppercase">
                  Text phụ dưới số (Ví dụ: OFF hoặc GIẢM)
                </label>
                <input
                  type="text"
                  value={discountSubtext}
                  onChange={(e) => setDiscountSubtext(e.target.value)}
                  className="w-full rounded-xl border bg-white p-2"
                />
              </div>
            </div>
          )}

          {displayType === "IMAGE" && (
            <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 text-sm">
              <label className="mb-1 block text-xs font-bold text-blue-700 uppercase">
                Chọn file ảnh Upload lên Cloudinary
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="w-full cursor-pointer file:mr-4 file:rounded-full file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-blue-700"
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleResetForm}
              className="rounded-xl border px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <Save size={16} />
              )}{" "}
              Lưu Thiết Cấu Hình
            </button>
          </div>
        </form>
      )}

      {/* CORE DATA DISPLAY TABLE */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-bold tracking-wider text-slate-500 uppercase">
              <th className="px-6 py-4">Thông tin Banner</th>
              <th className="px-6 py-4">Vị trí hiển thị</th>
              <th className="px-6 py-4">Cấu trúc đồ họa</th>
              <th className="px-6 py-4 text-center">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
            {banners.map((b) => (
              <tr key={b._id} className="transition-colors hover:bg-slate-50/50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      style={{ backgroundColor: b.backgroundColor, color: b.textColor }}
                      className="flex h-10 w-16 flex-col items-center justify-center rounded-lg border border-black/5 text-[10px] font-bold shadow-sm"
                    >
                      <span>{b.buttonText}</span>
                    </div>
                    <div>
                      <span className="line-clamp-1 font-semibold text-slate-800">
                        {b.title}
                      </span>
                      <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                        {b.description}
                      </p>
                      {/* 🔥 Hiển thị nhỏ thông tin link dưới tiêu đề để Admin dễ quan sát */}
                      {b.linkUrl && (
                        <p className="mt-0.5 flex items-center gap-0.5 text-[11px] font-medium text-blue-500">
                          <Link2 size={10} /> Link: {b.linkUrl}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-xs font-bold tracking-wider text-indigo-600 uppercase">
                  {b.page}
                </td>
                <td className="px-6 py-4">
                  <span className="inline-block rounded-md border bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600 uppercase">
                    {b.displayType}
                  </span>
                  {!b.isActive && (
                    <span className="ml-2 inline-block rounded-md border border-red-200 bg-red-50 px-2 py-1 text-[10px] font-bold text-red-500">
                      ĐÃ TẮT
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleEditClick(b)}
                      className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-blue-50 hover:text-blue-600"
                      title="Sửa nội dung"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(b._id)}
                      className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
                      title="Xóa vĩnh viễn"
                    >
                      <Trash2 size={16} />
                    </button>
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
