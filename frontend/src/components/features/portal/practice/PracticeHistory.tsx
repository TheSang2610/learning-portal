"use client";

import Link from "next/link";
import { useState } from "react";
import { AlarmClock, ChevronRight, CircleCheck, CircleHelp, Clock } from "lucide-react";

import { attemptHistory, type AttemptSummary } from "@/src/services/practice";

import { diem10, dateTime, duration } from "./practiceSettings";

import styles from "./PracticeHistory.module.scss";

// "Xem lich su lam bai" o trang thiet lap de, theo mau trang thi cua chu du an:
// bam nut moi tai (khong ai can lich su moi lan mo de), roi hien tung the diem.

export default function PracticeHistory({ deId: quizId }: { deId: string }) {
  const [items, setDs] = useState<AttemptSummary[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const download = async () => {
    setLoading(true);
    setErr("");
    try {
      setDs((await attemptHistory(quizId)).danhSach);
    } catch (e) {
      setErr((e as Error).message || "Không tải được lịch sử làm bài.");
    } finally {
      setLoading(false);
    }
  };

  if (!items) {
    return (
      <div className={styles.intro}>
        <button
          type="button"
          className={styles.openButton}
          onClick={download}
          disabled={loading}
        >
          {loading ? "Đang tải…" : "Xem lịch sử làm bài"}
        </button>
        {err && (
          <p className={styles.loi} role="alert">
            {err}
          </p>
        )}
      </div>
    );
  }

  return (
    <section className={styles.khoi} aria-labelledby="lich-su-tieu-de">
      <h2 id="lich-su-tieu-de" className={styles.tieuDe}>
        Lịch sử làm bài của bạn
      </h2>
      {items.length === 0 ? (
        <p className={styles.trong}>Bạn chưa làm bài nào ở đề này.</p>
      ) : (
        <ul className={styles.ds}>
          {items.map((b) => (
            <li key={b._id} className={styles.the}>
              <p className={styles.diem}>
                <span>Điểm của bạn:</span>
                <strong>{diem10(b.soDung, b.soCau)}</strong>
              </p>
              <dl className={styles.info}>
                <div>
                  <dt>
                    <Clock size={16} aria-hidden="true" /> Thời gian làm bài:
                  </dt>
                  <dd>{duration(b.giay)}</dd>
                </div>
                <div>
                  <dt>
                    <AlarmClock size={16} aria-hidden="true" /> Thời gian nộp bài:
                  </dt>
                  <dd>{dateTime(Date.parse(b.createdAt))}</dd>
                </div>
                <div>
                  <dt>
                    <CircleCheck size={16} aria-hidden="true" /> Số lượng đúng
                  </dt>
                  <dd className={styles.soDung}>{b.soDung}</dd>
                </div>
                <div>
                  <dt>
                    <CircleHelp size={16} aria-hidden="true" /> Tổng số câu hỏi trong đề
                  </dt>
                  <dd>{b.soCau}</dd>
                </div>
              </dl>
              <Link
                href={`/practice/${quizId}/result?lan=${b._id}`}
                className={styles.viewButton}
              >
                Xem chi tiết bài làm <ChevronRight size={16} aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
