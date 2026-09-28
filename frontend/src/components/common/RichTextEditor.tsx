"use client";

import { useRef, useState } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import {
  Bold,
  Eraser,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Loader2,
  Link2,
  List,
  ListOrdered,
  Quote,
  Strikethrough,
  Underline as UnderlineIcon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import styles from "./RichTextEditor.module.scss";

/**
 * O soan noi dung co dinh dang, dung TipTap (giay phep MIT, mien phi).
 *
 * KHAC voi PostEditor ben khu quan tri, va khac CO Y: PostEditor cho go thang
 * HTML tho vi viec thuong lam o do la DAN mot bai tu trang khac vao, can nhin
 * ro the nao con the nao mat. O day nguoi dang la HOC VIEN chia se tai lieu,
 * ho go tay va khong biet HTML - nen phai thay chu dam ngay khi bam dam.
 *
 * Ket qua van la HTML, di qua dung duong lam sach cu: may chu goi
 * chuanHoaNoiDung() trong documentController truoc khi luu, va trang doc goi
 * lamSachHtml() truoc khi hien. Doi trinh soan KHONG mo them mot loi vao nao.
 */

interface Props {
  giaTri: string;
  doiGiaTri: (html: string) => void;
  toiDa: number;
  placeholder?: string;
  /**
   * Tai mot anh len, tra ve URL. Co thi thanh cong cu hien nut "Chen anh" -
   * de viet bai huong dan kieu blog: buoc 1 + anh chup man hinh, buoc 2...
   */
  taiAnh?: (file: File) => Promise<string>;
}

/** Mot nut tren thanh cong cu. */
function Nut({
  Icon,
  nhan,
  dangBat,
  khiBam,
  tat,
}: {
  Icon: LucideIcon;
  nhan: string;
  dangBat?: boolean;
  khiBam: () => void;
  tat?: boolean;
}) {
  return (
    <button
      type="button"
      // type="button" BAT BUOC: o nay nam trong <form>, thieu no thi moi lan
      // bam dam la trinh duyet gui form va dang bai len khi chua soan xong.
      onMouseDown={(e) => e.preventDefault()}
      // Giu con tro dang o trong bai. Khong chan mousedown thi bam nut lam mat
      // vung boi den, va lenh dam/nghieng khong biet ap vao doan nao.
      onClick={khiBam}
      disabled={tat}
      aria-pressed={dangBat}
      title={nhan}
      aria-label={nhan}
      className={`${styles.nut} ${dangBat ? styles.nutBat : ""}`}
    >
      <Icon size={16} />
    </button>
  );
}

function ThanhCongCu({
  editor,
  taiAnh,
}: {
  editor: Editor;
  taiAnh?: (file: File) => Promise<string>;
}) {
  const oChonAnh = useRef<HTMLInputElement>(null);
  const [dangTaiAnh, setDangTaiAnh] = useState(false);

  const chenAnh = async (file: File) => {
    if (!taiAnh) return;
    try {
      setDangTaiAnh(true);
      const url = await taiAnh(file);
      // alt = ten file bo duoi: co con hon khong - nguoi viet sua duoc sau.
      const alt = file.name.replace(/\.[^.]+$/, "");
      editor.chain().focus().setImage({ src: url, alt }).createParagraphNear().run();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Không tải được ảnh.");
    } finally {
      setDangTaiAnh(false);
    }
  };

  const datLienKet = () => {
    const cu = editor.getAttributes("link").href as string | undefined;
    const nhap = window.prompt(
      "Dán địa chỉ liên kết (để trống để bỏ liên kết):",
      cu ?? "",
    );
    if (nhap === null) return;
    if (nhap.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    // Chi nhan http/https. Thieu buoc nay thi dan duoc "javascript:..." vao va
    // no thanh mot duong bam chay ma lenh tren trinh duyet nguoi doc.
    let dia = nhap.trim();
    if (!/^https?:\/\//i.test(dia)) dia = `https://${dia}`;
    editor.chain().focus().extendMarkRange("link").setLink({ href: dia }).run();
  };

  return (
    <div className={styles.thanh} role="toolbar" aria-label="Định dạng nội dung">
      <Nut
        Icon={Bold}
        nhan="Chữ đậm"
        dangBat={editor.isActive("bold")}
        khiBam={() => editor.chain().focus().toggleBold().run()}
      />
      <Nut
        Icon={Italic}
        nhan="Chữ nghiêng"
        dangBat={editor.isActive("italic")}
        khiBam={() => editor.chain().focus().toggleItalic().run()}
      />
      <Nut
        Icon={UnderlineIcon}
        nhan="Gạch chân"
        dangBat={editor.isActive("underline")}
        khiBam={() => editor.chain().focus().toggleUnderline().run()}
      />
      <Nut
        Icon={Strikethrough}
        nhan="Gạch ngang"
        dangBat={editor.isActive("strike")}
        khiBam={() => editor.chain().focus().toggleStrike().run()}
      />

      <span className={styles.vach} aria-hidden="true" />

      {/* Bat dau tu H2 chu khong phai H1: H1 cua trang la ten tai lieu, mot
          trang chi nen co mot H1. */}
      <Nut
        Icon={Heading2}
        nhan="Tiêu đề lớn"
        dangBat={editor.isActive("heading", { level: 2 })}
        khiBam={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      />
      <Nut
        Icon={Heading3}
        nhan="Tiêu đề nhỏ"
        dangBat={editor.isActive("heading", { level: 3 })}
        khiBam={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      />

      <span className={styles.vach} aria-hidden="true" />

      <Nut
        Icon={List}
        nhan="Danh sách gạch đầu dòng"
        dangBat={editor.isActive("bulletList")}
        khiBam={() => editor.chain().focus().toggleBulletList().run()}
      />
      <Nut
        Icon={ListOrdered}
        nhan="Danh sách đánh số"
        dangBat={editor.isActive("orderedList")}
        khiBam={() => editor.chain().focus().toggleOrderedList().run()}
      />
      <Nut
        Icon={Quote}
        nhan="Trích dẫn"
        dangBat={editor.isActive("blockquote")}
        khiBam={() => editor.chain().focus().toggleBlockquote().run()}
      />

      <span className={styles.vach} aria-hidden="true" />

      <Nut
        Icon={Link2}
        nhan="Chèn liên kết"
        dangBat={editor.isActive("link")}
        khiBam={datLienKet}
      />
      <Nut
        Icon={Eraser}
        nhan="Xóa định dạng"
        khiBam={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
      />

      {taiAnh && (
        <>
          <span className={styles.vach} aria-hidden="true" />
          <Nut
            Icon={dangTaiAnh ? Loader2 : ImagePlus}
            nhan={dangTaiAnh ? "Đang tải ảnh…" : "Chèn ảnh (ảnh chụp màn hình…)"}
            tat={dangTaiAnh}
            khiBam={() => oChonAnh.current?.click()}
          />
          <input
            ref={oChonAnh}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void chenAnh(f);
              e.target.value = "";
            }}
          />
        </>
      )}
    </div>
  );
}

export default function RichTextEditor({
  giaTri,
  doiGiaTri,
  toiDa,
  placeholder,
  taiAnh,
}: Props) {
  const editor = useEditor({
    // Tat kha nang dung ngay o may chu: TipTap dung do dac cua DOM that de dung
    // ban soan, ma may chu khong co DOM. Bat len se lech giua ban may chu dung
    // va ban trinh duyet dung.
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        // Chi cho H2 va H3 - xem ghi chu o thanh cong cu.
        heading: { levels: [2, 3] },
        link: false, // dung ban cau hinh rieng ben duoi
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: false,
        // Chot danh sach giao thuc: thieu no thi dan duoc javascript: vao.
        protocols: ["http", "https"],
      }),
      // Anh la khoi rieng (khong nam trong dong chu). Chan data: - anh dan
      // thang tu clipboard se thanh chuoi base64 khong lo trong bai; may chu
      // cung chi giu anh tai qua he thong (utils/documentImages.js).
      Image.configure({ inline: false, allowBase64: false }),
    ],
    content: giaTri,
    editorProps: {
      attributes: {
        class: styles.vung,
        ...(placeholder ? { "data-placeholder": placeholder } : {}),
      },
    },
    onUpdate: ({ editor }) => doiGiaTri(editor.getHTML()),
  });

  if (!editor) {
    // Chua dung xong thi giu dung cho de bo cuc khong nhay mot cai.
    return <div className={styles.khung} style={{ minHeight: 280 }} />;
  }

  // Dem THEO CHU, khong theo do dai HTML: nguoi dang khong nhin thay the nen
  // bao "con 120 ky tu" trong khi 3000 ky tu kia la <p> va <strong> thi ho
  // khong hieu vi sao. Gioi han that van la do dai HTML - may chu chan o do -
  // nen o duoi con mot dong bao rieng khi sap cham tran.
  const soChu = editor.getText().length;
  const doDaiHtml = editor.getHTML().length;
  const sapTran = doDaiHtml > toiDa * 0.9;

  return (
    <div className={styles.khung}>
      <ThanhCongCu editor={editor} taiAnh={taiAnh} />
      <EditorContent editor={editor} />
      <div className={styles.chan}>
        <span>{soChu} ký tự</span>
        {sapTran && (
          <span className={styles.canhBao}>
            Sắp chạm giới hạn ({doDaiHtml}/{toiDa} gồm cả thẻ định dạng)
          </span>
        )}
      </div>
    </div>
  );
}
