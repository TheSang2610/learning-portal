"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  CalendarDays,
  Download,
  Eye,
  FileText,
  GraduationCap,
  Home,
  Mail,
  Newspaper,
  Pencil,
  Printer,
  User,
} from "lucide-react";
import { lamSachHtml } from "@/src/components/common/postHtml";
import {
  documentService,
  type RecommendedDocument,
  type SharedDocument,
} from "@/src/services/document";
import { useNguoiDungLuu } from "@/src/hooks/userStore";
import DocumentComments from "./DocumentComments";
import { doiKichThuoc, duoiChinh, tongDungLuong } from "./fileInfo";

import styles from "./DocumentDetailClient.module.scss";
import { DUONG_TAT_CA, duongTaiLieu } from "./duongDan";
interface Props {
  doc: SharedDocument;
  lienQuan?: RecommendedDocument[];
}

const ngayGon = (iso: string) =>
  new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

export default function DocumentDetailClient({ doc, lienQuan = [] }: Props) {
  const user = useNguoiDungLuu();
  const idNguoiDung = user?._id;

  // Chi CHU BAI thay dong dan sang trang ca nhan - noi duy nhat sua bai (theo
  // chu du an: trang nay de doc, quan ly bai gom ve trang ca nhan). Admin
  // quan ly o /admin/documents. Day chi la an hien dong dan - may chu van tu
  // kiem quyen o updateDocument.
  const laChuBai = Boolean(user && user._id === doc.uploader?._id);

  // Ghi mot luot xem vao lich su. Goi tu TRINH DUYET chu khong phai luc may chu
  // dung trang: trang nay duoc dung san va luu 30 giay, luot dung do khong phai
  // mot nguoi that dang xem, va cung khong mang cookie cua ho.
  //
  // Chi goi khi da dang nhap - may chu cung tu bo qua khach, day chi la de
  // khoi mot luot goi vo ich. Phu thuoc idNguoiDung chu khong phai ca `user`:
  // doi tuong user moi lan doc lai co the la mot tham chieu moi, ghi hai lan.
  useEffect(() => {
    if (!idNguoiDung) return;
    documentService.logView(doc._id).catch(() => {});
  }, [doc._id, idNguoiDung]);

  const khiTai = () => {
    // Dem luot tai la viec phu: hong cung khong duoc chan nguoi dung tai file.
    documentService.countDownload(doc._id).catch(() => {});
  };

  // KHONG dung doc.fileUrl. Duong do tro thang vao Cloudinary va tra ve 401
  // "deny or ACL failure" vi tai khoan chan phat PDF o tang delivery. Duong
  // duoi day di qua backend, o do may chu tu truyen file ve. Xem
  // getDocumentFile ben backend de biet ba cach da thu va vi sao bo.
  //
  // De duong TUONG DOI chu khong ghep GOC_API: next.config.ts da chuyen tiep
  // /api/* sang backend, nho vay trinh duyet chi thay mot mien.
  //
  // ?i= chon file thu may (dem tu 0). ?tai=1 doi Content-Disposition tu
  // inline sang attachment - thieu no thi bam "Tai" chi MO file ra tab moi.
  const duongDanFile = (i: number) => `/api/documents/${doc._id}/file?i=${i}`;
  const duongDanTai = (i: number) => `${duongDanFile(i)}&tai=1`;
  const cacMon = doc.monHoc ?? [];

  // Nut chia se doc dia chi trang NGAY LUC BAM chu khong tinh san luc dung
  // trang. Tinh san bang window.location thi may chu khong co window -> React
  // bao lech giua ban dung o may chu va ban o trinh duyet.
  const chiaSeFacebook = () => {
    const u = encodeURIComponent(window.location.href);
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${u}`,
      "_blank",
      "noopener",
    );
  };
  const chiaSeEmail = () => {
    const tieu = encodeURIComponent(doc.title);
    const than = encodeURIComponent(`${doc.title}\n${window.location.href}`);
    window.location.href = `mailto:?subject=${tieu}&body=${than}`;
  };

  return (
    <>
      {/* Dai dau trang: breadcrumb + tieu de.
          Nen la mot dai chuyen sac theo mau cua du an chu KHONG phai anh. Ban
          mau tham chieu dat mot tam anh khuon vien truong lam nen, nhung tai
          lieu trong CSDL khong co truong anh bia nao - lay dai mot tam anh bat
          ky de lam nen la gan cho tai lieu mot hinh anh khong lien quan gi den
          noi dung cua no. */}
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <nav className={styles.crumb} aria-label="Đường dẫn">
            <Link href="/" className={styles.crumbLink} aria-label="Trang chủ">
              <Home size={14} />
            </Link>
            <span className={styles.crumbSep}>›</span>
            <Link href="/share-document" className={styles.crumbLink}>
              Chia sẻ tài liệu
            </Link>
            <span className={styles.crumbSep}>›</span>
            <Link href={DUONG_TAT_CA} className={styles.crumbLink}>
              Tất cả tài liệu
            </Link>
            <span className={styles.crumbSep}>›</span>
            <span>Chi tiết tài liệu</span>
          </nav>
          <h1 className={styles.heroTitle}>{doc.title}</h1>
        </div>
      </header>

      <div className={styles.container}>
        {/* Co tai lieu khac thi hai cot, khong co thi mot cot tran het chieu
            rong. Giu cot phai rong tron chi de bo cuc "on dinh" la de lai mot
            khoang trong vo nghia giua trang. */}
        <div className={lienQuan.length ? styles.layout : styles.layoutMot}>
          <article className={styles.main}>
            <h2 className={styles.title}>{doc.title}</h2>

            <div className={styles.row}>
              {/* Tai lieu dang truoc khi co truong mon hoc thi khong co - an han
                  chu khong hien "Mon: (trong)". */}
              {doc.truong ? (
                <span className={`${styles.label} ${styles.mon}`}>
                  <GraduationCap size={15} />
                  {doc.truong}
                </span>
              ) : null}
              {cacMon.map((m) => (
                <span key={m} className={`${styles.label} ${styles.mon}`}>
                  <BookOpen size={15} />
                  {m}
                </span>
              ))}
              <span className={styles.label}>
                <User size={15} className={styles.box2} />
                {doc.uploader?.name || "Người dùng đã xóa"}
              </span>
              <span className={styles.label}>
                <CalendarDays size={15} className={styles.box2} />
                {ngayGon(doc.createdAt)}
              </span>
              <span className={styles.label}>
                <Download size={15} className={styles.box2} />
                {doc.downloadCount} lượt tải
              </span>
              <span className={styles.label}>
                <FileText size={15} className={styles.box2} />
                {doc.files.length
                  ? `${doc.files.length} file · ${doiKichThuoc(tongDungLuong(doc.files))}`
                  : "Bài viết"}
              </span>
            </div>

            {laChuBai && (
              <Link
                href={`/user/profile?tab=tai-lieu&sua=${doc._id}`}
                className={styles.nutSua}
              >
                <Pencil size={14} />
                Sửa trong trang cá nhân
              </Link>
            )}

            {/* DA BO khung nhung PDF (iframe) theo y chu du an: khong can xem
            truoc tai cho nua, ai muon doc thi bam dong dan o tren, PDF mo
            o tab moi.
            Bo luon ArticleWithOutline - hai o "Noi dung bai" va o mo ta -
            vi nay noi dung da co dinh dang san, khong can tach muc luc ra
            mot o rieng.
            Duong /api/documents/:id/file ben backend GIU NGUYEN, va ngoai
            le CSP cho phep nhung o do cung giu: bo di thi luc nao muon mo
            lai khung doc phai di dieu tra lai tu dau. */}
            <div
              className={styles.body}
              // LOP CHAN CHINH NAM O MAY CHU, khong phai o day:
              // documentController goi chuanHoaNoiDung() TRUOC KHI LUU, va ham
              // do chay sanitize-html voi danh sach the cho phep - chan script,
              // style, iframe, svg, va chi nhan http/https/mailto nen
              // "javascript:" hay "data:" khong lot qua. Tuc la chuoi trong CSDL
              // da sach san.
              //
              // lamSachHtml() o day la lop thu hai, va PHAI biet gioi han cua
              // no: no dung DOMParser nen chi chay duoc trong trinh duyet - lan
              // dung san o may chu no tra ve nguyen chuoi. Cho nen dung bao gio
              // coi no la cho chan duy nhat; cho chan that la ben may chu.
              dangerouslySetInnerHTML={{ __html: lamSachHtml(doc.description) }}
            />
            {/* Danh sach file dinh kem - mot bai toi da 5 file (chuong 1..5).
                Moi file hai nut: Xem (mo tab moi) va Tai ve. */}
            {/* Bai huong dan kieu blog co the khong kem file - an ca muc. */}
            {doc.files.length > 0 && (
              <section className={styles.tep} aria-labelledby="tieu-de-tep">
                <h3 id="tieu-de-tep" className={styles.tepTieuDe}>
                  Tài liệu đính kèm ({doc.files.length})
                </h3>
                <ul className={styles.tepDs}>
                  {doc.files.map((f, i) => (
                    <li key={i} className={styles.tepMuc}>
                      <span className={styles.tepDuoi}>{f.fileExt.toUpperCase()}</span>
                      <span className={styles.tepThongTin}>
                        <span className={styles.tepTen}>
                          {f.fileName || `${doc.title} (${i + 1}).${f.fileExt}`}
                        </span>
                        <span className={styles.tepCo}>{doiKichThuoc(f.fileSize)}</span>
                      </span>
                      <a
                        href={duongDanFile(i)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.tepXem}
                      >
                        <Eye size={15} />
                        Xem
                      </a>
                      <a href={duongDanTai(i)} onClick={khiTai} className={styles.tepTai}>
                        <Download size={15} />
                        Tải
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <div className={styles.share}>
              <span className={styles.shareLabel}>Chia sẻ:</span>
              <button
                type="button"
                onClick={chiaSeFacebook}
                className={styles.shareBtn}
                aria-label="Chia sẻ lên Facebook"
              >
                {/* Ve bang SVG chu khong dung bo bieu tuong: lucide-react khong
                    co bieu tuong thuong hieu (ho da bo tu ban 1.0). */}
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.557-.14-2.857-.14C11.928 2 10 3.657 10 6.7v2.8H7v4h3V22h4v-8.5z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={chiaSeEmail}
                className={styles.shareBtn}
                aria-label="Gửi qua email"
              >
                <Mail size={16} />
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className={styles.shareBtn}
                aria-label="In trang"
              >
                <Printer size={16} />
              </button>
            </div>

            <DocumentComments docId={doc._id} />
          </article>

          {lienQuan.length > 0 && (
            <aside className={styles.aside}>
              <h2 className={styles.asideTitle}>Tài liệu liên quan</h2>
              <ul className={styles.asideList}>
                {lienQuan.map((d) => (
                  <li key={d._id}>
                    <Link href={duongTaiLieu(d._id)} className={styles.asideItem}>
                      {/* O nay la DUOI FILE chu khong phai anh thu nho.
                          Ban mau tham chieu dat anh bia cua tung bai; tai lieu
                          o day khong co truong anh nao, va sinh mot tam anh
                          dai dien thi no khong noi gi ve noi dung ben trong.
                          Duoi file thi noi that: mo ra se gap PDF hay Word. */}
                      <span className={styles.asideBadge}>
                        {/* Bai viet (khong kem file) thi khong co duoi nao de
                            noi - ve bieu tuong bai viet thay vi mac dinh "PDF". */}
                        {d.files.length ? (
                          duoiChinh(d.files).toUpperCase()
                        ) : (
                          <Newspaper size={22} aria-label="Bài viết" />
                        )}
                      </span>
                      <span className={styles.asideText}>
                        <span className={styles.asideDate}>
                          <CalendarDays size={13} />
                          {ngayGon(d.createdAt)}
                        </span>
                        <span className={styles.asideName}>{d.title}</span>
                        {/* Vi sao goi y tai lieu nay - may chu tra kem. Khong co
                            dong nay thi nguoi doc khong biet cot nay "lien quan"
                            theo nghia nao, va coi no nhu quang cao. */}
                        <span className={styles.asideWhy}>{d.viSaoGoiY}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </aside>
          )}
        </div>
      </div>
    </>
  );
}
