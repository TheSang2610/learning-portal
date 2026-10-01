"use client";

import { useEffect, useRef, useState } from "react";
import { Circle, CircleCheck } from "lucide-react";

import type { CauHoi } from "./practiceData";

import styles from "./QuestionPreview.module.scss";

interface Props {
  cauHoi: CauHoi[];
  /** Vi tri cau dau tien cua bo dang chon, dem tu 1 (vd 51 cho "Câu 51 - 100") */
  tu: number;
  den: number;
  /** So cau cua ca de theo ban goc - de biet phan nao con chua bo sung */
  tongCau: number;
  dong: () => void;
}

// Ban goc co cho hai dau cach lien nhau ("ứng  dụng"); gom lai cho gon mat.
const gon = (s: string) => s.replace(/\s+/g, " ").trim();

/** Cau co anh/cong thuc duoc luu san duoi dang HTML da loc (chi con the dinh
 *  dang, anh https va MathML) ngay luc chuyen doi du lieu, nen gan thang vao. */
function NoiDung({ html, s }: { html?: boolean; s: string }) {
  return html ? (
    <span className={styles.giau} dangerouslySetInnerHTML={{ __html: s }} />
  ) : (
    <span>{gon(s)}</span>
  );
}

export default function QuestionPreview({ cauHoi, tu, den, tongCau, dong }: Props) {
  const [hienDapAn, setHienDapAn] = useState(false);
  const nutDong = useRef<HTMLButtonElement>(null);

  // Esc de dong, khoa cuon trang phia sau, dua tieu diem vao hop
  useEffect(() => {
    const truoc = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    nutDong.current?.focus();
    const phim = (e: KeyboardEvent) => e.key === "Escape" && dong();
    window.addEventListener("keydown", phim);
    return () => {
      document.body.style.overflow = truoc;
      window.removeEventListener("keydown", phim);
    };
  }, [dong]);

  const ds = cauHoi.slice(tu - 1, den);
  const daCoDen = Math.min(den, cauHoi.length);

  return (
    <div className={styles.nen} onClick={dong}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="xem-truoc-tieu-de"
        className={styles.hop}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="xem-truoc-tieu-de" className={styles.tieuDe}>
          Xem trước câu hỏi
        </h2>

        <div className={styles.than}>
          <div className={styles.congTacDong}>
            <span className={styles.congTacNhan}>Hiển thị đáp án</span>
            <button
              type="button"
              role="switch"
              aria-checked={hienDapAn}
              aria-label="Hiển thị đáp án"
              onClick={() => setHienDapAn((v) => !v)}
              className={
                hienDapAn ? `${styles.congTac} ${styles.congTacBat}` : styles.congTac
              }
            >
              <span className={styles.nutTron}>{hienDapAn ? "ON" : "OFF"}</span>
            </button>
          </div>

          {/* Moi bo danh so lai tu Cau 1 (chu du an yeu cau): chon "Câu 101 - 120"
              thi hien Cau 1 - 20, giong luc vao lam bai. */}
          <ol className={styles.ds}>
            {ds.map((c, i) => (
              <li key={tu + i} className={styles.cau}>
                <h3 className={styles.cauHoi}>
                  Câu {i + 1}. <NoiDung html={c.html} s={c.cau} />
                </h3>
                <ul className={styles.dapAn}>
                  {c.dapAn.map((a, j) => {
                    const dung = hienDapAn && c.dung.includes(j);
                    return (
                      <li
                        key={j}
                        className={dung ? `${styles.moi} ${styles.moiDung}` : styles.moi}
                      >
                        {dung ? (
                          <CircleCheck
                            size={20}
                            className={styles.iconDung}
                            aria-label="Đáp án đúng"
                          />
                        ) : (
                          <Circle size={20} className={styles.icon} aria-hidden="true" />
                        )}
                        <NoiDung html={c.html} s={a} />
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ol>

          {daCoDen < den && (
            <p className={styles.chuaCo}>
              {ds.length === 0 ? `Câu ${tu} - ${den}` : `Câu ${daCoDen + 1} - ${den}`}{" "}
              chưa được bổ sung (đề đã có {cauHoi.length}/{tongCau} câu).
            </p>
          )}
        </div>

        <div className={styles.chan}>
          <button ref={nutDong} type="button" onClick={dong} className={styles.nutDong}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
