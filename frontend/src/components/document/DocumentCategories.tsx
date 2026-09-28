import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  Code,
  Cpu,
  FlaskConical,
  GraduationCap,
  Landmark,
  Languages,
  Network,
  Palette,
  Scale,
  Sigma,
  Stethoscope,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

import type { BieuTuongLinhVuc, DocumentCategory } from "@/src/services/document";
import { DUONG_TAT_CA, duongTatCa } from "./duongDan";

import styles from "./DocumentCategories.module.scss";

/**
 * Bieu tuong + mau cua tung loai linh vuc. Khoa khop BIEU_TUONG ben backend
 * (models/DocumentCategory.js) - admin chon trong danh sach nay.
 */
export const BIEU_TUONG: Record<
  BieuTuongLinhVuc,
  { Icon: LucideIcon; mau: string; nhan: string }
> = {
  sach: { Icon: BookOpen, mau: "xanh", nhan: "Sách" },
  luat: { Icon: Scale, mau: "tim", nhan: "Luật" },
  "kinh-doanh": { Icon: Briefcase, mau: "cam", nhan: "Kinh doanh" },
  "kinh-te": { Icon: TrendingUp, mau: "xanhLa", nhan: "Kinh tế" },
  "he-thong": { Icon: Network, mau: "xanh", nhan: "Hệ thống" },
  "lap-trinh": { Icon: Code, mau: "ngoc", nhan: "Lập trình" },
  toan: { Icon: Sigma, mau: "hong", nhan: "Toán" },
  "khoa-hoc": { Icon: FlaskConical, mau: "xanhLa", nhan: "Khoa học" },
  "y-te": { Icon: Stethoscope, mau: "hong", nhan: "Y tế" },
  "ngoai-ngu": { Icon: Languages, mau: "tim", nhan: "Ngoại ngữ" },
  "chinh-tri": { Icon: Landmark, mau: "vang", nhan: "Chính trị" },
  "ky-thuat": { Icon: Cpu, mau: "ngoc", nhan: "Kỹ thuật" },
  "thiet-ke": { Icon: Palette, mau: "cam", nhan: "Thiết kế" },
  "giao-duc": { Icon: GraduationCap, mau: "vang", nhan: "Giáo dục" },
};

/**
 * "Kham pha theo linh vuc" o trang /share-document: moi o la mot nhom mon lon
 * (Luat, Kinh doanh, He thong thong tin...). Bam vao la trang tat ca tai lieu
 * loc san theo linh vuc do.
 *
 * Component MAY CHU - khong co trang thai, du lieu lay san o page.tsx.
 */
export default function DocumentCategories({ dsNhom }: { dsNhom: DocumentCategory[] }) {
  return (
    <section className={styles.bang} aria-labelledby="tieu-de-linh-vuc">
      <div className={styles.khung}>
        <div className={styles.dau}>
          <div>
            <h2 id="tieu-de-linh-vuc" className={styles.tieuDe}>
              Khám phá theo lĩnh vực
            </h2>
            <p className={styles.moTa}>
              Tài liệu được xếp theo nhóm ngành. Chọn một lĩnh vực để xem mọi môn và tài
              liệu thuộc về nó.
            </p>
          </div>
          <Link href={DUONG_TAT_CA} className={styles.xemTatCa}>
            Xem tất cả tài liệu
            <ArrowRight size={16} />
          </Link>
        </div>

        {dsNhom.length === 0 ? (
          <p className={styles.trong}>Chưa có lĩnh vực nào.</p>
        ) : (
          <ul className={styles.luoi}>
            {dsNhom.map((n) => {
              const bt = BIEU_TUONG[n.bieuTuong] ?? BIEU_TUONG.sach;
              return (
                <li key={n._id}>
                  <Link href={duongTatCa({ nhom: n.key })} className={styles.o}>
                    <span className={`${styles.bieuTuong} ${styles[bt.mau]}`} aria-hidden>
                      <bt.Icon size={22} />
                    </span>
                    <span className={styles.ten}>{n.ten}</span>
                    <span className={styles.dem}>
                      {n.soTaiLieu > 0
                        ? `${n.soTaiLieu} tài liệu · ${n.soMon} môn`
                        : n.soMon > 0
                          ? `${n.soMon} môn · chưa có tài liệu`
                          : "Sắp có tài liệu"}
                    </span>
                    {n.monTieuBieu.length > 0 && (
                      <span className={styles.mon}>
                        {n.monTieuBieu.map((m) => m.ten).join(" · ")}
                      </span>
                    )}
                    <ArrowRight size={16} className={styles.mui} aria-hidden />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
