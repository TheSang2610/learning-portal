"use client";

import { useEffect, useImperativeHandle, useRef, useState, type Ref } from "react";
import { FileText, Loader2, Upload, X } from "lucide-react";

import RichTextEditor from "@/src/components/common/RichTextEditor";
import { getErrorMessage } from "@/src/services/apiHelper";
import {
  documentService,
  type DocumentSubject,
  type DocumentUniversity,
} from "@/src/services/document";
import SubjectPicker from "./SubjectPicker";
import {
  ALLOWED_EXTENSIONS,
  CONTENT_LIMIT,
  MAX_MB,
  MAX_FILES,
  setPageSize,
} from "@/src/lib/document/file-info";

import styles from "./ShareDocumentClient.module.scss";

/** Cho trang cha day file vao form - vd. file tha o dai dau trang. */
export interface DocumentUploadFormHandle {
  themFile: (files: File[]) => void;
  /** Cuon toi form. */
  scrollTo: () => void;
}

const fileExtensionOf = (name: string) => name.split(".").pop()?.toLowerCase() ?? "";

/**
 * Form dang tai lieu: tieu de, 1-5 mon, noi dung (TipTap), 1-5 file.
 *
 * Dung chung o trang chu khu tai lieu (/share-document - mo khi tha file vao
 * dai dau trang) va trang tat ca tai lieu (/share-document/browse - nut "Dang
 * tai lieu"). Chi hien cho nguoi DA dang nhap - trang cha tu kiem.
 */
