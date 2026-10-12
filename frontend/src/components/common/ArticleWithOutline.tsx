"use client";

import { useEffect, useMemo, useState } from "react";
import { ListTree } from "lucide-react";
import { getOutline, parseContent } from "@/src/lib/article-outline";
import { laHtml, anchorizeHeadings } from "@/src/lib/post-html";

import styles from "./ArticleWithOutline.module.scss";
// Bo cuc hai o dung chung cho tai lieu chia se va bai viet blog:
// o trai la muc luc dinh theo man hinh, o giua la toan bo bai.

interface Props {
  content: string;
  /** Doi chu goi y khi bai chua chia muc - tai lieu va blog noi khac nhau */
  emptyHint?: string;
}

export default function ArticleWithOutline({ content, emptyHint }: Props) {
  // Hai kieu bai cung song: bai go van ban thuong (tach khoi bang bo doan luat
  // trong articleOutline) va bai soan bang HTML (may chu da loc sach truoc khi
  // luu). Quyet dinh mot lan o day, ben duoi chi ve.
  //
  // Gop vao MOT useMemo chu khong tach hai: muc luc va than bai phai sinh ra
  // cung mot luot thi id neo moi trung nhau.
  const lesson = useMemo(() => {
    if (laHtml(content)) {
      const { html, outline } = anchorizeHeadings(content);
      return { laHtml: true as const, html, outline, blocks: [] };
    }
    const blocks = parseContent(content);
    return { laHtml: false as const, html: "", outline: getOutline(blocks), blocks };
  }, [content]);

  const { blocks, outline } = lesson;

  const [viewing, setViewing] = useState<string>("");

  // To sang muc dang doc.
  //
  // Dung IntersectionObserver thay vi nghe su kien cuon: trinh duyet tu goi lai
  // khi phan tu vao/ra vung nhin, khong phai tinh lai vi tri moi khung hinh.
  //
  // rootMargin cat 45% duoi man hinh -> muc duoc coi la "dang doc" khi no len
  // gan dinh, giong cam giac nguoi doc, thay vi sang len ngay luc vua nho vao
  // day man hinh.
  useEffect(() => {
    if (!outline.length) return;

    const els = outline
      .map((m) => document.getElementById(m.id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!els.length) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const reveal = entries.filter((e) => e.isIntersecting);
        if (!reveal.length) return;
        const top = reveal.reduce((a, b) =>
          a.boundingClientRect.top < b.boundingClientRect.top ? a : b,
        );
        setViewing(top.target.id);
      },
      { rootMargin: "-120px 0px -45% 0px", threshold: 0 },
    );

    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [outline]);

  const jumpTo = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    // Tru chieu cao header dinh (40px topbar + 64px header) va chut khoang tho
    const y = el.getBoundingClientRect().top + window.scrollY - 120;
    window.scrollTo({ top: y, behavior: "smooth" });
    setViewing(id);
  };

  return (
    <div className={styles.grid}>
      {/* O TRAI - muc luc */}
      <aside className={styles.aside}>
        <nav aria-label="Mục lục" className={styles.nav}>
          <p className={styles.text}>
            <ListTree size={16} className={styles.box} />
            Nội dung bài
          </p>

          {outline.length === 0 ? (
            <p className={styles.text2}>
              {emptyHint ??
                "Bài này chưa chia mục. Thêm dòng dạng Chương 1: ... hoặc ## Tiêu đề để tạo mục lục."}
            </p>
          ) : (
            <ul className={styles.list}>
              {outline.map((m) => {
                const activeHeading = viewing === m.id;
                return (
                  <li key={m.id}>
                    <a
                      href={`#${m.id}`}
                      onClick={jumpTo(m.id)}
                      aria-current={activeHeading ? "location" : undefined}
                      className={[
                        styles.link,
                        m.level === 1 ? styles.link2 : styles.link3,
                        m.level === 2 ? styles.link4 : m.level === 3 ? styles.link5 : "",
                        activeHeading ? styles.link6 : styles.link7,
                      ].join(" ")}
                    >
                      {m.text}
                    </a>
                  </li>
                );
              })}
            </ul>
          )}
        </nav>
      </aside>

      {/* O GIUA - toan bo bai, trinh bay nhu trang van ban */}
      <article className={styles.article}>
        {/* max-w theo do dai DONG CHU (ch) chu khong theo pixel: khoang 78 ky tu
            moi dong la vung de doc nhat cho van ban dai. */}
        <div className={styles.container}>
          {lesson.laHtml ? (
            // Noi dung nay da qua bo loc danh sach trang o may chu
            // (backend/src/utils/postHtml.js) truoc khi vao co so du lieu:
            // khong con script, khung nhung, thuoc tinh su kien hay dia chi
            // javascript:. Cach trinh bay do lop .bai-html trong globals.css lo.
            <div
              className={styles.box2}
              dangerouslySetInnerHTML={{ __html: lesson.html }}
            />
          ) : blocks.length === 0 ? (
            <p className={styles.text3}>Bài này chưa có nội dung.</p>
          ) : (
            blocks.map((b, i) => {
              if (b.kind === "heading") {
                const common = styles.box5;
                if (b.level === 1) {
                  return (
                    <h2 key={i} id={b.id} className={`${common} ${styles.heading}`}>
                      {b.text}
                    </h2>
                  );
                }
                if (b.level === 2) {
                  return (
                    <h3 key={i} id={b.id} className={`${common} ${styles.subheading}`}>
                      {b.text}
                    </h3>
                  );
                }
                return (
                  <h4 key={i} id={b.id} className={`${common} ${styles.minorHeading}`}>
                    {b.text}
                  </h4>
                );
              }

              if (b.kind === "list") {
                const Tag = b.ordered ? "ol" : "ul";
                return (
                  <Tag
                    key={i}
                    className={[styles.stack, b.ordered ? styles.box3 : styles.box4].join(
                      " ",
                    )}
                  >
                    {b.items.map((it, j) => (
                      <li key={j}>{it}</li>
                    ))}
                  </Tag>
                );
              }

              return (
                <p key={i} className={styles.text4}>
                  {b.text}
                </p>
              );
            })
          )}
        </div>
      </article>
    </div>
  );
}
