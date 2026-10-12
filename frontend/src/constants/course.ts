import type { SelectOption } from "@/src/types/course-form";

/** Trinh do khoa hoc - gia tri gui len backend va nhan hien thi. */
export const COURSE_LEVEL_OPTIONS: readonly SelectOption[] = [
  { value: "beginner", label: "Cơ bản (Beginner)" },
  { value: "intermediate", label: "Trung cấp (Intermediate)" },
  { value: "advanced", label: "Nâng cao (Advanced)" },
];

/** Gia tri mac dinh khi chua chon doi tac: he thong LMS tu cap chung chi. */
export const PROVIDER_NONE_LABEL = "-- Hệ thống LMS cấp độc lập --";
