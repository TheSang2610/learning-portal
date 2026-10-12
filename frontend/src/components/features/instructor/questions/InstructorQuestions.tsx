"use client";

import { useInstructorQuestions } from "./hooks/useInstructorQuestions";
import QuestionCard from "./parts/QuestionCard";
import QuestionsEmpty from "./parts/QuestionsEmpty";
import QuestionsToolbar from "./parts/QuestionsToolbar";
import styles from "./InstructorQuestions.module.scss";

/** Trang /instructor/questions - hang doi cau hoi cua hoc vien. */
export default function InstructorQuestions() {
  const q = useInstructorQuestions();

  return (
    <div className={styles.container}>
      <QuestionsToolbar
        loading={q.loading}
        tatCa={q.tatCa}
        tong={q.tong}
        onAll={q.setAll}
      />

      {q.loi && <p className={styles.text2}>{q.loi}</p>}

      {!q.loading && q.danhSach.length === 0 && <QuestionsEmpty tatCa={q.tatCa} />}

      <div className={styles.col}>
        {q.danhSach.map((c) => (
          <QuestionCard
            key={c._id}
            c={c}
            openId={q.replying === c._id}
            replyText={q.replyText}
            sending={q.sending}
            onToggle={() => q.toggleReply(c._id)}
            onText={q.setReplyText}
            onCancel={() => q.setReplying(null)}
            onSend={() => q.gui(c._id)}
          />
        ))}
      </div>
    </div>
  );
}
