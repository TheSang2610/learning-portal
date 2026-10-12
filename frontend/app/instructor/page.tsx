import { redirect } from "next/navigation";

// /instructor khong co noi dung rieng - trang dau tien cua giang vien la danh
// sach khoa hoc. Breadcrumb "Home" va logo deu tro ve day.
export default function InstructorHomePage() {
  redirect("/instructor/courses");
}
