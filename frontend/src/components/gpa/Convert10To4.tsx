"use client";

import { useState, type ReactNode } from "react";
import { Repeat, Settings } from "lucide-react";
import GradeMappingTable from "./GradeMappingTable";
import { SCALES, scaleById, gradeOf } from "./gradeScales";

import styles from "./Convert10To4.module.scss";
// Bang quy doi trong phan huong dan phai doi theo thang dang chon ("theo thang
// diem da chon"), nen cong cu va huong dan dung chung mot state. Phan "Cac tinh
// nang lien quan" nam giua hai khoi -> nhan qua children de van la server
// component, khong phai goi vao goi JavaScript cua trinh duyet.
export default function Convert10To4({ children }: { children?: ReactNode }) {
  const [scaleId, setScaleId] = useState("0");
  const [input, setInput] = useState("0");

  const scale = scaleById(scaleId);

  const raw = input.replace(",", ".").trim();
  const parsed = raw === "" ? 0 : Number(raw);
  const score = Number.isFinite(parsed) ? Math.min(10, Math.max(0, parsed)) : 0;
  const grade = gradeOf(scale, score);

  return (
    <>
      {/* ============ CONG CU ============ */}
      <div className={styles.card}>
        <div className={styles.row}>
          <Repeat size={17} className={styles.box} />
          <h2 className={styles.heading}>Quy đổi điểm hệ 10 sang hệ 4</h2>
        </div>

        <div className={styles.box2}>
          <h4 className={styles.minorHeading}>Chọn cấu trúc thang điểm</h4>
          <select
            value={scaleId}
            onChange={(e) => setScaleId(e.target.value)}
            aria-label="Chọn cấu trúc thang điểm"
            className={styles.select}
          >
            {SCALES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.box3}>
          <div className={styles.grid}>
            <div className={styles.box4}>Điểm hệ 10</div>
            <div className={styles.box4}>Điểm hệ 4</div>
            <div className={styles.box5}>Thang điểm chữ</div>

            <div className={styles.box6}>
              <input
                type="number"
                min={0}
                max={10}
                step="0.01"
                value={input}
                placeholder="Điểm hệ 10"
                aria-label="Điểm hệ 10"
                onChange={(e) => setInput(e.target.value)}
                className={styles.input}
              />
            </div>
            <div className={styles.row2}>{grade.gpa4}</div>
            <div className={styles.row3}>{grade.letter}</div>
          </div>
        </div>
      </div>

      {children}

      {/* ============ HUONG DAN ============ */}
      <section className={styles.section}>
        <div className={styles.box7}>
          <span className={styles.label}>
            <Settings size={22} className={styles.box8} />
          </span>
          <h3 className={styles.subheading}>Hướng dẫn sử dụng</h3>
          <p className={styles.text}>
            Quy đổi điểm hệ 10 sang hệ 4 và thang điểm chữ một cách chính xác
          </p>
        </div>

        <div className={styles.grid2}>
          {/* Duong ke noi cac buoc, chay qua TAM cac vong tron so.
              Phan tu absolute dinh vi theo PADDING BOX cua khung cha, nen phai
              cong ca pt-8 (2rem) vao, khong thi duong ke nam lo lung phia tren. */}
          <div aria-hidden className={styles.floating} />

          <Step n={1} title="Chọn thang điểm">
            <p className={styles.text2}>
              Chọn cấu trúc thang điểm phù hợp với trường của bạn. Hệ thống hỗ trợ 3 cấu
              trúc thang điểm phổ biến: (A+ A B+ B C+ C D+ D F), (A B+ B C+ C D+ D F), (A
              B C D F).
            </p>
          </Step>

          <Step n={2} title="Bảng quy đổi điểm">
            <p className={styles.text2}>
              Điểm quy ra hệ 4 và hệ chữ theo thang điểm đã chọn:
            </p>
            <div className={styles.box9}>
              <GradeMappingTable scale={scale} />
            </div>
          </Step>

          <Step n={3} title="Nhập và quy đổi">
            <p className={styles.text2}>
              Nhập điểm hệ 10 vào bảng, hệ thống sẽ tự động tính toán và quy đổi sang hệ 4
              cùng thang điểm chữ ngay lập tức.
            </p>
          </Step>
        </div>
      </section>
    </>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <div className={styles.box7}>
      {/* relative de vong tron ve DE LEN duong ke, khong bi ke cat ngang */}
      <span className={styles.label2}>{n}</span>
      <h4 className={styles.minorHeading2}>{title}</h4>
      {children}
    </div>
  );
}
