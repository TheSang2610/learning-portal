import Link from "next/link";
import { CircleCheck, Send } from "lucide-react";

import Avatar from "@/src/components/ui/Avatar";
import { INSTRUCTOR_QUESTIONS as C } from "@/src/constants/instructor/questions-page";
import { gap, displayName } from "@/src/lib/time";
import type { InstructorQuestion } from "@/src/services/question";

import styles from "../InstructorQuestions.module.scss";

const nameOf = (n: { name?: string; email?: string } | null): string =>
  displayName(n, C.item.studentFallback);

interface QuestionCardProps {
  c: InstructorQuestion;
  openId: boolean;
  replyText: string;
  sending: boolean;
  onToggle: () => void;
  onText: (v: string) => void;
  onCancel: () => void;
  onSend: () => void;
}

/** Mot cau hoi: khoa/bai, nguoi hoi, cac tra loi va o tra loi cua giang vien. */
export default function QuestionCard({
  c,
  openId,
  replyText,
  sending,
  onToggle,
  onText,
  onCancel,
  onSend,
}: QuestionCardProps) {
  return (
    <article className={styles.article}>
      {/* Ten khoa va ten bai la thu quan trong nhat o man hinh nay: danh
          sach tron cau hoi cua moi khoa, khong biet cau nay o dau thi
          khong tra loi duoc. */}
      <div className={styles.row3}>
        <span className={styles.label}>{c.course?.title || C.item.deletedCourse}</span>
        {c.lesson?.title && <span className={styles.label2}>· {c.lesson.title}</span>}
        {c.daGiaiQuyet && (
          <span className={styles.row4}>
            <CircleCheck size={11} /> {C.item.answered}
          </span>
        )}
      </div>

      <div className={styles.row5}>
        <Avatar
          src={c.student?.avatar}
          ten={nameOf(c.student)}
          size={36}
          letterBackground={styles.box6}
        />

        <div className={styles.box3}>
          <div className={styles.row6}>
            <span className={styles.label3}>{nameOf(c.student)}</span>
            <span className={styles.label4}>{gap(c.createdAt)}</span>
          </div>

          <p className={styles.text4}>{c.noiDung}</p>

          {c.traLoi.length > 0 && (
            <div className={styles.col2}>
              {c.traLoi.map((t) => (
                <div key={t._id}>
                  <span className={styles.label5}>{nameOf(t.user)}</span>
                  <p className={styles.text5}>{t.noiDung}</p>
                </div>
              ))}
            </div>
          )}

          <div className={styles.row7}>
            <button type="button" onClick={onToggle} className={styles.button3}>
              {C.item.reply}
            </button>

            {c.course?.slug && (
              <Link href={C.courseHref(c.course.slug)} className={styles.box4}>
                {C.item.openCourse}
              </Link>
            )}
          </div>

          {openId && (
            <div className={styles.box5}>
              <textarea
                id={C.replyInputId(c._id)}
                value={replyText}
                onChange={(e) => onText(e.target.value)}
                rows={3}
                placeholder={C.item.replyPlaceholder}
                className={styles.textarea}
              />
              <div className={styles.row8}>
                <button type="button" onClick={onCancel} className={styles.button4}>
                  {C.item.cancel}
                </button>
                <button
                  type="button"
                  onClick={onSend}
                  disabled={!replyText.trim() || sending}
                  className={styles.button5}
                >
                  <Send size={14} />
                  <span>{C.item.send}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
