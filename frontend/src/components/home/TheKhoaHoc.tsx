import Link from "next/link";
import { BookOpen, Building2, PlayCircle } from "lucide-react";
import SafeImage from "@/src/components/ui/SafeImage";
import type { Course } from "@/src/services/course";

// Mot the khoa hoc duy nhat, dung chung cho ca hai muc o trang chu.
//
// Truoc day moi muc tu ve the cua no: muc bang xep hang la mot dong ngang cao
// 56px, muc danh sach la mot the doc - hai kieu chu, hai kieu vien, hai cach
// hien gia. Sua mot cho thi cho kia van cu. Gio mot component, sua mot lan.

const TEN_CAP_DO: Record<string, string> = {
  beginner: "Sơ cấp",
  intermediate: "Trung cấp",
  advanced: "Cao cấp",
};

interface Props {
  khoa: Course;
  /**
   * Thu hang trong bang xep hang, tinh tu 1.
   *
   * Chi truyen o nhung muc THUC SU la xep hang. Gan so vao mot danh sach
   * khong co thu tu la noi doi voi nguoi doc: ho se tuong khoa dau bang la
   * khoa duoc chuong nhat trong khi that ra chi la khoa nam dau mang.
   */
  thuHang?: number;
  /** Kich thuoc anh bao trinh duyet tai dung do phan giai can dung. */
  sizes?: string;
}

export default function TheKhoaHoc({ khoa, thuHang, sizes }: Props) {
  const nhaCungCap =
    khoa.provider && typeof khoa.provider === "object" ? khoa.provider : null;
  const mienPhi = khoa.price === 0;
  const soBai = khoa.lessons?.length || 0;
  const capDo = TEN_CAP_DO[String(khoa.level).toLowerCase()] ?? khoa.level;

  return (
    <Link
      href={`/course?slug=${khoa.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/70 bg-white transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_12px_28px_-16px_rgba(0,86,210,.4)] focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
        {khoa.thumbnail ? (
          <SafeImage
            src={khoa.thumbnail}
            alt=""
            fill
            sizes={sizes ?? "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"}
            className="object-cover transition duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <span className="flex h-full items-center justify-center">
            <BookOpen size={32} className="text-slate-300" />
          </span>
        )}

        {thuHang !== undefined && (
          // Anh khoa hoc phan lon la anh chup toi mau, chu trang tren anh khong
          // du tuong phan o moi tam anh - nen so nam trong mot vien dac chu
          // khong de tran tren anh.
          <span className="absolute top-2.5 left-2.5 flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900/85 text-[13px] font-bold text-white tabular-nums backdrop-blur-sm">
            {thuHang}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        {/* min-h giu day cac the thang hang khi ten khoa dai ngan khac nhau.
            Khong co no thi the co ten mot dong se lech len, va hang the trong
            nhu bi rung. */}
        <h3 className="line-clamp-2 min-h-[2.75rem] text-[15px] leading-snug font-semibold text-slate-900 transition group-hover:text-blue-700">
          {khoa.title}
        </h3>

        {/* CHI don vi dao tao, khong kem ten giang vien.
            The rong khoang 300px, chu 13px chi vua chung 30 ky tu - nhet ca
            hai vao thi ban nao cung bi cat cut, doc khong ra ("Nguyen Va... .
            TechAcademy Vi..."). Giu don vi vi do la tin hieu uy tin khi nguoi
            ta dang luot chon; ten giang vien co day du o trang chi tiet. */}
        {nhaCungCap && (
          <p className="mt-2 flex min-w-0 items-center gap-1.5 text-[13px]">
            {nhaCungCap.logo ? (
              <span className="flex h-4 w-4 shrink-0 items-center justify-center overflow-hidden rounded border border-slate-200 bg-white">
                <SafeImage
                  src={nhaCungCap.logo}
                  alt=""
                  width={16}
                  height={16}
                  className="h-full w-full object-contain"
                />
              </span>
            ) : (
              <Building2 size={13} className="shrink-0 text-violet-400" />
            )}
            <span className="truncate font-medium text-violet-600">
              {nhaCungCap.name}
            </span>
          </p>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
          <span className="flex min-w-0 items-center gap-2 text-[12.5px] text-slate-500">
            <span className="rounded bg-slate-100 px-1.5 py-0.5 font-medium text-slate-600">
              {capDo}
            </span>
            <span className="flex shrink-0 items-center gap-1">
              <PlayCircle size={13} className="text-slate-400" />
              {soBai} bài
            </span>
          </span>

          {/* Gia la thu quyet dinh bam hay khong bam, nen no la chu lon nhat
              o hang duoi.
              Khoa mien phi hien mot nhan xanh ngay tai day chu khong phai mot
              nhan goc anh: hang duoi cua moi the deu thang cot voi nhau, nen
              luot mot hang the la so sanh duoc gia ngay, con nhan tren anh thi
              moi cai mot cho. */}
          {mienPhi ? (
            <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[13px] font-bold text-emerald-700">
              Miễn phí
            </span>
          ) : (
            <span className="shrink-0 text-[15px] font-bold text-slate-900">
              {khoa.price.toLocaleString("vi-VN")}đ
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
