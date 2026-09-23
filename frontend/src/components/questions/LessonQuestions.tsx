"use client";

import { useCallback, useEffect, useState } from "react";
import { CircleCheck, MessageCircleQuestion, Send, Trash2 } from "lucide-react";

import AnhDaiDien from "@/src/components/ui/Avatar";

import styles from "./LessonQuestions.module.scss";
import {
  dangCauHoi,
  layCauHoi,
  traLoiCauHoi,
  xoaCauHoi,
  type CauHoiHoiDap,
  type VaiTroTraLoi,
} from "@/src/services/question";

const DAI_TOI_DA = 2000;

// Nhan vai tro. Chi hien voi giang vien va quan tri: "Học viên" la truong hop
// mac dinh, gan nhan cho moi nguoi thi cai nhan mat het tac dung phan biet.
const NHAN_VAI_TRO: Partial<Record<VaiTroTraLoi, { chu: string; lop: string }>> = {
  giangVien: { chu: "Giảng viên", lop: styles.nhanGiangVien },
  quanTri: { chu: "Quản trị", lop: styles.nhanQuanTri },
};

const khoangCach = (moc: string): string => {
  const giay = Math.floor((Date.now() - new Date(moc).getTime()) / 1000);

  if (giay < 60) return "vừa xong";
  if (giay < 3600) return `${Math.floor(giay / 60)} phút trước`;
  if (giay < 86400) return `${Math.floor(giay / 3600)} giờ trước`;
  if (giay < 604800) return `${Math.floor(giay / 86400)} ngày trước`;

  return new Date(moc).toLocaleDateString("vi-VN");
};

const tenCua = (n: { name?: string; email?: string } | null): string =>
  n?.name?.trim() || n?.email?.split("@")[0] || "Người dùng";

