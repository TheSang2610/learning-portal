"use client";

import { useEffect, useState } from "react";
import SafeImage from "@/src/components/ui/SafeImage";
import { bannerService, BannerData } from "@/src/services/banner";
import { apiRequest } from "@/src/services/apiHelper";
import { Search, SlidersHorizontal, Loader2 } from "lucide-react";

import styles from "./page.module.scss";
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
      <div className={styles.row}>
        <Loader2 className={styles.spinner} size={24} /> Đang tải cấu hình hiển thị
        banner...
      </div>
    );
  }

  return (
    <div className={styles.stack}>
      {/* HEADER SECTION TƯƠNG ĐỒNG MẪU */}
      <div className={styles.card}>
        <div className={styles.row2}>
          <div className={styles.box}>
            <SlidersHorizontal size={24} />
          </div>
          <div>
            <h1 className={styles.title}>Homepage Banners</h1>
            <p className={styles.text}>
              Bật hoặc tắt nhanh trạng thái hiển thị của các Khung quảng cáo (Banner) hiển
              thị tại Trang Chủ Client.
            </p>
          </div>
        </div>
        <div className={styles.box2}>
          <Search className={styles.floating} size={18} />
          <input
            type="text"
            placeholder="Tìm kiếm tiêu đề banner..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.input}
          />
        </div>
      </div>

      {/* DATA TABLE CONTROL */}
      <div className={styles.card2}>
        {filteredBanners.length === 0 ? (
          <div className={styles.box3}>Không tìm thấy bản ghi banner nào của HOME.</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr className={styles.row3}>
                <th className={styles.headCell}>Nội dung Banner</th>
                <th className={styles.headCell}>Phân Loại / Vị Trí</th>
                <th className={styles.headCell2}>Thứ tự ưu tiên</th>
                <th className={styles.headCell2}>Trạng Thái Kích Hoạt</th>
              </tr>
            </thead>
            <tbody className={styles.tbody}>
              {filteredBanners.map((banner) => (
                <tr key={banner._id} className={styles.row4}>
                  <td className={styles.headCell}>
                    <div className={styles.row2}>
                      {banner.displayType === "IMAGE" && banner.imageUrl ? (
                        <SafeImage
                          src={banner.imageUrl}
                          alt={banner.title}
                          width={56}
                          height={36}
                          className={styles.box4}
                        />
                      ) : (
                        <div
                          style={{ backgroundColor: banner.backgroundColor }}
                          className={styles.row5}
                        >
                          {banner.discountText || "%"}
                        </div>
                      )}
                      <div>
                        <span className={styles.label}>{banner.title}</span>
                        <p className={styles.text2}>{banner.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className={styles.headCell}>
                    <p className={styles.text3}>{banner.displayType}</p>
                    <p className={styles.text4}>Trang: {banner.page}</p>
                  </td>
                  <td className={styles.cell}>
                    Sắp xếp: {banner.backgroundColor ? "Thứ tự " + banner.order : "0"}
                  </td>
                  <td className={styles.headCell2}>
                    <button
                      type="button"
                      disabled={updatingId === banner._id}
                      onClick={() => handleToggleActive(banner._id, !!banner.isActive)}
                      className={`${styles.button4} ${
                        banner.isActive ? styles.button : styles.button2
                      } ${updatingId === banner._id ? styles.button3 : ""}`}
                    >
                      <span
                        className={`${styles.label4} ${
                          banner.isActive ? styles.label2 : styles.label3
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
