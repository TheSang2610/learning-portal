"use client";

import { useEffect, useState, useRef } from "react";
import { useNguoiDungLuu } from "@/src/hooks/userStore";
import { getErrorMessage } from "@/src/services/apiHelper";

import styles from "./CertificateModal.module.scss";
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
  // useEffect + setState, xem src/hooks/userStore.ts.
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
    <div className={styles.overlay}>
      <div className={styles.card} role="dialog" aria-modal="true">
        {/* Close Button */}
        <button onClick={onClose} className={styles.button} aria-label="Close">
          <X size={24} />
        </button>

        {/* Loading State */}
        {loading && (
          <div className={styles.col}>
            <div className={styles.spinner}></div>
            <p className={styles.text}>Đang tạo chứng chỉ của bạn...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className={styles.box}>
            <div className={styles.box2}>❌ Lỗi</div>
            <p className={styles.text2}>{error}</p>
            <button onClick={onClose} className={styles.button2}>
              Đóng
            </button>
          </div>
        )}

        {/* Success State */}
        {certificate && !loading && !error && (
          <div className={styles.stack}>
            <div className={styles.stack2}>
              <div className={styles.row}>
                <Trophy size={64} className={styles.box3} />
              </div>
              <h2 className={styles.heading}>Chúc Mừng!</h2>
              <p className={styles.text3}>Bạn đã hoàn thành xuất sắc khóa học này</p>
            </div>

            {/* Certificate Preview UI */}
            <div ref={certificateRef} className={styles.stack3}>
              <div className={styles.box4}>📜</div>
              <h3 className={styles.subheading}>Chứng Chỉ Hoàn Thành Khóa Học</h3>
              <p className={styles.text4}>{certificate.courseName}</p>
              <p className={styles.text5}>
                được trao cho
                <br />
                <span className={styles.label}>{displayStudentName}</span>
              </p>
              <div className={styles.box5}>Mã: {certificate.certificateNumber}</div>
            </div>

            {/* Certificate Details Grid */}
            <div className={styles.grid}>
              <div className={styles.card2}>
                <div className={styles.row2}>
                  <Award size={16} className={styles.box6} />
                  <span className={styles.label2}>Điểm Số</span>
                </div>
                <p className={styles.heading}>{certificate.scorePercentage}%</p>
              </div>

              <div className={styles.card2}>
                <div className={styles.row2}>
                  <Calendar size={16} className={styles.box7} />
                  <span className={styles.label2}>Ngày Hoàn Thành</span>
                </div>
                <p className={styles.text6}>
                  {new Date(certificate.completionDate).toLocaleDateString("vi-VN")}
                </p>
              </div>

              <div className={styles.card2}>
                <div className={styles.row2}>
                  <UserIcon size={16} className={styles.box8} />
                  <span className={styles.label2}>Giảng Viên</span>
                </div>
                <p className={styles.text7}>{certificate.instructorName}</p>
              </div>

              <div className={styles.card2}>
                <div className={styles.row2}>
                  <BookOpen size={16} className={styles.box9} />
                  <span className={styles.label2}>Khóa Học</span>
                </div>
                <p className={styles.text7}>{certificate.courseName}</p>
              </div>
            </div>

            {/* Mã Xác Thực */}
            <div className={styles.card3}>
              <p className={styles.text8}>Mã Xác Thực</p>
              <div className={styles.card4}>
                <code className={styles.code}>{certificate.verificationCode}</code>
                <button
                  onClick={handleCopyCode}
                  className={`${styles.button6} ${
                    copiedCode ? styles.button3 : styles.button4
                  }`}
                  title="Copy mã xác thực"
                >
                  {copiedCode ? <CheckCircle size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className={styles.grid2}>
              {/* Tep PDF do MAY CHU dung, khong con goi window.print() nua.
                  Ban in cua trinh duyet phu thuoc vao tung may (le giay, co
                  chu, co in mau nen hay khong) va quan tri thi khong co cach
                  nao xem lai dung ban hoc vien cam. */}
              <a
                href={duongDanPdfChungChi(certificate._id)}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                <Download size={16} />
                Tải PDF
              </a>
              <button onClick={handleShare} className={styles.button5}>
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