export default function DocumentUploadForm({
  subjectList,
  onClose,
  onPosted,
  defaultSchool = "",
  ref,
}: {
  subjectList: DocumentSubject[];
  onClose: () => void;
  /** Dang xong - trang cha tai lai danh sach / so dem neu can. */
  onPosted?: () => void;
  /** KHOA truong chon san - vd. dang tu trang cua mot truong. */
  defaultSchool?: string;
  ref?: Ref<DocumentUploadFormHandle>;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [title, setTitle] = useState("");
  // KHOA cac mon da chon (1-5).
  const [subject, setSubject] = useState<string[]>([]);
  const [content, setContent] = useState("");
  // 1-5 file, dung thu tu se hien (chuong 1, 2, 3...).
  const [dsFile, setDsFile] = useState<File[]>([]);
  // Truong dai hoc - khong bat buoc. KHOA truong, "" = khong chon.
  const [schoolList, setSchoolList] = useState<DocumentUniversity[]>([]);
  const [school, setSchool] = useState(defaultSchool);

  useEffect(() => {
    let cancel = false;
    documentService
      .getUniversities()
      .then((items) => {
        if (!cancel) setSchoolList(items);
      })
      // Khong tai duoc danh sach truong thi o chon an di - truong khong bat buoc.
      .catch(() => {});
    return () => {
      cancel = true;
    };
  }, []);
  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");

  /**
   * Them file vao danh sach (khong thay the). File sai dinh dang / qua nang
   * bi bo va noi ro ten; qua 5 file thi chi lay cho du 5 va bao so bi bo.
   */
  const themFile = (recent: File[]) => {
    setFormError("");
    setSuccess("");
    const errorMessage: string[] = [];
    const isValid = recent.filter((f) => {
      if (!ALLOWED_EXTENSIONS.includes(fileExtensionOf(f.name))) {
        errorMessage.push(`"${f.name}" không phải PDF, DOC hoặc DOCX`);
        return false;
      }
      if (f.size > MAX_MB * 1024 * 1024) {
        errorMessage.push(`"${f.name}" nặng ${setPageSize(f.size)} (tối đa ${MAX_MB}MB)`);
        return false;
      }
      return true;
    });

    setDsFile((old) => {
      // Bo file trung (cung ten + cung dung luong) - chon lai lan hai la chuyen hay gap.
      const missing = isValid.filter(
        (f) => !old.some((c) => c.name === f.name && c.size === f.size),
      );
      const stillWaiting = MAX_FILES - old.length;
      if (missing.length > stillWaiting) {
        errorMessage.push(
          `chỉ đính kèm tối đa ${MAX_FILES} file, đã bỏ ${missing.length - stillWaiting} file`,
        );
      }
      return [...old, ...missing.slice(0, Math.max(0, stillWaiting))];
    });
    if (errorMessage.length) setFormError(`Không thêm được: ${errorMessage.join("; ")}.`);
  };

  useImperativeHandle(ref, () => ({
    themFile,
    scrollTo: () =>
      // Doi mot khung hinh: form co the vua duoc bat, chua ve xong.
      requestAnimationFrame(() =>
        formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
      ),
  }));

  const removeFile = (i: number) => setDsFile((old) => old.filter((_, j) => j !== i));

  const submitDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSuccess("");

    // Kiem CHU chu khong kiem chuoi HTML: o soan TipTap de trong van tra ve
    // "<p></p>", tuc la chuoi khong rong - kiem noiDung.trim() thi o trong van
    // lot qua, toi may chu moi bi chan.
    const fontSize = content
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim();
    if (!title.trim() || !fontSize) {
      return setFormError("Vui lòng nhập đầy đủ tiêu đề và nội dung.");
    }
    if (!subject.length) return setFormError("Vui lòng chọn ít nhất một môn học.");

    setSending(true);
    try {
      await documentService.createDocument({
        title: title.trim(),
        description: content.trim(),
        monHoc: subject,
        files: dsFile,
        truong: school,
      });
      setTitle("");
      setSubject([]);
      setContent("");
      setDsFile([]);
      setSchool("");
      setSuccess("Đã đăng tài liệu. Cảm ơn bạn đã chia sẻ!");
      onPosted?.();
    } catch (err) {
      // Bai bi bo loc chan cung ve day - thong bao tu may chu noi ro ly do.
      setFormError(getErrorMessage(err, "Không đăng được tài liệu."));
    } finally {
      setSending(false);
    }
  };

  return (
    <form ref={formRef} onSubmit={submitDocument} className={styles.form}>
      <div className={styles.row3}>
        <div>
          <h2 className={styles.heading}>Đăng tài liệu của bạn</h2>
          <p className={styles.text4}>
            Mọi người đều xem và tải được tài liệu bạn chia sẻ.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng biểu mẫu"
          className={styles.button2}
        >
          <X size={18} />
        </button>
      </div>

      <div className={styles.stack}>
        <div>
          <label htmlFor="tieu-de" className={styles.fieldLabel}>
            Tiêu đề <span className={styles.label}>*</span>
          </label>
          <input
            id="tieu-de"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
            placeholder="VD: Đề cương ôn tập Cấu trúc dữ liệu và giải thuật"
            className={styles.input}
          />
          <p className={styles.text5}>{title.length}/200</p>
        </div>

        <div>
          <span id="mon-hoc" className={styles.fieldLabel}>
            Môn học <span className={styles.label}>*</span>
            <span className={styles.subLabel}> — chọn một hoặc nhiều, tối đa 5</span>
          </span>
          {/* CHON trong danh sach admin quan ly, khong go tu do: go tu do thi mot
              mon ra nhieu cach viet va bo loc theo mon thanh vo dung. Gia tri
              gui di la KHOA mon; may chu tra lai ten chuan tu danh sach. */}
          <SubjectPicker
            subjectList={subjectList}
            chon={subject}
            toggleSelect={setSubject}
            labelId="mon-hoc"
          />
        </div>

        {schoolList.length > 0 && (
          <div>
            <label htmlFor="truong-dh" className={styles.fieldLabel}>
              Trường đại học
              <span className={styles.subLabel}> — không bắt buộc</span>
            </label>
            <select
              id="truong-dh"
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              className={styles.input}
            >
              <option value="">— Không chọn trường —</option>
              {schoolList.map((t) => (
                <option key={t.key} value={t.key}>
                  {t.ten}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label htmlFor="noi-dung" className={styles.fieldLabel}>
            Nội dung <span className={styles.label}>*</span>
          </label>
          <RichTextEditor
            giaTri={content}
            setValue={setContent}
            toiDa={CONTENT_LIMIT}
            uploadImage={documentService.uploadImage}
            placeholder="Mô tả tài liệu, hoặc viết một bài hướng dẫn: Bước 1… (bấm nút ảnh để chèn ảnh chụp màn hình)…"
          />
          <p className={styles.suggest}>
            Viết bài hướng dẫn như blog: dùng <strong>Tiêu đề nhỏ</strong> cho từng bước
            và nút <strong>chèn ảnh</strong> để thêm ảnh chụp màn hình ngay dưới bước đó.
          </p>
        </div>

        <div>
          <span className={styles.fieldLabel}>
            File đính kèm
            <span className={styles.subLabel}>
              {" "}
              — không bắt buộc, tối đa {MAX_FILES} file, vd. chương 1, 2, 3…
            </span>
          </span>

          {/* Moi file mot dong, dung thu tu se hien o trang chi tiet. */}
          {dsFile.length > 0 && (
            <ol className={styles.dsFile}>
              {dsFile.map((f, i) => (
                <li key={`${f.name}-${f.size}`} className={styles.card2}>
                  <span className={styles.index}>{i + 1}</span>
                  <FileText size={20} className={styles.box3} />
                  <div className={styles.box4}>
                    <p className={styles.text8}>{f.name}</p>
                    <p className={styles.text9}>{setPageSize(f.size)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    aria-label={`Bỏ file ${f.name}`}
                    className={styles.button3}
                  >
                    <X size={16} />
                  </button>
                </li>
              ))}
            </ol>
          )}

          {dsFile.length < MAX_FILES && (
            <label htmlFor="file-tai-lieu" className={styles.fieldLabel2}>
              <Upload size={24} className={styles.box5} />
              <span className={styles.label2}>
                {dsFile.length ? "Thêm file" : "Bấm để chọn file"}
              </span>
              <span className={styles.label3}>
                PDF, DOC hoặc DOCX &middot; mỗi file tối đa {MAX_MB}MB &middot; còn{" "}
                {MAX_FILES - dsFile.length} chỗ
              </span>
            </label>
          )}
          <input
            id="file-tai-lieu"
            type="file"
            accept=".pdf,.doc,.docx"
            multiple
            className={styles.input2}
            onChange={(e) => {
              themFile(Array.from(e.target.files ?? []));
              // Xoa gia tri: chon lai dung file vua bo van ban su kien change.
              e.target.value = "";
            }}
          />
        </div>
      </div>

      {formError && (
        <p role="alert" className={styles.text10}>
          {formError}
        </p>
      )}
      {success && (
        <p role="status" className={styles.text11}>
          {success}
        </p>
      )}

      <button type="submit" disabled={sending} className={styles.button4}>
        {sending ? (
          <Loader2 size={16} className={styles.spinner} />
        ) : (
          <Upload size={16} />
        )}
        {sending ? "Đang đăng..." : "Đăng tài liệu"}
      </button>
    </form>
  );
}
