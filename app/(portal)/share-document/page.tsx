import { FileUp } from "lucide-react";
import ComingSoon from "@/src/components/common/ComingSoon";

export const metadata = {
  title: "Chia sẻ tài liệu",
};

export default function ShareDocumentPage() {
  return (
    <ComingSoon
      icon={FileUp}
      title="Chia sẻ tài liệu"
      desc="Nơi học viên tải lên và tìm tài liệu học tập: đề cương, đề thi, bài giải, slide bài giảng."
      planned={[
        "Tải tài liệu lên kèm mô tả và gắn với môn học",
        "Duyệt và tải tài liệu do người khác chia sẻ",
        "Đánh giá, báo cáo tài liệu sai hoặc trùng lặp",
        "Kiểm duyệt tài liệu trước khi hiển thị công khai",
      ]}
    />
  );
}
