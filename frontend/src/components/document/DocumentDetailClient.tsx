"use client";

import Link from "next/link";
import { ArrowLeft, CalendarDays, Download, FileText, User } from "lucide-react";
import ArticleWithOutline from "@/src/components/common/ArticleWithOutline";
import { documentService, type SharedDocument } from "@/src/services/document";

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
    <div className="mx-auto max-w-6xl px-4">
      <Link
        href="/share-document"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 transition hover:text-blue-700"
      >
        <ArrowLeft size={16} />
        Về danh sách tài liệu
      </Link>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl leading-snug font-extrabold text-slate-900">
          {doc.title}
        </h1>

        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-600">
          <span className="inline-flex items-center gap-1.5">
            <User size={15} className="text-slate-400" />
            {doc.uploader?.name || "Người dùng đã xóa"}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays size={15} className="text-slate-400" />
            {new Date(doc.createdAt).toLocaleDateString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Download size={15} className="text-slate-400" />
            {doc.downloadCount} lượt tải
          </span>
          <span className="inline-flex items-center gap-1.5">
            <FileText size={15} className="text-slate-400" />
            {doc.fileExt.toUpperCase()} &middot; {doiKichThuoc(doc.fileSize)}
          </span>
        </div>

        <a
          href={doc.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={khiTai}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"
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
