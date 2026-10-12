import { Search } from "lucide-react";

import {
  ADMIN_POSTS as C,
  type PostStatusFilter,
} from "@/src/constants/admin/posts-page";

import type { AdminPostsState } from "../hooks/useAdminPosts";
import styles from "../AdminPosts.module.scss";

/** O tim tieu de, loc trang thai, loc chu de va dem so bai. */
export default function PostFilters({ s }: { s: AdminPostsState }) {
  const F = C.filters;

  return (
    <div className={styles.card2}>
      <form onSubmit={s.search} className={styles.form}>
        <div className={styles.box2}>
          <Search size={16} className={styles.floating} />
          <input
            value={s.tuKhoa}
            onChange={(e) => s.setKeyword(e.target.value)}
            placeholder={F.searchPlaceholder}
            aria-label={F.searchAria}
            className={`${styles.card8} ${styles.input}`}
          />
        </div>
        <button type="submit" className={styles.button}>
          {F.search}
        </button>
      </form>

      <select
        value={s.status}
        onChange={(e) => s.changeStatus(e.target.value as PostStatusFilter)}
        aria-label={F.statusAria}
        className={styles.card8}
      >
        {F.statuses.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>

      <select
        value={s.topic}
        onChange={(e) => s.changeTopic(e.target.value)}
        aria-label={F.topicAria}
        className={styles.card8}
      >
        <option value="">{F.allTopics}</option>
        {s.topics.map((t) => (
          <option key={t.slug} value={t.slug}>
            {t.name}
          </option>
        ))}
      </select>

      <span className={styles.label}>
        {F.count(s.tong)}
        {s.activeKeyword && F.matching(s.activeKeyword)}
      </span>
    </div>
  );
}
