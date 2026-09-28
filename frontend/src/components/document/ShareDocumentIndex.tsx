"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { documentService, type DocumentSubject } from "@/src/services/document";
import { useNguoiDungLuu } from "@/src/hooks/userStore";
import ShareDocumentHero from "./ShareDocumentHero";
import DocumentUploadForm, { type DocumentUploadFormHandle } from "./DocumentUploadForm";
import { MAX_MB } from "./fileInfo";
import { duongTatCa } from "./duongDan";

import styles from "./ShareDocumentClient.module.scss";

/**
 * Phan tuong tac cua trang chu khu tai lieu (/share-document): dai dau trang va
 * form dang bai. Cac section ben duoi (linh vuc...) la component may chu, dat
 * o page.tsx.
 *
 * Trang nay KHONG con danh sach tai lieu - danh sach nam o /share-document/browse.
 * Tim hay bam the mon o dai dau trang thi chuyen sang do, kem bo loc.
 */
export default function ShareDocumentIndex({ dsMon }: { dsMon: DocumentSubject[] }) {
  const router = useRouter();
  const user = useNguoiDungLuu();
  const [tuKhoa, setTuKhoa] = useState("");
  const [moForm, setMoForm] = useState(false);
  const formRef = useRef<DocumentUploadFormHandle>(null);

  const tim = () => {
    // Ghi lai de goi y hoc duoc nguoi nay quan tam gi - viec phu, loi bo qua.
    if (user && tuKhoa.trim()) documentService.logSearch(tuKhoa).catch(() => {});
    router.push(duongTatCa({ q: tuKhoa }));
  };

  const thaFile = (files: File[]) => {
    setMoForm(true);
    // Form co the chua co trong DOM (vua bat moForm) - doi mot khung hinh.
    requestAnimationFrame(() => {
      formRef.current?.themFile(files);
      formRef.current?.cuonToi();
    });
  };

  // Mo hop dang nhap NGAY TREN TRANG NAY (AuthModalGate nghe ?auth). pushState
  // chu khong router.push - xem ghi chu trong AuthModalGate.
  const moDangNhap = () => {
    const u = new URL(window.location.href);
    u.searchParams.set("auth", "login");
    u.searchParams.set("vi", "chiase");
    window.history.pushState(null, "", u.toString());
  };

  return (
    <>
      <ShareDocumentHero
        daDangNhap={Boolean(user)}
        gioiHanMb={MAX_MB}
        khiChonFile={thaFile}
        khiCanDangNhap={moDangNhap}
        tuKhoa={tuKhoa}
        doiTuKhoa={setTuKhoa}
        khiTim={tim}
        monNoiBat={dsMon
          .filter((m) => m.soTaiLieu > 0)
          .sort((x, y) => y.soTaiLieu - x.soTaiLieu)
          .slice(0, 4)}
        khiChonMon={(key) => router.push(duongTatCa({ mon: key }))}
      />

      {user && moForm && (
        <div className={styles.container}>
          <DocumentUploadForm
            ref={formRef}
            dsMon={dsMon}
            khiDong={() => setMoForm(false)}
            // Dang xong: lam moi so dem linh vuc / mon (component may chu).
            khiDangXong={() => router.refresh()}
          />
        </div>
      )}
    </>
  );
}
