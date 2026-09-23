"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, Send, Trash2, X, Loader2 } from "lucide-react";

import { getErrorMessage } from "@/src/services/apiHelper";

import styles from "./AssistantChat.module.scss";
import {
  hoiTroLy,
  layLichSuTroLy,
  xoaLichSuTroLy,
  type TinNhanTroLy,
} from "@/src/services/assistant";

interface Props {
  // Bo trong -> che do HOI CHUNG ve nen tang, khach vang lai cung hoi duoc.
  // Co gia tri -> che do HOI VE BAI HOC, phai dang nhap va da ghi danh.
  courseId?: string;
  lessonId?: string;
  tenBai?: string;
}

// Goi y san cho lan dau mo hop chat. Mot o nhap trong tron khong goi duoc cho
// nguoi dung y tuong nao — do la ly do hay gap nhat khien chuc nang chat bi bo
// khong dung sau lan mo dau tien.
const GOI_Y_BAI = [
  "Tóm tắt ý chính của bài này",
  "Giải thích lại phần mình chưa hiểu",
  "Cho mình một ví dụ thực tế",
];

const GOI_Y_CHUNG = [
  "Làm sao để đăng ký một khóa học?",
  "Thanh toán khóa có phí thế nào?",
  "Lấy chứng nhận ở đâu?",
];

/**
 * Mo hinh tra loi kem danh dau Markdown, hay gap nhat la "**in dam**".
 *
 * Khong nap ca mot thu vien Markdown chi de in dam: tach chuoi roi dung
 * <strong> la du. Quan trong hon, cach nay KHONG dung dangerouslySetInnerHTML,
 * nen khong co duong nao cho chu do mo hinh sinh ra chay nhu HTML trong trang —
 * ma chu do thi mot phan bat nguon tu chinh cau hoi nguoi dung go vao.
 */
const veDam = (chu: string) =>
  chu
    .split(/(\*\*[^*]+\*\*)/g)
    .map((phan, i) =>
      phan.startsWith("**") && phan.endsWith("**") && phan.length > 4 ? (
        <strong key={i}>{phan.slice(2, -2)}</strong>
      ) : (
        phan
      ),
    );

