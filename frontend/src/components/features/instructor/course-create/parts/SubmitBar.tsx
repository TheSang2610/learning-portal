import { Sparkles } from "lucide-react";

import { INSTRUCTOR_COURSE_CREATE as C } from "@/src/constants/instructor/course-create-page";

import styles from "../InstructorCourseCreate.module.scss";

export default function SubmitBar({ loading }: { loading: boolean }) {
  return (
    <div className={styles.box10}>
      <button
        type="submit"
        disabled={loading}
        className={`${styles.button6} ${loading ? styles.button3 : styles.button4}`}
      >
        <Sparkles size={16} />
        {loading ? C.submit.busy : C.submit.idle}
      </button>
    </div>
  );
}
