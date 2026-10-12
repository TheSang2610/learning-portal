import { ChevronLeft, ChevronRight } from "lucide-react";

import { PAGER_TEXT } from "@/src/constants/common";

interface PagerProps {
  page: number;
  pages: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  /** Lop scss cua trang dung no - moi trang admin co bo lop rieng. */
  classes: { wrap: string; info: string; group: string; button: string };
  iconSize?: number;
  /** Ghi chu "Trước" / "Sau" canh mui ten (mac dinh co). */
  withLabels?: boolean;
}

/**
 * Thanh "Trang x / y" + nut truoc / sau cua cac bang admin. Chi hien khi co
 * tu hai trang tro len. Truoc day bon trang admin chep cung mot doan nay.
 */
export default function Pager({
  page,
  pages,
  setPage,
  classes,
  iconSize = 14,
  withLabels = true,
}: PagerProps) {
  if (pages <= 1) return null;

  return (
    <div className={classes.wrap}>
      <p className={classes.info}>{PAGER_TEXT.info(page, pages)}</p>
      <div className={classes.group}>
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
          className={classes.button}
        >
          <ChevronLeft size={iconSize} />
          {withLabels && ` ${PAGER_TEXT.prev}`}
        </button>
        <button
          onClick={() => setPage((p) => Math.min(pages, p + 1))}
          disabled={page >= pages}
          className={classes.button}
        >
          {withLabels && `${PAGER_TEXT.next} `}
          <ChevronRight size={iconSize} />
        </button>
      </div>
    </div>
  );
}
