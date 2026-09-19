"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, CircleCheck, Clock, Play } from "lucide-react";

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
    <div className="min-h-screen bg-[#f5f7fa] pb-16">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="mb-2 flex items-center gap-2">
          <BookOpen size={22} className="text-blue-600" />
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Khóa học của tôi
          </h1>
        </div>

        <p className="mb-6 text-sm text-slate-500">
          {dangTai
            ? "Đang tải…"
            : `${soDangHoc} khóa đang học · ${soXong} khóa đã hoàn thành`}
        </p>

        {/* overflow-x-auto: ba nut nay vua man hinh 390px, nhung day la luoi an
            toan neu sau nay them bo loc. */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
          {BO_LOC.map((b) => (
            <button
              key={b.ma}
              type="button"
              onClick={() => setBoLoc(b.ma)}
              className={`h-10 shrink-0 rounded-full px-4 text-sm font-semibold whitespace-nowrap transition ${
                boLoc === b.ma
                  ? "bg-blue-600 text-white"
                  : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
              }`}
            >
              {b.chu}
            </button>
          ))}
        </div>

        {loi && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{loi}</p>
        )}

        {dangTai && (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
          </div>
        )}

        {!dangTai && !loi && loc.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
            <BookOpen size={32} className="mx-auto mb-3 text-slate-300" />
            <p className="mb-4 text-sm text-slate-500">
              {coKhoa.length === 0
                ? "Bạn chưa đăng ký khóa học nào."
                : boLoc === "xong"
                  ? "Bạn chưa hoàn thành khóa nào."
                  : "Bạn đã hoàn thành tất cả khóa đã đăng ký."}
            </p>
            <Link
              href="/courses"
              className="inline-flex h-11 items-center rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Tìm khóa học
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {!dangTai &&
            loc.map((g) => {
              const k = g.course!;
              const xong = g.status === "completed" || g.totalProgress >= 100;
              const phanTram = Math.min(100, Math.max(0, Math.round(g.totalProgress)));

              return (
                <article
                  key={g._id}
                  className="flex flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200"
                >
                  <div className="relative aspect-video w-full bg-slate-100">
                    {k.thumbnail ? (
                      <Image
                        src={k.thumbnail}
                        alt={k.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <BookOpen size={28} className="text-slate-300" />
                      </div>
                    )}

                    {xong && (
                      <span className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-1 text-[11px] font-semibold text-white">
                        <CircleCheck size={12} /> Hoàn thành
                      </span>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col p-4">
                    <h2 className="line-clamp-2 text-sm font-bold text-slate-900">
                      {k.title}
                    </h2>

                    <div className="mt-3 mb-4">
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="text-slate-500">Tiến độ</span>
                        <span className="font-semibold text-slate-700 tabular-nums">
                          {phanTram}%
                        </span>
                      </div>
                      {/* Thanh tien do la thong tin, khong phai trang tri: no la
                          ly do chinh nguoi ta mo trang nay. */}
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full transition-all ${
                            xong ? "bg-emerald-500" : "bg-blue-600"
                          }`}
                          style={{ width: `${phanTram}%` }}
                        />
                      </div>
                    </div>

                    {g.lastAccessedAt && (
                      <p className="mb-3 flex items-center gap-1 text-xs text-slate-400">
                        <Clock size={12} />
                        Học gần nhất{" "}
                        {new Date(g.lastAccessedAt).toLocaleDateString("vi-VN")}
                      </p>
                    )}

                    {/* mt-auto: day nut xuong day the de moi the trong hang co
                        nut nam cung mot duong, du tieu de dai ngan khac nhau. */}
                    <Link
                      href={k.slug ? `/learn?slug=${k.slug}` : "/courses"}
                      className="mt-auto flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700"
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
