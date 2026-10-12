import { Fragment } from "react";

import type { RichText as RichTextData } from "@/src/types/rich-text";

/** Ve mot doan RichText: chuoi giu nguyen, { strong } thanh <strong>. */
export default function RichText({
  value,
  strongClassName,
}: {
  value: RichTextData;
  strongClassName?: string;
}) {
  return (
    <>
      {value.map((part, i) =>
        typeof part === "string" ? (
          <Fragment key={i}>{part}</Fragment>
        ) : (
          <strong key={i} className={strongClassName}>
            {part.strong}
          </strong>
        ),
      )}
    </>
  );
}
