"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { updateUrl, loginUrl } from "@/src/components/features/portal/auth/loginUrl";
import { useUserLoading, useStoredUser } from "@/src/hooks/userStore";
import { attemptDetail } from "@/src/services/practice";

import PracticeResult from "./PracticeResult";
import { QUESTION_LOADERS, type Question, type PracticeQuiz } from "./practiceData";
import { applyOrder } from "./practiceSettings";

// Dung chung khung phu kin man hinh va cac nut cua phong lam bai
import styles from "./PracticeTest.module.scss";

// "Xem chi tiet bai lam" tu lich su: dung lai DUNG bai da lam (thu tu cau, thu
// tu dap an, lua chon) tu ban da luu, roi mo thang trang xem dap an.

interface Correct {
  ds: Question[];
  chon: number[][];
  giay: number;
  submittedAt: number;
}

export default function PracticeReview({ de: quiz }: { de: PracticeQuiz }) {
  const router = useRouter();
  const path = usePathname();
  const user = useStoredUser();
  const loading = useUserLoading();
  const [lesson, setLesson] = useState<Correct | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    const before = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = before;
    };
  }, []);

  useEffect(() => {
    const load = QUESTION_LOADERS[quiz.id];
    if (!user || !load) return;
    let cancel = false;
    const attempts = new URLSearchParams(window.location.search).get("lan") ?? "";
    Promise.all([attemptDetail(attempts), load()])
      .then(([{ bai: b }, off]) => {
        if (cancel) return;
        if (b.deId !== quiz.id) throw new Error("Bài làm không thuộc đề này.");
        // De bi sua sau khi lam (bot cau) thi khong dung lai duoc cho dung
        if (b.cau.some((k) => !off[k]))
          throw new Error("Đề đã thay đổi, không mở lại được bài này.");
        setLesson({
          ds: b.cau.map((k, i) => applyOrder(off[k], b.dapAn[i] ?? [])),
          chon: b.chon,
          giay: b.giay,
          submittedAt: Date.parse(b.createdAt),
        });
      })
      .catch((e: Error) => !cancel && setErr(e.message || "Không mở được bài làm."));
    return () => {
      cancel = true;
    };
    // nguoiDung chi can co/khong
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quiz.id, !!user]);

  if (!loading && !user) {
    return (
      <div className={styles.phong}>
        <div className={styles.giua}>
          <p className={styles.centerText}>Đăng nhập để xem lại bài làm của bạn.</p>
          <div className={styles.centerButton}>
            <Link href={`/practice/${quiz.id}`} className={styles.secondaryButton}>
              Quay lại
            </Link>
            <button
              type="button"
              className={styles.primaryButton}
              onClick={() =>
                updateUrl(loginUrl(path, new URLSearchParams(window.location.search)))
              }
            >
              Đăng nhập
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className={styles.phong}>
        <div className={styles.giua}>
          <p className={styles.centerText}>{err || "Đang mở bài làm…"}</p>
          {err && (
            <Link href={`/practice/${quiz.id}`} className={styles.secondaryButton}>
              Quay lại
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.phong}>
      <PracticeResult
        tieuDe={quiz.title}
        ten={user?.fullname || user?.name || "Bạn"}
        ds={lesson.ds}
        chon={lesson.chon}
        daQua={lesson.giay}
        ketThuc={lesson.submittedAt}
        goBack={() => router.push(`/practice/${quiz.id}`)}
        openAnswer
      />
    </div>
  );
}