export default function HoiDapBaiHoc({
  courseId,
  lessonId,
}: {
  courseId: string;
  lessonId: string;
}) {
  const [danhSach, setDanhSach] = useState<CauHoiHoiDap[]>([]);
  const [vaiTro, setVaiTro] = useState<VaiTroTraLoi>("hocVien");
  const [dangTai, setDangTai] = useState(true);
  const [loi, setLoi] = useState("");

  const [cauMoi, setCauMoi] = useState("");
  const [dangGui, setDangGui] = useState(false);

  // Dang mo o tra loi cua cau nao. Mot o duy nhat tai mot thoi diem: mo tat ca
  // cung luc thi tren dien thoai man hinh day o nhap, khong con thay cau hoi.
  const [dangTraLoi, setDangTraLoi] = useState<string | null>(null);
  const [chuTraLoi, setChuTraLoi] = useState("");

  const nap = useCallback(async () => {
    setDangTai(true);
    setLoi("");

    try {
      const kq = await layCauHoi(courseId, lessonId);
      setDanhSach(kq.danhSach);
      setVaiTro(kq.vaiTro);
    } catch (e) {
      setLoi(e instanceof Error ? e.message : "Không tải được phần hỏi đáp.");
    } finally {
      setDangTai(false);
    }
  }, [courseId, lessonId]);

  useEffect(() => {
    if (!courseId || !lessonId) return;

    // Day sang microtask thay vi goi thang trong than effect: goi thang la mot
    // vong ve lai noi tiep ngay sau lan ve dau, va react-hooks/set-state-in-effect
    // chan dung cho nay. Khong ai thay khac biet - nap() la mot luot goi mang,
    // luon cham hon mot khung hinh.
    queueMicrotask(nap);
  }, [courseId, lessonId, nap]);

  const guiCauHoi = async () => {
    const cau = cauMoi.trim();
    if (cau.length < 5 || dangGui) return;

    setDangGui(true);
    setLoi("");

    try {
      const kq = await dangCauHoi({ courseId, lessonId, noiDung: cau });
      // Chen len dau thay vi nap lai ca danh sach: nguoi dung thay ngay cau vua
      // gui, va khong mat vi tri cuon.
      setDanhSach((cu) => [kq.cauHoi, ...cu]);
      setCauMoi("");
    } catch (e) {
      setLoi(e instanceof Error ? e.message : "Không đăng được câu hỏi.");
    } finally {
      setDangGui(false);
    }
  };

  const guiTraLoi = async (id: string) => {
    const cau = chuTraLoi.trim();
    if (!cau || dangGui) return;

    setDangGui(true);
    setLoi("");

    try {
      const kq = await traLoiCauHoi(id, cau);
      setDanhSach((cu) => cu.map((c) => (c._id === id ? kq.cauHoi : c)));
      setChuTraLoi("");
      setDangTraLoi(null);
    } catch (e) {
      setLoi(e instanceof Error ? e.message : "Không gửi được câu trả lời.");
    } finally {
      setDangGui(false);
    }
  };

  const xoa = async (id: string) => {
    // Bo khoi danh sach ngay roi moi goi may chu. Hong thi nap lai - trang thai
    // that luon o may chu, cai tren man hinh chi la ban sao.
    const cu = danhSach;
    setDanhSach((ds) => ds.filter((c) => c._id !== id));

    try {
      await xoaCauHoi(id);
    } catch {
      setDanhSach(cu);
      setLoi("Không xóa được câu hỏi.");
    }
  };

  return (
    <section className={styles.section}>
      <div className={styles.row}>
        <MessageCircleQuestion size={20} className={styles.box} />
        <h2 className={styles.heading}>Hỏi đáp với giảng viên</h2>
      </div>

      {/* Noi ro day khong phai tro ly AI. Hai cho hoi nam canh nhau trong cung
          mot trang, khong phan biet thi hoc vien hoi nguoi that roi ngoi cho
          cau tra loi tuc thi. */}
      <p className={styles.text}>
        Câu hỏi ở đây do giảng viên trả lời nên cần thời gian. Muốn có câu trả lời ngay,
        bạn dùng trợ lý AI ở góc màn hình.
      </p>

      <div className={styles.box2}>
        <textarea
          id="hoi-dap-cau-moi"
          value={cauMoi}
          onChange={(e) => setCauMoi(e.target.value.slice(0, DAI_TOI_DA))}
          rows={3}
          placeholder="Bạn chưa hiểu chỗ nào trong bài này?"
          className={styles.textarea}
        />

        <div className={styles.row2}>
          <span className={styles.label}>
            {cauMoi.length}/{DAI_TOI_DA}
          </span>

          <button
            type="button"
            onClick={guiCauHoi}
            disabled={cauMoi.trim().length < 5 || dangGui}
            className={styles.row3}
          >
            <Send size={16} /> Gửi câu hỏi
          </button>
        </div>
      </div>

      {loi && <p className={styles.text2}>{loi}</p>}

      {dangTai && <p className={styles.text3}>Đang tải…</p>}

      {!dangTai && danhSach.length === 0 && (
        <p className={styles.text3}>
          Chưa có câu hỏi nào cho bài này. Bạn hỏi câu đầu tiên nhé.
        </p>
      )}

      <div className={styles.col}>
        {danhSach.map((c) => (
          <article key={c._id} className={styles.article}>
            <div className={styles.row4}>
              <AnhDaiDien
                src={c.student?.avatar}
                ten={tenCua(c.student)}
                size={36}
                nenChuCai={styles.box5}
              />

              <div className={styles.box3}>
                <div className={styles.row5}>
                  <span className={styles.label2}>{tenCua(c.student)}</span>
                  <span className={styles.label3}>{khoangCach(c.createdAt)}</span>

                  {c.daGiaiQuyet && (
                    <span className={styles.row6}>
                      <CircleCheck size={12} /> Đã trả lời
                    </span>
                  )}
                </div>

                {/* whitespace-pre-wrap: hoc vien xuong dong de tach y, ep mot
                    dong lam cau hoi dai thanh mot khoi chu khong doc noi. */}
                <p className={styles.text4}>{c.noiDung}</p>

                <div className={styles.row7}>
                  <button
                    type="button"
                    onClick={() => {
                      setDangTraLoi(dangTraLoi === c._id ? null : c._id);
                      setChuTraLoi("");
                    }}
                    className={styles.button}
                  >
                    Trả lời
                  </button>

                  {/* Nut xoa chi hien voi nguoi co the xoa duoc. May chu van kiem
                      lai lan nua - an nut khong phai la kiem quyen. */}
                  {vaiTro !== "hocVien" && (
                    <button
                      type="button"
                      onClick={() => xoa(c._id)}
                      className={styles.button2}
                    >
                      <Trash2 size={12} /> Xóa
                    </button>
                  )}
                </div>

                {c.traLoi.length > 0 && (
                  <div className={styles.col2}>
                    {c.traLoi.map((t) => {
                      const nhan = NHAN_VAI_TRO[t.vaiTro];

                      return (
                        <div key={t._id} className={styles.row8}>
                          <AnhDaiDien
                            src={t.user?.avatar}
                            ten={tenCua(t.user)}
                            size={28}
                            nenChuCai={styles.box5}
                          />
                          <div className={styles.box3}>
                            <div className={styles.row5}>
                              <span className={styles.label2}>{tenCua(t.user)}</span>
                              {nhan && (
                                <span className={`${styles.label4} ${nhan.lop}`}>
                                  {nhan.chu}
                                </span>
                              )}
                              <span className={styles.label3}>
                                {khoangCach(t.createdAt)}
                              </span>
                            </div>
                            <p className={styles.text5}>{t.noiDung}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {dangTraLoi === c._id && (
                  <div className={styles.box4}>
                    <textarea
                      id={`hoi-dap-tra-loi-${c._id}`}
                      value={chuTraLoi}
                      onChange={(e) => setChuTraLoi(e.target.value.slice(0, DAI_TOI_DA))}
                      rows={2}
                      placeholder="Nhập câu trả lời…"
                      className={styles.textarea2}
                    />
                    <div className={styles.row9}>
                      <button
                        type="button"
                        onClick={() => setDangTraLoi(null)}
                        className={styles.button3}
                      >
                        Hủy
                      </button>
                      <button
                        type="button"
                        onClick={() => guiTraLoi(c._id)}
                        disabled={!chuTraLoi.trim() || dangGui}
                        className={styles.button4}
                      >
                        Gửi
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