export default function HopChatTroLy({ courseId, lessonId, tenBai }: Props) {
  const [moHop, setMoHop] = useState(false);
  const [tinNhan, setTinNhan] = useState<TinNhanTroLy[]>([]);
  const [oNhap, setONhap] = useState("");
  const [dangGui, setDangGui] = useState(false);
  const [loi, setLoi] = useState<string | null>(null);

  const cuoiDanh = useRef<HTMLDivElement>(null);

  const cheBai = Boolean(courseId);
  const goiY = cheBai ? GOI_Y_BAI : GOI_Y_CHUNG;

  // Doc lai doan chat cu moi khi doi bai. Lich su luu theo TUNG bai o may chu,
  // nen chuyen bai ma khong nap lai la hien nham doan cua bai truoc.
  //
  // Che do hoi chung khong co buoc nay: may chu khong luu gi ca (khach vang lai
  // thi khong co tai khoan de gan vao), doan chat song trong bo nho trang.
  useEffect(() => {
    if (!moHop || !courseId) return;

    // Co y KHONG setLoi(null) o day: goi setState thang trong than effect la
    // mot vong dung hinh thua, va eslint chan luon (react-hooks/set-state-in-effect).
    // Loi da duoc xoa o dung cho gay ra no — luc mo hop va luc gui cau moi.
    let conHieuLuc = true;

    layLichSuTroLy(courseId, lessonId)
      .then((kq) => {
        if (conHieuLuc) setTinNhan(kq.tinNhan ?? []);
      })
      .catch(() => {
        // Khong doc duoc lich su thi van cho hoi tiep — mat lich su kho chiu
        // that, nhung chan luon o nhap thi con te hon.
        if (conHieuLuc) setTinNhan([]);
      });

    return () => {
      conHieuLuc = false;
    };
  }, [moHop, courseId, lessonId]);

  // Cuon xuong cuoi moi khi co tin moi hoac khi dang cho tra loi.
  useEffect(() => {
    cuoiDanh.current?.scrollIntoView({ behavior: "smooth" });
  }, [tinNhan, dangGui]);

  const gui = async (cauHoi: string) => {
    const sach = cauHoi.trim();
    if (!sach || dangGui) return;

    setLoi(null);
    setONhap("");

    // Hien cau hoi ngay, khong cho may chu. Neu goi hong thi go ra o catch —
    // doi 5 giay moi thay cau minh vua go la cam giac rat hong.
    setTinNhan((cu) => [...cu, { vaiTro: "nguoiDung", noiDung: sach }]);
    setDangGui(true);

    try {
      const kq = await hoiTroLy({
        cauHoi: sach,
        courseId,
        lessonId,
        // Che do hoi chung: may chu khong luu gi, nen phai tu mang lich su theo
        // thi tro ly moi hieu duoc "cai do", "no" trong cau hoi tiep theo.
        // Che do trong bai thi may chu tu doc lich su cua chinh nguoi dung.
        lichSu: cheBai ? undefined : tinNhan,
      });
      setTinNhan((cu) => [...cu, { vaiTro: "troLy", noiDung: kq.traLoi }]);
    } catch (e) {
      setTinNhan((cu) => cu.slice(0, -1));
      setONhap(sach);
      setLoi(getErrorMessage(e));
    } finally {
      setDangGui(false);
    }
  };

  const xoa = async () => {
    setLoi(null);
    setTinNhan([]);

    // Che do hoi chung khong co gi tren may chu de xoa — doan chat chi nam
    // trong bo nho trang, dat lai state la xong.
    if (!courseId) return;

    try {
      await xoaLichSuTroLy(courseId, lessonId);
    } catch (e) {
      setLoi(getErrorMessage(e));
    }
  };

  if (!moHop) {
    return (
      <button
        onClick={() => {
          setLoi(null);
          setMoHop(true);
        }}
        className={styles.button}
        aria-label={cheBai ? "Mở trợ giảng AI" : "Mở trợ lý Learning Portal"}
      >
        <Bot size={20} />
        <span className={styles.label}>{cheBai ? "Trợ giảng AI" : "Hỏi đáp AI"}</span>
      </button>
    );
  }

  return (
    <div className={styles.overlay}>
      <header className={styles.header}>
        <Bot size={18} />
        <div className={styles.box}>
          <p className={styles.text}>
            {cheBai ? "Trợ giảng AI" : "Hỏi đáp Learning Portal"}
          </p>
          {cheBai && tenBai && <p className={styles.text2}>{tenBai}</p>}
        </div>

        <button
          onClick={xoa}
          className={styles.button2}
          aria-label="Xóa đoạn trò chuyện"
          title="Xóa đoạn trò chuyện"
        >
          <Trash2 size={16} />
        </button>
        <button
          onClick={() => setMoHop(false)}
          className={styles.button2}
          aria-label="Đóng"
        >
          <X size={18} />
        </button>
      </header>

      <div className={styles.scroller}>
        {tinNhan.length === 0 && !dangGui && (
          <div className={styles.stack}>
            <p className={styles.text3}>
              {cheBai
                ? "Hỏi mình bất cứ điều gì về bài học này. Mình không đưa đáp án bài kiểm tra, nhưng sẽ giải thích tới khi bạn hiểu."
                : "Mình trả lời các câu hỏi về Learning Portal: đăng ký, thanh toán, chứng nhận, cách học. Cứ hỏi tự nhiên."}
            </p>
            <div className={styles.row}>
              {goiY.map((g) => (
                <button key={g} onClick={() => gui(g)} className={styles.button3}>
                  {g}
                </button>
              ))}
            </div>
          </div>
        )}

        {tinNhan.map((m, i) => (
          <div key={i} className={m.vaiTro === "nguoiDung" ? styles.row2 : styles.row3}>
            <p className={m.vaiTro === "nguoiDung" ? styles.text4 : styles.text5}>
              {m.vaiTro === "troLy" ? veDam(m.noiDung) : m.noiDung}
            </p>
          </div>
        ))}

        {dangGui && (
          <div className={styles.row3}>
            <p className={styles.text6}>
              <Loader2 size={14} className={styles.spinner} />
              Đang soạn câu trả lời…
            </p>
          </div>
        )}

        {loi && <p className={styles.text7}>{loi}</p>}

        <div ref={cuoiDanh} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          gui(oNhap);
        }}
        className={styles.form}
      >
        <textarea
          value={oNhap}
          onChange={(e) => setONhap(e.target.value)}
          onKeyDown={(e) => {
            // Enter gui, Shift+Enter xuong dong. Trong mot o chat thi gui la
            // hanh dong thuong gap hon nhieu so voi xuong dong.
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              gui(oNhap);
            }
          }}
          rows={1}
          maxLength={1000}
          placeholder="Nhập câu hỏi…"
          className={styles.textarea}
        />
        <button
          type="submit"
          disabled={dangGui || !oNhap.trim()}
          className={styles.button4}
          aria-label="Gửi"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
