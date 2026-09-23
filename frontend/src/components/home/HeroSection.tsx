import Image from "next/image";
import Link from "next/link";
import { GraduationCap, FileText, PenLine, BadgeCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { CSSProperties } from "react";

import styles from "./HeroSection.module.scss";
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
    mau: `${styles.gradChungNhan} ${styles.bongChungNhan}`,
    Icon: BadgeCheck,
    nhan: "Chứng nhận",
    dan: "Bốn phần nối vào một chỗ",
    tua: "Gọn trong một nền tảng",
  },
  {
    mau: `${styles.gradKhoaHoc} ${styles.bongKhoaHoc}`,
    Icon: GraduationCap,
    nhan: "Khóa học",
    // KHONG dat lai cau "Di len tung tang, khong nhay coc" o day: no la dung
    // chu cua the <h1> ngay ben trai, doc len thanh mot cau lap lai.
    dan: "Xem bài giảng rồi làm bài tập",
    tua: "Khóa học có lộ trình",
    anh: {
      src: "/images/screen-courses.webp",
      alt: "Danh sách khóa học kèm đơn vị đào tạo, số bài và học phí",
    },
    // Ban truoc ghi "Bai mo dan / Qua bai truoc moi len bai sau" - sai het,
    // xem ghi chu o the <h1>. Doi sang thu he thong lam that: Enrollment co
    // mang lessonProgress, moi bai mang trang thai not_started / in_progress /
    // completed.
    the: { tieu: "Nhớ tiến độ", phu: "Bài nào xong hệ thống ghi lại" },
  },
  {
    mau: `${styles.gradTaiLieu} ${styles.bongTaiLieu}`,
    Icon: FileText,
    nhan: "Tài liệu",
    dan: "Người học góp, người học dùng",
    tua: "Kho tài liệu chia sẻ",
    anh: {
      src: "/images/screen-documents.webp",
      alt: "Trang tài liệu do người học chia sẻ, kèm định dạng và lượt tải",
    },
    the: { tieu: "Tải về miễn phí", phu: "PDF, slide, đề ôn tập" },
  },
  {
    mau: `${styles.gradBaiViet} ${styles.bongBaiViet}`,
    Icon: PenLine,
    nhan: "Bài viết",
    dan: "Kinh nghiệm của người đi trước",
    tua: "Học cách tự học",
    anh: {
      src: "/images/screen-posts.webp",
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
    mau: styles.gradKhoaHoc,
    goc: "0deg",
    banKinh: "46%",
    chuKy: "44s",
  },
  {
    nhan: "Bài viết",
    Icon: PenLine,
    mau: styles.gradBaiViet,
    goc: "180deg",
    banKinh: "46%",
    chuKy: "44s",
  },
  {
    nhan: "Chứng nhận",
    Icon: BadgeCheck,
    mau: styles.gradChungNhan,
    goc: "90deg",
    banKinh: "29%",
    chuKy: "30s",
  },
  {
    nhan: "Tài liệu",
    Icon: FileText,
    mau: styles.gradTaiLieu,
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
    <header className={styles.header}>
      {/* Hai quang sang mo, thuan CSS - khong tai anh nao.
          Ban mau goc dung hai file PNG da lam mo san dat o hai goc; ve bang
          radial-gradient thi duoc dung ket qua do ma khong ton them mot luot
          tai anh nao o cho de nhat trang. */}
      <div
        aria-hidden="true"
        className={styles.floating}
        style={{
          backgroundImage: `
            radial-gradient(38% 42% at 12% 26%, rgb(79 43 255 / .13), transparent 72%),
            radial-gradient(44% 48% at 78% 30%, rgb(99 130 255 / .16), transparent 72%),
            radial-gradient(32% 36% at 62% 88%, rgb(0 191 179 / .10), transparent 72%)`,
        }}
      />

      <div className={styles.box}>
        <div className={styles.grid}>
          {/* ------------------------------ Chu ------------------------------ */}
          <div>
            {soMienPhi ? (
              <span className={styles.card}>
                <b className={styles.box2}>MỚI</b>
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
            <h1 className={styles.title}>
              Học có lộ trình,
              <br />
              <span className={styles.label}>
                lấy chứng nhận
                {/* Net gach chan ve tay - khong phai border-bottom thang tap */}
                <svg
                  viewBox="0 0 300 20"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                  className={styles.icon}
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

            <p className={styles.text}>
              Mỗi khóa là một chuỗi bài xếp sẵn theo thứ tự: xem bài giảng, làm bài kiểm
              tra, hệ thống ghi lại bài nào bạn đã xong. Hết khóa thì có chứng nhận kèm
              mã, ai cũng tra cứu lại được.
            </p>

            <div className={styles.row}>
              <Link href="/courses" className={styles.card2}>
                Học thử miễn phí
                <span className={styles.grid2}>→</span>
              </Link>
              <Link href="/courses" className={styles.card3}>
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
          <div className={styles.box3}>
            {CANH.map(({ mau, Icon, nhan, dan, tua, anh, the }) => (
              <div key={nhan} className={styles.col}>
                {/* Dau canh: huy hieu + hai dong chu. Ca cum nay DOI theo canh.
                    CAN GIUA o CA BON canh. Da thu chi can giua rieng canh quy
                    dao (vi vong tron hep hon cot, de canh trai thi chu treo lo
                    lung ben ngoai no) va de ba canh con lai canh trai - hong:
                    luc hoa hinh, hai dong chu cua hai canh nam o hai vi tri
                    khac nhau va chong len nhau, doc ra mot dam chu lem. Can
                    giua het thi tam chu, tam anh va tam vong tron trung nhau,
                    khong con cho nao nhay. */}
                <div className={styles.row2}>
                  <span className={`${styles.grid6} ${mau}`}>
                    <Icon size={21} strokeWidth={2.2} aria-hidden="true" />
                  </span>
                  <span className={styles.label2}>
                    <span className={styles.label3}>{dan}</span>
                    <b className={styles.box4}>{tua}</b>
                  </span>
                </div>

                {/* Phan hinh - chiem het cho con lai va tu can giua */}
                <div className={styles.grid3}>
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
                      className={styles.box5}
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
                        className={styles.box6}
                      />
                    </div>
                  ) : (
                    /* Canh cuoi: khong co may tinh, ve vong quy dao - dung nhu
                       tam thu ba cua ban mau. Hinh vuong an theo CHIEU CAO con
                       lai (h-full + aspect-square) chu khong theo be rong: o
                       man hinh hep, an theo be rong thi no cao vuot ra ngoai
                       khung va bi cat mat mot khuc. */
                    <div className={styles.box7}>
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
                        className={styles.icon2}
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
                          className={styles.iconPath}
                          d="M 103.6 314.9 A 150 150 0 0 1 148.7 59"
                          fill="none"
                          stroke="url(#vanh-hero)"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />

                        {/* Ba cham nho tren vanh, quay cung chieu voi bon the
                            nhung cham hon nhieu (90 giay). */}
                        <g className={styles.box8}>
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
                      <span className={styles.floating2}>
                        <span className={styles.grid4}>LP</span>
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
                          className={styles.label4}
                          style={
                            {
                              "--goc": m.goc,
                              "--ban-kinh": m.banKinh,
                              "--chu-ky": m.chuKy,
                            } as CSSProperties
                          }
                        >
                          <span className={styles.label5}>
                            <span className={styles.card4}>
                              <span className={`${styles.grid7} ${m.mau}`}>
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
                  <div className={styles.floating3}>
                    <div className={styles.row3}>
                      <span className={styles.grid5}>✓</span>
                      <span className={styles.label6}>
                        <b className={styles.box9}>{the.tieu}</b>
                        <span className={styles.label7}>{the.phu}</span>
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
        <p className={styles.text2}>
          <b className={styles.box10}>{soKhoa}</b> khóa học
          <span className={styles.label8}>·</span>
          <b className={styles.box10}>{soMienPhi}</b> khóa mở miễn phí
          <span className={styles.label8}>·</span>
          chứng nhận tra cứu được bằng mã
        </p>
      </div>
    </header>
  );
}
