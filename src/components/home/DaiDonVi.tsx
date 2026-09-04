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

        <div className="flex w-max animate-[troi-ngang_34s_linear_infinite] motion-reduce:animate-none">
          {mot(false)}
          {mot(true)}
        </div>
      </div>
    </section>
  );
}
