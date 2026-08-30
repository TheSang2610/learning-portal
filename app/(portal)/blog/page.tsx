import { BookMarked } from "lucide-react";
import ComingSoon from "@/src/components/common/ComingSoon";

export const metadata = {
  title: "Cẩm nang môn học",
};

export default function BlogPage() {
  return (
    <ComingSoon
      icon={BookMarked}
      title="Cẩm nang môn học"
      desc="Nơi tổng hợp bài viết hướng dẫn, kinh nghiệm học và lộ trình cho từng môn."
      planned={[
        "Danh sách bài viết theo môn học và theo chủ đề",
        "Trang đọc bài viết đầy đủ, có mục lục",
        "Tìm kiếm và lọc bài viết theo danh mục",
        "Quản lý bài viết trong khu vực quản trị",
      ]}
    />
  );
}
