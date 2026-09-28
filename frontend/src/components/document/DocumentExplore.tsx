"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, NotebookText } from "lucide-react";

import type { SharedDocument } from "@/src/services/document";

import styles from "./DocumentExplore.module.scss";
import { duongTaiLieu } from "./duongDan";

/** Mot tab: "Noi bat" hoac mot linh vuc, kem toi da 8 tai lieu (lay san o may chu). */
export interface TabKhamPha {
  khoa: string;
  ten: string;
  dsTaiLieu: SharedDocument[];
  /** Trang xem them cua tab (browse loc san). */
  xemThem: string;
}

// Bon mau trang giay minh hoa - public/images/share-document/trang-*.svg.
// Du an chua co anh xem truoc tung trang tai lieu (Cloudinary chan phat PDF),
// nen chong trang la hinh minh hoa; co anh that thi thay o day.
const SO_MAU_TRANG = 4;

// Vi tri + goc nghieng cua 4 trang trong chong, trai sang phai. `trai` tinh
// tren khung rong 337 (nhu ban mau) roi doi ra % - chong co gian theo be
// ngang the thay vi bi cat o the hep.
const RONG_KHUNG = 337;
const CHONG = [
  { trai: 0, goc: -5 },
  { trai: 77, goc: 0 },
  { trai: 141, goc: 0.3 },
  { trai: 196, goc: -5 },
];

/** Moi tai lieu mot bo trang khac nhau, co dinh theo id - khong nhay giua hai lan tai. */
const lechMau = (id: string) =>
  [...id].reduce((s, c) => s + c.charCodeAt(0), 0) % SO_MAU_TRANG;

/**
 * "Kham pha tai lieu tu cong dong" o trang /share-document: tab (Noi bat + cac
 * linh vuc) va luoi the tai lieu, moi the co chong trang giay nghieng.
 */
export default function DocumentExplore({ dsTab }: { dsTab: TabKhamPha[] }) {
  const [dangChon, setDangChon] = useState(0);
  const coTab = dsTab.filter((t) => t.dsTaiLieu.length > 0);
  if (!coTab.length) return null;
  const tab = coTab[Math.min(dangChon, coTab.length - 1)];

  return (
    <section className={styles.bang} aria-labelledby="tieu-de-kham-pha">
      <div className={styles.khung}>
        <header className={styles.dau}>
          <h2 id="tieu-de-kham-pha" className={styles.tieuDe}>
            Khám phá tài liệu từ cộng đồng
          </h2>
          <p className={styles.moTa}>
            Những tài liệu hay nhất do sinh viên chia sẻ để bạn học tốt hơn mỗi ngày.
          </p>
        </header>

        <div className={styles.tabs} role="tablist" aria-label="Chọn nhóm tài liệu">
          {coTab.map((t, i) => (
            <button
              key={t.khoa}
              type="button"
              role="tab"
              aria-selected={t.khoa === tab.khoa}
              aria-controls="luoi-kham-pha"
              onClick={() => setDangChon(i)}
              className={`${styles.tab} ${t.khoa === tab.khoa ? styles.tabOn : ""}`}
            >
              {t.ten}
            </button>
          ))}
        </div>

        {/* key theo tab: doi tab thi luoi dung lai, cac the hien ra lan luot. */}
        <ul key={tab.khoa} id="luoi-kham-pha" role="tabpanel" className={styles.luoi}>
          {tab.dsTaiLieu.map((d, i) => {
            const lech = lechMau(d._id);
            return (
              <li key={d._id} style={{ "--thu-tu": i } as React.CSSProperties}>
                <Link href={duongTaiLieu(d._id)} className={styles.the}>
                  <span className={styles.dauThe}>
                    <span className={styles.bieuTuong} aria-hidden>
                      <NotebookText size={16} />
                    </span>
                    <span className={styles.ten}>{d.title}</span>
                  </span>
                  <span className={styles.chong} aria-hidden>
                    {CHONG.map((vt, j) => (
                      <span
                        key={j}
                        className={styles.trang}
                        style={{
                          left: `${(vt.trai / RONG_KHUNG) * 100}%`,
                          transform: `rotate(${vt.goc}deg)`,
                          // Trang ben trai nam tren cung, giong ban mau.
                          zIndex: CHONG.length - j,
                          backgroundImage: `url(/images/share-document/trang-${((lech + j) % SO_MAU_TRANG) + 1}.svg)`,
                        }}
                      />
                    ))}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        <Link href={tab.xemThem} className={styles.xemThem}>
          Xem thêm tài liệu {tab.khoa === "noi-bat" ? "" : tab.ten}
          <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}
