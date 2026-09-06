import Link from "next/link";
import { ArrowRight } from "lucide-react";

// Tieu de dung chung cho cac muc o nua duoi trang chu.
//
// Truoc day moi muc tu dat co chu: "Kham pha danh muc" la text-sm, "Khoa hoc
// moi va pho bien" la text-xl, "Tat ca khoa hoc" text-2xl, "Cau hoi thuong
// gap" text-3xl. Bon muc ngang hang nhau ma bon co chu khac nhau thi mat doc
// khong con biet cai nao quan trong hon cai nao - nhat la muc danh muc, nho
// den muc trong nhu mot thanh loc chu khong phai mot phan cua trang.
//
// Gom ve mot cho thi ca bon deu la mot bac, va sau nay doi co chu chi phai sua
// mot lan.

interface Props {
  tieuDe: string;
  moTa?: string;
  /** Duong dan cho lien ket "xem tat ca" o goc phai, neu muc do co cho de xem tiep. */
  xemTatCa?: string;
  chuXemTatCa?: string;
  /**
   * The tieu de dung o day.
   *
   * Mac dinh h2 vi cho dung nhieu nhat la mot MUC trong trang chu, ma trang do
   * da co h1 rieng. Khi component nay lam tieu de CHINH cua ca trang (/courses,
   * /collection, /blog...) thi phai truyen "h1": mot trang chi co dung mot h1,
   * va no phai la cau tra loi cho "trang nay noi ve cai gi". Dat nham thanh h2
   * thi trang mat h1 - cong cu tim kiem va trinh doc man hinh deu doc theo
   * bac tieu de nay de dung dan y cua trang.
   */
  nhu?: "h1" | "h2";
}

export default function TieuDeMuc({
  tieuDe,
  moTa,
  xemTatCa,
  chuXemTatCa,
  nhu = "h2",
}: Props) {
  const The = nhu;

  return (
    <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
      <div>
        {/* text-balance: tieu de hai dong tren man hinh hep se ngat can doi
            thay vi de mot tu roi tho lo o dong duoi. */}
        <The className="text-[26px] leading-tight font-bold tracking-tight text-balance text-slate-900 md:text-[32px]">
          {tieuDe}
        </The>
        {moTa && (
          <p className="mt-2 max-w-[62ch] text-[15px] leading-relaxed text-slate-500">
            {moTa}
          </p>
        )}
      </div>

      {xemTatCa && (
        <Link
          href={xemTatCa}
          className="group inline-flex shrink-0 items-center gap-1.5 rounded-lg px-1 py-1 text-sm font-semibold text-blue-700 transition hover:text-blue-800 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
        >
          {chuXemTatCa ?? "Xem tất cả"}
          <ArrowRight
            size={16}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </Link>
      )}
    </div>
  );
}
