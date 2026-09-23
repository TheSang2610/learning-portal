"use client";

import Link from "next/link";
import { ArrowLeft, CalendarDays, Download, FileText, User } from "lucide-react";
import ArticleWithOutline from "@/src/components/common/ArticleWithOutline";
import { documentService, type SharedDocument } from "@/src/services/document";

import styles from "./DocumentDetailClient.module.scss";
interface Props {
  doc: SharedDocument;
}

function doiKichThuoc(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function DocumentDetailClient({ doc }: Props) {
  const khiTai = () => {
    // Dem luot tai la viec phu: hong cung khong duoc chan nguoi dung tai file.
    documentService.countDownload(doc._id).catch(() => {});
  };

  return (
    <div className={styles.container}>
      <Link href="/share-document" className={styles.box}>
        <ArrowLeft size={16} />
        Về danh sách tài liệu
      </Link>

      <div className={styles.card}>
        <h1 className={styles.title}>{doc.title}</h1>

        <div className={styles.row}>
          <span className={styles.label}>
            <User size={15} className={styles.box2} />
            {doc.uploader?.name || "Người dùng đã xóa"}
          </span>
          <span className={styles.label}>
            <CalendarDays size={15} className={styles.box2} />
            {new Date(doc.createdAt).toLocaleDateString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </span>
          <span className={styles.label}>
            <Download size={15} className={styles.box2} />
            {doc.downloadCount} lượt tải
          </span>
          <span className={styles.label}>
            <FileText size={15} className={styles.box2} />
            {doc.fileExt.toUpperCase()} &middot; {doiKichThuoc(doc.fileSize)}
          </span>
        </div>

        <a
          href={doc.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={khiTai}
          className={styles.link}
        >
          <Download size={16} />
          Tải file {doc.fileExt.toUpperCase()}
        </a>
      </div>

      <ArticleWithOutline
        content={doc.description}
        goiYKhiTrong="Tài liệu này chưa chia mục. Người đăng có thể thêm dòng dạng Chương 1: ... hoặc ## Tiêu đề để tạo mục lục."
      />
    </div>
  );
}
