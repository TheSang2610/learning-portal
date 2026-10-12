"use client";

import { useMemo, useRef, useState } from "react";
import {
  Bold,
  Eraser,
  Eye,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  PenLine,
  Pilcrow,
  Quote,
  Strikethrough,
  Underline,
} from "lucide-react";
import { parseContent } from "@/src/lib/article-outline";
import { laHtml, cleanHtml } from "@/src/lib/post-html";

import styles from "./PostEditor.module.scss";
// Trinh soan bai viet cho khu quan tri.
//
// CO Y giu o go la mot textarea HTML tho thay vi trinh soan WYSIWYG:
//
//   1. Viec thuong lam nhat o day la DAN mot bai tu trang khac vao. Dan vao o
//      HTML thi thay ngay cai gi con, cai gi bi bo. Dan vao WYSIWYG thi khong
//      biet duoi lop trinh bay con sot lai bao nhieu the rac.
//   2. Bai duoc luu duoi dang HTML that. Nguoi soan doc va sua duoc chinh cai
//      se luu la mot loi the, khong phai mot han che.
//
// Thanh nut ben duoi chi lam viec chen the vao dung cho con tro, de nguoi viet
// khong phai nho cu phap.

interface Props {
  giaTri: string;
  setValue: (v: string) => void;
  toiDa: number;
  id?: string;
}

