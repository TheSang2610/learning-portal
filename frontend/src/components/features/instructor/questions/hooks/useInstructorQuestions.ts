"use client";

import { useCallback, useEffect, useState } from "react";

import { INSTRUCTOR_QUESTIONS as C } from "@/src/constants/instructor/questions-page";
import {
  getInstructorQuestions,
  replyQuestion,
  type InstructorQuestion,
} from "@/src/services/question";

/** Danh sach cau hoi (cho tra loi / tat ca), mo o tra loi va gui tra loi. */
export function useInstructorQuestions() {
  const [list, setList] = useState<InstructorQuestion[]>([]);
  const [total, setTotal] = useState(0);
  const [all, setAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [replying, setReplying] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setErr("");

    try {
      const outcome = await getInstructorQuestions(1, all);
      setList(outcome.danhSach);
      setTotal(outcome.tong);
    } catch (e) {
      setErr(e instanceof Error ? e.message : C.errors.load);
    } finally {
      setLoading(false);
    }
  }, [all]);

  useEffect(() => {
    // Day sang microtask thay vi goi thang trong than effect - xem ghi chu
    // cung kieu o NotificationBell va LessonQa.
    queueMicrotask(load);
  }, [load]);

  /** Bam "Tra loi" lan nua tren cung cau thi dong lai. */
  const toggleReply = (id: string) => {
    setReplying(replying === id ? null : id);
    setReplyText("");
  };

  const send = async (id: string) => {
    const questionItem = replyText.trim();
    if (!questionItem || sending) return;

    setSending(true);

    try {
      const outcome = await replyQuestion(id, questionItem);
      setReplyText("");
      setReplying(null);

      // Dang o che do "chua tra loi" thi cau vua tra loi phai BIEN KHOI danh
      // sach: day la hang doi viec, tra loi xong la xong viec. Che do "tat ca"
      // thi giu lai va cap nhat tai cho.
      if (!all) {
        setList((old) => old.filter((c) => c._id !== id));
        setTotal((n) => Math.max(0, n - 1));
      } else {
        setList((old) =>
          old.map((c) =>
            c._id === id
              ? { ...c, ...outcome.cauHoi, course: c.course, lesson: c.lesson }
              : c,
          ),
        );
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : C.errors.send);
    } finally {
      setSending(false);
    }
  };

  return {
    danhSach: list,
    tong: total,
    tatCa: all,
    setAll,
    loading,
    loi: err,
    replying,
    setReplying,
    replyText,
    setReplyText: (v: string) => setReplyText(v.slice(0, C.maxLength)),
    sending,
    toggleReply,
    gui: send,
  };
}
