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
import DocumentShelves from "./DocumentShelves";
import DocumentCard from "./DocumentCard";
import { ALLOWED_EXTENSIONS, MAX_MB } from "@/src/lib/document/file-info";
import {
  ALL_PATH,
  HOME_PATH,
  SCHOOLS_PATH,
  schoolCategoryPath,
  allPath,
  schoolPath,
} from "@/src/lib/document/paths";
import {
  documentService,
  type DocumentCategory,
  type DocumentListResponse,
  type DocumentSubject,
  type DocumentUniversity,
  type DocumentType,
  type ListStats,
} from "@/src/services/document";
import { useUserLoading, useStoredUser } from "@/src/hooks/userStore";
import { getErrorMessage } from "@/src/services/apiHelper";

import styles from "./ShareDocumentClient.module.scss";
import b from "./ShareDocumentBrowse.module.scss";

/** Bo loc dang ap dung - dong bo voi dia chi ?q=&mon=&nhom=&truong=&loai=. */
export interface Filters {
  q: string;
  /** Khoa mon (DocumentSubject.key), "" = moi mon. */
  mon: string;
  /** Khoa linh vuc (DocumentCategory.key), "" = moi linh vuc. */
  nhom: string;
  /** Khoa truong dai hoc (DocumentUniversity.key), "" = moi truong. */
  truong: string;
  /** Tab loai tai lieu, "" = tat ca. */
  loai: DocumentType | "";
}

interface Props {
  /** Trang dau lay san tu server theo dung bo loc tren dia chi - xem page.tsx */
  initialData: DocumentListResponse;
  initialFilters: Filters;
  groupList: DocumentCategory[];
  schoolList: DocumentUniversity[];
  /** Danh sach mon lay san tu server - tieu de trang dung ngay, khong nhay. */
  initialSubjects: DocumentSubject[];
  /**
   * Trang linh vuc cua mot truong (/institution/<truong>/<linh-vuc>): con dung
   * truong + linh vuc nay thi dia chi giu dang do; doi sang bo loc khac thi
   * ve /all-document.
   */
  scope?: { truong: string; nhom: string };
  /** Mon cua truong thuoc linh vuc dang xem (danh muc truong) - trang linh vuc cua truong. */
  scopedSubjects?: { key: string; ten: string; soTaiLieu: number }[];
}

// 4 hang x 6 cot tren man rong.
const PAGE_SIZE = 24;

const TAB_LOAI: { khoa: DocumentType | ""; nhan: string; dem: keyof ListStats }[] = [
  { khoa: "", nhan: "Tất cả", dem: "tong" },
  { khoa: "pdf", nhan: "PDF", dem: "pdf" },
  { khoa: "word", nhan: "Word", dem: "word" },
  { khoa: "baiViet", nhan: "Bài viết hướng dẫn", dem: "baiViet" },
];

const formatNumber = (n: number) => n.toLocaleString("vi-VN");

/**
 * Trang TAT CA tai lieu (/share-document/browse), bo cuc theo trang mon hoc
 * cua ban mau tham chieu:
 *   dai dau (duong dan, ten + so lieu, nut dang / chia se, o tim, bo loc),
 *   cac hang cuon ngang (goi y, xem gan day, tai nhieu nhat),
 *   luoi tat ca tai lieu voi thanh tab loai DINH khi cuon.
 */
