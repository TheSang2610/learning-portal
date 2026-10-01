"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { doiDiaChi, duongDanDangNhap } from "@/src/components/auth/loginUrl";
import { useDangTaiNguoiDung, useNguoiDungLuu } from "@/src/hooks/userStore";
import { chiTietBaiLam } from "@/src/services/practice";

import PracticeResult from "./PracticeResult";
import { NAP_CAU_HOI, type CauHoi, type DeLuyenTap } from "./practiceData";
import { apThuTu } from "./practiceSettings";

// Dung chung khung phu kin man hinh va cac nut cua phong lam bai
import styles from "./PracticeTest.module.scss";

// "Xem chi tiet bai lam" tu lich su: dung lai DUNG bai da lam (thu tu cau, thu
// tu dap an, lua chon) tu ban da luu, roi mo thang trang xem dap an.

interface DaDung {
  ds: CauHoi[];
  chon: number[][];
  giay: number;
  nopLuc: number;
}

export default function PracticeReview({ de }: { de: DeLuyenTap }) {
  const router = useRouter();
  const duongDan = usePathname();
  const nguoiDung = useNguoiDungLuu();
  const dangTai = useDangTaiNguoiDung();
  const [bai, setBai] = useState<DaDung | null>(null);
  const [loi, setLoi] = useState("");

  useEffect(() => {
    const truoc = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = truoc;
    };
  }, []);

  useEffect(() => {
    const nap = NAP_CAU_HOI[de.id];
    if (!nguoiDung || !nap) return;
    let huy = false;
    const lan = new URLSearchParams(window.location.search).get("lan") ?? "";
    Promise.all([chiTietBaiLam(lan), nap()])
      .then(([{ bai: b }, tat]) => {
        if (huy) return;
        if (b.deId !== de.id) throw new Error("Bài làm không thuộc đề này.");
        // De bi sua sau khi lam (bot cau) thi khong dung lai duoc cho dung
        if (b.cau.some((k) => !tat[k]))
          throw new Error("Đề đã thay đổi, không mở lại được bài này.");
        setBai({
          ds: b.cau.map((k, i) => apThuTu(tat[k], b.dapAn[i] ?? [])),
          chon: b.chon,
          giay: b.giay,
          nopLuc: Date.parse(b.createdAt),
        });
      })
      .catch((e: Error) => !huy && setLoi(e.message || "Không mở được bài làm."));
    return () => {
      huy = true;
    };
    // nguoiDung chi can co/khong
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [de.id, !!nguoiDung]);

  if (!dangTai && !nguoiDung) {
    return (
      <div className={styles.phong}>
        <div className={styles.giua}>
          <p className={styles.giuaChu}>Đăng nhập để xem lại bài làm của bạn.</p>
          <div className={styles.giuaNut}>
            <Link href={`/practice/${de.id}`} className={styles.nutPhu}>
              Quay lại
            </Link>
            <button
              type="button"
              className={styles.nutChinh}
              onClick={() =>
                doiDiaChi(
                  duongDanDangNhap(duongDan, new URLSearchParams(window.location.search)),
                )
              }
            >
              Đăng nhập
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!bai) {
    return (
      <div className={styles.phong}>
        <div className={styles.giua}>
          <p className={styles.giuaChu}>{loi || "Đang mở bài làm…"}</p>
          {loi && (
            <Link href={`/practice/${de.id}`} className={styles.nutPhu}>
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
        tieuDe={de.title}
        ten={nguoiDung?.fullname || nguoiDung?.name || "Bạn"}
        ds={bai.ds}
        chon={bai.chon}
        daQua={bai.giay}
        ketThuc={bai.nopLuc}
        quayLai={() => router.push(`/practice/${de.id}`)}
        moDapAn
      />
    </div>
  );
}
