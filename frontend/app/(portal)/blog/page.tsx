import {
  BlogHeading,
  BlogPager,
  BlogPostList,
  BlogShell,
  BlogTopicsAside,
  getPostList,
  buildBlogPath,
} from "@/src/components/features/portal/blog";
import { BLOG } from "@/src/constants/portal/blog-page";

export const metadata = BLOG.metadata;

export const revalidate = 30;

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const topic = sp.topic ?? "";
  const page = Math.max(1, Number(sp.page) || 1);

  const { data, topics } = await getPostList(topic, page);
  const activeTopic = topics.find((t) => t.slug === topic);

  return (
    <BlogShell
      heading={<BlogHeading {...BLOG.list} topicName={activeTopic?.name} />}
      aside={
        <BlogTopicsAside
          topics={topics}
          topic={topic}
          hrefForTopic={(slug) => buildBlogPath(topic, { topic: slug, page: 1 })}
        />
      }
    >
      <BlogPostList posts={data.posts} topic={topic} />

      {data.totalPages > 1 && (
        <BlogPager
          page={page}
          currentPage={data.page}
          totalPages={data.totalPages}
          hrefFor={(p) => buildBlogPath(topic, { page: p })}
        />
      )}
    </BlogShell>
  );
}