export default function ShareDocumentClient({
  initialData,
  initialFilters,
  groupList,
  schoolList,
  initialSubjects,
  scope,
  scopedSubjects,
}: Props) {
  const [data, setData] = useState<DocumentListResponse>(initialData);
  // So lieu tach rieng: doi tab loai thi danh sach doi nhung so cua ca bon tab giu nguyen.
  const [stats, setStats] = useState<ListStats | undefined>(initialData.thongKe);
  const [loading, setLoading] = useState(false);
  const [listError, setListError] = useState("");

  const [keyword, setKeyword] = useState(initialFilters.q);
  const [filter, setFilter] = useState<Filters>(initialFilters);

  const user = useStoredUser();
  const loadingUser = useUserLoading();
  const [openForm, setOpenForm] = useState(false);
  const formRef = useRef<DocumentUploadFormHandle>(null);

  const [subjectList, setSubjectList] = useState<DocumentSubject[]>(initialSubjects);
  const activeGroup = groupList.find((n) => n.key === filter.nhom);
  const activeSchool = schoolList.find((t) => t.key === filter.truong);
  // Con dung truong + linh vuc cua trang linh vuc truong: mon lay theo danh
  // muc cua truong (ke ca mon chua co bai), khong theo ca kho.
  const inScope = Boolean(
    scope && filter.truong === scope.truong && filter.nhom === scope.nhom,
  );
  const activeSubject =
    subjectList.find((m) => m.key === filter.mon) ??
    scopedSubjects?.find((m) => m.key === filter.mon);
  // Ten trang: mon > truong > linh vuc > "Tat ca tai lieu".
  // Ten trang: cu the nhat truoc - mon > linh vuc > truong > "Tat ca tai lieu".
  const pageName =
    activeSubject?.ten ?? activeGroup?.ten ?? activeSchool?.ten ?? "Tất cả tài liệu";
  // Dang loc mot linh vuc thi o chon mon chi con cac mon cua linh vuc do.
  const subjectsWithDocuments: { key: string; ten: string; soTaiLieu: number }[] =
    inScope && scopedSubjects
      ? scopedSubjects
      : subjectList.filter(
          (m) => m.soTaiLieu > 0 && (!activeGroup || m.nhom === activeGroup._id),
        );
  // Linh vuc dang loc luon co trong o chon, ke ca khi chua co bai nao (vd.
  // trang "Kinh te" cua mot truong) - khong thi o chon hien sai "Moi linh vuc".
  const groupsWithDocuments = groupList.filter(
    (n) => n.soTaiLieu > 0 || n.key === filter.nhom,
  );

  const loadSubjects = useCallback(async () => {
    try {
      setSubjectList(await documentService.getSubjects());
    } catch {
      // Khong co danh sach mon thi o chon mon an di - phan phu.
    }
  }, []);

  // Server khong lay duoc danh sach mon (backend cham...) thi tai lai o day.
  const hasInitialSubject = initialSubjects.length > 0;
  useEffect(() => {
    // Hoan mot vong microtask - tranh setState dong bo trong than effect.
    if (!hasInitialSubject) void Promise.resolve().then(loadSubjects);
  }, [hasInitialSubject, loadSubjects]);

  /**
   * Tai trang `page` voi bo loc moi, va GHI bo loc len dia chi - gui link cho
   * nguoi khac la ho thay dung danh sach dang xem. replaceState: doi bo loc
   * khong lap day nut Back.
   */
  const scopeSchool = scope?.truong;
  const scopeGroup = scope?.nhom;
  const reload = useCallback(
    async (page: number, query: Filters) => {
      setFilter(query);
      const keepScope =
        scopeSchool && query.truong === scopeSchool && query.nhom === scopeGroup;
      window.history.replaceState(
        null,
        "",
        keepScope ? schoolCategoryPath(query.truong, query.nhom, query) : allPath(query),
      );
      setLoading(true);
      setListError("");
      try {
        const outcome = await documentService.getDocuments({
          page,
          limit: PAGE_SIZE,
          ...query,
          thongKe: true,
        });
        setData(outcome);
        setStats(outcome.thongKe);
      } catch (err) {
        setListError(getErrorMessage(err, "Không tải được danh sách tài liệu."));
      } finally {
        setLoading(false);
      }
    },
    [scopeSchool, scopeGroup],
  );

  // ---------------------------------------------------------------- thanh dinh
  // Dai dau ra khoi man hinh -> thanh tab hien them ten trang + nut dang.
  const moc = useRef<HTMLDivElement>(null);
  const [pinned, setPinned] = useState(false);
  useEffect(() => {
    const el = moc.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setPinned(!e.isIntersecting), {
      // Tru chieu cao header co dinh cua trang (104px).
      rootMargin: "-104px 0px 0px 0px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const search = (e: React.FormEvent) => {
    e.preventDefault();
    reload(1, { ...filter, q: keyword });
    // Ghi lai de goi y hoc duoc nguoi nay quan tam gi. Loi ghi lich su khong
    // duoc lam hong viec tim.
    if (user && keyword.trim()) documentService.logSearch(keyword).catch(() => {});
  };

  const openUpload = useCallback(() => {
    if (!user) {
      // Mo hop dang nhap ngay tren trang (AuthModalGate nghe ?auth).
      const u = new URL(window.location.href);
      u.searchParams.set("auth", "login");
      u.searchParams.set("vi", "chiase");
      window.history.pushState(null, "", u.toString());
      return;
    }
    setOpenForm(true);
    requestAnimationFrame(() => formRef.current?.scrollTo());
  }, [user]);

  // ?dang=1 (vd. nut "Chia se tai lieu" o trang mot truong): mo san form. Doi
  // biet nguoi xem la ai da - mo luc con dang hoi may chu thi nguoi da dang
  // nhap cung bi bat dang nhap lai. Xoa tham so ngay de F5 khong mo lai.
  useEffect(() => {
    if (loadingUser) return;
    const u = new URL(window.location.href);
    if (u.searchParams.get("dang") !== "1") return;
    u.searchParams.delete("dang");
    window.history.replaceState(null, "", u.toString());
    void Promise.resolve().then(openUpload);
  }, [loadingUser, openUpload]);

  // Chia se: bang chia se cua may neu co (dien thoai), khong thi chep link.
  const [copied, setCopied] = useState(false);
  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: pageName, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Nguoi dung huy bang chia se - khong can bao gi.
    }
  };

  const activeFilter = Boolean(filter.q || filter.mon || filter.nhom || filter.truong);
  const EMPTY_FILTERS: Filters = { q: "", mon: "", nhom: "", truong: "", loai: "" };

  // Hang cuon ngang chi hien khi KHONG tim tu khoa - dang tim thi nguoi dung
  // can ket qua tim ngay, khong phai cuon qua cac hang goi y.
  const showRow = !filter.q;

  return (
    <div className={b.trang}>
      {/* ============================================================ */}
      {/* Dai dau: duong dan, ten + so lieu, nut, o tim, bo loc          */}
      {/* ============================================================ */}
      <header className={b.dau}>
        <div className={b.khung}>
          <nav className={b.duongDan} aria-label="Đường dẫn">
            <Link href={HOME_PATH}>Chia sẻ tài liệu</Link>
            {/* Loc theo truong: di qua "Truong dai hoc" > ten truong. Khong
                thi qua "Tat ca tai lieu". */}
            {activeSchool ? (
              <>
                <ChevronRight size={14} aria-hidden />
                <Link href={SCHOOLS_PATH}>Trường đại học</Link>
                {(activeSubject || activeGroup) && (
                  <>
                    <ChevronRight size={14} aria-hidden />
                    <Link href={schoolPath(activeSchool.key)}>{activeSchool.ten}</Link>
                  </>
                )}
              </>
            ) : (
              (activeSubject || activeGroup) && (
                <>
                  <ChevronRight size={14} aria-hidden />
                  <Link href={ALL_PATH}>Tất cả tài liệu</Link>
                </>
              )
            )}
            {activeGroup && activeSubject && (
              <>
                <ChevronRight size={14} aria-hidden />
                <Link
                  href={
                    activeSchool
                      ? schoolCategoryPath(activeSchool.key, activeGroup.key)
                      : allPath({ nhom: activeGroup.key })
                  }
                >
                  {activeGroup.ten}
                </Link>
              </>
            )}
            <ChevronRight size={14} aria-hidden />
            <span aria-current="page">{pageName}</span>
          </nav>

          <div className={b.titleRow}>
            <Folder size={56} className={b.folderIcon} aria-hidden />
            <div className={b.titleText}>
              <h1 className={b.tieuDe}>{pageName}</h1>
              {stats && (
                <ul className={b.figures} aria-label="Số liệu">
                  <li className={b.numberCell}>
                    <FileText size={16} aria-hidden />
                    <strong>{formatNumber(stats.tong)}</strong> tài liệu
                  </li>
                  <li className={b.numberCell}>
                    <Download size={16} aria-hidden />
                    <strong>{formatNumber(stats.luotTai)}</strong> lượt tải
                  </li>
                  <li className={b.numberCell}>
                    <Users size={16} aria-hidden />
                    <strong>{formatNumber(stats.soNguoiChiaSe)}</strong> người chia sẻ
                  </li>
                  {!filter.mon && subjectsWithDocuments.length > 0 && (
                    <li className={b.numberCell}>
                      <BookOpen size={16} aria-hidden />
                      <strong>{subjectsWithDocuments.length}</strong> môn học
                    </li>
                  )}
                </ul>
              )}
            </div>
          </div>

          <div className={b.buttonRow}>
            <button type="button" onClick={openUpload} className={b.darkButton}>
              <Upload size={17} aria-hidden />
              Đăng tài liệu
            </button>
            <button type="button" onClick={share} className={b.pageButton}>
              {copied ? (
                <Check size={17} aria-hidden />
              ) : (
                <Share2 size={17} aria-hidden />
              )}
              {copied ? "Đã chép liên kết" : "Chia sẻ"}
            </button>
            <form onSubmit={search} role="search" className={b.searchInput}>
              <input
                type="search"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder={`Tìm trong ${pageName}`}
                aria-label={`Tìm trong ${pageName}`}
                className={b.searchInput}
              />
              <button type="submit" aria-label="Tìm" className={b.searchButton}>
                <Search size={18} />
              </button>
            </form>
          </div>

          {/* Bo loc dang o chon gon - thay cot loc ben trai truoc day. */}
          <div className={b.filterRow} role="group" aria-label="Bộ lọc">
            {groupsWithDocuments.length > 0 && (
              <select
                aria-label="Lọc theo lĩnh vực"
                value={filter.nhom}
                // Doi linh vuc thi bo mon cu: mon do co the khong thuoc linh vuc moi.
                onChange={(e) => reload(1, { ...filter, nhom: e.target.value, mon: "" })}
                className={`${b.chon} ${filter.nhom ? b.pickedFilter : ""}`}
              >
                <option value="">Mọi lĩnh vực</option>
                {groupsWithDocuments.map((n) => (
                  <option key={n._id} value={n.key}>
                    {n.ten} ({n.soTaiLieu})
                  </option>
                ))}
              </select>
            )}
            {subjectsWithDocuments.length > 0 && (
              <select
                aria-label="Lọc theo môn học"
                value={filter.mon}
                onChange={(e) => reload(1, { ...filter, mon: e.target.value })}
                className={`${b.chon} ${filter.mon ? b.pickedFilter : ""}`}
              >
                <option value="">Mọi môn học</option>
                {/* Mon dang loc nhung khong con trong danh sach (vd. doi linh vuc). */}
                {filter.mon &&
                  !subjectsWithDocuments.some((m) => m.key === filter.mon) && (
                    <option value={filter.mon}>{activeSubject?.ten ?? filter.mon}</option>
                  )}
                {subjectsWithDocuments.map((m) => (
                  <option key={m.key} value={m.key}>
                    {m.ten} ({m.soTaiLieu})
                  </option>
                ))}
              </select>
            )}
            {schoolList.length > 0 && (
              <select
                aria-label="Lọc theo trường"
                value={filter.truong}
                onChange={(e) => reload(1, { ...filter, truong: e.target.value })}
                className={`${b.chon} ${filter.truong ? b.pickedFilter : ""}`}
              >
                <option value="">Mọi trường</option>
                {schoolList.map((t) => (
                  <option key={t._id} value={t.key}>
                    {t.ten}
                  </option>
                ))}
              </select>
            )}
            {(activeFilter || filter.loai) && (
              <button
                type="button"
                onClick={() => {
                  setKeyword("");
                  void reload(1, EMPTY_FILTERS);
                }}
                className={b.clearAll}
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
      <div className={`${b.gon} ${pinned ? b.compactActive : ""}`} inert={!pinned}>
        <div className={`${b.khung} ${b.compactEmpty}`}>
          <Folder size={26} className={b.gonIcon} aria-hidden />
          <p className={b.compactName}>{pageName}</p>
          <button type="button" onClick={openUpload} className={b.smallDarkButton}>
            <Upload size={15} aria-hidden />
            <span className={b.buttonLabel}>Đăng tài liệu</span>
          </button>
          <button type="button" onClick={share} className={b.smallPageButton}>
            {copied ? <Check size={15} aria-hidden /> : <Share2 size={15} aria-hidden />}
            <span className={b.buttonLabel}>{copied ? "Đã chép" : "Chia sẻ"}</span>
          </button>
          <form onSubmit={search} role="search" className={b.compactSearch}>
            <input
              type="search"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder={`Tìm trong ${pageName}`}
              aria-label={`Tìm trong ${pageName}`}
              className={b.compactInput}
            />
            <button type="submit" aria-label="Tìm" className={b.searchButton}>
              <Search size={16} />
            </button>
          </form>
        </div>
      </div>

      <div className={b.khung}>
        {user && openForm && (
          <div className={b.oForm}>
            <div className={b.rulesCard}>
              <ShieldAlert size={18} aria-hidden />
              <p>
                Hệ thống tự động từ chối bài có nội dung{" "}
                <strong>chửi thề, tục tĩu</strong>, <strong>kỳ thị</strong> hoặc{" "}
                <strong>kích động gây hấn</strong>. File{" "}
                {ALLOWED_EXTENSIONS.map((d) => d.toUpperCase()).join(" · ")}, tối đa 5
                file, {MAX_MB}MB/file — hoặc viết bài hướng dẫn chỉ gồm chữ và ảnh.
              </p>
            </div>
            <DocumentUploadForm
              ref={formRef}
              subjectList={subjectList}
              onClose={() => setOpenForm(false)}
              defaultSchool={initialFilters.truong}
              onPosted={() => {
                void reload(1, filter);
                void loadSubjects();
              }}
            />
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* Tat ca tai lieu: tab loai + luoi                               */}
      {/* ============================================================ */}
      <section aria-labelledby="tat-ca-tai-lieu" className={b.listPart}>
        <div className={b.khung}>
          <div className={b.tabRow}>
            <h2 id="tat-ca-tai-lieu" className={b.hideText}>
              Tất cả tài liệu
            </h2>
            <div className={b.tabs} role="group" aria-label="Loại tài liệu">
              {TAB_LOAI.filter(
                (t) => !t.khoa || t.khoa === filter.loai || (stats?.[t.dem] ?? 0) > 0,
              ).map((t) => (
                <button
                  key={t.khoa || "tatCa"}
                  type="button"
                  aria-pressed={filter.loai === t.khoa}
                  onClick={() => reload(1, { ...filter, loai: t.khoa })}
                  className={`${b.tab} ${filter.loai === t.khoa ? b.tabOn : ""}`}
                >
                  {t.nhan}
                  {stats && (
                    <span className={b.tabCount}>{formatNumber(stats[t.dem])}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={b.khung}>
          {filter.q && (
            <p className={b.searchResults} role="status">
              <strong>{formatNumber(data.total)}</strong> kết quả cho “{filter.q}”
              <button
                type="button"
                onClick={() => {
                  setKeyword("");
                  void reload(1, { ...filter, q: "" });
                }}
                className={b.textButton}
              >
                Bỏ tìm
              </button>
            </p>
          )}

          {listError && (
            <p role="alert" className={styles.text10}>
              {listError}
            </p>
          )}

          {loading ? (
            <div className={b.trong}>
              <Loader2 size={20} className={styles.spinner} />
              Đang tải...
            </div>
          ) : data.documents.length === 0 &&
            inScope &&
            !filter.q &&
            !filter.mon &&
            !filter.loai ? (
            // Trang linh vuc cua truong chua co bai nao: moi dang bai dau tien,
            // truong chon san trong form.
            <div className={b.trong}>
              <FileText size={32} aria-hidden />
              <p className={b.inTitle}>
                Chưa có tài liệu {pageName} nào của {activeSchool?.ten ?? "trường này"}
              </p>
              <p>
                Bạn học ở đây? Hãy là người đầu tiên chia sẻ đề cương, đề thi hoặc bài
                giải.
              </p>
              <button type="button" onClick={openUpload} className={b.darkButton}>
                <Upload size={17} aria-hidden />
                Chia sẻ tài liệu đầu tiên
              </button>
            </div>
          ) : data.documents.length === 0 ? (
            <div className={b.trong}>
              <FileText size={32} aria-hidden />
              <p className={b.inTitle}>
                {activeFilter || filter.loai
                  ? "Không tìm thấy tài liệu phù hợp"
                  : "Chưa có tài liệu nào"}
              </p>
              <p>
                {activeFilter || filter.loai
                  ? "Thử từ khóa hoặc bộ lọc khác xem sao."
                  : "Hãy là người đầu tiên chia sẻ."}
              </p>
            </div>
          ) : (
            <ul className={b.luoi}>
              {data.documents.map((doc) => (
                <li key={doc._id}>
                  {/* Khong co nut xoa o day: trang nay de xem / tim, bam nham la
                      mat bai. Chu bai xoa o ho so (Tai lieu cua toi), admin
                      xoa o trang quan tri. */}
                  <DocumentCard doc={doc} chan="thoiGian" />
                </li>
              ))}
            </ul>
          )}

          {data.totalPages > 1 && (
            <nav className={b.phanTrang} aria-label="Phân trang">
              <button
                type="button"
                disabled={data.page <= 1 || loading}
                onClick={() => reload(data.page - 1, filter)}
                className={b.pageNumberButton}
              >
                ← Trước
              </button>
              <span>
                Trang <strong>{data.page}</strong> / {data.totalPages}
              </span>
              <button
                type="button"
                disabled={data.page >= data.totalPages || loading}
                onClick={() => reload(data.page + 1, filter)}
                className={b.pageNumberButton}
              >
                Sau →
              </button>
            </nav>
          )}
        </div>
      </section>

      {/* Cac hang cuon ngang - DUOI danh sach tat ca. */}
      <div className={b.khung}>
        {showRow && (
          <DocumentShelves
            query={{ truong: filter.truong, nhom: filter.nhom, mon: filter.mon }}
            scopeName={filter.truong || filter.nhom || filter.mon ? pageName : undefined}
          />
        )}
      </div>
    </div>
  );
}
