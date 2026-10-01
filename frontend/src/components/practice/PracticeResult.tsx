"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  CircleX,
  Clock,
  PanelLeftClose,
  PanelLeftOpen,
  RotateCcw,
  User,
} from "lucide-react";

import type { CauHoi } from "./practiceData";
import { diem10, ngayGio, thoiLuong, traLoiDung } from "./practiceSettings";

import styles from "./PracticeResult.module.scss";

// Sau khi nop: man "Bai lam cua ban da duoc gui di" roi trang "Xem dap an",
// theo mau trang thi cua chu du an.

const CHU_CAI = "ABCDEFGH";
const gon = (s: string) => s.replace(/\s+/g, " ").trim();

/** Dap an ngan thi xep 4 cot, vua thi 2 cot, dai thi 1 cot - nhu ban goc */
function kieuCot(c: CauHoi) {
  if (c.html) return styles.cot1;
  const dai = Math.max(...c.dapAn.map((a) => gon(a).length));
  return dai <= 22 ? styles.cot4 : dai <= 70 ? styles.cot2 : styles.cot1;
}

// Bo loc tren trang xem dap an: 3 trang thai, bam nut de chuyen vong
type Loc = "tong" | "dung" | "sai";
const LOC: Record<Loc, { nhan: string; moTa: string; lop: string; tiep: Loc }> = {
  tong: { nhan: "Đúng & sai", moTa: "tất cả câu", lop: styles.locTong, tiep: "dung" },
  dung: { nhan: "Đúng", moTa: "câu đúng", lop: styles.locDung, tiep: "sai" },
  sai: { nhan: "Sai", moTa: "câu sai và chưa làm", lop: styles.locSai, tiep: "tong" },
};

function NoiDung({ html, s }: { html?: boolean; s: string }) {
  return html ? (
    <span className={styles.giau} dangerouslySetInnerHTML={{ __html: s }} />
  ) : (
    <span>{gon(s)}</span>
  );
}

interface Props {
  tieuDe: string;
  ten: string;
  ds: CauHoi[];
  chon: (number[] | undefined)[];
  daQua: number;
  ketThuc: number;
  quayLai: () => void;
  /** Khong truyen = dang xem lai bai cu tu lich su: an cac nut "Lam lai" */
  lamLai?: () => void;
  /** Trang thai luu vao lich su ngay sau khi nop; khong truyen = khong hien */
  luu?: "dang" | "xong" | "loi" | null;
  /** Mo thang trang xem dap an (xem lai tu lich su) */
  moDapAn?: boolean;
}

