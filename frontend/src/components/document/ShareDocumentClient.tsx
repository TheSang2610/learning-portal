"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Check,
  ChevronRight,
  Download,
  FileText,
  Folder,
  Loader2,
  Search,
  Share2,
  ShieldAlert,
  Upload,
  Users,
  X,
} from "lucide-react";
import DocumentUploadForm, { type DocumentUploadFormHandle } from "./DocumentUploadForm";
import CacHangTaiLieu from "./CacHangTaiLieu";
import TheTaiLieuDoc from "./TheTaiLieuDoc";
import { DUOI_CHO_PHEP, MAX_MB } from "./fileInfo";
import {
  DUONG_TAT_CA,
  DUONG_TRANG_CHU,
  DUONG_TRUONG,
  duongDanhMucTruong,
  duongTatCa,
  duongTruong,
} from "./duongDan";
import {
  documentService,
  type DocumentCategory,
  type DocumentListResponse,
  type DocumentSubject,
  type DocumentUniversity,
  type LoaiTaiLieu,
  type SharedDocument,
  type ThongKeDanhSach,
} from "@/src/services/document";
import { useDangTaiNguoiDung, useNguoiDungLuu } from "@/src/hooks/userStore";
import { getErrorMessage } from "@/src/services/apiHelper";

import styles from "./ShareDocumentClient.module.scss";
import b from "./ShareDocumentBrowse.module.scss";

/** Bo loc dang ap dung - dong bo voi dia chi ?q=&mon=&nhom=&truong=&loai=. */
export interface BoLoc {
  q: string;
  /** Khoa mon (DocumentSubject.key), "" = moi mon. */
  mon: string;
  /** Khoa linh vuc (DocumentCategory.key), "" = moi linh vuc. */
  nhom: string;
  /** Khoa truong dai hoc (DocumentUniversity.key), "" = moi truong. */
  truong: string;
  /** Tab loai tai lieu, "" = tat ca. */
  loai: LoaiTaiLieu | "";
}

interface Props {
  /** Trang dau lay san tu server theo dung bo loc tren dia chi - xem page.tsx */
  initialData: DocumentListResponse;
  boLocBanDau: BoLoc;
  dsNhom: DocumentCategory[];
  dsTruong: DocumentUniversity[];
  /** Danh sach mon lay san tu server - tieu de trang dung ngay, khong nhay. */
  dsMonBanDau: DocumentSubject[];
  /**
   * Trang linh vuc cua mot truong (/institution/<truong>/<linh-vuc>): con dung
   * truong + linh vuc nay thi dia chi giu dang do; doi sang bo loc khac thi
   * ve /all-document.
   */
  phamVi?: { truong: string; nhom: string };
  /** Mon cua truong thuoc linh vuc dang xem (danh muc truong) - trang linh vuc cua truong. */
  monPhamVi?: { key: string; ten: string; soTaiLieu: number }[];
}

// 4 hang x 6 cot tren man rong.
const SO_MOI_TRANG = 24;

const TAB_LOAI: { khoa: LoaiTaiLieu | ""; nhan: string; dem: keyof ThongKeDanhSach }[] = [
  { khoa: "", nhan: "Tất cả", dem: "tong" },
  { khoa: "pdf", nhan: "PDF", dem: "pdf" },
  { khoa: "word", nhan: "Word", dem: "word" },
  { khoa: "baiViet", nhan: "Bài viết hướng dẫn", dem: "baiViet" },
];

const dinhSo = (n: number) => n.toLocaleString("vi-VN");

/**
 * Trang TAT CA tai lieu (/share-document/browse), bo cuc theo trang mon hoc
 * cua ban mau tham chieu:
 *   dai dau (duong dan, ten + so lieu, nut dang / chia se, o tim, bo loc),
 *   cac hang cuon ngang (goi y, xem gan day, tai nhieu nhat),
 *   luoi tat ca tai lieu voi thanh tab loai DINH khi cuon.
 */
