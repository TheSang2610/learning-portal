/** Trang /courses (tim khoa hoc). */
export const COURSES_PAGE = {
  metadata: {
    title: "Khóa học",
    description: "Tìm khóa học theo từ khóa hoặc theo danh mục.",
  },
  coursesApi: "/api/courses",
  categoriesApi: "/api/categories",
} as const;