export default function PracticeResult({
  tieuDe,
  ten,
  ds,
  chon,
  daQua,
  ketThuc,
  quayLai,
  lamLai,
  luu,
  moDapAn = false,
}: Props) {
  const [xemDapAn, setXemDapAn] = useState(moDapAn);
  const [anBen, setAnBen] = useState(false);
  const [loc, setLoc] = useState<Loc>("tong");

  const soDung = ds.filter((c, i) => traLoiDung(chon[i], c.dung)).length;
  // Giu so thu tu goc cua cau khi loc (Cau 12, Cau 13...)
  const hienRa = ds
    .map((c, i) => ({ i, dung: traLoiDung(chon[i], c.dung) }))
    .filter((x) => loc === "tong" || (loc === "dung") === x.dung)
    .map((x) => x.i);
  const diem = diem10(soDung, ds.length);

  /* ---------- Man tom tat ---------- */
  if (!xemDapAn) {
    return (
      <>
        <header className={styles.thanh}>
          <button type="button" className={styles.nutTrong} onClick={quayLai}>
            <ChevronLeft size={18} aria-hidden="true" /> Quay lại
          </button>
        </header>
        <div className={styles.cuon}>
          <section className={styles.tomTat} aria-live="polite">
            <h1 className={styles.daGui}>Bài làm của bạn đã được gửi đi</h1>
            <p className={styles.diemDong}>
              <span>Điểm của bạn:</span>
              <strong>{diem}/10</strong>
            </p>
            <h2 className={styles.tenDe}>{tieuDe}</h2>
            {luu && (
              <p
                className={luu === "loi" ? `${styles.luu} ${styles.luuLoi}` : styles.luu}
              >
                {luu === "dang"
                  ? "Đang lưu vào lịch sử làm bài…"
                  : luu === "xong"
                    ? "Đã lưu vào lịch sử làm bài"
                    : "Chưa lưu được vào lịch sử làm bài (lỗi mạng)."}
              </p>
            )}
            <dl className={styles.thongTin}>
              <div>
                <dt>
                  <User size={16} aria-hidden="true" /> Thí sinh
                </dt>
                <dd>{ten}</dd>
              </div>
              <div>
                <dt>
                  <Clock size={16} aria-hidden="true" /> Thời gian làm bài
                </dt>
                <dd>{thoiLuong(daQua)}</dd>
              </div>
              <div>
                <dt>
                  <CircleCheck size={16} aria-hidden="true" /> Số câu trắc nghiệm đúng
                </dt>
                <dd>
                  {soDung}/{ds.length}
                </dd>
              </div>
            </dl>
            <div className={styles.nutDuoi}>
              <button
                type="button"
                className={styles.nutXem}
                onClick={() => setXemDapAn(true)}
              >
                Xem đáp án <ChevronRight size={16} aria-hidden="true" />
              </button>
              {lamLai && (
                <button type="button" className={styles.nutLamLai} onClick={lamLai}>
                  <RotateCcw size={16} aria-hidden="true" /> Làm lại
                </button>
              )}
            </div>
          </section>
        </div>
      </>
    );
  }

  /* ---------- Trang xem dap an ---------- */
  return (
    <>
      <header className={styles.thanh}>
        <button
          type="button"
          className={styles.nutTrong}
          onClick={() => (moDapAn ? quayLai() : setXemDapAn(false))}
        >
          <ChevronLeft size={18} aria-hidden="true" /> Quay lại
        </button>
      </header>
      <div className={styles.cuon}>
        <div className={anBen ? `${styles.khung} ${styles.khungAn}` : styles.khung}>
          {!anBen && (
            <aside className={styles.ben}>
              <p className={styles.benDiem}>
                Điểm: <strong>{diem}/10</strong>
              </p>
              <div className={styles.chiTiet}>
                <h2 className={styles.chiTietDau}>Thông tin chi tiết</h2>
                <dl className={styles.chiTietThan}>
                  <div>
                    <dt>Thời gian làm bài:</dt>
                    <dd>{thoiLuong(daQua)}</dd>
                  </div>
                  <div>
                    <dt>Thời gian nộp bài:</dt>
                    <dd>{ngayGio(ketThuc)}</dd>
                  </div>
                  <div>
                    <dt>
                      Trắc nghiệm: {diem} ({soDung}/{ds.length}&nbsp;câu)
                    </dt>
                  </div>
                </dl>
                {lamLai && (
                  <button type="button" className={styles.nutChu} onClick={lamLai}>
                    Làm lại bài này
                  </button>
                )}
              </div>
            </aside>
          )}

          <div className={styles.chinh}>
            <div className={styles.thanhDe}>
              <button
                type="button"
                className={styles.nutAn}
                onClick={() => setAnBen((v) => !v)}
                aria-label={anBen ? "Hiện thông tin" : "Ẩn thông tin"}
                title={anBen ? "Hiện thông tin" : "Ẩn thông tin"}
              >
                {anBen ? (
                  <PanelLeftOpen size={16} aria-hidden="true" />
                ) : (
                  <PanelLeftClose size={16} aria-hidden="true" />
                )}
              </button>
              <h1 className={styles.thanhDeTen}>{tieuDe}</h1>
              {/* Bam de chuyen vong: tat ca -> chi cau dung -> chi cau sai.
                  Dau x tren nut dang loc de quay ve tat ca. */}
              <span className={`${styles.loc} ${LOC[loc].lop}`}>
                <button
                  type="button"
                  className={styles.locNut}
                  onClick={() => setLoc(LOC[loc].tiep)}
                  title={`Đang xem: ${LOC[loc].moTa}. Bấm để đổi.`}
                >
                  {LOC[loc].nhan}
                </button>
                {loc !== "tong" && (
                  <button
                    type="button"
                    className={styles.locBo}
                    onClick={() => setLoc("tong")}
                    aria-label="Bỏ lọc, xem tất cả câu"
                  >
                    x
                  </button>
                )}
              </span>
            </div>

            <div className={styles.baiLam}>
              <div className={styles.tab} role="tablist">
                <span role="tab" aria-selected="true" className={styles.tabChon}>
                  Trắc nghiệm
                </span>
              </div>

              {hienRa.length === 0 && (
                <p className={styles.trong}>
                  {loc === "dung" ? "Chưa có câu nào đúng." : "Không có câu nào sai."}
                </p>
              )}
              <ol className={styles.dsCau}>
                {hienRa.map((i) => {
                  const c = ds[i];
                  const daChon = chon[i] ?? [];
                  const dung = traLoiDung(daChon, c.dung);
                  const mau = dung ? styles.hopDung : styles.hopSai;
                  return (
                    <li key={i} className={styles.cau}>
                      <div className={styles.cauSo}>
                        Câu&nbsp; {i + 1}
                        {daChon.length === 0 && (
                          <span className={styles.nhanBo}>Chưa làm</span>
                        )}
                      </div>
                      <div className={styles.cauChu}>
                        <NoiDung html={c.html} s={c.cau} />
                      </div>
                      <div className={`${styles.dapAn} ${kieuCot(c)}`}>
                        {c.dapAn.map((a, j) => (
                          <div key={j} className={styles.moi}>
                            <b>{CHU_CAI[j]}.</b> <NoiDung html={c.html} s={a} />
                          </div>
                        ))}
                      </div>
                      <div className={`${styles.hopDapAn} ${mau}`}>
                        <span className={styles.dapAnDung}>
                          Đáp án đúng: {c.dung.map((d) => CHU_CAI[d]).join(", ")}
                        </span>
                        <div
                          className={styles.dayChu}
                          aria-label={
                            daChon.length
                              ? `Bạn chọn ${daChon.map((d) => CHU_CAI[d]).join(", ")}`
                              : "Bạn chưa chọn"
                          }
                        >
                          {/* Chu ban chon co dau tick dung (xanh) / sai (do) dung
                              truoc, nhu ban goc */}
                          {c.dapAn.map((_, j) => (
                            <span key={j} className={styles.chu} aria-hidden="true">
                              {daChon.includes(j) &&
                                (c.dung.includes(j) ? (
                                  <CircleCheck size={20} className={styles.tickDung} />
                                ) : (
                                  <CircleX size={20} className={styles.tickSai} />
                                ))}
                              {CHU_CAI[j]}
                            </span>
                          ))}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
