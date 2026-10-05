import type { CSSProperties } from "react";

import type { ProviderData } from "@/src/services/provider";
import SafeImage from "@/src/components/ui/SafeImage";

import styles from "./PartnerMarquee.module.scss";
import { LOGO_DON_VI } from "./partnerLogos";
/**
 * Dai ten don vi dao tao chay ngang, dat ngay duoi phan mo dau.
 *
 * KHONG ghi them ten truong hay cong ty nao ngoai danh sach that trong
 * `providers`. Mot dai ten don vi la mot LOI KHANG DINH ve quan he hop tac,
 * khong phai chu trang tri: dien ten mot don vi chua he hop tac vao day la
 * mao danh ho, va trang nay se nam trong ho so xin viec.
 *
 * Dieu do ap dung cho CA LOGO: mot logo la dau hieu nhan dien co chu so huu,
 * dat nham la mao danh ro rang hon ca ghi nham ten. Logo uu tien truong `logo`
 * cua chinh ban ghi trong CSDL; ban ghi nao chua co thi lay file dung tam trong
 * partnerLogos.ts, tra theo `slug` cua chinh don vi do.
 *
 * Danh sach ngan thi dai ngan - do la trung thuc, khong phai loi thiet ke.
 */

interface Props {
  donVi: ProviderData[];
}

export default function DaiDonVi({ donVi }: Props) {
  if (!donVi.length) return null;

  // Lap cho du dai de mot vong chay khong lo ra khoang trong o man hinh rong.
  const coAnh = donVi.map((d) => ({
    ...d,
    logo: d.logo || LOGO_DON_VI[d.slug]?.src || "",
  }));
  const day = [...coAnh, ...coAnh, ...coAnh].slice(0, Math.max(6, coAnh.length * 2));

  // Thoi gian chay mot vong phai suy ra tu BE RONG cua dai, khong duoc ghi cung.
  //
  // Hai lan hong truoc, ghi lai de khong lam lan ba:
  //
  //  1. Ban dau ghi thang 34s. Dung khi chi co 3 don vi (mot vong ~2750px ->
  //     81 px moi giay, doc kip). Len 13 don vi thi mot vong thanh 11923px ma
  //     van 34s -> 351 px moi giay, ten luot qua nhanh gap hon bon lan.
  //  2. Sua thanh "5,7 giay moi muc". Van hong, chi la hong nguoc lai: cong
  //     thuc do coi moi ten dai bang nhau. Khi danh sach doi tu ten day du
  //     ("Đại học Bách Khoa Hà Nội") sang viet tat ("HUST"), moi muc hep di gan
  //     mot nua ma thoi gian giu nguyen -> dai bo cham nhu dung yen.
  //
  // Nen o day uoc luong be rong that: moi ten ton PX_MOI_KY_TU cho phan chu,
  // cong PX_MOI_MUC co dinh cho phan khong doi theo do dai ten. Chia cho toc do
  // mong muon la ra thoi gian. Doi co chu, khoang cach hay co logo o duoi thi
  // PHAI DO LAI hai hang so nay - chung khong suy ra duoc tu CSS.
  //
  // Bo so cu (24 / 81) la cua ban chu tran co lon kem dau ✦. Ban nay logo dan
  // nen ca hai deu doi: chu nho di han (semibold .95rem thay vi bold 1.7rem),
  // con phan co dinh tang vi them logo cao 32px va gap giua hai muc rong ra.
  //
  // SO DUOI DAY DO THAT tren trinh duyet voi 4 don vi that trong CSDL, o khung
  // 1600px (gap md = 72px):
  //   ca day 8 muc = 1515px = 939 (muc) + 576 (8 x gap 72)
  //   8,75 px moi ky tu - do o ban truoc, co chu khong doi nen giu nguyen
  //   phan co dinh = (939 - 40 x 8,75) / 8 = 73,6px, cong 72 gap = 145,6
  // Kiem lai: 8 x 146 + 40 x 9 = 1528 so voi 1515 do duoc, lech 0,9%.
  //
  // Lan do truoc ra 125 khi logo con tha truc tiep (cao 32, khong de). Them de
  // trang 48px thi moi muc rong them ~20px - day dung la loai thay doi bat buoc
  // phai do lai chu khong suy ra duoc.
  const PX_MOI_KY_TU = 9; // phan chu, o co chu clamp(.9rem,1.3vw,.95rem) semibold
  const PX_MOI_MUC = 146; // phan co dinh: de logo 48+ + gap trong 12 + gap ngoai 72
  const PX_MOI_GIAY = 81; // toc do doc duoc, giu nguyen nhu ban cu

  const tongKyTu = day.reduce((tong, d) => tong + d.name.length, 0);
  const rongUocTinh = day.length * PX_MOI_MUC + tongKyTu * PX_MOI_KY_TU;
  const giayMotVong = Math.max(20, Math.round(rongUocTinh / PX_MOI_GIAY));

  const mot = (an: boolean) => (
    <div className={styles.row} aria-hidden={an || undefined}>
      {day.map((d, i) => (
        <span key={`${d._id ?? d.name}-${i}`} className={styles.item}>
          {/* Thieu logo thi bo han o anh, khong de khung rong hay anh vo:
              rieng cai ten van doc duoc, con mot o anh hong thi trong nhu
              trang loi. */}
          {d.logo ? (
            <span className={styles.logoBox}>
              <SafeImage
                src={d.logo}
                // alt rong CO Y: ten don vi nam ngay ben canh duoi dang chu
                // that. De alt="Logo FPT" nua thi trinh doc man hinh doc ten
                // hai lan.
                alt=""
                // Hai so nay chi de next/image biet ty le ma dat cho truoc;
                // kich thuoc that do CSS quyet dinh (cao 28, rong tu do).
                width={92}
                height={28}
                className={styles.logo}
                loading="lazy"
              />
            </span>
          ) : null}
          <span className={styles.label}>{d.name}</span>
        </span>
      ))}
    </div>
  );

  return (
    <section className={styles.section}>
      <div className={styles.box}>
        {/* Mo hai dau de chu troi vao troi ra chu khong bi cat cut giua chung */}
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
