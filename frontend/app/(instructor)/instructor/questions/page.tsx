"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { CircleCheck, MessageCircleQuestion, Send } from "lucide-react";

import AnhDaiDien from "@/src/components/ui/Avatar";

import styles from "./page.module.scss";
import {
  layCauHoiChoGiangVien,
  traLoiCauHoi,
  type CauHoiChoGiangVien,
} from "@/src/services/question";

const DAI_TOI_DA = 2000;

const khoangCach = (moc: string): string => {
  const giay = Math.floor((Date.now() - new Date(moc).getTime()) / 1000);

  if (giay < 60) return "vừa xong";
  if (giay < 3600) return `${Math.floor(giay / 60)} phút trước`;
  if (giay < 86400) return `${Math.floor(giay / 3600)} giờ trước`;
  if (giay < 604800) return `${Math.floor(giay / 86400)} ngày trước`;

  return new Date(moc).toLocaleDateString("vi-VN");
};

const tenCua = (n: { name?: string; email?: string } | null): string =>
  n?.name?.trim() || n?.email?.split("@")[0] || "Học viên";

export default function InstructorHoiDapPage() {
  const [danhSach, setDanhSach] = useState<CauHoiChoGiangVien[]>([]);
  const [tong, setTong] = useState(0);
  const [tatCa, setTatCa] = useState(false);
  const [dangTai, setDangTai] = useState(true);
  const [loi, setLoi] = useState("");

  const [dangTraLoi, setDangTraLoi] = useState<string | null>(null);
  const [chuTraLoi, setChuTraLoi] = useState("");
  const [dangGui, setDangGui] = useState(false);

  const nap = useCallback(async () => {
    setDangTai(true);
    setLoi("");

    try {
      const kq = await layCauHoiChoGiangVien(1, tatCa);
      setDanhSach(kq.danhSach);
      setTong(kq.tong);
    } catch (e) {
      setLoi(e instanceof Error ? e.message : "Không tải được danh sách câu hỏi.");
    } finally {
      setDangTai(false);
    }
  }, [tatCa]);

  useEffect(() => {
    // Day sang microtask thay vi goi thang trong than effect - xem ghi chu
    // cung kieu o ChuongThongBao va HoiDapBaiHoc.
    queueMicrotask(nap);
  }, [nap]);

  const gui = async (id: string) => {
    const cau = chuTraLoi.trim();
    if (!cau || dangGui) return;

    setDangGui(true);

    try {
      const kq = await traLoiCauHoi(id, cau);
      setChuTraLoi("");
      setDangTraLoi(null);

      // Dang o che do "chua tra loi" thi cau vua tra loi phai BIEN KHOI danh
      // sach: day la hang doi viec, tra loi xong la xong viec. Che do "tat ca"
      // thi giu lai va cap nhat tai cho.
      if (!tatCa) {
        setDanhSach((cu) => cu.filter((c) => c._id !== id));
        setTong((n) => Math.max(0, n - 1));
      } else {
        setDanhSach((cu) =>
          cu.map((c) =>
            c._id === id ? { ...c, ...kq.cauHoi, course: c.course, lesson: c.lesson } : c,
          ),
        );
      }
    } catch (e) {
      setLoi(e instanceof Error ? e.message : "Không gửi được câu trả lời.");
    } finally {
      setDangGui(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.row}>
        <MessageCircleQuestion size={22} className={styles.box} />
        <h1 className={styles.title}>Câu hỏi của học viên</h1>
      </div>

      <p className={styles.text}>
        {dangTai
          ? "Đang tải…"
          : tatCa
            ? `${tong} câu hỏi trong các khóa bạn dạy.`
            : `${tong} câu đang chờ bạn trả lời.`}
      </p>

      <div className={styles.row2}>
        <button
          type="button"
          onClick={() => setTatCa(false)}
          className={`${styles.button6} ${!tatCa ? styles.button : styles.button2}`}
        >
          Chờ trả lời
        </button>
        <button
          type="button"
          onClick={() => setTatCa(true)}
          className={`${styles.button6} ${tatCa ? styles.button : styles.button2}`}
        >
          Tất cả
        </button>
      </div>

      {loi && <p className={styles.text2}>{loi}</p>}

      {!dangTai && danhSach.length === 0 && (
        <div className={styles.card}>
          <CircleCheck size={30} className={styles.box2} />
          <p className={styles.text3}>
            {tatCa
              ? "Chưa có câu hỏi nào trong các khóa bạn dạy."
              : "Không còn câu hỏi nào đang chờ. Bạn đã trả lời hết."}
          </p>
        </div>
      )}

      <div className={styles.col}>
        {danhSach.map((c) => (
          <article key={c._id} className={styles.article}>
            {/* Ten khoa va ten bai la thu quan trong nhat o man hinh nay: danh
                sach tron cau hoi cua moi khoa, khong biet cau nay o dau thi
                khong tra loi duoc. */}
            <div className={styles.row3}>
              <span className={styles.label}>{c.course?.title || "Khóa đã xóa"}</span>
              {c.lesson?.title && (
                <span className={styles.label2}>· {c.lesson.title}</span>
              )}
              {c.daGiaiQuyet && (
                <span className={styles.row4}>
                  <CircleCheck size={11} /> Đã trả lời
                </span>
              )}
            </div>

            <div className={styles.row5}>
              <AnhDaiDien
                src={c.student?.avatar}
                ten={tenCua(c.student)}
                size={36}
                nenChuCai={styles.box6}
              />

              <div className={styles.box3}>
                <div className={styles.row6}>
                  <span className={styles.label3}>{tenCua(c.student)}</span>
                  <span className={styles.label4}>{khoangCach(c.createdAt)}</span>
                </div>

                <p className={styles.text4}>{c.noiDung}</p>

                {c.traLoi.length > 0 && (
                  <div className={styles.col2}>
                    {c.traLoi.map((t) => (
                      <div key={t._id}>
                        <span className={styles.label5}>{tenCua(t.user)}</span>
                        <p className={styles.text5}>{t.noiDung}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className={styles.row7}>
                  <button
                    type="button"
                    onClick={() => {
                      setDangTraLoi(dangTraLoi === c._id ? null : c._id);
                      setChuTraLoi("");
                    }}
                    className={styles.button3}
                  >
                    Trả lời
                  </button>

                  {c.course?.slug && (
                    <Link href={`/course?slug=${c.course.slug}`} className={styles.box4}>
                      Mở khóa học
                    </Link>
                  )}
                </div>

                {dangTraLoi === c._id && (
                  <div className={styles.box5}>
                    <textarea
                      id={`gv-tra-loi-${c._id}`}
                      value={chuTraLoi}
                      onChange={(e) => setChuTraLoi(e.target.value.slice(0, DAI_TOI_DA))}
                      rows={3}
                      placeholder="Nhập câu trả lời…"
                      className={styles.textarea}
                    />
                    <div className={styles.row8}>
                      <button
                        type="button"
                        onClick={() => setDangTraLoi(null)}
                        className={styles.button4}
                      >
                        Hủy
                      </button>
                      <button
                        type="button"
                        onClick={() => gui(c._id)}
                        disabled={!chuTraLoi.trim() || dangGui}
                        className={styles.button5}
                      >
                        <Send size={14} /> Gửi
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
