import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Bug,
  Code2,
  Cpu,
  PenLine,
  PenTool,
  Server,
  type LucideIcon,
} from "lucide-react";

import SafeImage from "@/src/components/ui/SafeImage";
import { BLOG } from "@/src/constants/portal/blog-page";
import { fillTemplate } from "@/src/lib/format";
import { readingMinutes, relativeTime } from "@/src/lib/post-time";
import type { BlogPost, Topic } from "@/src/services/post";
import type { HomeGuidesData } from "@/src/types/home";

import styles from "./HomeGuides.module.scss";

// Bieu tuong theo TU KHOA trong slug chu de - cung ly do voi HomeCategories:
// chu de do admin dat, khong dua vao mot truong icon nhap tay duoc.
const ICONS: [RegExp, LucideIcon][] = [
  [/front|mobile|web/i, Code2],
  [/back|devops|server/i, Server],
  [/ai|llm|machine/i, Cpu],
  [/test/i, Bug],
  [/ui|ux|design/i, PenTool],
];

function pickIcon(slug: string): LucideIcon {
  for (const [mau, Icon] of ICONS) if (mau.test(slug)) return Icon;
  return BookOpen;
}

interface Props extends HomeGuidesData {
  posts: BlogPost[];
  topics: Topic[];
  /**
   * Tong mau. Mac dinh la mau rieng cua khu (landing); "course" = xanh cua cac
   * muc khoa hoc, dung o dashboard noi muc nay dung giua cac muc khoa hoc.
   */
  tone?: "default" | "course";
}

/**
 * Muc "Cam nang mon hoc" o trang chu: chu ben trai, ben phai la loi vao khu
 * /blog - vai bai moi nhat (neu co) va cac chu de.
 *
 * Chua co bai nao thi van hien chu de: day la loi dan sang khu cam nang, khong
 * phai danh sach bai - an ca muc chi vi CSDL trong la mat luon loi vao.
 *
 * Component MAY CHU - du lieu lay san trong getHomeData.
 */
export default function HomeGuides({
  tone = "default",
  posts,
  topics,
  eyebrow,
  heading,
  text,
  points,
  cta,
  latestTitle,
  topicsTitle,
  topicCount,
  topicEmpty,
  topicHref,
  readMinutes,
}: Props) {
  return (
    <section
      className={`${styles.section} ${tone === "course" ? styles.toneCourse : ""}`}
      aria-labelledby="home-guides-heading"
    >
      <div className={styles.container}>
        <div className={styles.intro}>
          <span className={styles.eyebrow}>
            <PenLine size={14} aria-hidden />
            {eyebrow}
          </span>
          <h2 id="home-guides-heading" className={styles.heading}>
            {heading}
          </h2>
          <p className={styles.text}>{text}</p>

          <ul className={styles.points}>
            {points.map((p) => (
              <li key={p} className={styles.point}>
                <i className={styles.check} aria-hidden>
                  ✓
                </i>
                {p}
              </li>
            ))}
          </ul>

          <Link href={cta.href} className={`group ${styles.cta}`}>
            {cta.label}
            <ArrowRight size={18} className={styles.ctaArrow} />
          </Link>
        </div>

        <div className={styles.panel}>
          {posts.length > 0 && (
            <div className={styles.block}>
              <h3 className={styles.blockTitle}>{latestTitle}</h3>
              <ul className={styles.posts}>
                {posts.map((p) => (
                  <li key={p._id}>
                    <Link href={BLOG.postHref(p.slug)} className={styles.post}>
                      <span className={styles.thumb}>
                        {p.thumbnail ? (
                          <SafeImage
                            src={p.thumbnail}
                            alt=""
                            fill
                            sizes="88px"
                            className={styles.thumbImage}
                            hideOnError
                          />
                        ) : (
                          <PenLine size={22} aria-hidden />
                        )}
                      </span>
                      <span className={styles.postBody}>
                        <span className={styles.postTitle}>{p.title}</span>
                        <span className={styles.postMeta}>
                          {p.tags[0] && <span className={styles.tag}>{p.tags[0]}</span>}
                          <span>{relativeTime(p.createdAt)}</span>
                          <span aria-hidden>&middot;</span>
                          <span>
                            {fillTemplate(readMinutes, { n: readingMinutes(p.excerpt) })}
                          </span>
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {topics.length > 0 && (
            <div className={styles.block}>
              <h3 className={styles.blockTitle}>{topicsTitle}</h3>
              <div className={styles.topics}>
                {topics.map((t) => {
                  const Icon = pickIcon(t.slug);
                  return (
                    <Link
                      key={t.slug}
                      href={fillTemplate(topicHref, { slug: t.slug })}
                      className={`group ${styles.topic}`}
                    >
                      <span className={styles.topicIcon}>
                        <Icon size={18} strokeWidth={1.75} />
                      </span>
                      <span className={styles.topicText}>
                        <span className={styles.topicName}>{t.name}</span>
                        <span className={styles.topicCount}>
                          {t.count > 0
                            ? fillTemplate(topicCount, { n: t.count })
                            : topicEmpty}
                        </span>
                      </span>
                      <ArrowUpRight size={16} className={styles.topicArrow} />
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
