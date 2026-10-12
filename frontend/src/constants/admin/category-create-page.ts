/** Chu cua trang /admin/category-create. */
export const ADMIN_CATEGORY_CREATE = {
  listHref: "/admin/categories",

  back: "Back to Categories",
  title: "Create Category",
  subtitle: "Add a new category to classify your academic courses",

  name: { label: "Category Name", placeholder: "e.g. Lập trình Web, Thiết kế Đồ họa..." },
  slug: { label: "Category Slug", placeholder: "e.g. lap-trinh-web, thiet-ke-do-hoa" },

  submit: { idle: "Publish Category", busy: "Creating..." },

  messages: {
    needName: "Please enter category name",
    needSlug: "Please enter category slug",
    success: "Category created successfully!",
    failure: "Create failed",
  },
} as const;
