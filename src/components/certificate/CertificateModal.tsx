"use client";

import { useEffect, useState, useRef } from "react";
import { X, Download, Share2, Copy, CheckCircle, Award, Calendar, User as UserIcon, BookOpen, Trophy } from "lucide-react";
import { certificateService, Certificate } from "@/src/services/certificate";

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  enrollmentId: string;
  courseTitle: string;
  instructorName: string;
}

export default function CertificateModal({
  isOpen,
  onClose,
  enrollmentId,
  courseTitle,
  instructorName
}: CertificateModalProps) {
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  
  // SỬA LỖI: Thêm state lưu thông tin tên từ localStorage
  const [localUserInfo, setLocalUserInfo] = useState<{ fullname?: string; name?: string } | null>(null);
  
  const certificateRef = useRef<HTMLDivElement>(null);

  // Đọc thông tin học viên từ localStorage và Tải chứng chỉ khi modal mở
  useEffect(() => {
    if (!isOpen || !enrollmentId) return;

    // 1. Lấy dữ liệu mới nhất từ localStorage (giống bên trang Profile)
    const userInfo = localStorage.getItem("userInfo");
    if (userInfo) {
      try {
        setLocalUserInfo(JSON.parse(userInfo));
      } catch (e) {
        console.error("Lỗi parse dữ liệu localStorage:", e);
      }
    }

    // 2. Gọi API lấy chứng chỉ
    const loadCertificate = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const cert = await certificateService.createCertificate(enrollmentId);
        setCertificate(cert);
      } catch (err: any) {
        console.error("Lỗi khi tạo chứng chỉ:", err);
        setError(err.message || "Không thể tạo chứng chỉ. Vui lòng thử lại sau!");
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
    return (
      localUserInfo?.fullname || 
      (certificate?.student as any)?.fullname || 
      localUserInfo?.name || 
      (certificate?.student as any)?.name || 
      "Học Viên"
    );
  };

  // Sửa lỗi hiển thị tên & Lệch dấu khi in PDF
  const handleDownloadPDF = () => {
    if (!certificate) return;
    
    // ĐỒNG BỘ: Sử dụng hàm helper lấy tên chuẩn cho bản in PDF
    const studentName = getValidStudentName();

    const formattedDate = new Date(certificate.completionDate).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

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

    const printWindow = window.open('', '', 'width=1100,height=750');
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
      url: `${window.location.origin}/certificates/verify/${certificate.verificationCode}`
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div
        className="bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition z-10"
          aria-label="Close"
        >
          <X size={24} />
        </button>

        {/* Loading State */}
        {loading && (
          <div className="p-12 flex flex-col items-center justify-center text-slate-400 gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
            <p className="text-sm">Đang tạo chứng chỉ của bạn...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="p-8 text-center">
            <div className="text-red-400 mb-4 text-lg font-bold">❌ Lỗi</div>
            <p className="text-slate-400 text-sm mb-6">{error}</p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-semibold transition"
            >
              Đóng
            </button>
          </div>
        )}

        {/* Success State */}
        {certificate && !loading && !error && (
          <div className="p-8 space-y-6">
            <div className="text-center space-y-3">
              <div className="flex justify-center">
                <Trophy size={64} className="text-yellow-400 animate-bounce" />
              </div>
              <h2 className="text-2xl font-bold text-white">Chúc Mừng!</h2>
              <p className="text-slate-400 text-sm">
                Bạn đã hoàn thành xuất sắc khóa học này
              </p>
            </div>

            {/* Certificate Preview UI */}
            <div
              ref={certificateRef}
              className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border-2 border-yellow-500/30 rounded-2xl p-8 text-center space-y-4 relative overflow-hidden"
            >
              

              <div className="text-4xl font-bold text-white">📜</div>
              <h3 className="text-xl font-bold text-white">
                Chứng Chỉ Hoàn Thành Khóa Học
              </h3>
              <p className="text-yellow-300 font-semibold text-lg">
                {certificate.courseName}
              </p>
              <p className="text-slate-300 text-sm">
                được trao cho
                <br />
                <span className="font-bold text-white">{displayStudentName}</span>
              </p>
              <div className="text-xs text-slate-400 pt-2 border-t border-slate-700">
                Mã: {certificate.certificateNumber}
              </div>
            </div>

            {/* Certificate Details Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Award size={16} className="text-yellow-400" />
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">
                    Điểm Số
                  </span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {certificate.scorePercentage}%
                </p>
              </div>

              <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar size={16} className="text-blue-400" />
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">
                    Ngày Hoàn Thành
                  </span>
                </div>
                <p className="text-sm font-bold text-white">
                  {new Date(certificate.completionDate).toLocaleDateString('vi-VN')}
                </p>
              </div>

              <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <UserIcon size={16} className="text-purple-400" />
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">
                    Giảng Viên
                  </span>
                </div>
                <p className="text-sm font-bold text-white truncate">
                  {certificate.instructorName}
                </p>
              </div>

              <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen size={16} className="text-emerald-400" />
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">
                    Khóa Học
                  </span>
                </div>
                <p className="text-sm font-bold text-white truncate">
                  {certificate.courseName}
                </p>
              </div>
            </div>

            {/* Mã Xác Thực */}
            <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-4">
              <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-2">
                Mã Xác Thực
              </p>
              <div className="flex items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-lg border border-slate-700">
                <code className="text-xs font-mono text-slate-300 break-all">
                  {certificate.verificationCode}
                </code>
                <button
                  onClick={handleCopyCode}
                  className={`p-2 rounded-lg transition flex-shrink-0 ${
                    copiedCode
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-700 hover:bg-slate-600 text-slate-300"
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
                className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition transform active:scale-95"
              >
                <Download size={16} />
                Tải PDF
              </button>
              <button
                onClick={handleShare}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold text-sm transition transform active:scale-95"
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