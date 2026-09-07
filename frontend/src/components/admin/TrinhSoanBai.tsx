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
import { phanTichNoiDung } from "@/src/components/common/articleOutline";
import { laHtml, lamSachHtml } from "@/src/components/common/htmlBaiViet";

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
  doiGiaTri: (v: string) => void;
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
function dungBanXem(noiDung: string): string {
  if (laHtml(noiDung)) return lamSachHtml(noiDung);

  return phanTichNoiDung(noiDung)
    .map((b) => {
      if (b.kind === "heading") {
        const the = b.level === 1 ? "h2" : b.level === 2 ? "h3" : "h4";
        return `<${the}>${thoat(b.text)}</${the}>`;
      }
      if (b.kind === "list") {
        const the = b.ordered ? "ol" : "ul";
        return `<${the}>${b.items.map((i) => `<li>${thoat(i)}</li>`).join("")}</${the}>`;
      }
      return `<p>${thoat(b.text)}</p>`;
    })
    .join("");
}

export default function TrinhSoanBai({ giaTri, doiGiaTri, toiDa, id }: Props) {
  const oGo = useRef<HTMLTextAreaElement>(null);
  const [dangXemTruoc, setDangXemTruoc] = useState(false);

  const banXem = useMemo(
    () => (dangXemTruoc ? dungBanXem(giaTri) : ""),
    [dangXemTruoc, giaTri],
  );

  /**
   * Chen cap the vao dung cho con tro.
   *
   * Boi den chu roi bam thi chu do nam giua hai the. Khong boi gi thi chen chu
   * mau de thay ngay phai go vao dau, va no duoc boi den san.
   */
  const chen = (truoc: string, sau: string, mau = "") => {
    const el = oGo.current;
    if (!el) return;

    const dau = el.selectionStart;
    const cuoi = el.selectionEnd;
    const chon = giaTri.slice(dau, cuoi) || mau;

    // The khoi phai dung dong rieng, neu khong ca bai thanh mot day the noi
    // duoi nhau, mo ra sua khong doc noi.
    const laKhoi = /^<(h[1-4]|p|ul|ol|blockquote|figure|hr)/.test(truoc);
    const truocDo = giaTri.slice(0, dau);
    const dem =
      laKhoi && truocDo && !truocDo.endsWith("\n\n")
        ? truocDo.endsWith("\n")
          ? "\n"
          : "\n\n"
        : "";

    doiGiaTri(
      truocDo + dem + truoc + chon + sau + (laKhoi ? "\n" : "") + giaTri.slice(cuoi),
    );

    // Tra con tro ve dung phan chu giua hai the. Phai doi sang khung ve ke
    // tiep: luc goi ham nay React chua kip ve gia tri moi vao textarea.
    const tuDay = truocDo.length + dem.length + truoc.length;
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(tuDay, tuDay + chon.length);
    });
  };

  const don = () => {
    const sach = lamSachHtml(giaTri);
    if (sach !== giaTri) doiGiaTri(sach);
  };

  const nut =
    "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-white hover:text-blue-700 hover:shadow-sm";

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      {/* THANH NUT */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-slate-200 bg-slate-100 px-2 py-1.5">
        <button
          type="button"
          onClick={() => chen("<h2>", "</h2>", "Tiêu đề chương")}
          className={nut}
          title="Tiêu đề lớn — vào mục lục cấp 1"
        >
          <Heading2 size={15} />
          Tiêu đề lớn
        </button>
        <button
          type="button"
          onClick={() => chen("<h3>", "</h3>", "Tiêu đề mục")}
          className={nut}
          title="Tiêu đề nhỏ — vào mục lục cấp 2"
        >
          <Heading3 size={15} />
          Tiêu đề nhỏ
        </button>
        <button
          type="button"
          onClick={() => chen("<p>", "</p>", "Nội dung đoạn văn")}
          className={nut}
          title="Một đoạn văn"
        >
          <Pilcrow size={15} />
          Đoạn
        </button>

        <span className="mx-1 h-5 w-px bg-slate-300" />

        <button
          type="button"
          onClick={() => chen("<strong>", "</strong>", "in đậm")}
          className={nut}
          title="In đậm"
        >
          <Bold size={15} />
        </button>
        <button
          type="button"
          onClick={() => chen("<em>", "</em>", "in nghiêng")}
          className={nut}
          title="In nghiêng"
        >
          <Italic size={15} />
        </button>
        <button
          type="button"
          onClick={() => chen("<u>", "</u>", "gạch chân")}
          className={nut}
          title="Gạch chân"
        >
          <Underline size={15} />
        </button>
        <button
          type="button"
          onClick={() => chen("<s>", "</s>", "gạch ngang")}
          className={nut}
          title="Gạch ngang"
        >
          <Strikethrough size={15} />
        </button>

        <span className="mx-1 h-5 w-px bg-slate-300" />

        <button
          type="button"
          onClick={() => chen("<ul>\n  <li>", "</li>\n</ul>", "Ý thứ nhất")}
          className={nut}
          title="Danh sách gạch đầu dòng"
        >
          <List size={15} />
        </button>
        <button
          type="button"
          onClick={() => chen("<ol>\n  <li>", "</li>\n</ol>", "Bước một")}
          className={nut}
          title="Danh sách đánh số"
        >
          <ListOrdered size={15} />
        </button>
        <button
          type="button"
          onClick={() => chen("<blockquote>", "</blockquote>", "Câu trích dẫn")}
          className={nut}
          title="Trích dẫn"
        >
          <Quote size={15} />
        </button>
        <button
          type="button"
          onClick={() => chen('<a href="https://">', "</a>", "chữ hiện ra")}
          className={nut}
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
          className={nut}
          title="Chèn ảnh kèm chú thích"
        >
          <ImageIcon size={15} />
          Ảnh
        </button>
        <button
          type="button"
          onClick={() => chen("<hr>", "")}
          className={nut}
          title="Đường kẻ ngang"
        >
          <Minus size={15} />
        </button>

        <span className="mx-1 h-5 w-px bg-slate-300" />

        <button
          type="button"
          onClick={don}
          className={nut}
          title="Bỏ script, khung quảng cáo, class và style của trang nguồn"
        >
          <Eraser size={15} />
          Dọn HTML dán từ web
        </button>

        <button
          type="button"
          onClick={() => setDangXemTruoc((v) => !v)}
          className={[
            "ml-auto inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition",
            dangXemTruoc
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-600 hover:bg-white hover:text-blue-700",
          ].join(" ")}
        >
          {dangXemTruoc ? <PenLine size={15} /> : <Eye size={15} />}
          {dangXemTruoc ? "Về ô soạn" : "Xem trước"}
        </button>
      </div>

      {/* O SOAN / BAN XEM TRUOC */}
      {dangXemTruoc ? (
        <div className="max-h-[560px] overflow-y-auto bg-white px-6 py-6">
          {banXem ? (
            // Chuoi nay do lamSachHtml o tren dung ra chu khong phai chuoi
            // nguoi dung go thang vao the.
            <div
              className="bai-html mx-auto max-w-[78ch]"
              dangerouslySetInnerHTML={{ __html: banXem }}
            />
          ) : (
            <p className="text-sm text-slate-400 italic">Chưa có gì để xem.</p>
          )}
        </div>
      ) : (
        <textarea
          id={id}
          ref={oGo}
          value={giaTri}
          onChange={(e) => doiGiaTri(e.target.value)}
          maxLength={toiDa}
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
          className="w-full resize-y bg-slate-50 px-4 py-3 font-mono text-[13px] leading-relaxed text-slate-800 transition-all focus:bg-white focus:outline-none"
        />
      )}
    </div>
  );
}
