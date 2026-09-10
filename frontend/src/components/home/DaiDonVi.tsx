import type { CSSProperties } from "react";

import type { ProviderData } from "@/src/services/provider";

/**
 * Dai ten don vi dao tao chay ngang, dat ngay duoi phan mo dau.
 *
 * KHONG ghi them ten truong hay cong ty nao ngoai danh sach that trong
 * `providers`. Mot dai ten don vi la mot LOI KHANG DINH ve quan he hop tac,
 * khong phai chu trang tri: dien ten mot don vi chua he hop tac vao day la
 * mao danh ho, va trang nay se nam trong ho so xin viec.
 *
 * Danh sach ngan thi dai ngan - do la trung thuc, khong phai loi thiet ke.
 */

interface Props {
  donVi: ProviderData[];
}

export default function DaiDonVi({ donVi }: Props) {
  if (!donVi.length) return null;

  // Lap cho du dai de mot vong chay khong lo ra khoang trong o man hinh rong.
  const day = [...donVi, ...donVi, ...donVi].slice(0, Math.max(6, donVi.length * 2));

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
  // cong PX_MOI_MUC co dinh cho khoang cach hai ben va dau ✦ ngan giua. Chia
  // cho toc do mong muon la ra thoi gian. Doi co chu hay khoang cach o duoi thi
  // phai do lai hai hang so nay.
  // Hai hang so duoi day KHONG phai uoc doan: chung giai ra tu hai lan do that
  // (3 don vi ten day du = 6 muc / 96 ky tu / 2750px, va 22 don vi viet tat =
  // 44 muc / 198 ky tu / 8315px). Cung mot cap so khop ca hai, lech duoi 2%.
  const PX_MOI_KY_TU = 24; // phan chu, o co chu clamp(1.1rem,2.4vw,1.7rem)
  const PX_MOI_MUC = 81; // phan co dinh: gap-12 hai ben + dau ✦
  const PX_MOI_GIAY = 81; // toc do doc duoc (trung so 81 o tren la ngau nhien)

  const tongKyTu = day.reduce((tong, d) => tong + d.name.length, 0);
  const rongUocTinh = day.length * PX_MOI_MUC + tongKyTu * PX_MOI_KY_TU;
  const giayMotVong = Math.max(20, Math.round(rongUocTinh / PX_MOI_GIAY));

  const mot = (an: boolean) => (
    <div
      className="flex items-center gap-6 pr-6 md:gap-12 md:pr-12"
      aria-hidden={an || undefined}
    >
      {day.map((d, i) => (
        <span
          key={`${d._id ?? d.name}-${i}`}
          className="flex items-center gap-6 md:gap-12"
        >
          <span className="font-hien text-muc text-[clamp(1.1rem,2.4vw,1.7rem)] font-bold tracking-[-.03em] whitespace-nowrap">
            {d.name}
          </span>
          <span className="text-tim">✦</span>
        </span>
      ))}
    </div>
  );

  return (
    <section className="border-y border-slate-200 bg-slate-50 py-5 md:py-8">
      <div className="relative overflow-hidden">
        {/* Mo hai dau de chu troi vao troi ra chu khong bi cat cut giua chung */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-2 w-12 bg-linear-to-r from-slate-50 to-transparent md:w-36" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-2 w-12 bg-linear-to-l from-slate-50 to-transparent md:w-36" />

        <div
          className="flex w-max animate-[troi-ngang_var(--nhip)_linear_infinite] motion-reduce:animate-none"
          style={{ "--nhip": `${giayMotVong}s` } as CSSProperties}
        >
          {mot(false)}
          {mot(true)}
        </div>
      </div>
    </section>
  );
}
