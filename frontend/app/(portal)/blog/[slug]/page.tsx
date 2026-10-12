import { notFound } from "next/navigation";

import ArticleWithOutline from "@/src/components/common/ArticleWithOutline";
import {
  BlogDetailHeader,
  BlogDetailShell,
  getPost,
} from "@/src/components/features/portal/blog";
import { BLOG } from "@/src/constants/portal/blog-page";

export const revalidate = 30;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const lesson = await getPost(slug);
  if (!lesson) return { title: BLOG.notFoundTitle };
  return { title: lesson.title, description: lesson.excerpt };
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const lesson = await getPost(slug);
  if (!lesson) notFound();

  return (
    <BlogDetailShell>
      <BlogDetailHeader bai={lesson} />
      <ArticleWithOutline
        content={lesson.content ?? ""}
        emptyHint={BLOG.detail.noOutline}
      />
    </BlogDetailShell>
  );
}
