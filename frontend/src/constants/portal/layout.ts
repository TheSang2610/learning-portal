/** Cau hinh khung chung cua khu hoc vien (app/(portal)/layout.tsx). */
export const PORTAL_LAYOUT = {
  /** Moi cot o Footer hien toi da bao nhieu muc. */
  footerItems: 5,
  api: {
    categories: "/api/categories",
    homeSections: "/api/courses/home-sections",
    providers: "/api/providers",
  },
  // Giay giu ban dem o may chu. Danh muc va don vi it doi; khoa pho bien doi
  // nhanh hon nen hoi lai som hon.
  revalidate: {
    categories: 300,
    homeSections: 120,
    providers: 300,
  },
} as const;
