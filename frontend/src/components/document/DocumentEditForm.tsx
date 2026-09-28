"use client";

import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";

import RichTextEditor from "@/src/components/common/RichTextEditor";
import SubjectPicker from "./SubjectPicker";
import { GIOI_HAN_NOI_DUNG, khoaTuTenMon } from "./fileInfo";
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
  khiLuu,
  khiHuy,
}: {
  doc: SharedDocument;
  khiLuu: (moi: SharedDocument) => void;
  khiHuy: () => void;
}) {
  const [tieuDe, setTieuDe] = useState(doc.title);
  const [noiDung, setNoiDung] = useState(doc.description);
  const [dsMon, setDsMon] = useState<DocumentSubject[]>([]);
  // KHOA cac mon. Rong luc dau cho toi khi tai xong danh sach va doi ten -> khoa.
  const [monHoc, setMonHoc] = useState<string[]>([]);
  // KHOA truong - doi tu ten sau khi tai xong danh sach. "" = khong gan truong.
  const [dsTruong, setDsTruong] = useState<DocumentUniversity[]>([]);
  const [truong, setTruong] = useState("");
  const [dangLuu, setDangLuu] = useState(false);
  const [loi, setLoi] = useState("");

  useEffect(() => {
    let huy = false;
    documentService
      .getSubjects()
      .then((ds) => {
        if (huy) return;
        setDsMon(ds);
        // Tai lieu luu TEN mon (ten chuan lay tu danh sach luc dang), nen so
        // khop dung ten la ra khoa. Tai lieu cu chua co mon thi de trong.
        setMonHoc(khoaTuTenMon(ds, doc.monHoc));
        // Truong: tai rieng, hong thi o chon an di (truong khong bat buoc).
        documentService
          .getUniversities()
          .then((dsT) => {
            if (huy) return;
            setDsTruong(dsT);
            setTruong(dsT.find((t) => t.ten === doc.truong)?.key ?? "");
          })
          .catch(() => {});
      })
      .catch(() => {
        if (!huy) setLoi("Không tải được danh sách môn học.");
      });
    return () => {
      huy = true;
    };
  }, [doc.monHoc, doc.truong]);

  const luu = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoi("");

    // Kiem CHU chu khong kiem chuoi HTML: o soan trong van tra ve "<p></p>".
    const coChu = noiDung
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim();
    if (!tieuDe.trim() || !coChu)
      return setLoi("Tiêu đề và nội dung không được để trống.");
    if (!monHoc.length) return setLoi("Vui lòng chọn ít nhất một môn học.");

    setDangLuu(true);
    try {
      const moi = await documentService.updateDocument(doc._id, {
        title: tieuDe.trim(),
        description: noiDung,
        monHoc,
        truong,
      });
      khiLuu(moi);
    } catch (err) {
      // Bo loc tu ngu, mon khong con trong danh sach... may chu noi ro.
      setLoi(getErrorMessage(err, "Không lưu được thay đổi."));
    } finally {
      setDangLuu(false);
    }
  };

  return (
    <form onSubmit={luu} className={styles.form}>
      <h2 className={styles.tieuDe}>Sửa tài liệu</h2>

      <label htmlFor="sua-tieu-de" className={styles.nhan}>
        Tiêu đề
      </label>
      <input
        id="sua-tieu-de"
        value={tieuDe}
        onChange={(e) => setTieuDe(e.target.value)}
        maxLength={200}
        className={styles.o}
      />

      <span id="sua-mon" className={styles.nhan}>
        Môn học (chọn một hoặc nhiều)
      </span>
      <SubjectPicker dsMon={dsMon} chon={monHoc} doiChon={setMonHoc} idNhan="sua-mon" />

      {dsTruong.length > 0 && (
        <>
          <label htmlFor="sua-truong" className={styles.nhan}>
            Trường đại học (không bắt buộc)
          </label>
          <select
            id="sua-truong"
            value={truong}
            onChange={(e) => setTruong(e.target.value)}
            className={styles.o}
          >
            <option value="">— Không chọn trường —</option>
            {dsTruong.map((t) => (
              <option key={t.key} value={t.key}>
                {t.ten}
              </option>
            ))}
          </select>
        </>
      )}

      <span className={styles.nhan}>Nội dung</span>
      <RichTextEditor
        giaTri={noiDung}
        doiGiaTri={setNoiDung}
        toiDa={GIOI_HAN_NOI_DUNG}
        taiAnh={documentService.uploadImage}
      />

      <p className={styles.ghiChu}>
        File đính kèm không đổi được ở đây. Muốn thay file, hãy xóa bài và đăng lại.
      </p>

      {loi && (
        <p role="alert" className={styles.loi}>
          {loi}
        </p>
      )}

      <div className={styles.nut}>
        <button type="button" onClick={khiHuy} className={styles.nutHuy}>
          Hủy
        </button>
        <button type="submit" disabled={dangLuu} className={styles.nutLuu}>
          {dangLuu ? <Loader2 size={15} className={styles.quay} /> : <Save size={15} />}
          Lưu thay đổi
        </button>
      </div>
    </form>
  );
}
