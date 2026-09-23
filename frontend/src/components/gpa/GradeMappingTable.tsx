import { rangeOf, type Scale } from "./gradeScales";

import styles from "./GradeMappingTable.module.scss";
// Bang quy doi dung chung cho trang Tinh diem tong ket va trang Quy doi 10 -> 4.
// Sinh tu gradeScales.ts nen khong bao gio lech voi ket qua tinh that.

export default function GradeMappingTable({ scale }: { scale: Scale }) {
  return (
    <div className={styles.box}>
      <table className={styles.table}>
        <thead>
          <tr className={styles.row}>
            <th className={styles.headCell}>Điểm hệ 10</th>
            <th className={styles.headCell}>Điểm hệ 4</th>
            <th className={styles.headCell}>Điểm dạng chữ</th>
          </tr>
        </thead>
        <tbody>
          {/* Bang goc liet ke tu thap len cao, mang grades sap giam dan */}
          {scale.grades
            .map((g, i) => ({ g, i }))
            .reverse()
            .map(({ g, i }) => (
              <tr key={g.letter} className={styles.row2}>
                <td className={styles.cell}>{rangeOf(scale, i)}</td>
                <td className={styles.cell}>{g.gpa4}</td>
                <td className={styles.cell2}>{g.letter}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
