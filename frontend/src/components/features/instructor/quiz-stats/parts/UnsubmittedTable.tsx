import { AlertCircle, Mail } from "lucide-react";

import { INSTRUCTOR_QUIZ_STATS as C } from "@/src/constants/instructor/quiz-stats-page";
import type { QuizStats } from "@/src/services/quizService";

import styles from "../InstructorQuizStats.module.scss";

/** Bang hoc vien chua nop, co nut gui mail nhac. */
export default function UnsubmittedTable({
  list,
}: {
  list: QuizStats["unsubmittedList"] | undefined;
}) {
  const cols = C.unsubmitted.columns;

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
        <tbody className={styles.tbody2}>
          {list?.map((student) => (
            <tr key={student._id} className={styles.row3}>
              <td className={styles.cell3}>
                <AlertCircle size={14} className={styles.box2} />
                {student.name}
              </td>
              <td className={styles.cell4}>{student.email}</td>
              <td className={styles.headCell2}>
                <a
                  href={C.remindMailto(student.email, student.name)}
                  className={styles.link}
                >
                  <Mail size={12} /> {C.unsubmitted.remind}
                </a>
              </td>
            </tr>
          ))}
          {list?.length === 0 && (
            <tr>
              <td colSpan={3} className={styles.cell5}>
                {C.unsubmitted.empty}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
