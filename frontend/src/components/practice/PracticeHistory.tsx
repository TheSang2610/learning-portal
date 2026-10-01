"use client";

import Link from "next/link";
import { useState } from "react";
import { AlarmClock, ChevronRight, CircleCheck, CircleHelp, Clock } from "lucide-react";

import { lichSuBaiLam, type BaiLamTomTat } from "@/src/services/practice";

import { diem10, ngayGio, thoiLuong } from "./practiceSettings";

import styles from "./PracticeHistory.module.scss";

// "Xem lich su lam bai" o trang thiet lap de, theo mau trang thi cua chu du an:
// bam nut moi tai (khong ai can lich su moi lan mo de), roi hien tung the diem.

export default function PracticeHistory({ deId }: { deId: string }) {
  const [ds, setDs] = useState<BaiLamTomTat[] | null>(null);
  const [dangTai, setDangTai] = useState(false);
  const [loi, setLoi] = useState("");

  const tai = async () => {
    setDangTai(true);
    setLoi("");
    try {
      setDs((await lichSuBaiLam(deId)).danhSach);
    } catch (e) {
      setLoi((e as Error).message || "Không tải được lịch sử làm bài.");
    } finally {
      setDangTai(false);
    }
  };

  if (!ds) {
    return (
      <div className={styles.moDau}>
        <button type="button" className={styles.nutMo} onClick={tai} disabled={dangTai}>
          {dangTai ? "Đang tải…" : "Xem lịch sử làm bài"}
        </button>
        {loi && (
          <p className={styles.loi} role="alert">
            {loi}
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
      {ds.length === 0 ? (
        <p className={styles.trong}>Bạn chưa làm bài nào ở đề này.</p>
      ) : (
        <ul className={styles.ds}>
          {ds.map((b) => (
            <li key={b._id} className={styles.the}>
              <p className={styles.diem}>
                <span>Điểm của bạn:</span>
                <strong>{diem10(b.soDung, b.soCau)}</strong>
              </p>
              <dl className={styles.thongTin}>
                <div>
                  <dt>
                    <Clock size={16} aria-hidden="true" /> Thời gian làm bài:
                  </dt>
                  <dd>{thoiLuong(b.giay)}</dd>
                </div>
                <div>
                  <dt>
                    <AlarmClock size={16} aria-hidden="true" /> Thời gian nộp bài:
                  </dt>
                  <dd>{ngayGio(Date.parse(b.createdAt))}</dd>
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
                href={`/practice/${deId}/result?lan=${b._id}`}
                className={styles.nutXem}
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
