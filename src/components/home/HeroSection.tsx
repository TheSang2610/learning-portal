"use client";

import Link from "next/link";
import { useRef, useState } from "react";

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
//
// Bon cai the trang truoc day bay lo lung quanh thap ("Video bài giảng",
// "Trắc nghiệm chấm ngay", "Tiến độ tự lưu", "Chứng nhận có mã") gio nam han
// vao trong tang cua no. Chung von la bon dac diem cua bon buoc hoc, ma lai
// treo o bon goc man hinh khong dinh gi den tang nao - doc xong khong biet
// cai nao thuoc ve cai nao. Dua vao trong roi thi bam tang nao ra dac diem
// tang do, va cung khong con bon mon do noi lo lung che mat thap nua.
const TANG = [
  {
    ten: "Bài 1 · Nhập môn",
    a: "#2A0F9E",
    b: "#4F2BFF",
    bieu: "▶",
    nen: "#EFEAFF",
    muc: "#4F2BFF",
    nhan: "Video bài giảng",
    mo: "Bài giảng quay sẵn, tua tới tua lui bao nhiêu lần cũng được.",
  },
  {
    ten: "Bài 2 · Thực hành",
    a: "#4F2BFF",
    b: "#8B6BFF",
    bieu: "⌁",
    nen: "#FFE6F1",
    muc: "#FF3E9D",
    nhan: "Tiến độ tự lưu",
    mo: "Làm tới đâu lưu tới đó. Đóng máy giữa chừng, mở lại vẫn đúng chỗ cũ.",
  },
  {
    ten: "Bài 3 · Dự án nhỏ",
    a: "#7B4BFF",
    b: "#B98BFF",
    bieu: "◆",
    nen: "#F1EAFF",
    muc: "#7B4BFF",
    nhan: "Làm thật một lần",
    mo: "Gộp phần đã học ở hai bài trước thành một bài làm hoàn chỉnh.",
  },
  {
    ten: "Bài 4 · Kiểm tra",
    a: "#009A90",
    b: "#00BFB3",
    bieu: "✓",
    nen: "#D6F7F4",
    muc: "#00857B",
    nhan: "Trắc nghiệm chấm ngay",
    mo: "Nộp xong biết điểm luôn, không phải chờ ai chấm.",
  },
  {
    ten: "Chứng nhận",
    a: "#E89400",
    b: "#FFC93C",
    bieu: "★",
    nen: "#FFF1D4",
    muc: "#B37400",
    nhan: "Chứng nhận có mã",
    mo: "Mỗi chứng nhận mang một mã riêng, ai cũng tra lại được là thật.",
  },
];

interface Props {
  /** So khoa dang mo, do trang chu dem duoc tu API. */
  soKhoa?: number;
  /** So khoa gia 0. */
  soMienPhi?: number;
}