export default function ShareDocumentClient({
  initialData,
  boLocBanDau,
  dsNhom,
  dsTruong,
  dsMonBanDau,
  phamVi,
  monPhamVi,
}: Props) {
  const [data, setData] = useState<DocumentListResponse>(initialData);
  // So lieu tach rieng: doi tab loai thi danh sach doi nhung so cua ca bon tab giu nguyen.
  const [thongKe, setThongKe] = useState<ThongKeDanhSach | undefined>(
    initialData.thongKe,
  );
  const [dangTai, setDangTai] = useState(false);
  const [loiDanhSach, setLoiDanhSach] = useState("");

  const [tuKhoa, setTuKhoa] = useState(boLocBanDau.q);
  const [boLoc, setBoLoc] = useState<BoLoc>(boLocBanDau);

  const user = useNguoiDungLuu();
  const dangTaiUser = useDangTaiNguoiDung();
  const [moForm, setMoForm] = useState(false);
  const formRef = useRef<DocumentUploadFormHandle>(null);

  const [dsMon, setDsMon] = useState<DocumentSubject[]>(dsMonBanDau);
  const nhomDangLoc = dsNhom.find((n) => n.key === boLoc.nhom);
  const truongDangLoc = dsTruong.find((t) => t.key === boLoc.truong);
  // Con dung truong + linh vuc cua trang linh vuc truong: mon lay theo danh
  // muc cua truong (ke ca mon chua co bai), khong theo ca kho.
  const trongPhamVi = Boolean(
    phamVi && boLoc.truong === phamVi.truong && boLoc.nhom === phamVi.nhom,
  );
  const monDangLoc =
    dsMon.find((m) => m.key === boLoc.mon) ?? monPhamVi?.find((m) => m.key === boLoc.mon);
  // Ten trang: mon > truong > linh vuc > "Tat ca tai lieu".
  // Ten trang: cu the nhat truoc - mon > linh vuc > truong > "Tat ca tai lieu".
  const tenTrang =
    monDangLoc?.ten ?? nhomDangLoc?.ten ?? truongDangLoc?.ten ?? "Tất cả tài liệu";
  // Dang loc mot linh vuc thi o chon mon chi con cac mon cua linh vuc do.
  const monCoTaiLieu: { key: string; ten: string; soTaiLieu: number }[] =
    trongPhamVi && monPhamVi
      ? monPhamVi
      : dsMon.filter(
          (m) => m.soTaiLieu > 0 && (!nhomDangLoc || m.nhom === nhomDangLoc._id),
        );
  // Linh vuc dang loc luon co trong o chon, ke ca khi chua co bai nao (vd.
  // trang "Kinh te" cua mot truong) - khong thi o chon hien sai "Moi linh vuc".
  const nhomCoTaiLieu = dsNhom.filter((n) => n.soTaiLieu > 0 || n.key === boLoc.nhom);

  const taiDsMon = useCallback(async () => {
    try {
      setDsMon(await documentService.getSubjects());
    } catch {
      // Khong co danh sach mon thi o chon mon an di - phan phu.
    }
  }, []);

  // Server khong lay duoc danh sach mon (backend cham...) thi tai lai o day.
  const coMonBanDau = dsMonBanDau.length > 0;
  useEffect(() => {
    // Hoan mot vong microtask - tranh setState dong bo trong than effect.
    if (!coMonBanDau) void Promise.resolve().then(taiDsMon);
  }, [coMonBanDau, taiDsMon]);

  /**
   * Tai trang `page` voi bo loc moi, va GHI bo loc len dia chi - gui link cho
   * nguoi khac la ho thay dung danh sach dang xem. replaceState: doi bo loc
   * khong lap day nut Back.
   */
  const truongPv = phamVi?.truong;
  const nhomPv = phamVi?.nhom;
  const taiLai = useCallback(
    async (page: number, loc: BoLoc) => {
      setBoLoc(loc);
      const giuPhamVi = truongPv && loc.truong === truongPv && loc.nhom === nhomPv;
      window.history.replaceState(
        null,
        "",
        giuPhamVi ? duongDanhMucTruong(loc.truong, loc.nhom, loc) : duongTatCa(loc),
      );
      setDangTai(true);
      setLoiDanhSach("");
      try {
        const kq = await documentService.getDocuments({
          page,
          limit: SO_MOI_TRANG,
          ...loc,
          thongKe: true,
        });
        setData(kq);
        setThongKe(kq.thongKe);
      } catch (err) {
        setLoiDanhSach(getErrorMessage(err, "Không tải được danh sách tài liệu."));
      } finally {
        setDangTai(false);
      }
    },
    [truongPv, nhomPv],
  );

  // ---------------------------------------------------------------- thanh dinh
  // Dai dau ra khoi man hinh -> thanh tab hien them ten trang + nut dang.
  const moc = useRef<HTMLDivElement>(null);
  const [daDinh, setDaDinh] = useState(false);
  useEffect(() => {
    const el = moc.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setDaDinh(!e.isIntersecting), {
      // Tru chieu cao header co dinh cua trang (104px).
      rootMargin: "-104px 0px 0px 0px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const timKiem = (e: React.FormEvent) => {
    e.preventDefault();
    taiLai(1, { ...boLoc, q: tuKhoa });
    // Ghi lai de goi y hoc duoc nguoi nay quan tam gi. Loi ghi lich su khong
    // duoc lam hong viec tim.
    if (user && tuKhoa.trim()) documentService.logSearch(tuKhoa).catch(() => {});
  };

  const moDangBai = useCallback(() => {
    if (!user) {
      // Mo hop dang nhap ngay tren trang (AuthModalGate nghe ?auth).
      const u = new URL(window.location.href);
      u.searchParams.set("auth", "login");
      u.searchParams.set("vi", "chiase");
      window.history.pushState(null, "", u.toString());
      return;
    }
    setMoForm(true);
    requestAnimationFrame(() => formRef.current?.cuonToi());
  }, [user]);

  // ?dang=1 (vd. nut "Chia se tai lieu" o trang mot truong): mo san form. Doi
  // biet nguoi xem la ai da - mo luc con dang hoi may chu thi nguoi da dang
  // nhap cung bi bat dang nhap lai. Xoa tham so ngay de F5 khong mo lai.
  useEffect(() => {
    if (dangTaiUser) return;
    const u = new URL(window.location.href);
    if (u.searchParams.get("dang") !== "1") return;
    u.searchParams.delete("dang");
    window.history.replaceState(null, "", u.toString());
    void Promise.resolve().then(moDangBai);
  }, [dangTaiUser, moDangBai]);

  // Chia se: bang chia se cua may neu co (dien thoai), khong thi chep link.
  const [daChep, setDaChep] = useState(false);
  const chiaSe = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: tenTrang, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setDaChep(true);
      setTimeout(() => setDaChep(false), 2000);
    } catch {
      // Nguoi dung huy bang chia se - khong can bao gi.
    }
  };

  const xoaBai = async (doc: SharedDocument) => {
    if (!confirm(`Xóa tài liệu "${doc.title}"? Thao tác này không hoàn tác được.`))
      return;
    try {
      await documentService.deleteDocument(doc._id);
      await taiLai(data.page, boLoc);
    } catch (err) {
      alert(getErrorMessage(err, "Không xóa được tài liệu."));
    }
  };

  const coTheXoa = (doc: SharedDocument) =>
    Boolean(user && (user.role === "admin" || user._id === doc.uploader?._id));

  const dangLocGi = Boolean(boLoc.q || boLoc.mon || boLoc.nhom || boLoc.truong);
  const LOC_TRONG: BoLoc = { q: "", mon: "", nhom: "", truong: "", loai: "" };

  // Hang cuon ngang chi hien khi KHONG tim tu khoa - dang tim thi nguoi dung
  // can ket qua tim ngay, khong phai cuon qua cac hang goi y.
  const hienHang = !boLoc.q;

  return (
    <div className={b.trang}>
      {/* ============================================================ */}
      {/* Dai dau: duong dan, ten + so lieu, nut, o tim, bo loc          */}
      {/* ============================================================ */}
      <header className={b.dau}>
        <div className={b.khung}>
          <nav className={b.duongDan} aria-label="Đường dẫn">
            <Link href={DUONG_TRANG_CHU}>Chia sẻ tài liệu</Link>
            {/* Loc theo truong: di qua "Truong dai hoc" > ten truong. Khong
                thi qua "Tat ca tai lieu". */}
            {truongDangLoc ? (
              <>
                <ChevronRight size={14} aria-hidden />
                <Link href={DUONG_TRUONG}>Trường đại học</Link>
                {(monDangLoc || nhomDangLoc) && (
                  <>
                    <ChevronRight size={14} aria-hidden />
                    <Link href={duongTruong(truongDangLoc.key)}>{truongDangLoc.ten}</Link>
                  </>
                )}
              </>
            ) : (
              (monDangLoc || nhomDangLoc) && (
                <>
                  <ChevronRight size={14} aria-hidden />
                  <Link href={DUONG_TAT_CA}>Tất cả tài liệu</Link>
                </>
              )
            )}
            {nhomDangLoc && monDangLoc && (
              <>
                <ChevronRight size={14} aria-hidden />
                <Link
                  href={
                    truongDangLoc
                      ? duongDanhMucTruong(truongDangLoc.key, nhomDangLoc.key)
                      : duongTatCa({ nhom: nhomDangLoc.key })
                  }
                >
                  {nhomDangLoc.ten}
                </Link>
              </>
            )}
            <ChevronRight size={14} aria-hidden />
            <span aria-current="page">{tenTrang}</span>
          </nav>

          <div className={b.hangTieuDe}>
            <Folder size={56} className={b.iconThuMuc} aria-hidden />
            <div className={b.chuTieuDe}>
              <h1 className={b.tieuDe}>{tenTrang}</h1>
              {thongKe && (
                <ul className={b.soLieu} aria-label="Số liệu">
                  <li className={b.oSo}>
                    <FileText size={16} aria-hidden />
                    <strong>{dinhSo(thongKe.tong)}</strong> tài liệu
                  </li>
                  <li className={b.oSo}>
                    <Download size={16} aria-hidden />
                    <strong>{dinhSo(thongKe.luotTai)}</strong> lượt tải
                  </li>
                  <li className={b.oSo}>
                    <Users size={16} aria-hidden />
                    <strong>{dinhSo(thongKe.soNguoiChiaSe)}</strong> người chia sẻ
                  </li>
                  {!boLoc.mon && monCoTaiLieu.length > 0 && (
                    <li className={b.oSo}>
                      <BookOpen size={16} aria-hidden />
                      <strong>{monCoTaiLieu.length}</strong> môn học
                    </li>
                  )}
                </ul>
              )}
            </div>
          </div>

          <div className={b.hangNut}>
            <button type="button" onClick={moDangBai} className={b.nutDen}>
              <Upload size={17} aria-hidden />
              Đăng tài liệu
            </button>
            <button type="button" onClick={chiaSe} className={b.nutTrang}>
              {daChep ? (
                <Check size={17} aria-hidden />
              ) : (
                <Share2 size={17} aria-hidden />
              )}
              {daChep ? "Đã chép liên kết" : "Chia sẻ"}
            </button>
            <form onSubmit={timKiem} role="search" className={b.oTim}>
              <input
                type="search"
                value={tuKhoa}
                onChange={(e) => setTuKhoa(e.target.value)}
                placeholder={`Tìm trong ${tenTrang}`}
                aria-label={`Tìm trong ${tenTrang}`}
                className={b.nhapTim}
              />
              <button type="submit" aria-label="Tìm" className={b.nutTim}>
                <Search size={18} />
              </button>
            </form>
          </div>

          {/* Bo loc dang o chon gon - thay cot loc ben trai truoc day. */}
          <div className={b.hangLoc} role="group" aria-label="Bộ lọc">
            {nhomCoTaiLieu.length > 0 && (
              <select
                aria-label="Lọc theo lĩnh vực"
                value={boLoc.nhom}
                // Doi linh vuc thi bo mon cu: mon do co the khong thuoc linh vuc moi.
                onChange={(e) => taiLai(1, { ...boLoc, nhom: e.target.value, mon: "" })}
                className={`${b.chon} ${boLoc.nhom ? b.chonOn : ""}`}
              >
                <option value="">Mọi lĩnh vực</option>
                {nhomCoTaiLieu.map((n) => (
                  <option key={n._id} value={n.key}>
                    {n.ten} ({n.soTaiLieu})
                  </option>
                ))}
              </select>
            )}
            {monCoTaiLieu.length > 0 && (
              <select
                aria-label="Lọc theo môn học"
                value={boLoc.mon}
                onChange={(e) => taiLai(1, { ...boLoc, mon: e.target.value })}
                className={`${b.chon} ${boLoc.mon ? b.chonOn : ""}`}
              >
                <option value="">Mọi môn học</option>
                {/* Mon dang loc nhung khong con trong danh sach (vd. doi linh vuc). */}
                {boLoc.mon && !monCoTaiLieu.some((m) => m.key === boLoc.mon) && (
                  <option value={boLoc.mon}>{monDangLoc?.ten ?? boLoc.mon}</option>
                )}
                {monCoTaiLieu.map((m) => (
                  <option key={m.key} value={m.key}>
                    {m.ten} ({m.soTaiLieu})
                  </option>
                ))}
              </select>
            )}
            {dsTruong.length > 0 && (
              <select
                aria-label="Lọc theo trường"
                value={boLoc.truong}
                onChange={(e) => taiLai(1, { ...boLoc, truong: e.target.value })}
                className={`${b.chon} ${boLoc.truong ? b.chonOn : ""}`}
              >
                <option value="">Mọi trường</option>
                {dsTruong.map((t) => (
                  <option key={t._id} value={t.key}>
                    {t.ten}
                  </option>
                ))}
              </select>
            )}
            {(dangLocGi || boLoc.loai) && (
              <button
                type="button"
                onClick={() => {
                  setTuKhoa("");
                  void taiLai(1, LOC_TRONG);
                }}
                className={b.boHet}
              >
                <X size={14} aria-hidden />
                Xóa bộ lọc
              </button>
            )}
          </div>
        </div>
        {/* Moc de biet dai dau da cuon khoi man hinh chua. */}
        <div ref={moc} aria-hidden />
      </header>

      {/* Dai dau THU GON: cuon qua dai dau thi no hien thanh mot thanh dinh
          duy nhat - ten trang, nut dang, chia se, o tim. inert khi an: nut
          trong thanh an khong duoc nhan Tab vao. */}
      <div className={`${b.gon} ${daDinh ? b.gonOn : ""}`} inert={!daDinh}>
        <div className={`${b.khung} ${b.gonTrong}`}>
          <Folder size={26} className={b.gonIcon} aria-hidden />
          <p className={b.gonTen}>{tenTrang}</p>
          <button type="button" onClick={moDangBai} className={b.nutDenNho}>
            <Upload size={15} aria-hidden />
            <span className={b.chuNut}>Đăng tài liệu</span>
          </button>
          <button type="button" onClick={chiaSe} className={b.nutTrangNho}>
            {daChep ? <Check size={15} aria-hidden /> : <Share2 size={15} aria-hidden />}
            <span className={b.chuNut}>{daChep ? "Đã chép" : "Chia sẻ"}</span>
          </button>
          <form onSubmit={timKiem} role="search" className={b.gonTim}>
            <input
              type="search"
              value={tuKhoa}
              onChange={(e) => setTuKhoa(e.target.value)}
              placeholder={`Tìm trong ${tenTrang}`}
              aria-label={`Tìm trong ${tenTrang}`}
              className={b.gonNhap}
            />
            <button type="submit" aria-label="Tìm" className={b.nutTim}>
              <Search size={16} />
            </button>
          </form>
        </div>
      </div>

      <div className={b.khung}>
        {user && moForm && (
          <div className={b.oForm}>
            <div className={b.theQuyDinh}>
              <ShieldAlert size={18} aria-hidden />
              <p>
                Hệ thống tự động từ chối bài có nội dung{" "}
                <strong>chửi thề, tục tĩu</strong>, <strong>kỳ thị</strong> hoặc{" "}
                <strong>kích động gây hấn</strong>. File{" "}
                {DUOI_CHO_PHEP.map((d) => d.toUpperCase()).join(" · ")}, tối đa 5 file,{" "}
                {MAX_MB}MB/file — hoặc viết bài hướng dẫn chỉ gồm chữ và ảnh.
              </p>
            </div>
            <DocumentUploadForm
              ref={formRef}
              dsMon={dsMon}
              khiDong={() => setMoForm(false)}
              truongMacDinh={boLocBanDau.truong}
              khiDangXong={() => {
                void taiLai(1, boLoc);
                void taiDsMon();
              }}
            />
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* Tat ca tai lieu: tab loai + luoi                               */}
      {/* ============================================================ */}
      <section aria-labelledby="tat-ca-tai-lieu" className={b.phanDs}>
        <div className={b.khung}>
          <div className={b.hangTab}>
            <h2 id="tat-ca-tai-lieu" className={b.anChu}>
              Tất cả tài liệu
            </h2>
            <div className={b.tabs} role="group" aria-label="Loại tài liệu">
              {TAB_LOAI.filter(
                (t) => !t.khoa || t.khoa === boLoc.loai || (thongKe?.[t.dem] ?? 0) > 0,
              ).map((t) => (
                <button
                  key={t.khoa || "tatCa"}
                  type="button"
                  aria-pressed={boLoc.loai === t.khoa}
                  onClick={() => taiLai(1, { ...boLoc, loai: t.khoa })}
                  className={`${b.tab} ${boLoc.loai === t.khoa ? b.tabOn : ""}`}
                >
                  {t.nhan}
                  {thongKe && <span className={b.soTab}>{dinhSo(thongKe[t.dem])}</span>}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={b.khung}>
          {boLoc.q && (
            <p className={b.ketQuaTim} role="status">
              <strong>{dinhSo(data.total)}</strong> kết quả cho “{boLoc.q}”
              <button
                type="button"
                onClick={() => {
                  setTuKhoa("");
                  void taiLai(1, { ...boLoc, q: "" });
                }}
                className={b.nutChu}
              >
                Bỏ tìm
              </button>
            </p>
          )}

          {loiDanhSach && (
            <p role="alert" className={styles.text10}>
              {loiDanhSach}
            </p>
          )}

          {dangTai ? (
            <div className={b.trong}>
              <Loader2 size={20} className={styles.spinner} />
              Đang tải...
            </div>
          ) : data.documents.length === 0 &&
            trongPhamVi &&
            !boLoc.q &&
            !boLoc.mon &&
            !boLoc.loai ? (
            // Trang linh vuc cua truong chua co bai nao: moi dang bai dau tien,
            // truong chon san trong form.
            <div className={b.trong}>
              <FileText size={32} aria-hidden />
              <p className={b.trongTieuDe}>
                Chưa có tài liệu {tenTrang} nào của {truongDangLoc?.ten ?? "trường này"}
              </p>
              <p>
                Bạn học ở đây? Hãy là người đầu tiên chia sẻ đề cương, đề thi hoặc bài
                giải.
              </p>
              <button type="button" onClick={moDangBai} className={b.nutDen}>
                <Upload size={17} aria-hidden />
                Chia sẻ tài liệu đầu tiên
              </button>
            </div>
          ) : data.documents.length === 0 ? (
            <div className={b.trong}>
              <FileText size={32} aria-hidden />
              <p className={b.trongTieuDe}>
                {dangLocGi || boLoc.loai
                  ? "Không tìm thấy tài liệu phù hợp"
                  : "Chưa có tài liệu nào"}
              </p>
              <p>
                {dangLocGi || boLoc.loai
                  ? "Thử từ khóa hoặc bộ lọc khác xem sao."
                  : "Hãy là người đầu tiên chia sẻ."}
              </p>
            </div>
          ) : (
            <ul className={b.luoi}>
              {data.documents.map((doc) => (
                <li key={doc._id}>
                  <TheTaiLieuDoc
                    doc={doc}
                    chan="thoiGian"
                    khiXoa={coTheXoa(doc) ? () => void xoaBai(doc) : undefined}
                  />
                </li>
              ))}
            </ul>
          )}

          {data.totalPages > 1 && (
            <nav className={b.phanTrang} aria-label="Phân trang">
              <button
                type="button"
                disabled={data.page <= 1 || dangTai}
                onClick={() => taiLai(data.page - 1, boLoc)}
                className={b.nutTrangSo}
              >
                ← Trước
              </button>
              <span>
                Trang <strong>{data.page}</strong> / {data.totalPages}
              </span>
              <button
                type="button"
                disabled={data.page >= data.totalPages || dangTai}
                onClick={() => taiLai(data.page + 1, boLoc)}
                className={b.nutTrangSo}
              >
                Sau →
              </button>
            </nav>
          )}
        </div>
      </section>

      {/* Cac hang cuon ngang - DUOI danh sach tat ca. */}
      <div className={b.khung}>
        {hienHang && (
          <CacHangTaiLieu
            loc={{ truong: boLoc.truong, nhom: boLoc.nhom, mon: boLoc.mon }}
            tenPhamVi={boLoc.truong || boLoc.nhom || boLoc.mon ? tenTrang : undefined}
          />
        )}
      </div>
    </div>
  );
}
