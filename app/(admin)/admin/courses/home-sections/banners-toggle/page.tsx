"use client";

import { useEffect, useState } from "react";
import { bannerService, BannerData } from "@/src/services/banner";
import { Search, SlidersHorizontal, Loader2, Image as ImageIcon } from "lucide-react";

export default function HomepageBannersTogglePage() {
  const [banners, setBanners] = useState<BannerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchHomeBanners();
  }, []);

const fetchHomeBanners = async () => {
    try {
      setLoading(true);
      
      // 🔥 THAY ĐỔI: Không gọi qua bộ lọc hạn chế của getBannersByPage("HOME") nữa
      // Gọi trực tiếp API tổng lấy toàn bộ banner của hệ thống (giống bên trang quản lý chính)
      const res = await fetch("http://localhost:5000/api/banners?page=HOME&admin=true");
      const json = await res.json();
      
      if (json.success && Array.isArray(json.data)) {
        // 🔥 Lọc bằng Javascript: Chỉ giữ lại những banner được cấu hình cho vị trí "HOME"
        // Dù banner đó đang ẩn (isActive: false) hay hiện (isActive: true) thì vẫn sẽ giữ lại trong bảng!
        const homeBanners = json.data.filter((b: any) => b.page === "HOME");
        setBanners(homeBanners);
      }
    } catch (error) {
      console.error("Lỗi lấy danh sách banner trang chủ:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      setUpdatingId(id);
      
      // Khởi tạo FormData để gửi cập nhật trạng thái isActive lên API PUT
      const formData = new FormData();
      formData.append("isActive", String(!currentStatus));

      await bannerService.updateBanner(id, formData);

      // Cập nhật Local State để UI thay đổi mượt mà lập tức
      setBanners((prev) =>
        prev.map((b) => (b._id === id ? { ...b, isActive: !currentStatus } : b))
      );
    } catch (error) {
      alert("Cập nhật trạng thái hiển thị thất bại!");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredBanners = banners.filter((b) =>
    b.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center text-slate-500">
        <Loader2 className="animate-spin mr-2" size={24} /> Đang tải cấu hình hiển thị banner...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER SECTION TƯƠNG ĐỒNG MẪU */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-100 text-indigo-600 p-3 rounded-xl">
            <SlidersHorizontal size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Homepage Banners</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Bật hoặc tắt nhanh trạng thái hiển thị của các Khung quảng cáo (Banner) hiển thị tại Trang Chủ Client.
            </p>
          </div>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Tìm kiếm tiêu đề banner..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500 transition-all bg-slate-50"
          />
        </div>
      </div>

      {/* DATA TABLE CONTROL */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredBanners.length === 0 ? (
          <div className="p-12 text-center text-slate-400">Không tìm thấy bản ghi banner nào của HOME.</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-4">Nội dung Banner</th>
                <th className="px-6 py-4">Phân Loại / Vị Trí</th>
                <th className="px-6 py-4 text-center">Thứ tự ưu tiên</th>
                <th className="px-6 py-4 text-center">Trạng Thái Kích Hoạt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
              {filteredBanners.map((banner) => (
                <tr key={banner._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {banner.displayType === "IMAGE" && banner.imageUrl ? (
                        <img
                          src={banner.imageUrl}
                          alt={banner.title}
                          className="w-14 h-9 object-cover rounded-lg border border-slate-100"
                        />
                      ) : (
                        <div 
                          style={{ backgroundColor: banner.backgroundColor }}
                          className="w-14 h-9 rounded-lg border border-slate-200 flex items-center justify-center text-white font-bold text-xs"
                        >
                          {banner.discountText || "%"}
                        </div>
                      )}
                      <div>
                        <span className="font-semibold text-slate-800 line-clamp-1">{banner.title}</span>
                        <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{banner.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-slate-800 font-medium uppercase text-xs tracking-wider">{banner.displayType}</p>
                    <p className="text-xs text-indigo-500 font-semibold mt-0.5">Trang: {banner.page}</p>
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-slate-700">
                    Sắp xếp: {banner.backgroundColor ? "Thứ tự " + (banner as any).order : "0"}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      type="button"
                      disabled={updatingId === banner._id}
                      onClick={() => handleToggleActive(banner._id, !!banner.isActive)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                        banner.isActive ? "bg-emerald-500" : "bg-slate-200"
                      } ${updatingId === banner._id ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          banner.isActive ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}