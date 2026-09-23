"use client";

import { useEffect, useState } from "react";
import { bannerService, BannerData } from "@/src/services/banner";
import { apiRequest } from "@/src/services/apiHelper";

import styles from "./page.module.scss";
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
      <div className={styles.row}>
        <Loader2 className={styles.spinner} size={24} /> Đang tải hệ thống dữ liệu
        Banner...
      </div>
    );
  }

  return (
    <div className={styles.stack}>
      {/* TOP HEADER CONTROLS */}
      <div className={styles.card}>
        <div className={styles.row2}>
          <div className={styles.box}>
            <ImageIcon size={24} />
          </div>
          <div>
            <h1 className={styles.title}>Banners Management</h1>
            <p className={styles.text}>
              Khởi tạo các khối banner quảng cáo và cấu hình đồ họa, đẩy file ảnh trực
              tiếp lên kho chứa Cloudinary.
            </p>
          </div>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className={styles.button}>
            <Plus size={16} /> Thêm Mới Banner
          </button>
        )}
      </div>

      {/* DOCK FORM POPUP/COLLAPSE */}
      {showForm && (
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.row3}>
            <h3 className={styles.subheading}>
              {editingId ? "Cập Nhật Thông Tin Banner" : "Tạo Khung Quảng Cáo Mới"}
            </h3>
            <button type="button" onClick={handleResetForm} className={styles.button2}>
              <X size={18} />
            </button>
          </div>

          <div className={styles.grid}>
            <div className={styles.box2}>
              <label className={styles.fieldLabel}>Tiêu đề Banner *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className={styles.input}
              />
            </div>
            <div>
              <label className={styles.fieldLabel}>Chữ trên nút bấm</label>
              <input
                type="text"
                value={buttonText}
                onChange={(e) => setButtonText(e.target.value)}
                className={styles.input}
              />
            </div>
            <div>
              <label className={styles.fieldLabel}>Vị trí Trang hiển thị *</label>
              <select
                value={page}
                onChange={(e) => setPage(e.target.value as BannerData["page"])}
                className={styles.select}
              >
                <option value="HOME">HOME (Trang Chủ)</option>
                <option value="COURSE_LIST">COURSE_LIST (Trang Khóa Học)</option>
                <option value="PRODUCT_LIST">PRODUCT_LIST (Trang Sản Phẩm)</option>
                <option value="CART">CART (Trang Giỏ Hàng)</option>
              </select>
            </div>
          </div>

          {/* 🔥 Ô NHẬP LINK ĐƯỜNG DẪN LIÊN KẾT CHUYỂN TRANG */}
          <div className={styles.box3}>
            <label className={styles.fieldLabel}>
              Đường dẫn liên kết khi click nút (URL Link)
            </label>
            <div className={styles.box4}>
              <Link2 className={styles.floating} size={16} />
              <input
                type="text"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="Ví dụ: /courses/nextjs-basic hoặc https://google.com"
                className={styles.input2}
              />
            </div>
          </div>

          <div className={styles.box3}>
            <label className={styles.fieldLabel}>Mô tả chi tiết banner *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={2}
              className={styles.input}
            />
          </div>

          <div className={styles.grid}>
            <div>
              <label className={styles.fieldLabel}>Màu Nền (Mã Hex)</label>
              <div className={styles.row4}>
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className={styles.input3}
                />
                <input
                  type="text"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className={styles.input4}
                />
              </div>
            </div>
            <div>
              <label className={styles.fieldLabel}>Màu Chữ (Mã Hex)</label>
              <div className={styles.row4}>
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className={styles.input3}
                />
                <input
                  type="text"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className={styles.input4}
                />
              </div>
            </div>
            <div>
              <label className={styles.fieldLabel}>Độ ưu tiên (Order)</label>
              <input
                type="number"
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
                className={styles.input5}
              />
            </div>
            <div>
              <label className={styles.fieldLabel}>Kiểu họa hình hiển thị</label>
              <select
                value={displayType}
                onChange={(e) =>
                  setDisplayType(e.target.value as BannerData["displayType"])
                }
                className={styles.select2}
              >
                <option value="DEFAULT">DEFAULT (Chỉ có chữ)</option>
                <option value="IMAGE">IMAGE (Upload File ảnh đại diện)</option>
                <option value="DISCOUNT">DISCOUNT (Hộp số giảm giá %)</option>
              </select>
            </div>
          </div>

          {/* CONDITIONAL RENDERING SUBFORM */}
          {displayType === "DISCOUNT" && (
            <div className={styles.card2}>
              <div>
                <label className={styles.fieldLabel2}>
                  Text số giảm giá (Ví dụ: 40% hoặc $10)
                </label>
                <input
                  type="text"
                  value={discountText}
                  onChange={(e) => setDiscountText(e.target.value)}
                  className={styles.input6}
                />
              </div>
              <div>
                <label className={styles.fieldLabel2}>
                  Text phụ dưới số (Ví dụ: OFF hoặc GIẢM)
                </label>
                <input
                  type="text"
                  value={discountSubtext}
                  onChange={(e) => setDiscountSubtext(e.target.value)}
                  className={styles.input6}
                />
              </div>
            </div>
          )}

          {displayType === "IMAGE" && (
            <div className={styles.card3}>
              <label className={styles.fieldLabel3}>
                Chọn file ảnh Upload lên Cloudinary
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className={styles.input7}
              />
            </div>
          )}

          <div className={styles.row5}>
            <button type="button" onClick={handleResetForm} className={styles.button3}>
              Hủy
            </button>
            <button type="submit" disabled={submitting} className={styles.button4}>
              {submitting ? (
                <Loader2 className={styles.spinner2} size={16} />
              ) : (
                <Save size={16} />
              )}{" "}
              Lưu Thiết Cấu Hình
            </button>
          </div>
        </form>
      )}

      {/* CORE DATA DISPLAY TABLE */}
      <div className={styles.card4}>
        <table className={styles.table}>
          <thead>
            <tr className={styles.row6}>
              <th className={styles.headCell}>Thông tin Banner</th>
              <th className={styles.headCell}>Vị trí hiển thị</th>
              <th className={styles.headCell}>Cấu trúc đồ họa</th>
              <th className={styles.headCell2}>Thao Tác</th>
            </tr>
          </thead>
          <tbody className={styles.tbody}>
            {banners.map((b) => (
              <tr key={b._id} className={styles.row7}>
                <td className={styles.headCell}>
                  <div className={styles.row2}>
                    <div
                      style={{ backgroundColor: b.backgroundColor, color: b.textColor }}
                      className={styles.col}
                    >
                      <span>{b.buttonText}</span>
                    </div>
                    <div>
                      <span className={styles.label}>{b.title}</span>
                      <p className={styles.text2}>{b.description}</p>
                      {/* 🔥 Hiển thị nhỏ thông tin link dưới tiêu đề để Admin dễ quan sát */}
                      {b.linkUrl && (
                        <p className={styles.text3}>
                          <Link2 size={10} /> Link: {b.linkUrl}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className={styles.cell}>{b.page}</td>
                <td className={styles.headCell}>
                  <span className={styles.card5}>{b.displayType}</span>
                  {!b.isActive && <span className={styles.card6}>ĐÃ TẮT</span>}
                </td>
                <td className={styles.headCell}>
                  <div className={styles.row8}>
                    <button
                      onClick={() => handleEditClick(b)}
                      className={styles.button5}
                      title="Sửa nội dung"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(b._id)}
                      className={styles.button6}
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
