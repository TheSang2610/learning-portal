import { FileText, Landmark, UserRound, type LucideIcon } from "lucide-react";

import type { DocumentStats as ThongKe } from "@/src/services/document";

import styles from "./DocumentStats.module.scss";

// So gon kieu mang xa hoi: 1.234 -> "1,2K", 2.500.000 -> "2,5M".
const soGon = (n: number) =>
  new Intl.NumberFormat("vi-VN", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);

/**
 * Section so lieu o trang /share-document: ba the so that cua kho (tai lieu,
 * truong, nguoi chia se), moi the mot nhan mau. Cac mang mau trang tri o bon
 * goc dung lai bo SVG o public/images/share-document/.
 *
 * Component MAY CHU - so lieu lay san o page.tsx.
 */
export default function DocumentStats({ tk }: { tk: ThongKe }) {
  const the: { so: number; Icon: LucideIcon; nhan: string; tag: string; mau: string }[] =
    [
      {
        so: tk.soTaiLieu,
        Icon: FileText,
        nhan: "Tài liệu học tập",
        tag:
          tk.moiTuanNay > 0
            ? `${soGon(tk.moiTuanNay)} tài liệu mới tuần này`
            : `${tk.soMon} môn học`,
        mau: styles.tim,
      },
      {
        so: tk.soTruong,
        Icon: Landmark,
        nhan: "Trường đại học",
        tag: `${tk.soLinhVuc} lĩnh vực`,
        mau: styles.xanhLa,
      },
      {
        so: tk.soNguoiChiaSe,
        Icon: UserRound,
        nhan: "Người chia sẻ",
        tag: `${soGon(tk.tongLuotTai)} lượt tải`,
        mau: styles.cam,
      },
    ];

  return (
    <section className={styles.bang} aria-labelledby="tieu-de-so-lieu">
      <span aria-hidden className={`${styles.hinh} ${styles.trenTrai}`} />
      <span aria-hidden className={`${styles.hinh} ${styles.duoiTrai}`} />
      <span aria-hidden className={`${styles.hinh} ${styles.trenPhai}`} />
      <span aria-hidden className={`${styles.hinh} ${styles.duoiPhai}`} />

      <div className={styles.khung}>
        <h2 id="tieu-de-so-lieu" className={styles.tieuDe}>
          Tài liệu thật, từ chính cộng đồng sinh viên
        </h2>
        <p className={styles.moTa}>
          Tài liệu mới được thêm mỗi ngày bởi sinh viên các trường trên cả nước.
        </p>

        <ul className={styles.ds}>
          {the.map(({ so, Icon, nhan, tag, mau }) => (
            <li key={nhan} className={styles.the}>
              <span className={styles.so}>{soGon(so)}</span>
              <span className={styles.nhan}>
                <Icon size={20} aria-hidden />
                {nhan}
              </span>
              <span className={`${styles.tag} ${mau}`}>{tag}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
