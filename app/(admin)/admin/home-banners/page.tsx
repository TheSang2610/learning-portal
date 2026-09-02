"use client";

import { useEffect, useState } from "react";
import SafeImage from "@/src/components/ui/SafeImage";
import { bannerService, BannerData } from "@/src/services/banner";
import { apiRequest } from "@/src/services/apiHelper";
import { Search, SlidersHorizontal, Loader2 } from "lucide-react";

export default function HomepageBannersTogglePage() {
  const [banners, setBanners] = useState<BannerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function fetchHomeBanners() {
    try {
      const json = await apiRequest("/banners?page=HOME&admin=true", {
        method: "GET",
        cache: "no-store",
      });

      if (json.success && Array.isArray(json.data)) {
        // 🔥 Lọc bằng Javascript: Chỉ giữ lại những banner được cấu hình cho vị trí "HOME"
        // Dù banner đó đang ẩn (isActive: false) hay hiện (isActive: true) thì vẫn sẽ giữ lại trong bảng!
        const homeBanners = (json.data as BannerData[]).filter((b) => b.page === "HOME");
        setBanners(homeBanners);
      }
    } catch (error) {
      console.error("Lỗi lấy danh sách banner trang chủ:", error);
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
    void Promise.resolve().then(fetchHomeBanners);
  }, []);

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      setUpdatingId(id);

      // Khởi tạo FormData để gửi cập nhật trạng thái isActive lên API PUT
      const formData = new FormData();
      formData.append("isActive", String(!currentStatus));

      await bannerService.updateBanner(id, formData);

      // Cập nhật Local State để UI thay đổi mượt mà lập tức
      setBanners((prev) =>
        prev.map((b) => (b._id === id ? { ...b, isActive: !currentStatus } : b)),
      );
    } catch {
      alert("Cập nhật trạng thái hiển thị thất bại!");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredBanners = banners.filter((b) =>
    b.title?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center text-slate-500">
        <Loader2 className="mr-2 animate-spin" size={24} /> Đang tải cấu hình hiển thị
        banner...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER SECTION TƯƠNG ĐỒNG MẪU */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-indigo-100 p-3 text-indigo-600">
            <SlidersHorizontal size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Homepage Banners</h1>
            <p className="mt-0.5 text-xs text-slate-500">
              Bật hoặc tắt nhanh trạng thái hiển thị của các Khung quảng cáo (Banner) hiển
              thị tại Trang Chủ Client.
            </p>
          </div>
        </div>
        <div className="relative w-full sm:w-72">
          <Search
            className="absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-500"
            size={18}
          />
          <input
            type="text"
            placeholder="Tìm kiếm tiêu đề banner..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-4 pl-10 text-sm transition-all focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* DATA TABLE CONTROL */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {filteredBanners.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            Không tìm thấy bản ghi banner nào của HOME.
          </div>
        ) : (
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-bold tracking-wider text-slate-500 uppercase">
                <th className="px-6 py-4">Nội dung Banner</th>
                <th className="px-6 py-4">Phân Loại / Vị Trí</th>
                <th className="px-6 py-4 text-center">Thứ tự ưu tiên</th>
                <th className="px-6 py-4 text-center">Trạng Thái Kích Hoạt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
              {filteredBanners.map((banner) => (
                <tr key={banner._id} className="transition-colors hover:bg-slate-50/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {banner.displayType === "IMAGE" && banner.imageUrl ? (
                        <SafeImage
                          src={banner.imageUrl}
                          alt={banner.title}
                          width={56}
                          height={36}
                          className="h-9 w-14 rounded-lg border border-slate-100 object-cover"
                        />
                      ) : (
                        <div
                          style={{ backgroundColor: banner.backgroundColor }}
                          className="flex h-9 w-14 items-center justify-center rounded-lg border border-slate-200 text-xs font-bold text-white"
                        >
                          {banner.discountText || "%"}
                        </div>
                      )}
                      <div>
                        <span className="line-clamp-1 font-semibold text-slate-800">
                          {banner.title}
                        </span>
                        <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                          {banner.description}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs font-medium tracking-wider text-slate-800 uppercase">
                      {banner.displayType}
                    </p>
                    <p className="mt-0.5 text-xs font-semibold text-indigo-500">
                      Trang: {banner.page}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-slate-700">
                    Sắp xếp: {banner.backgroundColor ? "Thứ tự " + banner.order : "0"}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      type="button"
                      disabled={updatingId === banner._id}
                      onClick={() => handleToggleActive(banner._id, !!banner.isActive)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                        banner.isActive ? "bg-emerald-500" : "bg-slate-200"
                      } ${updatingId === banner._id ? "cursor-not-allowed opacity-50" : ""}`}
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
