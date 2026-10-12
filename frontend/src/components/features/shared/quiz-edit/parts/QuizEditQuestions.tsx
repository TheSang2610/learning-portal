import { HelpCircle, Trash2 } from "lucide-react";

import { QUIZ_EDIT as C } from "@/src/constants/shared/quiz-edit-page";
import type { QuizQuestionsEditor } from "@/src/hooks/useQuizQuestions";

import styles from "../QuizEdit.module.scss";

/** Danh sach cau hoi dang sua - them/xoa cau, them phuong an, chon dap an. */
export default function QuizEditQuestions({ editor }: { editor: QuizQuestionsEditor }) {
  const { questions } = editor;

  return (
    <div className={styles.stack}>
      <div className={styles.row}>
        <h2 className={styles.heading}>
          <HelpCircle size={16} className={styles.box5} />{" "}
          {C.questions.heading(questions.length)}
        </h2>
        <button type="button" onClick={editor.addQuestion} className={styles.button}>
          {C.questions.add}
        </button>
      </div>

      {questions.map((question, qIndex) => (
        <div key={qIndex} className={styles.card3}>
          <button
            type="button"
            onClick={() => editor.removeQuestion(qIndex)}
            className={styles.button2}
          >
            <Trash2 size={16} />
          </button>
          <div className={styles.grid2}>
            <input
              type="text"
              className={styles.input3}
              value={question.text}
              onChange={(e) =>
                editor.handleQuestionChange(qIndex, "text", e.target.value)
              }
              placeholder={C.questions.textPlaceholder}
              required
            />
            <input
              type="number"
              className={styles.input4}
              value={question.points}
              onChange={(e) =>
                editor.handleQuestionChange(qIndex, "points", Number(e.target.value))
              }
            />
          </div>

          <div className={styles.card4}>
            <div className={styles.row}>
              <span className={styles.label}>{C.questions.options}</span>
              <button
                type="button"
                onClick={() => editor.addOption(qIndex)}
                className={styles.button3}
              >
                {C.questions.addOption}
              </button>
            </div>
            {question.options.map((option, oIndex) => (
              <div key={oIndex} className={styles.row2}>
                <input
                  type="radio"
                  name={C.questions.radioName(qIndex)}
                  checked={option.isCorrect}
                  onChange={() =>
                    editor.handleOptionChange(qIndex, oIndex, "isCorrect", true)
                  }
                  className={styles.input5}
                />
                <input
                  type="text"
                  className={styles.input6}
                  value={option.text}
                  onChange={(e) =>
                    editor.handleOptionChange(qIndex, oIndex, "text", e.target.value)
                  }
                  required
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
