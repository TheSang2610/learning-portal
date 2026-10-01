import Image from "next/image";
import type { CSSProperties } from "react";

import SafeImage from "@/src/components/ui/SafeImage";
import type { ProviderData } from "@/src/services/provider";

import styles from "./PartnerMarquee.module.scss";
import { LOGO_DON_VI, type LogoDonVi } from "./partnerLogos";
/**
 * Dai logo don vi dao tao chay ngang, dat ngay duoi phan mo dau.
 *
 * KHONG ghi them truong hay cong ty nao ngoai danh sach that trong `providers`.
 * Mot dai logo don vi la mot LOI KHANG DINH ve quan he hop tac, khong phai do
 * trang tri - logo con noi manh hon ten chu: dat logo mot don vi chua he hop
 * tac vao day la mao danh ho, va trang nay se nam trong ho so xin viec.
 *
 * Don vi nao khong co logo (ca trong CSDL lan trong partnerLogos.ts) thi bi BO
 * QUA, khong hien ten chu thay the - chu dich cua chu du an, de dai dong nhat.
 * Danh sach ngan thi dai ngan - do la trung thuc, khong phai loi thiet ke.
 */

interface Props {
  donVi: ProviderData[];
}

// Chieu cao logo o man hinh rong; phai khop .logo trong file scss.
const CAO_LOGO = 52;
const RONG_TOI_DA = 180;

export default function DaiDonVi({ donVi }: Props) {
  // Logo tai len qua trang admin (CSDL) duoc uu tien hon file dung tam.
  // Logo CSDL khong biet ti le nen coi nhu vuong - chi dung de uoc toc do.
  const coLogo = donVi.flatMap((d) => {
    const anh: LogoDonVi | undefined = d.logo
      ? { src: d.logo, w: 1, h: 1 }
      : LOGO_DON_VI[d.slug];
    return anh ? [{ ...d, anh, tuCsdl: Boolean(d.logo) }] : [];
  });
  if (!coLogo.length) return null;

  // Lap cho du dai de mot vong chay khong lo ra khoang trong o man hinh rong.
  const day = [...coLogo, ...coLogo, ...coLogo].slice(0, Math.max(6, coLogo.length * 2));

  // Thoi gian chay mot vong phai suy ra tu BE RONG cua dai, khong duoc ghi cung.
  //
  // Hai lan hong truoc, ghi lai de khong lam lan ba:
  //
  //  1. Ban dau ghi thang 34s. Dung khi chi co 3 don vi (mot vong ~2750px ->
  //     81 px moi giay, doc kip). Len 13 don vi thi mot vong thanh 11923px ma
  //     van 34s -> 351 px moi giay, ten luot qua nhanh gap hon bon lan.
  //  2. Sua thanh "5,7 giay moi muc". Van hong, chi la hong nguoc lai: cong
  //     thuc do coi moi muc rong bang nhau. Khi danh sach doi tu ten day du
  //     sang viet tat, moi muc hep di gan mot nua ma thoi gian giu nguyen ->
  //     dai bo cham nhu dung yen.
  //
  // Nay dai la logo nen be rong moi muc tinh tu TI LE ANH (w/h trong
  // partnerLogos.ts) nhan chieu cao hien thi, chan o RONG_TOI_DA nhu CSS, cong
  // PX_MOI_MUC co dinh cho hai khoang gap-12 va vach ngan giua.
  const PX_MOI_MUC = 97; // 48px moi ben vach + vach 1px
  const PX_MOI_GIAY = 70;

  const rongUocTinh = day.reduce(
    (tong, d) =>
      tong + Math.min((CAO_LOGO * d.anh.w) / d.anh.h, RONG_TOI_DA) + PX_MOI_MUC,
    0,
  );
  const giayMotVong = Math.max(20, Math.round(rongUocTinh / PX_MOI_GIAY));

  const mot = (an: boolean) => (
    <div className={styles.row} aria-hidden={an || undefined}>
      {day.map((d, i) => (
        <span key={`${d._id ?? d.slug}-${i}`} className={styles.row2}>
          {d.tuCsdl ? (
            <SafeImage
              src={d.anh.src}
              alt={an ? "" : d.name}
              width={CAO_LOGO}
              height={CAO_LOGO}
              loading="eager"
              className={styles.logo}
            />
          ) : (
            <Image
              src={d.anh.src}
              alt={an ? "" : d.name}
              width={d.anh.w}
              height={d.anh.h}
              // Tung de mac dinh (lazy + qua bo toi uu anh) va dai lo ra O TRONG:
              // logo chi bat dau tai khi truot gan khung nhin, ma dai dang chay
              // nen no vao khung truoc khi tai xong; bo toi uu lai cham o lan
              // dau va co luc tra ve anh trong (haui.png). File trong
              // public/logos da thu nho san (<= 68KB) nen tai thang, tai ngay.
              unoptimized
              loading="eager"
              className={styles.logo}
            />
          )}
          <span className={styles.vach} />
        </span>
      ))}
    </div>
  );

  return (
    <section className={styles.section}>
      <div className={styles.box}>
        {/* Mo hai dau de logo troi vao troi ra chu khong bi cat cut giua chung */}
        <div className={styles.floating} />
        <div className={styles.floating2} />

        <div
          className={styles.row3}
          style={{ "--nhip": `${giayMotVong}s` } as CSSProperties}
        >
          {mot(false)}
          {mot(true)}
        </div>
      </div>
    </section>
  );
}
