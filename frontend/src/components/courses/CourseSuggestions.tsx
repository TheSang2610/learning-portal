"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

import TheKhoaHoc from "@/src/components/home/CourseCard";
import { layGoiYKhoaHoc, type KhoaGoiY } from "@/src/services/course";

import styles from "./CourseSuggestions.module.scss";
interface Props {
  soLuong?: number;
  /** Co gia tri -> goi y KHOA LIEN QUAN voi khoa nay, dung o trang chi tiet. */
  courseId?: string;
}

export default function GoiYKhoaHoc({ soLuong = 6, courseId }: Props) {
  const [danhSach, setDanhSach] = useState<KhoaGoiY[]>([]);
  const [caNhanHoa, setCaNhanHoa] = useState(false);
  const [xong, setXong] = useState(false);

  useEffect(() => {
    let conSong = true;

    layGoiYKhoaHoc(soLuong, courseId)
      .then((kq) => {
        if (!conSong) return;
        setDanhSach(kq.danhSach);
        setCaNhanHoa(kq.caNhanHoa);
      })
      // Nuot loi co chu dich: day la muc PHU o cuoi trang. Hong thi an han di,
      // khong day mot khung bao loi do vao giua trang chu vi mot muc goi y.
      .catch(() => {})
      .finally(() => {
        if (conSong) setXong(true);
      });

    return () => {
      conSong = false;
    };
  }, [soLuong, courseId]);

  // Khong ve gi ca khi chua xong hoac khong co goi y nao.
  //
  // Khong dung khung xuong: muc nay khong phai noi dung chinh, mot khung xuong
  // o day chi lam trang nhay len mot cai roi thoi. Con muc rong kem dong chu
  // "chua co goi y" thi to ra he thong dang thieu du lieu - khong ai can biet.
  if (!xong || danhSach.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className={styles.row}>
        <Sparkles size={20} className={styles.box} />
        <h2 className={styles.heading}>
          {courseId
            ? "Khóa học liên quan"
            : caNhanHoa
              ? "Gợi ý cho bạn"
              : "Đang được quan tâm"}
        </h2>
      </div>

      {/* 2 cot tu dien thoai tro len: mot cot thi the qua to va phai cuon rat
          lau moi het sau khoa. Bon cot chi tu lg de the khong bi bop hep. */}
      <div className={styles.grid}>
        {danhSach.map((k) => (
          <div key={k._id} className={styles.col}>
            <TheKhoaHoc khoa={k} sizes="(max-width: 768px) 50vw, 25vw" />

            {/* Ly do goi y. Day la phan dang gia nhat cua ca muc: mot goi y
                khong noi duoc vi sao thi nguoi dung doc no nhu quang cao. */}
            <p className={styles.text}>{k.viSaoGoiY}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
