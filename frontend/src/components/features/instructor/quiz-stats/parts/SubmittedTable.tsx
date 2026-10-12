import { CheckCircle, RotateCcw, XCircle } from "lucide-react";

import { INSTRUCTOR_QUIZ_STATS as C } from "@/src/constants/instructor/quiz-stats-page";
import type { QuizStats } from "@/src/services/quizService";

import styles from "../InstructorQuizStats.module.scss";

interface SubmittedTableProps {
  list: QuizStats["submittedList"] | undefined;
  onRetry: (studentId: string, studentName: string) => void;
}

/** Bang hoc vien da nop bai: diem, dat/khong dat, thoi gian, cho lam lai. */
export default function SubmittedTable({ list, onRetry }: SubmittedTableProps) {
  const cols = C.submitted.columns;

  return (
    <div className={styles.card2}>
      <table className={styles.table}>
        <thead>
          <tr className={styles.row2}>
            {cols.map((col, i) => (
              <th
                key={col}
                className={i === cols.length - 1 ? styles.headCell2 : styles.headCell}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={styles.tbody}>
          {list?.map((item) => (
            <tr key={item._id} className={styles.row3}>
              <td className={styles.headCell}>
                <p className={styles.text7}>{item.student?.name}</p>
                <p className={styles.text8}>{item.student?.email}</p>
              </td>
              <td className={styles.headCell}>
                <span className={styles.label2}>
                  {item.score} {C.submitted.points}
                </span>
                <span className={styles.label3}>
                  {C.submitted.accuracy(item.percentage)}
                </span>
              </td>
              <td className={styles.headCell}>
                {item.passed ? (
                  <span className={styles.card3}>
                    <CheckCircle size={12} /> {C.submitted.passed}
                  </span>
                ) : (
                  <span className={styles.card4}>
                    <XCircle size={12} /> {C.submitted.failed}
                  </span>
                )}
              </td>
              <td className={styles.cell}>
                {new Date(item.submittedAt).toLocaleString("vi-VN")}
                <p className={styles.text9}>{C.submitted.attempt(item.attemptNumber)}</p>
              </td>
              <td className={styles.headCell2}>
                <button
                  onClick={() => onRetry(item.student?._id, item.student?.name)}
                  className={`${styles.button10} ${
                    !item.passed ? styles.button5 : styles.button6
                  }`}
                >
                  <RotateCcw size={12} />
                  {C.submitted.retry}
                </button>
              </td>
            </tr>
          ))}
          {list?.length === 0 && (
            <tr>
              <td colSpan={5} className={styles.cell2}>
                {C.submitted.empty}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
