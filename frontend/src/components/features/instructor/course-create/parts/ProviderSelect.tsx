import { Building2 } from "lucide-react";

import { INSTRUCTOR_COURSE_CREATE as C } from "@/src/constants/instructor/course-create-page";
import type { ProviderData } from "@/src/services/provider";
import type { FieldChangeEvent } from "@/src/types/course-form";

import styles from "../InstructorCourseCreate.module.scss";

interface ProviderSelectProps {
  providers: ProviderData[];
  value: string;
  onChange: (e: FieldChangeEvent) => void;
}

/** Don vi doi tac / truong hoc cap chung chi. */
export default function ProviderSelect({
  providers,
  value,
  onChange,
}: ProviderSelectProps) {
  return (
    <div className={styles.stack2}>
      <label className={styles.fieldLabel4}>
        <Building2 size={16} className={styles.box6} />
        {C.provider.label}
      </label>
      <select
        name="providerId"
        className={styles.select}
        value={value}
        onChange={onChange}
      >
        <option value="">{C.provider.none}</option>
        {providers.map((prov) => (
          <option key={prov._id} value={prov._id}>
            {prov.type === "university"
              ? C.provider.universityPrefix
              : C.provider.companyPrefix}{" "}
            {prov.name}
          </option>
        ))}
      </select>
    </div>
  );
}