/** Doi ky tu dac biet thanh thuc the, dung khi dung HTML tu van ban tho. */
function thoat(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Dung HTML de xem truoc.
 *
 * Bai go van ban thuong cung phai xem truoc duoc, nen doi luon qua HTML bang
 * chinh bo luat tach khoi cua trang doc - nho vay o xem truoc chi co MOT duong
 * ve, khong phai viet hai cach trinh bay roi de chung lech nhau.
 */
function buildPreview(content: string): string {
  if (laHtml(content)) return cleanHtml(content);

  return parseContent(content)
    .map((b) => {
      if (b.kind === "heading") {
        const card = b.level === 1 ? "h2" : b.level === 2 ? "h3" : "h4";
        return `<${card}>${thoat(b.text)}</${card}>`;
      }
      if (b.kind === "list") {
        const card = b.ordered ? "ol" : "ul";
        return `<${card}>${b.items.map((i) => `<li>${thoat(i)}</li>`).join("")}</${card}>`;
      }
      return `<p>${thoat(b.text)}</p>`;
    })
    .join("");
}

export default function PostEditor({ giaTri: value, setValue, toiDa: max, id }: Props) {
  const typingBox = useRef<HTMLTextAreaElement>(null);
  const [previewing, setPreviewing] = useState(false);

  const previewCopy = useMemo(
    () => (previewing ? buildPreview(value) : ""),
    [previewing, value],
  );

  /**
   * Chen cap the vao dung cho con tro.
   *
   * Boi den chu roi bam thi chu do nam giua hai the. Khong boi gi thi chen chu
   * mau de thay ngay phai go vao dau, va no duoc boi den san.
   */
  const chen = (before: string, after: string, mau = "") => {
    const el = typingBox.current;
    if (!el) return;

    const head = el.selectionStart;
    const end = el.selectionEnd;
    const choice = value.slice(head, end) || mau;

    // The khoi phai dung dong rieng, neu khong ca bai thanh mot day the noi
    // duoi nhau, mo ra sua khong doc noi.
    const isBlock = /^<(h[1-4]|p|ul|ol|blockquote|figure|hr)/.test(before);
    const previous = value.slice(0, head);
    const tally =
      isBlock && previous && !previous.endsWith("\n\n")
        ? previous.endsWith("\n")
          ? "\n"
          : "\n\n"
        : "";

    setValue(
      previous +
        tally +
        before +
        choice +
        after +
        (isBlock ? "\n" : "") +
        value.slice(end),
    );

    // Tra con tro ve dung phan chu giua hai the. Phai doi sang khung ve ke
    // tiep: luc goi ham nay React chua kip ve gia tri moi vao textarea.
    const fullWidth = previous.length + tally.length + before.length;
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(fullWidth, fullWidth + choice.length);
    });
  };

  const order = () => {
    const clean = cleanHtml(value);
    if (clean !== value) setValue(clean);
  };

  const toolButton = styles.button4;

  return (
    <div className={styles.box}>
      {/* THANH NUT */}
      <div className={styles.row}>
        <button
          type="button"
          onClick={() => chen("<h2>", "</h2>", "Tiêu đề chương")}
          className={toolButton}
          title="Tiêu đề lớn — vào mục lục cấp 1"
        >
          <Heading2 size={15} />
          Tiêu đề lớn
        </button>
        <button
          type="button"
          onClick={() => chen("<h3>", "</h3>", "Tiêu đề mục")}
          className={toolButton}
          title="Tiêu đề nhỏ — vào mục lục cấp 2"
        >
          <Heading3 size={15} />
          Tiêu đề nhỏ
        </button>
        <button
          type="button"
          onClick={() => chen("<p>", "</p>", "Nội dung đoạn văn")}
          className={toolButton}
          title="Một đoạn văn"
        >
          <Pilcrow size={15} />
          Đoạn
        </button>

        <span className={styles.label} />

        <button
          type="button"
          onClick={() => chen("<strong>", "</strong>", "in đậm")}
          className={toolButton}
          title="In đậm"
        >
          <Bold size={15} />
        </button>
        <button
          type="button"
          onClick={() => chen("<em>", "</em>", "in nghiêng")}
          className={toolButton}
          title="In nghiêng"
        >
          <Italic size={15} />
        </button>
        <button
          type="button"
          onClick={() => chen("<u>", "</u>", "gạch chân")}
          className={toolButton}
          title="Gạch chân"
        >
          <Underline size={15} />
        </button>
        <button
          type="button"
          onClick={() => chen("<s>", "</s>", "gạch ngang")}
          className={toolButton}
          title="Gạch ngang"
        >
          <Strikethrough size={15} />
        </button>

        <span className={styles.label} />

        <button
          type="button"
          onClick={() => chen("<ul>\n  <li>", "</li>\n</ul>", "Ý thứ nhất")}
          className={toolButton}
          title="Danh sách gạch đầu dòng"
        >
          <List size={15} />
        </button>
        <button
          type="button"
          onClick={() => chen("<ol>\n  <li>", "</li>\n</ol>", "Bước một")}
          className={toolButton}
          title="Danh sách đánh số"
        >
          <ListOrdered size={15} />
        </button>
        <button
          type="button"
          onClick={() => chen("<blockquote>", "</blockquote>", "Câu trích dẫn")}
          className={toolButton}
          title="Trích dẫn"
        >
          <Quote size={15} />
        </button>
        <button
          type="button"
          onClick={() => chen('<a href="https://">', "</a>", "chữ hiện ra")}
          className={toolButton}
          title="Chèn liên kết"
        >
          <Link2 size={15} />
        </button>
        <button
          type="button"
          onClick={() =>
            chen(
              '<figure>\n  <img src="https://" alt="">\n  <figcaption>',
              "</figcaption>\n</figure>",
              "Chú thích ảnh",
            )
          }
          className={toolButton}
          title="Chèn ảnh kèm chú thích"
        >
          <ImageIcon size={15} />
          Ảnh
        </button>
        <button
          type="button"
          onClick={() => chen("<hr>", "")}
          className={toolButton}
          title="Đường kẻ ngang"
        >
          <Minus size={15} />
        </button>

        <span className={styles.label} />

        <button
          type="button"
          onClick={order}
          className={toolButton}
          title="Bỏ script, khung quảng cáo, class và style của trang nguồn"
        >
          <Eraser size={15} />
          Dọn HTML dán từ web
        </button>

        <button
          type="button"
          onClick={() => setPreviewing((v) => !v)}
          className={[styles.button, previewing ? styles.button2 : styles.button3].join(
            " ",
          )}
        >
          {previewing ? <PenLine size={15} /> : <Eye size={15} />}
          {previewing ? "Về ô soạn" : "Xem trước"}
        </button>
      </div>

      {/* O SOAN / BAN XEM TRUOC */}
      {previewing ? (
        <div className={styles.scroller}>
          {previewCopy ? (
            // Chuoi nay do cleanHtml o tren dung ra chu khong phai chuoi
            // nguoi dung go thang vao the.
            <div
              className={styles.container}
              dangerouslySetInnerHTML={{ __html: previewCopy }}
            />
          ) : (
            <p className={styles.text}>Chưa có gì để xem.</p>
          )}
        </div>
      ) : (
        <textarea
          id={id}
          ref={typingBox}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          maxLength={max}
          rows={22}
          spellCheck={false}
          placeholder={
            "Gõ chữ thường cũng được, mà dán HTML vào cũng được.\n\n" +
            "<h2>Tên chương</h2>\n" +
            "<p>Đoạn nội dung của chương...</p>\n\n" +
            "<h3>Tên mục nhỏ</h3>\n" +
            "<ul>\n  <li>Ý thứ nhất</li>\n  <li>Ý thứ hai</li>\n</ul>\n\n" +
            "<figure>\n" +
            '  <img src="https://..." alt="">\n' +
            "  <figcaption>Chú thích ảnh</figcaption>\n" +
            "</figure>"
          }
          className={styles.box2}
        />
      )}
    </div>
  );
}
