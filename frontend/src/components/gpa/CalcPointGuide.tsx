import { Settings } from "lucide-react";
import GradeMappingTable from "./GradeMappingTable";
import { SCALES } from "./gradeScales";

import styles from "./CalcPointGuide.module.scss";
// Bang quy doi trong huong dan lay theo thang 9 muc (thang day du nhat).
// gradeScales.ts la nguon duy nhat, nen bang nay va ket qua tinh khong bao gio
// lech nhau.
const SCALE = SCALES[0];

const STEPS = [
  {
    title: "Chọn cấu trúc điểm",
    body: "Chọn cấu trúc điểm của môn học tương ứng với hệ số các điểm thành phần. Ví dụ: môn có 4 điểm với hệ số 10%, 10%, 20%, 60% → chọn 10-10-20-60.",
  },
  {
    title: "Chọn thang điểm",
    body: "Chọn cấu trúc thang điểm phù hợp với trường của bạn. Hệ thống hỗ trợ 3 cấu trúc thang điểm phổ biến: (A+ A B+ B C+ C D+ D F), (A B+ B C+ C D+ D F), (A B C D F).",
  },
  { title: "Bảng quy đổi điểm", body: null },
  {
    title: "Tính toán tự động",
    body: "Sau khi nhập điểm, hệ thống sẽ tự động tính toán điểm tổng kết của môn học một cách chính xác và nhanh chóng.",
  },
];

export default function CalcPointGuide() {
  return (
    <section className={styles.section}>
      <div className={styles.box}>
        <span className={styles.label}>
          <Settings size={22} className={styles.box2} />
        </span>
        <h3 className={styles.subheading}>Hướng dẫn sử dụng</h3>
        <p className={styles.text}>
          Công cụ tính điểm tổng kết của môn học, quy đổi ra hệ 4 và xếp loại điểm
        </p>
      </div>

      <div className={styles.grid}>
        {/* Duong ke noi cac buoc, chay qua TAM cac vong tron so.
              Phan tu absolute dinh vi theo PADDING BOX cua khung cha, nen phai
              cong ca pt-8 (2rem) vao, khong thi duong ke nam lo lung phia tren. */}
        <div aria-hidden className={styles.floating} />

        {STEPS.map((s, i) => (
          <div key={s.title} className={styles.box}>
            {/* relative de vong tron ve DE LEN duong ke, khong bi ke cat ngang */}
            <span className={styles.label2}>{i + 1}</span>
            <h4 className={styles.minorHeading}>{s.title}</h4>

            {s.body ? (
              <p className={styles.text2}>{s.body}</p>
            ) : (
              <>
                <p className={styles.text2}>
                  Điểm tổng kết quy ra hệ 4 và hệ chữ (điểm lẻ được làm tròn):
                </p>
                <div className={styles.box3}>
                  <GradeMappingTable scale={SCALE} />
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
