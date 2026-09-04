"use client";

import Link from "next/link";

/**
 * Phan mo dau trang chu.
 *
 * Truoc day day la bang bang khuyen mai do admin dat, tu doi anh sau vai
 * giay. Bo di vi ba ly do:
 *
 *   1. Anh banner do admin tai len, moi tam vai tram KB, nam ngay cho de
 *      nhat trang - do la thu Google do khi cham diem toc do.
 *   2. Noi dung kieu "Giam 30% den het thang" phai co nguoi nho vao sua,
 *      khong sua thi thang sau van con nam do va thanh loi hua sai.
 *   3. No khong noi trang nay LA GI. Nguoi la vao lan dau doc xong van
 *      khong biet day la noi ban khoa hoc hay noi hoc mien phi.
 *
 * Thay bang mot cau noi ro san pham, va mot vat the 3D dung bang CSS - do
 * day cua thap chinh la so bai trong mot khoa.
 */

// So tang = so bai hoc cua mot khoa tieu bieu. Tang tren cung la chung nhan.
const TANG = [
  { ten: "Bài 1 · Nhập môn", a: "#2A0F9E", b: "#4F2BFF" },
  { ten: "Bài 2 · Thực hành", a: "#4F2BFF", b: "#8B6BFF" },
  { ten: "Bài 3 · Dự án nhỏ", a: "#7B4BFF", b: "#B98BFF" },
  { ten: "Bài 4 · Kiểm tra", a: "#009A90", b: "#00BFB3" },
  { ten: "Chứng nhận", a: "#E89400", b: "#FFC93C" },
];

const THE_BAY = [
  {
    chu: "Video bài giảng",
    bieu: "▶",
    nen: "#EFEAFF",
    muc: "#4F2BFF",
    vitri: "top-[6%] left-[-2%]",
  },
  {
    chu: "Trắc nghiệm chấm ngay",
    bieu: "✓",
    nen: "#D6F7F4",
    muc: "#00857B",
    vitri: "top-[30%] right-[-4%]",
  },
  {
    chu: "Tiến độ tự lưu",
    bieu: "⌁",
    nen: "#FFE6F1",
    muc: "#FF3E9D",
    vitri: "bottom-[26%] left-[-6%]",
  },
  {
    chu: "Chứng nhận có mã",
    bieu: "★",
    nen: "#FFF1D4",
    muc: "#B37400",
    vitri: "bottom-[6%] right-[2%]",
  },
];

interface Props {
  /** So khoa dang mo, do trang chu dem duoc tu API. */
  soKhoa?: number;
  /** So khoa gia 0. */
  soMienPhi?: number;
}

export default function HeroSection({ soKhoa, soMienPhi }: Props) {
  return (
    <header className="relative overflow-hidden bg-white pt-12 pb-10 md:pt-20 md:pb-16">
      {/* Luoi ke mo dan + hai quang sang. Thuan CSS, khong tai anh nao. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(46% 46% at 74% 34%, rgb(79 43 255 / .13), transparent 70%),
            radial-gradient(34% 34% at 88% 66%, rgb(0 191 179 / .12), transparent 70%),
            linear-gradient(#E9E9F2 1px, transparent 1px),
            linear-gradient(90deg, #E9E9F2 1px, transparent 1px)`,
          backgroundSize: "auto, auto, 52px 52px, 52px 52px",
          maskImage: "radial-gradient(72% 68% at 62% 42%, #000 30%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(72% 68% at 62% 42%, #000 30%, transparent 100%)",
        }}
      />

      <div className="relative z-2 mx-auto grid w-[min(76rem,100%-2.5rem)] items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          {soMienPhi ? (
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1.5 pr-4 pl-1.5 text-sm font-medium shadow-sm">
              <b className="bg-ngoc rounded-full px-2 py-0.5 font-mono text-[.66rem] font-semibold text-[#04231F]">
                MỚI
              </b>
              {soMienPhi} khóa đang mở miễn phí
            </span>
          ) : null}

          <h1 className="font-hien text-muc text-[clamp(2.4rem,5.4vw,4rem)] leading-[1.1] font-extrabold tracking-[-.035em] text-balance">
            Đi lên từng tầng,
            <br />
            <span className="text-tim relative inline-block">
              không nhảy cóc
              {/* Net gach chan ve tay - khong phai border-bottom thang tap */}
              <svg
                viewBox="0 0 300 20"
                preserveAspectRatio="none"
                aria-hidden="true"
                className="absolute -bottom-[.32em] left-[-2%] h-[.4em] w-[104%] overflow-visible"
              >
                <path
                  d="M4 13 C 60 4, 110 18, 168 9 S 262 6, 296 12"
                  fill="none"
                  stroke="#00BFB3"
                  strokeWidth="7"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          <p className="mt-6 max-w-[56ch] text-[1.06rem] text-slate-500">
            Mỗi khóa là một chồng bài có thứ tự: xem bài giảng, làm bài tập, qua được mới
            lên tầng kế. Tới tầng cuối thì có chứng nhận tra cứu được.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/courses"
              className="from-tim-2 to-tim font-hien inline-flex items-center gap-2.5 rounded-full bg-linear-to-br px-7 py-3.5 text-base font-bold text-white shadow-[0_16px_30px_-16px_rgb(79_43_255/.85)] transition hover:-translate-y-0.5"
            >
              Học thử miễn phí
              <span className="grid size-6.5 place-items-center rounded-full bg-white/20">
                →
              </span>
            </Link>
            <Link
              href="/courses"
              className="font-hien text-muc hover:border-tim hover:text-tim rounded-full border border-slate-200 bg-white px-7 py-3.5 text-base font-bold transition"
            >
              {soKhoa ? `Xem ${soKhoa} khóa học` : "Xem tất cả khóa học"}
            </Link>
          </div>
        </div>

        {/* Thap 5 tang. aria-hidden vi noi dung cua no da nam trong doan chu
            ben trai - de trinh doc man hinh doc lai lan nua la thua. */}
        <div className="relative grid min-h-[26rem] place-items-center [perspective:1200px] md:min-h-[30rem]">
          <div
            aria-hidden="true"
            className="relative size-60 [transform:rotateX(58deg)_rotateZ(-38deg)] transition-transform duration-600 [transform-style:preserve-3d] hover:[transform:rotateX(48deg)_rotateZ(-28deg)]"
          >
            {TANG.map((t, i) => (
              <div
                key={t.ten}
                className="absolute inset-0 grid place-items-center rounded-[18px] border border-white/45"
                style={{
                  background: `linear-gradient(135deg, ${t.a}, ${t.b})`,
                  boxShadow: `0 0 40px -8px ${t.a}`,
                  transform: `translateZ(${i * 46}px) scale(${1 - i * 0.07})`,
                }}
              >
                <b
                  className="font-mono text-[.7rem] font-semibold tracking-[.1em] whitespace-nowrap text-white uppercase [text-shadow:0_1px_6px_rgb(0_0_0/.4)]"
                  style={{ transform: "rotateZ(38deg) rotateX(-58deg)" }}
                >
                  {t.ten}
                </b>
              </div>
            ))}
          </div>

          {THE_BAY.map((t) => (
            <div
              key={t.chu}
              className={`absolute z-5 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-[.82rem] font-medium whitespace-nowrap shadow-[0_20px_34px_-24px_rgb(11_12_30/.45)] ${t.vitri}`}
            >
              <i
                className="grid size-6.5 place-items-center rounded-lg text-[.85rem] not-italic"
                style={{ background: t.nen, color: t.muc }}
              >
                {t.bieu}
              </i>
              {t.chu}
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}
