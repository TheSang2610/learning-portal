"use client";

import { useEffect, useState, useRef } from "react";
import { useNguoiDungLuu } from "@/src/hooks/nguoiDungLuu";
import { getErrorMessage } from "@/src/services/apiHelper";
import {
  X,
  Download,
  Share2,
  Copy,
  CheckCircle,
  Award,
  Calendar,
  User as UserIcon,
  BookOpen,
  Trophy,
} from "lucide-react";
import {
  certificateService,
  duongDanPdfChungChi,
  Certificate,
} from "@/src/services/certificate";

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  enrollmentId: string;
}

// courseTitle va instructorName truoc day nam trong danh sach nay nhung khong he
// duoc doc: component tu goi API theo enrollmentId roi lay ten khoa hoc va ten
// giang vien tu chinh ban ghi chung chi. Bo di cho khoi ai tuong phai truyen.

export default function CertificateModal({
  isOpen,
  onClose,
  enrollmentId,
}: CertificateModalProps) {
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Ten hoc vien uu tien lay tu localStorage (moi hon ban ghi chung chi neu
  // nguoi dung vua doi ho so). Doc bang useSyncExternalStore chu khong bang
  // useEffect + setState, xem src/hooks/nguoiDungLuu.ts.
  const localUserInfo = useNguoiDungLuu();

  const certificateRef = useRef<HTMLDivElement>(null);

  // Đọc thông tin học viên từ localStorage và Tải chứng chỉ khi modal mở
  useEffect(() => {
    if (!isOpen || !enrollmentId) return;

    // Gọi API lấy chứng chỉ
    const loadCertificate = async () => {
      try {
        setLoading(true);
        setError(null);

        const cert = await certificateService.createCertificate(enrollmentId);
        setCertificate(cert);
      } catch (err) {
        console.error("Lỗi khi tạo chứng chỉ:", err);
        setError(getErrorMessage(err, "Không thể tạo chứng chỉ. Vui lòng thử lại sau!"));
      } finally {
        setLoading(false);
      }
    };

    loadCertificate();
  }, [isOpen, enrollmentId]);

  // Đóng modal khi nhấn Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Hàm helper lấy tên học viên chuẩn xác nhất (Ưu tiên LocalStorage > API)
  const getValidStudentName = () => {
    // certificate.student chi duoc populate 'name email' (xem
    // certificateController), khong co fullname - nhanh doc fullname tu day
    // chua bao gio chay nen da bo.
    return (
      localUserInfo?.fullname ||
      localUserInfo?.name ||
      certificate?.student?.name ||
      "Học Viên"
    );
  };

  // Copy mã xác thực
  const handleCopyCode = async () => {
    if (!certificate) return;
    try {
      await navigator.clipboard.writeText(certificate.verificationCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (err) {
      console.error("Lỗi copy mã:", err);
    }
  };

  // Chia sẻ chứng chỉ
  const handleShare = async () => {
    if (!certificate) return;

    const shareData = {
      title: certificate.title,
      text: `Tôi vừa hoàn thành khóa học "${certificate.courseName}" với điểm ${certificate.scorePercentage}%!`,
      url: `${window.location.origin}/certificates/verify/${certificate.verificationCode}`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error("Lỗi chia sẻ:", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareData.url);
        alert("Link đã được copy vào clipboard!");
      } catch (err) {
        console.error("Lỗi copy:", err);
      }
    }
  };

  if (!isOpen) return null;

  // Gọi hàm lấy tên chuẩn hiển thị lên giao diện Modal UI
  const displayStudentName = getValidStudentName();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
          aria-label="Close"
        >
          <X size={24} />
        </button>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center gap-3 p-12 text-slate-400">
            <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-blue-500"></div>
            <p className="text-sm">Đang tạo chứng chỉ của bạn...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="p-8 text-center">
            <div className="mb-4 text-lg font-bold text-red-400">❌ Lỗi</div>
            <p className="mb-6 text-sm text-slate-400">{error}</p>
            <button
              onClick={onClose}
              className="rounded-xl bg-slate-800 px-6 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Đóng
            </button>
          </div>
        )}

        {/* Success State */}
        {certificate && !loading && !error && (
          <div className="space-y-6 p-8">
            <div className="space-y-3 text-center">
              <div className="flex justify-center">
                <Trophy size={64} className="animate-bounce text-yellow-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Chúc Mừng!</h2>
              <p className="text-sm text-slate-400">
                Bạn đã hoàn thành xuất sắc khóa học này
              </p>
            </div>

            {/* Certificate Preview UI */}
            <div
              ref={certificateRef}
              className="relative space-y-4 overflow-hidden rounded-2xl border-2 border-yellow-500/30 bg-gradient-to-br from-blue-600/20 to-purple-600/20 p-8 text-center"
            >
              <div className="text-4xl font-bold text-white">📜</div>
              <h3 className="text-xl font-bold text-white">
                Chứng Chỉ Hoàn Thành Khóa Học
              </h3>
              <p className="text-lg font-semibold text-yellow-300">
                {certificate.courseName}
              </p>
              <p className="text-sm text-slate-300">
                được trao cho
                <br />
                <span className="font-bold text-white">{displayStudentName}</span>
              </p>
              <div className="border-t border-slate-700 pt-2 text-xs text-slate-400">
                Mã: {certificate.certificateNumber}
              </div>
            </div>

            {/* Certificate Details Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Award size={16} className="text-yellow-400" />
                  <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                    Điểm Số
                  </span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {certificate.scorePercentage}%
                </p>
              </div>

              <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Calendar size={16} className="text-blue-400" />
                  <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                    Ngày Hoàn Thành
                  </span>
                </div>
                <p className="text-sm font-bold text-white">
                  {new Date(certificate.completionDate).toLocaleDateString("vi-VN")}
                </p>
              </div>

              <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <UserIcon size={16} className="text-purple-400" />
                  <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                    Giảng Viên
                  </span>
                </div>
                <p className="truncate text-sm font-bold text-white">
                  {certificate.instructorName}
                </p>
              </div>

              <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <BookOpen size={16} className="text-emerald-400" />
                  <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                    Khóa Học
                  </span>
                </div>
                <p className="truncate text-sm font-bold text-white">
                  {certificate.courseName}
                </p>
              </div>
            </div>

            {/* Mã Xác Thực */}
            <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-4">
              <p className="mb-2 text-xs font-bold tracking-wider text-slate-400 uppercase">
                Mã Xác Thực
              </p>
              <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-700 bg-slate-900/60 p-3">
                <code className="font-mono text-xs break-all text-slate-300">
                  {certificate.verificationCode}
                </code>
                <button
                  onClick={handleCopyCode}
                  className={`flex-shrink-0 rounded-lg p-2 transition ${
                    copiedCode
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  }`}
                  title="Copy mã xác thực"
                >
                  {copiedCode ? <CheckCircle size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-4">
              {/* Tep PDF do MAY CHU dung, khong con goi window.print() nua.
                  Ban in cua trinh duyet phu thuoc vao tung may (le giay, co
                  chu, co in mau nen hay khong) va quan tri thi khong co cach
                  nao xem lai dung ban hoc vien cam. */}
              <a
                href={duongDanPdfChungChi(certificate._id)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex transform items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 active:scale-95"
              >
                <Download size={16} />
                Tải PDF
              </a>
              <button
                onClick={handleShare}
                className="flex transform items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-purple-700 active:scale-95"
              >
                <Share2 size={16} />
                Chia Sẻ
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
