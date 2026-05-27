"use client";

import { useEffect, useState, useRef } from "react";
import { X, Download, Share2, Copy, CheckCircle, Award, Calendar, User, BookOpen, Trophy } from "lucide-react";
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
  const certificateRef = useRef<HTMLDivElement>(null);

  // Tải chứng chỉ khi modal mở
  useEffect(() => {
    if (!isOpen || !enrollmentId) return;

    const loadCertificate = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Tạo chứng chỉ từ enrollment
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

  // Xử lý tải PDF (giả lập)
  const handleDownloadPDF = () => {
    if (!certificate) return;
    
    // Tạo nội dung HTML cho PDF
    const certificateHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${certificate.title}</title>
        <style>
          body {
            font-family: 'Georgia', serif;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
          }
          .certificate {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 60px;
            text-align: center;
            color: white;
            border: 10px solid gold;
            border-radius: 10px;
            max-width: 900px;
            margin: 0 auto;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
          }
          .header {
            font-size: 48px;
            font-weight: bold;
            margin-bottom: 30px;
            text-transform: uppercase;
            letter-spacing: 3px;
          }
          .subtitle {
            font-size: 24px;
            margin-bottom: 40px;
            font-style: italic;
          }
          .content {
            font-size: 18px;
            line-height: 1.8;
            margin: 30px 0;
          }
          .course-name {
            font-size: 32px;
            font-weight: bold;
            margin: 20px 0;
            color: #ffd700;
          }
          .details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin: 40px 0;
            font-size: 16px;
          }
          .detail-item {
            background: rgba(255,255,255,0.1);
            padding: 15px;
            border-radius: 5px;
          }
          .detail-label {
            font-weight: bold;
            opacity: 0.9;
          }
          .detail-value {
            font-size: 18px;
            margin-top: 5px;
          }
          .signature {
            margin-top: 50px;
            padding-top: 30px;
            border-top: 2px solid white;
          }
          .signature-line {
            display: inline-block;
            width: 200px;
            margin: 0 30px;
          }
          .code {
            margin-top: 30px;
            font-size: 14px;
            opacity: 0.9;
          }
        </style>
      </head>
      <body>
        <div class="certificate">
          <div class="header">🏆 Chứng Chỉ Hoàn Thành</div>
          <div class="subtitle">Certificate of Completion</div>
          
          <div class="content">
            Xác nhận rằng
            <div style="font-size: 24px; margin: 20px 0;">
              ${certificate.student.name}
            </div>
            đã hoàn thành xuất sắc khóa học
          </div>

          <div class="course-name">${certificate.courseName}</div>

          <div class="details">
            <div class="detail-item">
              <div class="detail-label">Ngày Hoàn Thành</div>
              <div class="detail-value">${new Date(certificate.completionDate).toLocaleDateString('vi-VN')}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Điểm Số</div>
              <div class="detail-value">${certificate.scorePercentage}%</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Giảng Viên</div>
              <div class="detail-value">${certificate.instructorName}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Mã Chứng Chỉ</div>
              <div class="detail-value">${certificate.certificateNumber}</div>
            </div>
          </div>

          <div class="signature">
            <div>Ký xác nhận</div>
            <div class="signature-line">________________________</div>
            <div>${certificate.signedBy}</div>
          </div>

          <div class="code">
            Mã Xác Thực: ${certificate.verificationCode}
          </div>
        </div>
      </body>
      </html>
    `;

    // Mở cửa sổ in
    const printWindow = window.open('', '', 'width=900,height=600');
    if (printWindow) {
      printWindow.document.write(certificateHTML);
      printWindow.document.close();
      printWindow.print();
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
      // Fallback: Copy URL vào clipboard
      try {
        await navigator.clipboard.writeText(shareData.url);
        alert("Link đã được copy vào clipboard!");
      } catch (err) {
        console.error("Lỗi copy:", err);
      }
    }
  };

  if (!isOpen) return null;

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
            {/* Header với icon */}
            <div className="text-center space-y-3">
              <div className="flex justify-center">
                <Trophy size={64} className="text-yellow-400 animate-bounce" />
              </div>
              <h2 className="text-2xl font-bold text-white">🎉 Chúc Mừng!</h2>
              <p className="text-slate-400 text-sm">
                Bạn đã hoàn thành xuất sắc khóa học này
              </p>
            </div>

            {/* Certificate Preview (Giả lập) */}
            <div
              ref={certificateRef}
              className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border-2 border-yellow-500/30 rounded-2xl p-8 text-center space-y-4 relative overflow-hidden"
            >
              {/* Decorative elements */}
              <div className="absolute top-0 left-0 w-20 h-20 border-t-4 border-l-4 border-yellow-400 rounded-br-2xl"></div>
              <div className="absolute bottom-0 right-0 w-20 h-20 border-b-4 border-r-4 border-yellow-400 rounded-tl-2xl"></div>

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
                <span className="font-bold text-white">{certificate.student.name}</span>
              </p>
              <div className="text-xs text-slate-400 pt-2 border-t border-slate-700">
                Mã: {certificate.certificateNumber}
              </div>
            </div>

            {/* Certificate Details Grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* Điểm số */}
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

              {/* Ngày hoàn thành */}
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

              {/* Giảng viên */}
              <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <User size={16} className="text-purple-400" />
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">
                    Giảng Viên
                  </span>
                </div>
                <p className="text-sm font-bold text-white truncate">
                  {certificate.instructorName}
                </p>
              </div>

              {/* Khóa học */}
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
                  {copiedCode ? (
                    <CheckCircle size={16} />
                  ) : (
                    <Copy size={16} />
                  )}
                </button>
              </div>
              <p className="text-[10px] text-slate-500 mt-2">
                👉 Chia sẻ mã này để người khác xác minh chứng chỉ của bạn
              </p>
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

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl font-semibold text-sm transition"
            >
              Đóng
            </button>
          </div>
        )}
      </div>
    </div>
  );
}