export default function HeroSection({ soKhoa, soMienPhi }: Props) {
  // Mac dinh chon tang 1: trang luc dung yen phai dang o dau lo trinh, dung
  // nhu cau "đi lên từng tầng" - khong phai dang o dich.
  const [dangChon, setDangChon] = useState(0);
  const nut = useRef<(HTMLButtonElement | null)[]>([]);
  const tang = TANG[dangChon];

  // Mui ten LEN di len tang tren, tuc la tang chi so LON hon: chi so 0 la
  // tang day thap. Neu lam nguoc lai thi ban phim chay nguoc voi cai mat
  // dang nhin.
  function bamPhim(e: React.KeyboardEvent<HTMLDivElement>) {
    let toi = -1;
    if (e.key === "ArrowUp") toi = (dangChon + 1) % TANG.length;
    else if (e.key === "ArrowDown") toi = (dangChon - 1 + TANG.length) % TANG.length;
    else if (e.key === "Home") toi = 0;
    else if (e.key === "End") toi = TANG.length - 1;
    if (toi < 0) return;

    e.preventDefault();
    setDangChon(toi);
    nut.current[toi]?.focus();
  }

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

        {/* Thap 5 tang, bam duoc tung tang.
            Truoc day ca khoi nay la aria-hidden vi no chi la hinh trang tri.
            Gio khong duoc nua: ben trong co nut bam that, ma de mot phan tu
            bam duoc nam trong vung aria-hidden thi nguoi dung trinh doc man
            hinh van tab toi duoc no nhung khong nghe thay gi ca. */}
        <div className="relative flex min-h-[28rem] flex-col items-center justify-end gap-6 pt-[7.5rem] [perspective:1200px] md:min-h-[30rem]">
          {/* Ba the long nhau, moi the mot viec - xem ghi chu ".thap" trong
              globals.css. Don ca ba vao mot the thi chung dam transform nhau. */}
          <div className="thap-troi relative size-60">
            <div
              role="tablist"
              aria-orientation="vertical"
              aria-label="Các tầng của một khoá học"
              onKeyDown={bamPhim}
              className="thap size-full [transform:rotateX(58deg)_rotateZ(-38deg)] transition-transform duration-600 [transform-style:preserve-3d] hover:[transform:rotateX(48deg)_rotateZ(-28deg)]"
            >
              {TANG.map((t, i) => (
                <button
                  key={t.ten}
                  type="button"
                  role="tab"
                  id={`tang-${i}`}
                  ref={(el) => {
                    nut.current[i] = el;
                  }}
                  aria-selected={i === dangChon}
                  aria-controls="o-tang"
                  // Ca nhom nut chi chiem MOT diem dung Tab. Vao roi thi di
                  // giua cac tang bang mui ten - dung chuan tablist, va cung
                  // de nguoi dung ban phim khong phai bam Tab nam lan moi qua
                  // duoc cai thap.
                  tabIndex={i === dangChon ? 0 : -1}
                  onClick={() => setDangChon(i)}
                  className="tang absolute inset-0 grid cursor-pointer place-items-center rounded-[18px] border border-white/45"
                  style={
                    {
                      background: `linear-gradient(135deg, ${t.a}, ${t.b})`,
                      // Quang sang di qua bien de CSS con ghep them duoc vong
                      // vien luc chon / luc lay tieu diem (xem globals.css).
                      "--hao": `0 0 40px -8px ${t.a}`,
                      // Vi tri cuoi cua tang, CSS doc lai o ca hieu ung xep
                      // len lan luc ro chuot.
                      "--z": `${i * 48}px`,
                      "--s": `${1 - i * 0.07}`,
                      // Tang duoi len truoc, cach nhau 150ms. Tang chung nhan
                      // dap xuong sau cung, dung nhu thu tu hoc that.
                      "--tre": `${120 + i * 150}ms`,
                      // Nhung tang NAM TREN tang dang chon bi day cao them,
                      // mo ra mot khe ho ngay tren no. Nho khe ho do ma tang
                      // dang chon lo ra du chieu cao de doc duoc chu va de
                      // bam trung bang ngon tay.
                      "--nhoi": i > dangChon ? "32px" : "0px",
                    } as React.CSSProperties
                  }
                >
                  <b
                    className="font-mono text-[.7rem] font-semibold tracking-[.1em] whitespace-nowrap text-white uppercase [text-shadow:0_1px_6px_rgb(0_0_0/.4)]"
                    style={{ transform: "rotateZ(38deg) rotateX(-58deg)" }}
                  >
                    {t.ten}
                  </b>
                </button>
              ))}
            </div>
          </div>

          {/* O noi dung cua tang dang chon.
              min-h co dinh de doi tang khong lam ca trang nhay len nhay xuong
              theo do dai cau chu. */}
          <div
            id="o-tang"
            role="tabpanel"
            aria-labelledby={`tang-${dangChon}`}
            tabIndex={0}
            className="w-[min(23rem,100%)] rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_20px_34px_-24px_rgb(11_12_30/.45)]"
          >
            {/* key doi theo tang nen React thay the han khoi nay -> hieu ung
                hien ra chay lai moi lan bam, chu khong chi doi chu am tham. */}
            <div key={dangChon} className="o-tang flex items-start gap-3">
              <i
                aria-hidden="true"
                className="grid size-9 shrink-0 place-items-center rounded-xl text-[.95rem] not-italic"
                style={{ background: tang.nen, color: tang.muc }}
              >
                {tang.bieu}
              </i>
              <div className="min-w-0">
                <p className="font-mono text-[.62rem] font-semibold tracking-[.14em] text-slate-400 uppercase">
                  Tầng {dangChon + 1} / {TANG.length}
                </p>
                <p className="font-hien text-muc mt-0.5 text-[.95rem] font-bold">
                  {tang.nhan}
                </p>
                <p className="mt-1 text-[.85rem] leading-relaxed text-slate-500">
                  {tang.mo}
                </p>
              </div>
            </div>
          </div>

          <p className="text-[.8rem] text-slate-500">
            Bấm vào từng tầng để xem tầng đó có gì
          </p>
        </div>
      </div>
    </header>
  );
}
