"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { documentService, type DocumentSubject } from "@/src/services/document";
import { useStoredUser } from "@/src/hooks/userStore";
import ShareDocumentHero from "./ShareDocumentHero";
import DocumentUploadForm, { type DocumentUploadFormHandle } from "./DocumentUploadForm";
import { MAX_MB } from "@/src/lib/document/file-info";
import { allPath } from "@/src/lib/document/paths";

import styles from "./ShareDocumentClient.module.scss";

/**
 * Phan tuong tac cua trang chu khu tai lieu (/share-document): dai dau trang va
 * form dang bai. Cac section ben duoi (linh vuc...) la component may chu, dat
 * o page.tsx.
 *
 * Trang nay KHONG con danh sach tai lieu - danh sach nam o /share-document/browse.
 * Tim hay bam the mon o dai dau trang thi chuyen sang do, kem bo loc.
 */
export default function ShareDocumentIndex({
  subjectList,
}: {
  subjectList: DocumentSubject[];
}) {
  const router = useRouter();
  const user = useStoredUser();
  const [keyword, setKeyword] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const formRef = useRef<DocumentUploadFormHandle>(null);

  const search = () => {
    // Ghi lai de goi y hoc duoc nguoi nay quan tam gi - viec phu, loi bo qua.
    if (user && keyword.trim()) documentService.logSearch(keyword).catch(() => {});
    router.push(allPath({ q: keyword }));
  };

  const dropFile = (files: File[]) => {
    setOpenForm(true);
    // Form co the chua co trong DOM (vua bat openForm) - doi mot khung hinh.
    requestAnimationFrame(() => {
      formRef.current?.themFile(files);
      formRef.current?.scrollTo();
    });
  };

  // Mo hop dang nhap NGAY TREN TRANG NAY (AuthModalGate nghe ?auth). pushState
  // chu khong router.push - xem ghi chu trong AuthModalGate.
  const openLogin = () => {
    const u = new URL(window.location.href);
    u.searchParams.set("auth", "login");
    u.searchParams.set("vi", "chiase");
    window.history.pushState(null, "", u.toString());
  };

  return (
    <>
      <ShareDocumentHero
        loggedIn={Boolean(user)}
        limitMb={MAX_MB}
        onPickFile={dropFile}
        onNeedLogin={openLogin}
        tuKhoa={keyword}
        changeKeyword={setKeyword}
        onSearch={search}
        featuredSubject={subjectList
          .filter((m) => m.soTaiLieu > 0)
          .sort((x, y) => y.soTaiLieu - x.soTaiLieu)
          .slice(0, 4)}
        onPickSubject={(key) => router.push(allPath({ mon: key }))}
      />

      {user && openForm && (
        <div className={styles.container}>
          <DocumentUploadForm
            ref={formRef}
            subjectList={subjectList}
            onClose={() => setOpenForm(false)}
            // Dang xong: lam moi so dem linh vuc / mon (component may chu).
            onPosted={() => router.refresh()}
          />
        </div>
      )}
    </>
  );
}
