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
import { certificateService, Certificate } from "@/src/services/certificate";

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

  // Sửa lỗi hiển thị tên & Lệch dấu khi in PDF
  const handleDownloadPDF = () => {
    if (!certificate) return;

    // ĐỒNG BỘ: Sử dụng hàm helper lấy tên chuẩn cho bản in PDF
    const studentName = getValidStudentName();

    const formattedDate = new Date(certificate.completionDate).toLocaleDateString(
      "vi-VN",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      },
    );

    const certificateHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Chứng chỉ - ${certificate.courseName}</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=Playfair+Display:ital,wght@0,700;1,400&display=swap" rel="stylesheet">
        <style>
          @page {
            size: A4 landscape;
            margin: 0;
          }
          body {
            font-family: 'Inter', sans-serif;
            margin: 0;
            padding: 0;
            background-color: #ffffff;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .page-wrapper {
            width: 297mm;
            height: 210mm;
            box-sizing: border-box;
            padding: 20mm;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #ffffff;
          }
          .certificate {
            width: 100%;
            height: 100%;
            border: 8px double #d4af37;
            border-radius: 4px;
            background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
            box-sizing: border-box;
            padding: 40px;
            text-align: center;
            color: #f8fafc;
            position: relative;
          }
          .badge-icon {
            font-size: 50px;
            margin-bottom: 10px;
          }
          .header {
            font-family: 'Playfair Display', serif;
            font-size: 38px;
            font-weight: 700;
            color: #fbbf24;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin: 0 0 5px 0;
          }
          .subtitle {
            font-family: 'Playfair Display', serif;
            font-size: 16px;
            font-style: italic;
            color: #94a3b8;
            margin-bottom: 30px;
          }
          .certify-text {
            font-size: 16px;
            color: #cbd5e1;
            margin-bottom: 15px;
          }
          .student-name {
            font-size: 32px;
            font-weight: 800;
            color: #ffffff;
            margin: 15px 0;
            text-shadow: 0 2px 4px rgba(0,0,0,0.5);
            border-bottom: 2px solid rgba(251, 191, 36, 0.3);
            display: inline-block;
            padding-bottom: 5px;
          }
          .course-name {
            font-family: 'Playfair Display', serif;
            font-size: 24px;
            font-weight: 700;
            color: #38bdf8;
            margin: 15px 0 35px 0;
          }
          .grid-details {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
            max-width: 90%;
            margin: 0 auto;
            text-align: left;
          }
          .detail-card {
            background: rgba(255, 255, 255, 0.05);
            padding: 12px;
            border-radius: 6px;
            border: 1px solid rgba(255, 255, 255, 0.1);
          }
          .detail-label {
            font-size: 11px;
            text-transform: uppercase;
            color: #94a3b8;
            font-weight: 600;
            letter-spacing: 0.5px;
          }
          .detail-value {
            font-size: 13px;
            color: #f1f5f9;
            font-weight: 600;
            margin-top: 4px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .footer-section {
            margin-top: 45px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            padding: 0 40px;
          }
          .verification-box {
            text-align: left;
            font-size: 11px;
            color: #94a3b8;
          }
          .verification-code {
            font-family: monospace;
            color: #f1f5f9;
            background: rgba(0, 0, 0, 0.3);
            padding: 3px 6px;
            border-radius: 4px;
          }
          .signature-box {
            text-align: center;
            width: 200px;
          }
          .signature-line {
            border-top: 1px solid #cbd5e1;
            margin-top: 40px;
            padding-top: 5px;
            font-size: 13px;
            font-weight: 600;
            color: #f1f5f9;
          }
        </style>
      </head>
      <body>
        <div class="page-wrapper">
          <div class="certificate">
            <h1 class="header">Chứng Chỉ Hoàn Thành</h1>
            <div class="subtitle">Certificate of Completion</div>
            
            <p class="certify-text">Hệ thống đào tạo trực tuyến chứng nhận học viên</p>
            <div class="student-name">${studentName}</div>
            <p class="certify-text">đã hoàn thành xuất sắc khoá học</p>
            
            <div class="course-name">“${certificate.courseName}”</div>

            <div class="grid-details">
              <div class="detail-card">
                <div class="detail-label">Ngày hoàn thành</div>
                <div class="detail-value">${formattedDate}</div>
              </div>
              <div class="detail-card">
                <div class="detail-label">Điểm đánh giá</div>
                <div class="detail-value">${certificate.scorePercentage}%</div>
              </div>
              <div class="detail-card">
                <div class="detail-label">Giảng viên</div>
                <div class="detail-value">${certificate.instructorName}</div>
              </div>
              <div class="detail-card">
                <div class="detail-label">Số hiệu</div>
                <div class="detail-value">${certificate.certificateNumber}</div>
              </div>
            </div>

            <div class="footer-section">
              <div class="verification-box">
                <div>Mã xác thực trực tuyến:</div>
                <div style="margin-top: 4px;"><span class="verification-code">${certificate.verificationCode}</span></div>
              </div>
              <div class="signature-box">
                <div class="signature-line">${certificate.signedBy || "Ban quản trị Đại học"}</div>
              </div>
            </div>
          </div>
        </div>
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          };
        </script>
      </body>
      </html>
    `;

    const printWindow = window.open("", "", "width=1100,height=750");
    if (printWindow) {
      printWindow.document.write(certificateHTML);
      printWindow.document.close();
    }
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
              <button
                onClick={handleDownloadPDF}
                className="flex transform items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 active:scale-95"
              >
                <Download size={16} />
                Tải PDF
              </button>
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
