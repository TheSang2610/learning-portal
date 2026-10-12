/** Chu cua trang /admin/providers (doi tac & truong hoc). */
export const ADMIN_PROVIDERS = {
  title: "Quản lý Đối tác & Trường học",
  intro: "Quản lý các đơn vị liên kết cấp chứng chỉ và khóa học trên hệ thống.",
  refreshTitle: "Làm mới bảng",

  form: {
    createTitle: "Thêm đơn vị mới",
    editTitle: "Cập nhật dữ liệu đối tác",
    name: "Tên Đơn Vị",
    namePlaceholder: "Ví dụ: Google, Đại Học Quốc Gia...",
    kind: "Phân Loại",
    company: "Doanh nghiệp",
    university: "Trường học",
    logo: "Logo Thương Hiệu",
    previewAlt: "Preview",
    changeLogo: "Thay đổi ảnh thương hiệu",
    pickLogo: "Click để chọn file logo",
    formats: "Định dạng ảnh: PNG, JPG, SVG",
    busy: "Hệ thống đang xử lý...",
    update: "Cập nhật dữ liệu",
    create: "Tạo đối tác mới",
    cancelEdit: "Hủy chế độ chỉnh sửa",
  },

  table: {
    loading: "Đang lấy dữ liệu từ server...",
    empty: "Hệ thống trống! Chưa có đối tác nào được thiết lập.",
    columns: {
      logo: "Logo",
      name: "Tên đơn vị",
      slug: "Đường dẫn SEO (Slug)",
      kind: "Phân loại",
      actions: "Thao tác",
    },
    edit: "Sửa",
    delete: "Xóa",
  },

  messages: {
    loadFailed: "Không thể đồng bộ danh sách đối tác!",
    needName: "Vui lòng nhập tên đối tác!",
    updated: "Cập nhật thông tin đối tác thành công!",
    needLogo: "Vui lòng chọn hình ảnh logo thương hiệu cho đối tác mới!",
    created: "Thêm đơn vị đối tác và tải ảnh lên Cloudinary thành công!",
    saveFailed: "Xảy ra lỗi trong quá trình xử lý dữ liệu!",
    confirmDelete: "Bạn có chắc chắn muốn xóa đối tác này?",
    deleted: "Xóa đối tác thành công!",
    deleteFailed: "Không thể xóa đơn vị đối tác này!",
  },
} as const;
