"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, CircleCheck, Clock, Play } from "lucide-react";

import styles from "./page.module.scss";
import {
  getMyEnrolledCourses,
  type EnrolledCourseItem,
} from "@/src/services/enrollment.api";

// Ba bo loc. Xep theo thu tu nguoi dung can toi:
//   dangHoc  - thu ho mo trang nay de tim
//   xong     - thu ho khoe / lay chung nhan
//   tatCa    - duong lui khi hai cai tren khong co gi
const BO_LOC = [
  { ma: "dangHoc", chu: "Đang học" },
  { ma: "xong", chu: "Đã hoàn thành" },
  { ma: "tatCa", chu: "Tất cả" },
] as const;

type MaBoLoc = (typeof BO_LOC)[number]["ma"];

export default function MyCoursesPage() {
  const [danhSach, setDanhSach] = useState<EnrolledCourseItem[]>([]);
  const [dangTai, setDangTai] = useState(true);
  const [loi, setLoi] = useState("");
  const [boLoc, setBoLoc] = useState<MaBoLoc>("dangHoc");

  useEffect(() => {
    let conSong = true;

    getMyEnrolledCourses()
      .then((ds) => {
        if (!conSong) return;
        setDanhSach(Array.isArray(ds) ? ds : []);
      })
      .catch((e) => {
        if (!conSong) return;
        setLoi(e instanceof Error ? e.message : "Không tải được danh sách khóa học.");
      })
      .finally(() => {
        if (conSong) setDangTai(false);
      });

    return () => {
      conSong = false;
    };
  }, []);

  // Bo ban ghi co course === null.
  //
  // May chu populate mot phan va tra null khi khoa hoc da bi xoa - xem ghi chu
  // o EnrolledCourseSummary. Khong loc thi cho nay ve mot the trong khong bam
  // duoc, va nguoi dung tuong giao dien hong.
  const coKhoa = danhSach.filter((g) => g.course);

  const loc = coKhoa.filter((g) => {
    if (boLoc === "tatCa") return true;
    if (boLoc === "xong") return g.status === "completed" || g.totalProgress >= 100;
    return g.status !== "completed" && g.totalProgress < 100;
  });

  const soDangHoc = coKhoa.filter(
    (g) => g.status !== "completed" && g.totalProgress < 100,
  ).length;
  const soXong = coKhoa.length - soDangHoc;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.row}>
          <BookOpen size={22} className={styles.box} />
          <h1 className={styles.title}>Khóa học của tôi</h1>
        </div>

        <p className={styles.text}>
          {dangTai
            ? "Đang tải…"
            : `${soDangHoc} khóa đang học · ${soXong} khóa đã hoàn thành`}
        </p>

        {/* overflow-x-auto: ba nut nay vua man hinh 390px, nhung day la luoi an
            toan neu sau nay them bo loc. */}
        <div className={styles.scroller}>
          {BO_LOC.map((b) => (
            <button
              key={b.ma}
              type="button"
              onClick={() => setBoLoc(b.ma)}
              className={`${styles.button3} ${
                boLoc === b.ma ? styles.button : styles.button2
              }`}
            >
              {b.chu}
            </button>
          ))}
        </div>

        {loi && <p className={styles.text2}>{loi}</p>}

        {dangTai && (
          <div className={styles.row2}>
            <div className={styles.spinner} />
          </div>
        )}

        {!dangTai && !loi && loc.length === 0 && (
          <div className={styles.card}>
            <BookOpen size={32} className={styles.box2} />
            <p className={styles.text3}>
              {coKhoa.length === 0
                ? "Bạn chưa đăng ký khóa học nào."
                : boLoc === "xong"
                  ? "Bạn chưa hoàn thành khóa nào."
                  : "Bạn đã hoàn thành tất cả khóa đã đăng ký."}
            </p>
            <Link href="/courses" className={styles.box3}>
              Tìm khóa học
            </Link>
          </div>
        )}

        <div className={styles.grid}>
          {!dangTai &&
            loc.map((g) => {
              const k = g.course!;
              const xong = g.status === "completed" || g.totalProgress >= 100;
              const phanTram = Math.min(100, Math.max(0, Math.round(g.totalProgress)));

              return (
                <article key={g._id} className={styles.article}>
                  <div className={styles.box4}>
                    {k.thumbnail ? (
                      <Image
                        src={k.thumbnail}
                        alt={k.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className={styles.box5}
                      />
                    ) : (
                      <div className={styles.row3}>
                        <BookOpen size={28} className={styles.box6} />
                      </div>
                    )}

                    {xong && (
                      <span className={styles.floating}>
                        <CircleCheck size={12} /> Hoàn thành
                      </span>
                    )}
                  </div>

                  <div className={styles.col}>
                    <h2 className={styles.heading}>{k.title}</h2>

                    <div className={styles.box7}>
                      <div className={styles.row4}>
                        <span className={styles.label}>Tiến độ</span>
                        <span className={styles.label2}>{phanTram}%</span>
                      </div>
                      {/* Thanh tien do la thong tin, khong phai trang tri: no la
                          ly do chinh nguoi ta mo trang nay. */}
                      <div className={styles.box8}>
                        <div
                          className={`${styles.box11} ${
                            xong ? styles.box9 : styles.box10
                          }`}
                          style={{ width: `${phanTram}%` }}
                        />
                      </div>
                    </div>

                    {g.lastAccessedAt && (
                      <p className={styles.text4}>
                        <Clock size={12} />
                        Học gần nhất{" "}
                        {new Date(g.lastAccessedAt).toLocaleDateString("vi-VN")}
                      </p>
                    )}

                    {/* mt-auto: day nut xuong day the de moi the trong hang co
                        nut nam cung mot duong, du tieu de dai ngan khac nhau. */}
                    <Link
                      href={k.slug ? `/learn?slug=${k.slug}` : "/courses"}
                      className={styles.row5}
                    >
                      <Play size={15} />
                      {xong ? "Xem lại" : phanTram > 0 ? "Học tiếp" : "Bắt đầu học"}
                    </Link>
                  </div>
                </article>
              );
            })}
        </div>
      </div>
    </div>
  );
}
