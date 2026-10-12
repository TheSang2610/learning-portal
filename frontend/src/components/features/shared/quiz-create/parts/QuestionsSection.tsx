import { HelpCircle, Plus, Trash2 } from "lucide-react";

import { QUIZ_CREATE as C } from "@/src/constants/shared/quiz-create-page";
import type { QuizQuestionsEditor } from "@/src/hooks/useQuizQuestions";

import styles from "../QuizCreate.module.scss";

/** Khoi 2: bo cau hoi dong - them/xoa cau, them phuong an, chon dap an dung. */
export default function QuestionsSection({ editor }: { editor: QuizQuestionsEditor }) {
  const { questions } = editor;

  return (
    <div className={styles.stack}>
      <div className={styles.row2}>
        <h2 className={styles.heading2}>
          <HelpCircle size={16} className={styles.box5} />{" "}
          {C.questions.heading(questions.length)}
        </h2>
        <button type="button" onClick={editor.addQuestion} className={styles.button}>
          <Plus size={14} /> {C.questions.add}
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

          <div className={styles.grid3}>
            <div className={styles.box6}>
              <label className={styles.fieldLabel2}>{C.questions.text(qIndex + 1)}</label>
              <input
                type="text"
                placeholder={C.questions.textPlaceholder}
                className={styles.input}
                value={question.text}
                onChange={(e) =>
                  editor.handleQuestionChange(qIndex, "text", e.target.value)
                }
                required
              />
            </div>
            <div>
              <label className={styles.fieldLabel2}>{C.questions.points}</label>
              <input
                type="number"
                className={styles.input2}
                value={question.points}
                onChange={(e) =>
                  editor.handleQuestionChange(qIndex, "points", Number(e.target.value))
                }
              />
            </div>
          </div>

          <div className={styles.card4}>
            <div className={styles.row3}>
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
              <div key={oIndex} className={styles.row4}>
                <input
                  type="radio"
                  name={C.questions.radioName(qIndex)}
                  checked={option.isCorrect}
                  onChange={() =>
                    editor.handleOptionChange(qIndex, oIndex, "isCorrect", true)
                  }
                  className={styles.input3}
                />
                <input
                  type="text"
                  placeholder={C.questions.optionPlaceholder(oIndex + 1)}
                  className={styles.input4}
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
