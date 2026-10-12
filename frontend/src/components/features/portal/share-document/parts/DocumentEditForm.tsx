"use client";

import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";

import RichTextEditor from "@/src/components/common/RichTextEditor";
import SubjectPicker from "./SubjectPicker";
import { CONTENT_LIMIT, keyFromSubjectName } from "@/src/lib/document/file-info";
import { getErrorMessage } from "@/src/services/apiHelper";
import {
  documentService,
  type DocumentSubject,
  type DocumentUniversity,
  type SharedDocument,
} from "@/src/services/document";

import styles from "./DocumentEditForm.module.scss";

/**
 * Sua tieu de, mon hoc, noi dung cua tai lieu. Dung o trang ca nhan
 * (src/components/profile/MyDocuments.tsx) - noi duy nhat chu bai sua bai.
 *
 * KHONG doi file o day - theo chot voi chu du an: doi file thi phai xoa file
 * cu tren kho luu tru, va tai file moi hong giua chung la mot duong loi rieng.
 * Muon doi file thi xoa bai roi dang lai.
 */
export default function DocumentEditForm({
  doc,
  onSave,
  onCancel,
}: {
  doc: SharedDocument;
  onSave: (recent: SharedDocument) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(doc.title);
  const [content, setContent] = useState(doc.description);
  const [subjectList, setSubjectList] = useState<DocumentSubject[]>([]);
  // KHOA cac mon. Rong luc dau cho toi khi tai xong danh sach va doi ten -> khoa.
  const [subject, setSubject] = useState<string[]>([]);
  // KHOA truong - doi tu ten sau khi tai xong danh sach. "" = khong gan truong.
  const [schoolList, setSchoolList] = useState<DocumentUniversity[]>([]);
  const [school, setSchool] = useState("");
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancel = false;
    documentService
      .getSubjects()
      .then((items) => {
        if (cancel) return;
        setSubjectList(items);
        // Tai lieu luu TEN mon (ten chuan lay tu danh sach luc dang), nen so
        // khop dung ten la ra khoa. Tai lieu cu chua co mon thi de trong.
        setSubject(keyFromSubjectName(items, doc.monHoc));
        // Truong: tai rieng, hong thi o chon an di (truong khong bat buoc).
        documentService
          .getUniversities()
          .then((dsT) => {
            if (cancel) return;
            setSchoolList(dsT);
            setSchool(dsT.find((t) => t.ten === doc.truong)?.key ?? "");
          })
          .catch(() => {});
      })
      .catch(() => {
        if (!cancel) setErrorMessage("Không tải được danh sách môn học.");
      });
    return () => {
      cancel = true;
    };
  }, [doc.monHoc, doc.truong]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    // Kiem CHU chu khong kiem chuoi HTML: o soan trong van tra ve "<p></p>".
    const fontSize = content
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim();
    if (!title.trim() || !fontSize)
      return setErrorMessage("Tiêu đề và nội dung không được để trống.");
    if (!subject.length) return setErrorMessage("Vui lòng chọn ít nhất một môn học.");

    setSaving(true);
    try {
      const recent = await documentService.updateDocument(doc._id, {
        title: title.trim(),
        description: content,
        monHoc: subject,
        truong: school,
      });
      onSave(recent);
    } catch (err) {
      // Bo loc tu ngu, mon khong con trong danh sach... may chu noi ro.
      setErrorMessage(getErrorMessage(err, "Không lưu được thay đổi."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save} className={styles.form}>
      <h2 className={styles.tieuDe}>Sửa tài liệu</h2>

      <label htmlFor="sua-tieu-de" className={styles.nhan}>
        Tiêu đề
      </label>
      <input
        id="sua-tieu-de"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={200}
        className={styles.o}
      />

      <span id="sua-mon" className={styles.nhan}>
        Môn học (chọn một hoặc nhiều)
      </span>
      <SubjectPicker
        subjectList={subjectList}
        chon={subject}
        toggleSelect={setSubject}
        labelId="sua-mon"
      />

      {schoolList.length > 0 && (
        <>
          <label htmlFor="sua-truong" className={styles.nhan}>
            Trường đại học (không bắt buộc)
          </label>
          <select
            id="sua-truong"
            value={school}
            onChange={(e) => setSchool(e.target.value)}
            className={styles.o}
          >
            <option value="">— Không chọn trường —</option>
            {schoolList.map((t) => (
              <option key={t.key} value={t.key}>
                {t.ten}
              </option>
            ))}
          </select>
        </>
      )}

      <span className={styles.nhan}>Nội dung</span>
      <RichTextEditor
        giaTri={content}
        setValue={setContent}
        toiDa={CONTENT_LIMIT}
        uploadImage={documentService.uploadImage}
      />

      <p className={styles.ghiChu}>
        File đính kèm không đổi được ở đây. Muốn thay file, hãy xóa bài và đăng lại.
      </p>

      {errorMessage && (
        <p role="alert" className={styles.loi}>
          {errorMessage}
        </p>
      )}

      <div className={styles.button}>
        <button type="button" onClick={onCancel} className={styles.cancelButton}>
          Hủy
        </button>
        <button type="submit" disabled={saving} className={styles.saveButton}>
          {saving ? <Loader2 size={15} className={styles.quay} /> : <Save size={15} />}
          Lưu thay đổi
        </button>
      </div>
    </form>
  );
}
