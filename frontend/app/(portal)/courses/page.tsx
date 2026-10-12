import { CourseSearchPage } from "@/src/components/features/portal/courses";
import { COURSES_PAGE } from "@/src/constants/portal/courses-page";

export const metadata = COURSES_PAGE.metadata;

// Danh sach khoa hoc doi khi admin dang bai moi, khong dung trang tinh vinh vien.
export const revalidate = 60;

export default function SearchResultPage() {
  return <CourseSearchPage />;
}
