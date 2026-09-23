"use client";

import { useEffect, useMemo, useState } from "react";
import { ListTree } from "lucide-react";
import { layMucLuc, phanTichNoiDung } from "./articleOutline";
import { laHtml, neoHoaTieuDe } from "./postHtml";

import styles from "./ArticleWithOutline.module.scss";
// Bo cuc hai o dung chung cho tai lieu chia se va bai viet blog:
// o trai la muc luc dinh theo man hinh, o giua la toan bo bai.

interface Props {
  content: string;
  /** Doi chu goi y khi bai chua chia muc - tai lieu va blog noi khac nhau */
  goiYKhiTrong?: string;
}

export default function ArticleWithOutline({ content, goiYKhiTrong }: Props) {
  // Hai kieu bai cung song: bai go van ban thuong (tach khoi bang bo doan luat
  // trong articleOutline) va bai soan bang HTML (may chu da loc sach truoc khi
  // luu). Quyet dinh mot lan o day, ben duoi chi ve.
  //
  // Gop vao MOT useMemo chu khong tach hai: muc luc va than bai phai sinh ra
  // cung mot luot thi id neo moi trung nhau.
  const bai = useMemo(() => {
    if (laHtml(content)) {
      const { html, mucLuc } = neoHoaTieuDe(content);
      return { laHtml: true as const, html, mucLuc, blocks: [] };
    }
    const blocks = phanTichNoiDung(content);
    return { laHtml: false as const, html: "", mucLuc: layMucLuc(blocks), blocks };
  }, [content]);

  const { blocks, mucLuc } = bai;

  const [dangXem, setDangXem] = useState<string>("");

  // To sang muc dang doc.
  //
  // Dung IntersectionObserver thay vi nghe su kien cuon: trinh duyet tu goi lai
  // khi phan tu vao/ra vung nhin, khong phai tinh lai vi tri moi khung hinh.
  //
  // rootMargin cat 45% duoi man hinh -> muc duoc coi la "dang doc" khi no len
  // gan dinh, giong cam giac nguoi doc, thay vi sang len ngay luc vua nho vao
  // day man hinh.
  useEffect(() => {
    if (!mucLuc.length) return;

    const els = mucLuc
      .map((m) => document.getElementById(m.id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!els.length) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const hienRa = entries.filter((e) => e.isIntersecting);
        if (!hienRa.length) return;
        const tren = hienRa.reduce((a, b) =>
          a.boundingClientRect.top < b.boundingClientRect.top ? a : b,
        );
        setDangXem(tren.target.id);
      },
      { rootMargin: "-120px 0px -45% 0px", threshold: 0 },
    );

    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [mucLuc]);

  const nhayToi = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    // Tru chieu cao header dinh (40px topbar + 64px header) va chut khoang tho
    const y = el.getBoundingClientRect().top + window.scrollY - 120;
    window.scrollTo({ top: y, behavior: "smooth" });
    setDangXem(id);
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

          {mucLuc.length === 0 ? (
            <p className={styles.text2}>
              {goiYKhiTrong ??
                "Bài này chưa chia mục. Thêm dòng dạng Chương 1: ... hoặc ## Tiêu đề để tạo mục lục."}
            </p>
          ) : (
            <ul className={styles.list}>
              {mucLuc.map((m) => {
                const dangDoc = dangXem === m.id;
                return (
                  <li key={m.id}>
                    <a
                      href={`#${m.id}`}
                      onClick={nhayToi(m.id)}
                      aria-current={dangDoc ? "location" : undefined}
                      className={[
                        styles.link,
                        m.level === 1 ? styles.link2 : styles.link3,
                        m.level === 2 ? styles.link4 : m.level === 3 ? styles.link5 : "",
                        dangDoc ? styles.link6 : styles.link7,
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
          {bai.laHtml ? (
            // Noi dung nay da qua bo loc danh sach trang o may chu
            // (backend/src/utils/postHtml.js) truoc khi vao co so du lieu:
            // khong con script, khung nhung, thuoc tinh su kien hay dia chi
            // javascript:. Cach trinh bay do lop .bai-html trong globals.css lo.
            <div className={styles.box2} dangerouslySetInnerHTML={{ __html: bai.html }} />
          ) : blocks.length === 0 ? (
            <p className={styles.text3}>Bài này chưa có nội dung.</p>
          ) : (
            blocks.map((b, i) => {
              if (b.kind === "heading") {
                const chung = styles.box5;
                if (b.level === 1) {
                  return (
                    <h2 key={i} id={b.id} className={`${chung} ${styles.heading}`}>
                      {b.text}
                    </h2>
                  );
                }
                if (b.level === 2) {
                  return (
                    <h3 key={i} id={b.id} className={`${chung} ${styles.subheading}`}>
                      {b.text}
                    </h3>
                  );
                }
                return (
                  <h4 key={i} id={b.id} className={`${chung} ${styles.minorHeading}`}>
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
