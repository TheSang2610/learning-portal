import Image from "next/image";
import Link from "next/link";
import { GraduationCap, FileText, PenLine, BadgeCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { CSSProperties } from "react";

/**
 * Phan mo dau trang chu.
 *
 * LICH SU DOI, ghi lai de nguoi doc sau khong lam nguoc lai:
 *
 * 1. Ban dau day la bang bang khuyen mai do admin dat, tu doi anh sau vai
 *    giay. Bo di vi anh banner nam ngay cho de nhat trang (Google do toc do
 *    dung o do), vi noi dung kieu "Giam 30% den het thang" khong ai nho sua
 *    nen thang sau thanh loi hua sai, va vi no khong noi trang nay LA GI.
 *
 * 2. Sau do la mot cai thap 5 tang dung bang CSS, bam duoc tung tang. Bo not,
 *    va lan nay KHONG phai vi no sai - no chay tot. Chu du an chon bo cuc
 *    khac: chu ben trai, hinh san pham ben phai. Ma nguon cua thap con nguyen
 *    trong lich su git neu can lay lai.
 *
 * 3. Roi mot khung may tinh dung yen, chi rieng anh ben trong doi. Sai y ban
 *    mau: o ban mau moi canh la mot tam hoan chinh khac nhau.
 *
 * 4. DA THU dung dung the <video> cua ban mau, tai ca doan phim cua ho ve. BO,
 *    vi mot ly do khong sua duoc bang code: toan bo chu trong doan phim nam
 *    trong pixel. No mang ten LadiPage / LadiWork / Automation, mot the bao
 *    "LadiPage - Ban co mot thong bao moi", va trong man hinh laptop la mot
 *    trang ban hang nha hang. Cat bo dai chu o tren roi de chu minh len cung
 *    khong cuu duoc, vi ten do con nam giua hinh minh hoa. File video da xoa.
 *
 * 5. Nay quay ve bon canh hoa hinh vao nhau: MOI DONG CHU deu nam trong HTML
 *    nen sua duoc bat cu luc nao, va ruot man hinh la anh chup that cua chinh
 *    du an nay.
 *
 * Phan chu ben trai giu y nguyen qua ca nam lan - no khong lien quan gi den
 * viec doi hinh minh hoa.
 */

/**
 * Bon canh thay nhau hien ra, moi canh la mot tam doc lap.
 *
 * Ban mau dat o cho nay mot the <video> tu chay lap - xem muc 4 o tren de biet
 * vi sao khong di theo. Bon canh nay cho ra dung cai can co (hinh doi lien
 * tuc) voi tong dung luong 812 KB, nho hon mot doan phim ngan rat nhieu.
 *
 * `anh` de trong = canh do khong co may tinh, ve vong quy dao thay vao - dung
 * nhu tam thu ba trong ban mau.
 *
 * Ba tam anh deu chup o CUNG kich thuoc 1240x640. Lech kich thuoc la luc
 * chuyen canh anh bi nhay mot cai, rat lo.
 *
 * THEM/BOT canh thi phai sua ba cho trong globals.css: do dai vong lap, buoc
 * tre cua tung canh, va cac moc phan tram trong keyframes.
 */
type Canh = {
  mau: string;
  Icon: LucideIcon;
  nhan: string;
  dan: string;
  tua: string;
  anh?: { src: string; alt: string };
  the?: { tieu: string; phu: string };
};

const CANH: Canh[] = [
  // Canh quy dao dat DAU TIEN theo y chu du an. No thuan CSS/SVG, khong tai
  // anh nao - nen canh dau tien nguoi dung thay cung la canh nhe nhat.
  {
    mau: "from-[#ffc63f] to-pha shadow-[0_10px_20px_-10px_rgb(255_176_0/.9)]",
    Icon: BadgeCheck,
    nhan: "Chứng nhận",
    dan: "Bốn phần nối vào một chỗ",
    tua: "Gọn trong một nền tảng",
  },
  {
    mau: "from-tim-2 to-tim shadow-[0_10px_20px_-10px_rgb(79_43_255/.9)]",
    Icon: GraduationCap,
    nhan: "Khóa học",
    // KHONG dat lai cau "Di len tung tang, khong nhay coc" o day: no la dung
    // chu cua the <h1> ngay ben trai, doc len thanh mot cau lap lai.
    dan: "Xem bài giảng rồi làm bài tập",
    tua: "Khóa học có lộ trình",
    anh: {
      src: "/anh/man-khoa-hoc.png",
      alt: "Danh sách khóa học kèm đơn vị đào tạo, số bài và học phí",
    },
    // Ban truoc ghi "Bai mo dan / Qua bai truoc moi len bai sau" - sai het,
    // xem ghi chu o the <h1>. Doi sang thu he thong lam that: Enrollment co
    // mang lessonProgress, moi bai mang trang thai not_started / in_progress /
    // completed.
    the: { tieu: "Nhớ tiến độ", phu: "Bài nào xong hệ thống ghi lại" },
  },
  {
    mau: "from-ngoc to-[#009d93] shadow-[0_10px_20px_-10px_rgb(0_191_179/.9)]",
    Icon: FileText,
    nhan: "Tài liệu",
    dan: "Người học góp, người học dùng",
    tua: "Kho tài liệu chia sẻ",
    anh: {
      src: "/anh/man-tai-lieu.png",
      alt: "Trang tài liệu do người học chia sẻ, kèm định dạng và lượt tải",
    },
    the: { tieu: "Tải về miễn phí", phu: "PDF, slide, đề ôn tập" },
  },
  {
    mau: "from-[#ff6fb5] to-hong shadow-[0_10px_20px_-10px_rgb(255_62_157/.9)]",
    Icon: PenLine,
    nhan: "Bài viết",
    dan: "Kinh nghiệm của người đi trước",
    tua: "Học cách tự học",
    anh: {
      src: "/anh/man-bai-viet.png",
      alt: "Trang bài viết chia sẻ kinh nghiệm tự học, lọc theo chủ đề",
    },
    the: { tieu: "Lọc theo chủ đề", phu: "Đọc đúng thứ đang cần" },
  },
];

// Bon the quay quanh tam o canh dau, moi the la mot "hanh tinh".
//
// HAI VANH, MOI VANH HAI THE, DAT DOI DIEN NHAU (0/180 va 90/270 do). Cach chia
// nay khong phai cho dep ma de KHONG BAO GIO chong nhau, va do la rang buoc hinh
// hoc chu khong phai may man:
//
//   - Cung mot vanh: hai the cung chu ky nen goc lech giu nguyen 180 do mai mai.
//   - Khac vanh: hai vanh cach nhau 17% cua canh o vuong = 65px o kich thuoc
//     that, trong khi the chi cao ~52px. Luc hai the thang hang goc nhau - truong
//     hop xau nhat - chung van cach 13px.
//
// Da THU bon vanh moi vanh mot the cho giong he mat troi hon. Khong duoc: ban
// kinh dung duoc chi tu 16% (mep dia tam) toi 50% (mep o), chia bon thanh moi
// vanh cach nhau 8,5% = 33px, nho hon chieu cao mot the - hai the o vanh ke nhau
// se long vao nhau moi khi thang hang.
//
// Vanh trong quay nhanh hon vanh ngoai, dung nhu he mat troi that.
const QUY_DAO = [
  {
    nhan: "Khóa học",
    Icon: GraduationCap,
    mau: "from-tim-2 to-tim",
    goc: "0deg",
    banKinh: "46%",
    chuKy: "44s",
  },
  {
    nhan: "Bài viết",
    Icon: PenLine,
    mau: "from-[#ff6fb5] to-hong",
    goc: "180deg",
    banKinh: "46%",
    chuKy: "44s",
  },
  {
    nhan: "Chứng nhận",
    Icon: BadgeCheck,
    mau: "from-[#ffc63f] to-pha",
    goc: "90deg",
    banKinh: "29%",
    chuKy: "30s",
  },
  {
    nhan: "Tài liệu",
    Icon: FileText,
    mau: "from-ngoc to-[#009d93]",
    goc: "270deg",
    banKinh: "29%",
    chuKy: "30s",
  },
];

interface HeroSectionProps {
  soKhoa: number;
  soMienPhi: number;
}

export default function HeroSection({ soKhoa, soMienPhi }: HeroSectionProps) {
  // KHOANG TREN/DUOI DA BOP LAI MOT LAN: pt-20/pb-20 -> pt-10/pb-10, dong so
  // lieu tu mt-20 -> mt-10, va ty le khung hinh tu 10/9 -> 6/5 (ben
  // globals.css). Ly do: chu du an muon thay duoc dai ten don vi dao tao NGAY
  // khi mo trang, khong phai cuon. Do luc do: dai do ket thuc o 1020px trong
  // khi khung nhin cao 900 - hut 120px. Them chu vao phan mo dau thi phai do
  // lai, dung them khoang trong.
  return (
    <header className="relative overflow-hidden bg-white pt-8 pb-12 md:pt-8 md:pb-14">
      {/* Hai quang sang mo, thuan CSS - khong tai anh nao.
          Ban mau goc dung hai file PNG da lam mo san dat o hai goc; ve bang
          radial-gradient thi duoc dung ket qua do ma khong ton them mot luot
          tai anh nao o cho de nhat trang. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(38% 42% at 12% 26%, rgb(79 43 255 / .13), transparent 72%),
            radial-gradient(44% 48% at 78% 30%, rgb(99 130 255 / .16), transparent 72%),
            radial-gradient(32% 36% at 62% 88%, rgb(0 191 179 / .10), transparent 72%)`,
        }}
      />

      <div className="relative z-2 mx-auto w-[min(76rem,100%-2.5rem)]">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-8">
          {/* ------------------------------ Chu ------------------------------ */}
          <div>
            {soMienPhi ? (
              <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1.5 pr-4 pl-1.5 text-sm font-medium shadow-sm">
                <b className="bg-ngoc rounded-full px-2 py-0.5 font-mono text-[.66rem] font-semibold text-[#04231F]">
                  MỚI
                </b>
                {soMienPhi} khóa đang mở miễn phí
              </span>
            ) : null}

            {/* KHONG dung lai an du "len tung tang / khong nhay coc" cua ban cu:
                no hua rang bai sau bi khoa den khi qua duoc bai truoc, ma
                lessonController KHONG he kiem dieu do - duong doc bai chi goi
                duocXemNoiDung (da ghi danh / da tra tien chua). Mo thang bai
                so 8 truoc bai so 1 van duoc. Cau do viet cho hinh cai thap 5
                tang ngay truoc, thap go roi ma cau o lai.
                Muon cau do thanh that thi phai them chan tuan tu o tang doc
                bai, khong phai sua chu o day.

                GIU MOI DONG DUOI ~17 KY TU. Co chu o day len toi 4rem, cot chu
                rong khoang 577px: dai hon la dong tu gay lam doi, tieu de thanh
                bon dong va day tut ca khoi ben duoi xuong. Da thu
                "Tu bai hoc dau tien / toi tam chung nhan" (19/18 ky tu) va bi
                dung loi do. */}
            <h1 className="font-hien text-muc text-[clamp(2.4rem,5.4vw,4rem)] leading-[1.1] font-extrabold tracking-[-.035em] text-balance">
              Học có lộ trình,
              <br />
              <span className="text-tim relative inline-block">
                lấy chứng nhận
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
              Mỗi khóa là một chuỗi bài xếp sẵn theo thứ tự: xem bài giảng, làm bài kiểm
              tra, hệ thống ghi lại bài nào bạn đã xong. Hết khóa thì có chứng nhận kèm
              mã, ai cũng tra cứu lại được.
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

          {/* --------------------------- Khoi hinh doi ---------------------------
              KHONG bam vao duoc: ca khoi la hinh minh hoa, dung nhu ban mau.
              Mot ban truoc boc ca khung trong the <Link> - vua sai y ban mau,
              vua sinh mot loi that: bon canh chong len nhau, canh dang o
              opacity 0 VAN an chuot, nen nguoi bam vao canh dang nhin thay co
              the bi day sang trang cua mot canh khac. Hai loi CTA that da nam
              san o cot chu ben trai.

              Ty le khung va nhip chuyen canh nam trong globals.css
              (.khung-canh-hero / .canh-hero).

              BON CANH PHAI LA NHUNG DUA CON DUY NHAT cua the nay: nhip chuyen
              canh nham vao :first-child va :nth-child(2..4). Chen them bat ky
              the nao vao day - mot tam nen chang han - la canh dau mat luat
              first-child (nguoi tat chuyen dong thay o TRONG TRON) va canh thu
              tu tuot khoi danh sach buoc tre. Da dinh dung loi do mot lan. */}
          <div className="khung-canh-hero">
            {CANH.map(({ mau, Icon, nhan, dan, tua, anh, the }) => (
              <div key={nhan} className="canh-hero flex flex-col px-1 pt-2 pb-4 sm:px-3">
                {/* Dau canh: huy hieu + hai dong chu. Ca cum nay DOI theo canh.
                    CAN GIUA o CA BON canh. Da thu chi can giua rieng canh quy
                    dao (vi vong tron hep hon cot, de canh trai thi chu treo lo
                    lung ben ngoai no) va de ba canh con lai canh trai - hong:
                    luc hoa hinh, hai dong chu cua hai canh nam o hai vi tri
                    khac nhau va chong len nhau, doc ra mot dam chu lem. Can
                    giua het thi tam chu, tam anh va tam vong tron trung nhau,
                    khong con cho nao nhay. */}
                <div className="flex items-center justify-center gap-3">
                  <span
                    className={`grid size-11 shrink-0 place-items-center rounded-[.9rem] bg-linear-to-br text-white ${mau}`}
                  >
                    <Icon size={21} strokeWidth={2.2} aria-hidden="true" />
                  </span>
                  <span className="leading-tight">
                    <span className="block text-[.78rem] text-slate-500">{dan}</span>
                    <b className="font-hien text-muc block text-[1.02rem] font-bold">
                      {tua}
                    </b>
                  </span>
                </div>

                {/* Phan hinh - chiem het cho con lai va tu can giua */}
                <div className="mt-5 grid min-h-0 flex-1 place-items-center">
                  {anh ? (
                    /* Anh tran, KHONG long trong khung may tinh nao.
                       Ban truoc ve mot cai vien may mau muc kem de may ben duoi;
                       chu du an khong thich, bo.
                       Con lai vien mo mot pixel + bong do: thieu hai thu do thi
                       anh chup (nen trang) dat tren trang (cung nen trang) khong
                       con duong bien nao, nhin ra mot mang lem chu khong ra mot
                       tam anh. */
                    <div
                      // max-h-full la de danh cho man hinh thap: khi khung
                      // canh co lai theo vh, tam anh (cao suy ra tu be rong)
                      // se cao hon cho con lai va tran ra ngoai. Chan lai thi
                      // anh bi cat bot tren duoi - object-cover lo phan do -
                      // van hon la de no day vo bo cuc.
                      className="relative aspect-[31/16] max-h-full w-full overflow-hidden rounded-2xl bg-white ring-1 ring-slate-900/8"
                      style={{ boxShadow: "0 26px 50px -28px rgb(15 23 42 / .45)" }}
                    >
                      {/* Ty le 31/16 = dung 1240x640 cua anh goc */}
                      <Image
                        src={anh.src}
                        alt={anh.alt}
                        fill
                        // KHONG dat priority cho tam nao.
                        // Truoc day tam dau duoc priority vi no la thu nguoi
                        // dung thay ngay. Nay canh dau la vong quy dao thuan
                        // SVG, khong con anh nao can gap ca: tam anh som nhat
                        // cung phai 3 giay nua moi toi luot.
                        // Ba tam van tai ve gan nhu ngay lap tuc du mang
                        // loading="lazy", vi chung NAM TRONG khung nhin (chi la
                        // opacity 0) nen trinh duyet coi nhu da lo ra. Khac
                        // biet duy nhat: chung khong con tranh bang thong voi
                        // thu ve dau tien nua.
                        sizes="(min-width: 1024px) 46vw, 92vw"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    /* Canh cuoi: khong co may tinh, ve vong quy dao - dung nhu
                       tam thu ba cua ban mau. Hinh vuong an theo CHIEU CAO con
                       lai (h-full + aspect-square) chu khong theo be rong: o
                       man hinh hep, an theo be rong thi no cao vuot ra ngoai
                       khung va bi cat mat mot khuc. */
                    <div className="relative aspect-square h-full">
                      {/* He vanh ve bang SVG chu khong phai border cua CSS.
                          Ly do: ban mau co MOT doan vanh dam chuyen sac (ngoc
                          sang tim). border cua CSS chi nhan mot mau dac - muon
                          chuyen sac phai chong hai lop rieng roi cat bot, vua
                          roi vua kho sua. SVG thi mot the <path> voi stroke la
                          gradient la xong.

                          Khung toa do 400x400, tam o (200,200). Ban thân o
                          chua la hinh vuông nen SVG co gian theo, khong can
                          tinh lai gi khi doi kich thuoc. */}
                      <svg
                        viewBox="0 0 400 400"
                        className="absolute inset-0 size-full overflow-visible"
                        aria-hidden="true"
                      >
                        <defs>
                          <linearGradient id="vanh-hero" x1="0" y1="1" x2="1" y2="0">
                            <stop offset="0%" stopColor="#00BFB3" />
                            <stop offset="55%" stopColor="#4F8BFF" />
                            <stop offset="100%" stopColor="#4F2BFF" />
                          </linearGradient>
                        </defs>

                        {/* Nam vanh dong tam, mo dan tu trong ra ngoai.
                            HAI vanh 184 va 116 la duong DI THAT cua bon the:
                            46% va 29% cua 400. Doi ban kinh o QUY_DAO thi phai
                            doi hai so nay, khong thi the chay lo lung khong bam
                            vao vanh nao. Hai vanh con lai chi de trang tri. */}
                        <circle
                          cx="200"
                          cy="200"
                          r="184"
                          fill="none"
                          stroke="#4F2BFF"
                          strokeOpacity=".16"
                        />
                        <circle
                          cx="200"
                          cy="200"
                          r="150"
                          fill="none"
                          stroke="#4F2BFF"
                          strokeOpacity=".1"
                        />
                        <circle
                          cx="200"
                          cy="200"
                          r="116"
                          fill="none"
                          stroke="#4F2BFF"
                          strokeOpacity=".2"
                        />
                        <circle
                          cx="200"
                          cy="200"
                          r="74"
                          fill="none"
                          stroke="#4F2BFF"
                          strokeOpacity=".12"
                        />

                        {/* Doan vanh dam: cung tron ban kinh 150, chay tu goc
                            130 do (duoi ben trai) len 250 do (tren, hoi lech
                            trai). Dau tron de hai dau khong bi cat vuong.
                            Quay cham 70 giay mot vong va NGUOC chieu bon the -
                            chuyen dong nen, khong tranh voi cai chinh. */}
                        <path
                          className="vanh-sang"
                          d="M 103.6 314.9 A 150 150 0 0 1 148.7 59"
                          fill="none"
                          stroke="url(#vanh-hero)"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />

                        {/* Ba cham nho tren vanh, quay cung chieu voi bon the
                            nhung cham hon nhieu (90 giay). */}
                        <g className="cham-quay">
                          <circle cx="12.9" cy="233" r="5.5" fill="#4F8BFF" />
                          <circle cx="378.5" cy="135" r="5" fill="#4F8BFF" />
                          <circle
                            cx="301.5"
                            cy="247.3"
                            r="4.5"
                            fill="#4F2BFF"
                            fillOpacity=".55"
                          />
                        </g>
                      </svg>

                      {/* Tam: dia trang co quang sang, ben trong la dau LP.
                          Ban mau dat logo tren nen TRANG chu khong phai tren
                          nen mau - de vay thi cai dia noi han len khoi cac vanh
                          mo phia sau. */}
                      <span className="absolute top-1/2 left-1/2 grid size-[27%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white shadow-[0_0_0_10px_rgb(255_255_255/.75),0_18px_38px_-14px_rgb(79_43_255/.45)]">
                        <span className="from-tim-2 to-ngoc grid size-[76%] place-items-center rounded-full bg-linear-to-br text-[1.05rem] font-black text-white">
                          LP
                        </span>
                      </span>

                      {/* Bon the quay quanh tam.
                          BA LOP, moi lop mot viec, khong gop lai duoc:
                            quy-dao-tay  o vuong phu kin, quay quanh tam
                            quy-dao-neo  ghim the len vanh, o vi tri 12 gio
                            quy-dao-the  quay NGUOC lai dung bang canh tay
                          Thieu lop trong cung thi chu tren the lat nguoc dau moi
                          khi the di qua nua duoi vong tron. */}
                      {QUY_DAO.map((m) => (
                        <span
                          key={m.nhan}
                          className="quy-dao-tay"
                          style={
                            {
                              "--goc": m.goc,
                              "--ban-kinh": m.banKinh,
                              "--chu-ky": m.chuKy,
                            } as CSSProperties
                          }
                        >
                          <span className="quy-dao-neo">
                            <span className="quy-dao-the w-[4.6rem] flex-col items-center gap-1 rounded-xl bg-white px-1.5 py-2 text-center text-[.62rem] leading-tight font-semibold text-slate-700 shadow-[0_12px_26px_-14px_rgb(15_23_42/.5)] ring-1 ring-slate-900/6">
                              <span
                                className={`grid size-6 place-items-center rounded-lg bg-linear-to-br text-white ${m.mau}`}
                              >
                                <m.Icon size={13} strokeWidth={2.4} aria-hidden="true" />
                              </span>
                              {m.nhan}
                            </span>
                          </span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* The noi - ban mau cung dat vai the nho chong len hinh, va noi
                    dung the DOI theo canh. An o man hinh hep: cho do vua du cho
                    cai may tinh, them the nua la che mat thu can nhin. */}
                {the ? (
                  <div className="absolute right-6 bottom-5 hidden max-w-[15rem] rounded-xl bg-white/95 px-4 py-3 shadow-[0_18px_36px_-20px_rgb(15_23_42/.5)] ring-1 ring-slate-900/8 backdrop-blur-sm sm:block">
                    <div className="flex items-center gap-2.5">
                      <span className="bg-ngoc/15 text-ngoc grid size-8 shrink-0 place-items-center rounded-lg text-sm font-bold">
                        ✓
                      </span>
                      <span className="leading-snug">
                        <b className="text-muc block text-[.82rem] font-semibold">
                          {the.tieu}
                        </b>
                        <span className="block text-[.72rem] text-slate-500">
                          {the.phu}
                        </span>
                      </span>
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        {/* --------------------------- Dai so lieu ---------------------------
            Ban mau goc de o day mot con so kieu "770,000+ khach hang tin
            tuong". Khong bia mot con so nhu vay: ba muc duoi day deu dem
            duoc tu du lieu that dang co, va neu khoa bi go bot thi chung tu
            giam theo.

            KHONG ghi cung bat ky con so nao vao day. Ca hai con so deu do
            trang chu dem tu danh sach khoa hoc that (page.tsx) va lam moi moi
            60 giay, nen admin them/xoa/go xuat ban mot KHOA HOC la cho nay tu
            tang giam theo. Thay mot con so bang chu la lan sau no thanh loi
            noi sai. */}
        <p className="mt-6 text-center text-[.95rem] text-slate-500 md:mt-6">
          <b className="text-tim font-semibold">{soKhoa}</b> khóa học
          <span className="mx-2.5 text-slate-300">·</span>
          <b className="text-tim font-semibold">{soMienPhi}</b> khóa mở miễn phí
          <span className="mx-2.5 text-slate-300">·</span>
          chứng nhận tra cứu được bằng mã
        </p>
      </div>
    </header>
  );
}
