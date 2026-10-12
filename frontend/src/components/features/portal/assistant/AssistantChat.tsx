"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Trash2, X, Loader2 } from "lucide-react";

import { getErrorMessage } from "@/src/services/apiHelper";

import styles from "./AssistantChat.module.scss";
import HeartBot from "./HeartBot";
import {
  askAssistant,
  getAssistantHistory,
  clearAssistantHistory,
  type AssistantMessage,
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
const LESSON_PROMPTS = [
  "Tóm tắt ý chính của bài này",
  "Giải thích lại phần mình chưa hiểu",
  "Cho mình một ví dụ thực tế",
];

const GENERAL_PROMPTS = [
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
const drawBold = (text: string) =>
  text
    .split(/(\*\*[^*]+\*\*)/g)
    .map((part, i) =>
      part.startsWith("**") && part.endsWith("**") && part.length > 4 ? (
        <strong key={i}>{part.slice(2, -2)}</strong>
      ) : (
        part
      ),
    );

export default function AssistantChatBox({
  courseId,
  lessonId,
  tenBai: lessonTitle,
}: Props) {
  const [openChat, setOpenChat] = useState(false);
  const [message, setMessage] = useState<AssistantMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const listEnd = useRef<HTMLDivElement>(null);

  const maskLesson = Boolean(courseId);
  const suggest = maskLesson ? LESSON_PROMPTS : GENERAL_PROMPTS;

  // Doc lai doan chat cu moi khi doi bai. Lich su luu theo TUNG bai o may chu,
  // nen chuyen bai ma khong nap lai la hien nham doan cua bai truoc.
  //
  // Che do hoi chung khong co buoc nay: may chu khong luu gi ca (khach vang lai
  // thi khong co tai khoan de gan vao), doan chat song trong bo nho trang.
  useEffect(() => {
    if (!openChat || !courseId) return;

    // Co y KHONG setErr(null) o day: goi setState thang trong than effect la
    // mot vong dung hinh thua, va eslint chan luon (react-hooks/set-state-in-effect).
    // Loi da duoc xoa o dung cho gay ra no — luc mo hop va luc gui cau moi.
    let isActive = true;

    getAssistantHistory(courseId, lessonId)
      .then((outcome) => {
        if (isActive) setMessage(outcome.tinNhan ?? []);
      })
      .catch(() => {
        // Khong doc duoc lich su thi van cho hoi tiep — mat lich su kho chiu
        // that, nhung chan luon o nhap thi con te hon.
        if (isActive) setMessage([]);
      });

    return () => {
      isActive = false;
    };
  }, [openChat, courseId, lessonId]);

  // Cuon xuong cuoi moi khi co tin moi hoac khi dang cho tra loi.
  useEffect(() => {
    listEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [message, sending]);

  const send = async (question: string) => {
    const clean = question.trim();
    if (!clean || sending) return;

    setErr(null);
    setInput("");

    // Hien cau hoi ngay, khong cho may chu. Neu goi hong thi go ra o catch —
    // doi 5 giay moi thay cau minh vua go la cam giac rat hong.
    setMessage((old) => [...old, { vaiTro: "nguoiDung", noiDung: clean }]);
    setSending(true);

    try {
      const outcome = await askAssistant({
        cauHoi: clean,
        courseId,
        lessonId,
        // Che do hoi chung: may chu khong luu gi, nen phai tu mang lich su theo
        // thi tro ly moi hieu duoc "cai do", "no" trong cau hoi tiep theo.
        // Che do trong bai thi may chu tu doc lich su cua chinh nguoi dung.
        lichSu: maskLesson ? undefined : message,
      });
      setMessage((old) => [...old, { vaiTro: "troLy", noiDung: outcome.traLoi }]);
    } catch (e) {
      setMessage((old) => old.slice(0, -1));
      setInput(clean);
      setErr(getErrorMessage(e));
    } finally {
      setSending(false);
    }
  };

  const remove = async () => {
    setErr(null);
    setMessage([]);

    // Che do hoi chung khong co gi tren may chu de xoa — doan chat chi nam
    // trong bo nho trang, dat lai state la xong.
    if (!courseId) return;

    try {
      await clearAssistantHistory(courseId, lessonId);
    } catch (e) {
      setErr(getErrorMessage(e));
    }
  };

  if (!openChat) {
    return (
      <button
        onClick={() => {
          setErr(null);
          setOpenChat(true);
        }}
        className={styles.button}
        aria-label={maskLesson ? "Mở trợ giảng AI" : "Mở trợ lý Learning Portal"}
        title={maskLesson ? "Trợ giảng AI" : "Hỏi đáp AI"}
      >
        {/* Chi con hinh con bot, bo chu: nut tron gon o goc phai, khong de len
            noi dung trang tren dien thoai. Ten nut van nam o aria-label/title. */}
        <HeartBot size={60} state={sending ? "working" : "default"} followCursor />
      </button>
    );
  }

  return (
    <div className={styles.overlay}>
      <header className={styles.header}>
        <HeartBot size={32} state={sending ? "working" : "default"} />
        <div className={styles.box}>
          <p className={styles.text}>
            {maskLesson ? "Trợ giảng AI" : "Hỏi đáp Learning Portal"}
          </p>
          {maskLesson && lessonTitle && <p className={styles.text2}>{lessonTitle}</p>}
        </div>

        <button
          onClick={remove}
          className={styles.button2}
          aria-label="Xóa đoạn trò chuyện"
          title="Xóa đoạn trò chuyện"
        >
          <Trash2 size={16} />
        </button>
        <button
          onClick={() => setOpenChat(false)}
          className={styles.button2}
          aria-label="Đóng"
        >
          <X size={18} />
        </button>
      </header>

      <div className={styles.scroller}>
        {message.length === 0 && !sending && (
          <div className={styles.stack}>
            <p className={styles.text3}>
              {maskLesson
                ? "Hỏi mình bất cứ điều gì về bài học này. Mình không đưa đáp án bài kiểm tra, nhưng sẽ giải thích tới khi bạn hiểu."
                : "Mình trả lời các câu hỏi về Learning Portal: đăng ký, thanh toán, chứng nhận, cách học. Cứ hỏi tự nhiên."}
            </p>
            <div className={styles.row}>
              {suggest.map((g) => (
                <button key={g} onClick={() => send(g)} className={styles.button3}>
                  {g}
                </button>
              ))}
            </div>
          </div>
        )}

        {message.map((m, i) => (
          <div key={i} className={m.vaiTro === "nguoiDung" ? styles.row2 : styles.row3}>
            <p className={m.vaiTro === "nguoiDung" ? styles.text4 : styles.text5}>
              {m.vaiTro === "troLy" ? drawBold(m.noiDung) : m.noiDung}
            </p>
          </div>
        ))}

        {sending && (
          <div className={styles.row3}>
            <p className={styles.text6}>
              <Loader2 size={14} className={styles.spinner} />
              Đang soạn câu trả lời…
            </p>
          </div>
        )}

        {err && <p className={styles.text7}>{err}</p>}

        <div ref={listEnd} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className={styles.form}
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            // Enter gui, Shift+Enter xuong dong. Trong mot o chat thi gui la
            // hanh dong thuong gap hon nhieu so voi xuong dong.
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(input);
            }
          }}
          rows={1}
          maxLength={1000}
          placeholder="Nhập câu hỏi…"
          className={styles.textarea}
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className={styles.button4}
          aria-label="Gửi"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
