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
 * normalizeContent() trong documentController truoc khi luu, va trang doc goi
 * cleanHtml() truoc khi hien. Doi trinh soan KHONG mo them mot loi vao nao.
 */

interface Props {
  giaTri: string;
  setValue: (html: string) => void;
  toiDa: number;
  placeholder?: string;
  /**
   * Tai mot anh len, tra ve URL. Co thi thanh cong cu hien nut "Chen anh" -
   * de viet bai huong dan kieu blog: buoc 1 + anh chup man hinh, buoc 2...
   */
  uploadImage?: (file: File) => Promise<string>;
}

/** Mot nut tren thanh cong cu. */
function Button({
  Icon,
  nhan: label,
  active,
  onClick,
  tat: off,
}: {
  Icon: LucideIcon;
  nhan: string;
  active?: boolean;
  onClick: () => void;
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
      onClick={onClick}
      disabled={off}
      aria-pressed={active}
      title={label}
      aria-label={label}
      className={`${styles.button} ${active ? styles.activeButton : ""}`}
    >
      <Icon size={16} />
    </button>
  );
}

function Toolbar({
  editor,
  uploadImage,
}: {
  editor: Editor;
  uploadImage?: (file: File) => Promise<string>;
}) {
  const imageInput = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const insertImage = async (file: File) => {
    if (!uploadImage) return;
    try {
      setUploadingImage(true);
      const url = await uploadImage(file);
      // alt = ten file bo duoi: co con hon khong - nguoi viet sua duoc sau.
      const alt = file.name.replace(/\.[^.]+$/, "");
      editor.chain().focus().setImage({ src: url, alt }).createParagraphNear().run();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Không tải được ảnh.");
    } finally {
      setUploadingImage(false);
    }
  };

  const setLink = () => {
    const old = editor.getAttributes("link").href as string | undefined;
    const draft = window.prompt(
      "Dán địa chỉ liên kết (để trống để bỏ liên kết):",
      old ?? "",
    );
    if (draft === null) return;
    if (draft.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    // Chi nhan http/https. Thieu buoc nay thi dan duoc "javascript:..." vao va
    // no thanh mot duong bam chay ma lenh tren trinh duyet nguoi doc.
    let address = draft.trim();
    if (!/^https?:\/\//i.test(address)) address = `https://${address}`;
    editor.chain().focus().extendMarkRange("link").setLink({ href: address }).run();
  };

  return (
    <div className={styles.thanh} role="toolbar" aria-label="Định dạng nội dung">
      <Button
        Icon={Bold}
        nhan="Chữ đậm"
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      />
      <Button
        Icon={Italic}
        nhan="Chữ nghiêng"
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      />
      <Button
        Icon={UnderlineIcon}
        nhan="Gạch chân"
        active={editor.isActive("underline")}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      />
      <Button
        Icon={Strikethrough}
        nhan="Gạch ngang"
        active={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      />

      <span className={styles.vach} aria-hidden="true" />

      {/* Bat dau tu H2 chu khong phai H1: H1 cua trang la ten tai lieu, mot
          trang chi nen co mot H1. */}
      <Button
        Icon={Heading2}
        nhan="Tiêu đề lớn"
        active={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      />
      <Button
        Icon={Heading3}
        nhan="Tiêu đề nhỏ"
        active={editor.isActive("heading", { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      />

      <span className={styles.vach} aria-hidden="true" />

      <Button
        Icon={List}
        nhan="Danh sách gạch đầu dòng"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      />
      <Button
        Icon={ListOrdered}
        nhan="Danh sách đánh số"
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      />
      <Button
        Icon={Quote}
        nhan="Trích dẫn"
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      />

      <span className={styles.vach} aria-hidden="true" />

      <Button
        Icon={Link2}
        nhan="Chèn liên kết"
        active={editor.isActive("link")}
        onClick={setLink}
      />
      <Button
        Icon={Eraser}
        nhan="Xóa định dạng"
        onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
      />

      {uploadImage && (
        <>
          <span className={styles.vach} aria-hidden="true" />
          <Button
            Icon={uploadingImage ? Loader2 : ImagePlus}
            nhan={uploadingImage ? "Đang tải ảnh…" : "Chèn ảnh (ảnh chụp màn hình…)"}
            tat={uploadingImage}
            onClick={() => imageInput.current?.click()}
          />
          <input
            ref={imageInput}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void insertImage(f);
              e.target.value = "";
            }}
          />
        </>
      )}
    </div>
  );
}

export default function RichTextEditor({
  giaTri: value,
  setValue,
  toiDa: max,
  placeholder,
  uploadImage,
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
    content: value,
    editorProps: {
      attributes: {
        class: styles.vung,
        ...(placeholder ? { "data-placeholder": placeholder } : {}),
      },
    },
    onUpdate: ({ editor }) => setValue(editor.getHTML()),
  });

  if (!editor) {
    // Chua dung xong thi giu dung cho de bo cuc khong nhay mot cai.
    return <div className={styles.khung} style={{ minHeight: 280 }} />;
  }

  // Dem THEO CHU, khong theo do dai HTML: nguoi dang khong nhin thay the nen
  // bao "con 120 ky tu" trong khi 3000 ky tu kia la <p> va <strong> thi ho
  // khong hieu vi sao. Gioi han that van la do dai HTML - may chu chan o do -
  // nen o duoi con mot dong bao rieng khi sap cham tran.
  const charCount = editor.getText().length;
  const htmlLength = editor.getHTML().length;
  const nearLimit = htmlLength > max * 0.9;

  return (
    <div className={styles.khung}>
      <Toolbar editor={editor} uploadImage={uploadImage} />
      <EditorContent editor={editor} />
      <div className={styles.chan}>
        <span>{charCount} ký tự</span>
        {nearLimit && (
          <span className={styles.warning}>
            Sắp chạm giới hạn ({htmlLength}/{max} gồm cả thẻ định dạng)
          </span>
        )}
      </div>
    </div>
  );
}
