"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ListChecks } from "lucide-react";

import { doiDiaChi, duongDanDangNhap } from "@/src/components/auth/loginUrl";
import { useDangTaiNguoiDung, useNguoiDungLuu } from "@/src/hooks/userStore";

import { NAP_CAU_HOI, type CauHoi, type DeLuyenTap } from "./practiceData";
import {
  MAC_DINH,
  chiaBo,
  docThietLap,
  luuThietLap,
  type ThietLap,
} from "./practiceSettings";
import PracticeHistory from "./PracticeHistory";
import QuestionPreview from "./QuestionPreview";

import styles from "./PracticeSetup.module.scss";

interface Props {
  de: DeLuyenTap;
}

export default function PracticeSetup({ de }: Props) {
  const duongDan = usePathname();
  const nguoiDung = useNguoiDungLuu();
  const dangTai = useDangTaiNguoiDung();

  const [tl, setTl] = useState<ThietLap>(MAC_DINH);
  const [boChon, setBoChon] = useState(0);
  const [cauHoi, setCauHoi] = useState<CauHoi[] | null>(null);
  const [xemTruoc, setXemTruoc] = useState(false);
  const [dangNap, setDangNap] = useState(false);
  const napCauHoi = NAP_CAU_HOI[de.id];

  const moXemTruoc = async () => {
    if (!napCauHoi) return;
    if (!cauHoi) {
      setDangNap(true);
      try {
        setCauHoi(await napCauHoi());
      } finally {
        setDangNap(false);
      }
    }
    setXemTruoc(true);
  };
  // Giu cung mot ham qua cac lan ve: hop xem truoc dang ky phim Esc theo no
  const dongXemTruoc = useCallback(() => setXemTruoc(false), []);

  // Doc thiet lap da luu SAU khi gan vao trinh duyet, de HTML may chu va trinh
  // duyet khop nhau (doc ngay luc render se lech).
  useEffect(() => {
    const id = requestAnimationFrame(() => setTl(docThietLap()));
    return () => cancelAnimationFrame(id);
  }, []);

  const doi = (moi: Partial<ThietLap>) =>
    setTl((cu) => {
      const tiep = { ...cu, ...moi };
      luuThietLap(tiep);
      return tiep;
    });

  const cacBo = chiaBo(de.soCau, tl.soLuong);

  const moDangNhap = () =>
    doiDiaChi(duongDanDangNhap(duongDan, new URLSearchParams(window.location.search)));

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* ============ DAU DE ============ */}
        <section className={styles.hero}>
          <span className={styles.heroBong} aria-hidden="true" />
          <h1 className={styles.heroTitle}>{de.title}</h1>
          {de.description && <p className={styles.heroMoTa}>{de.description}</p>}
          <div className={styles.heroSo}>
            <span className={styles.heroBadge}>
              <ListChecks size={13} aria-hidden="true" />
              {de.soCau} câu hỏi
            </span>
          </div>
        </section>

        {/* ============ THIET LAP ============ */}
        <section className={styles.card}>
          <h2 className={styles.tieuDe}>Thiết lập phòng luyện tập</h2>

          <div className={styles.dong}>
            <label htmlFor="so-luong" className={styles.nhan}>
              Chọn số lượng câu hỏi
            </label>
            <select
              id="so-luong"
              value={tl.soLuong}
              onChange={(e) => {
                doi({ soLuong: Number(e.target.value) });
                setBoChon(0);
              }}
              className={styles.chon}
            >
              {[20, 50, 75, 100].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.dongBo}>
            <h3 className={styles.tieuDe}>Chọn bộ câu hỏi</h3>
            <div className={styles.cacBo} role="group" aria-label="Chọn bộ câu hỏi">
              {cacBo.map((b, i) => (
                <button
                  key={b.tu}
                  type="button"
                  aria-pressed={i === boChon}
                  onClick={() => setBoChon(i)}
                  className={i === boChon ? `${styles.bo} ${styles.boChon}` : styles.bo}
                >
                  Câu {b.tu} - {b.den}
                </button>
              ))}
            </div>
          </div>

          <CongTac
            nhan="Xáo trộn câu hỏi và đáp án"
            bat={tl.xaoTron}
            doiLai={() => doi({ xaoTron: !tl.xaoTron })}
          />
        </section>

        {/* Lich su lam bai la du lieu rieng: chi hien khi da dang nhap */}
        {nguoiDung && <PracticeHistory deId={de.id} />}
      </div>

      {/* ============ NUT HANH DONG ============ */}
      <div className={styles.thanhNut}>
        <button
          type="button"
          disabled={!napCauHoi || dangNap}
          onClick={moXemTruoc}
          title={napCauHoi ? undefined : "Câu hỏi của đề đang được bổ sung"}
          className={`${styles.nut} ${styles.nutXem}`}
        >
          {dangNap ? "Đang tải…" : "Xem trước câu hỏi"}
        </button>
        {dangTai ? (
          <span className={`${styles.nut} ${styles.nutCho}`} aria-hidden="true" />
        ) : nguoiDung && napCauHoi ? (
          // Bo cau dang chon di qua dia chi; con lai (so cau moi bo,
          // xao tron) trang lam bai tu doc lai tu thiet lap da luu.
          <Link
            href={`/practice/${de.id}/take?bo=${boChon}`}
            className={`${styles.nut} ${styles.nutBatDau}`}
          >
            Bắt đầu luyện tập
          </Link>
        ) : nguoiDung ? (
          <button type="button" disabled className={`${styles.nut} ${styles.nutBatDau}`}>
            Bắt đầu luyện tập
          </button>
        ) : (
          <button
            type="button"
            onClick={moDangNhap}
            className={`${styles.nut} ${styles.nutBatDau}`}
          >
            Đăng nhập để bắt đầu
          </button>
        )}
      </div>

      {xemTruoc && cauHoi && (
        <QuestionPreview
          cauHoi={cauHoi}
          tu={cacBo[boChon]?.tu ?? 1}
          den={cacBo[boChon]?.den ?? de.soCau}
          tongCau={de.soCau}
          dong={dongXemTruoc}
        />
      )}
    </div>
  );
}

/** Cong tac BAT/TAT giong ban goc: nut tron chay qua lai, ghi ON / OFF. */
function CongTac({
  nhan,
  bat,
  doiLai,
}: {
  nhan: string;
  bat: boolean;
  doiLai: () => void;
}) {
  return (
    <div className={styles.dong}>
      <span className={styles.nhan}>{nhan}</span>
      <button
        type="button"
        role="switch"
        aria-checked={bat}
        aria-label={nhan}
        onClick={doiLai}
        className={bat ? `${styles.congTac} ${styles.congTacBat}` : styles.congTac}
      >
        <span className={styles.nutTron}>{bat ? "ON" : "OFF"}</span>
      </button>
    </div>
  );
}
