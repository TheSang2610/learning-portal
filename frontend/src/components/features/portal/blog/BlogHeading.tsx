import SectionTitle from "@/src/components/common/SectionHeading";
import { BLOG } from "@/src/constants/portal/blog-page";

interface BlogHeadingProps {
  title: string;
  description: string;
  allPosts: string;
  /** Ten chu de dang loc; khong co = dang xem tat ca. */
  topicName?: string;
}

/** Tieu de trang /blog - doi theo chu de dang loc. */
export default function BlogHeading({
  title,
  description,
  allPosts,
  topicName,
}: BlogHeadingProps) {
  return (
    <SectionTitle
      nhu="h1"
      tieuDe={topicName ?? title}
      moTa={description}
      // Dang loc theo mot chu de thi mo mot duong ra. Truoc day loi ra duy
      // nhat la cai the chu de o cot phai - ma tren man hinh hep cot do bi
      // day xuong tan duoi danh sach bai.
      viewAll={topicName ? BLOG.listHref : undefined}
      viewAllLabel={allPosts}
    />
  );
}
