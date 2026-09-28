"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  BookOpen,
  Check,
  CheckCircle,
  GraduationCap,
  Layers,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import { getErrorMessage } from "@/src/services/apiHelper";
import {
  documentService,
  type BieuTuongLinhVuc,
  type DocumentCategory,
  type DocumentSubject,
  type DocumentUniversity,
} from "@/src/services/document";
import { BIEU_TUONG } from "@/src/components/document/DocumentCategories";

import styles from "./page.module.scss";

const DS_BIEU_TUONG = Object.entries(BIEU_TUONG) as [
  BieuTuongLinhVuc,
  (typeof BIEU_TUONG)[BieuTuongLinhVuc],
][];

/**
 * Mon hoc va LINH VUC cua kho tai lieu chia se.
 *
 * - Linh vuc: nhom lon (Luat, Kinh doanh...) - hien thanh cac o o trang
 *   /share-document.
 * - Mon: nguoi dang tai lieu chi CHON trong danh sach nay. Moi mon xep vao toi
 *   da mot linh vuc.
 *
 * Rieng cho kho tai lieu, khong dinh vao danh muc cua khoa hoc.
 */
export default function AdminDocumentSubjectsPage() {
  const [ds, setDs] = useState<DocumentSubject[]>([]);
  const [dsNhom, setDsNhom] = useState<DocumentCategory[]>([]);
  const [dangTai, setDangTai] = useState(true);
  const [loi, setLoi] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const [tenMoi, setTenMoi] = useState("");
  const [dangThem, setDangThem] = useState(false);

  const [dangSua, setDangSua] = useState<string | null>(null);
  const [tenSua, setTenSua] = useState("");
  const [dangLuu, setDangLuu] = useState(false);
  const [dangXoa, setDangXoa] = useState<string | null>(null);

  // Linh vuc
  const [tenNhomMoi, setTenNhomMoi] = useState("");
  const [bieuTuongMoi, setBieuTuongMoi] = useState<BieuTuongLinhVuc>("sach");
  const [dangThemNhom, setDangThemNhom] = useState(false);
  const [suaNhom, setSuaNhom] = useState<string | null>(null);
  const [tenNhomSua, setTenNhomSua] = useState("");

  // Truong dai hoc
  const [dsTruong, setDsTruong] = useState<DocumentUniversity[]>([]);
  const [tenTruongMoi, setTenTruongMoi] = useState("");
  const [suaTruong, setSuaTruong] = useState<string | null>(null);
  const [tenTruongSua, setTenTruongSua] = useState("");
  const [logoSua, setLogoSua] = useState("");

  const tai = useCallback(async () => {
    try {
      setDangTai(true);
      setLoi(null);
      const [mon, nhom, truong] = await Promise.all([
        documentService.getSubjects(),
        documentService.getCategories(),
        documentService.getUniversities(),
      ]);
      setDs(mon);
      setDsNhom(nhom);
      setDsTruong(truong);
    } catch (err) {
      setLoi(getErrorMessage(err, "Không tải được danh sách môn học."));
    } finally {
      setDangTai(false);
    }
  }, []);

  useEffect(() => {
    // Hoan mot vong microtask - cung cach app/(admin)/admin/faqs/page.tsx, tranh
    // setState dong bo trong than effect (react-hooks/set-state-in-effect).
    void Promise.resolve().then(tai);
  }, [tai]);

  // ------------------------------------------------------------- linh vuc

  const themNhom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenNhomMoi.trim()) return;
    try {
      setDangThemNhom(true);
      setLoi(null);
      const n = await documentService.createCategory({
        ten: tenNhomMoi,
        bieuTuong: bieuTuongMoi,
      });
      setDsNhom((cu) => [...cu, n]);
      setTenNhomMoi("");
      setOk(`Đã thêm lĩnh vực "${n.ten}".`);
    } catch (err) {
      setLoi(getErrorMessage(err, "Không thêm được lĩnh vực."));
    } finally {
      setDangThemNhom(false);
    }
  };

  const capNhatNhom = async (
    n: DocumentCategory,
    data: { ten?: string; bieuTuong?: BieuTuongLinhVuc },
  ) => {
    try {
      setLoi(null);
      const moi = await documentService.updateCategory(n._id, data);
      setDsNhom((cu) =>
        cu.map((x) =>
          x._id === n._id
            ? { ...x, ten: moi.ten, key: moi.key, bieuTuong: moi.bieuTuong }
            : x,
        ),
      );
      setSuaNhom(null);
      setOk(`Đã cập nhật lĩnh vực "${moi.ten}".`);
    } catch (err) {
      setLoi(getErrorMessage(err, "Không cập nhật được lĩnh vực."));
    }
  };

  const xoaNhom = async (n: DocumentCategory) => {
    if (
      !confirm(
        `Xóa lĩnh vực "${n.ten}"? ${n.soMon} môn trong đó sẽ thành "chưa có lĩnh vực" (môn và tài liệu không bị xóa).`,
      )
    )
      return;
    try {
      setLoi(null);
      await documentService.deleteCategory(n._id);
      setDsNhom((cu) => cu.filter((x) => x._id !== n._id));
      setDs((cu) => cu.map((m) => (m.nhom === n._id ? { ...m, nhom: null } : m)));
      setOk(`Đã xóa lĩnh vực "${n.ten}".`);
    } catch (err) {
      setLoi(getErrorMessage(err, "Không xóa được lĩnh vực."));
    }
  };

  const xepMon = async (m: DocumentSubject, nhom: string) => {
    try {
      setLoi(null);
      await documentService.setSubjectCategory(m._id, nhom || null);
      setDs((cu) => cu.map((x) => (x._id === m._id ? { ...x, nhom: nhom || null } : x)));
      // So mon cua moi linh vuc tren man hinh doi theo ngay.
      setDsNhom((cu) =>
        cu.map((n) => ({
          ...n,
          soMon: n.soMon + (n._id === nhom ? 1 : 0) - (n._id === m.nhom ? 1 : 0),
        })),
      );
      const ten = dsNhom.find((n) => n._id === nhom)?.ten;
      setOk(ten ? `Đã xếp "${m.ten}" vào "${ten}".` : `Đã bỏ "${m.ten}" khỏi lĩnh vực.`);
    } catch (err) {
      setLoi(getErrorMessage(err, "Không xếp được môn vào lĩnh vực."));
    }
  };

  // ------------------------------------------------------------- truong

  const themTruong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenTruongMoi.trim()) return;
    try {
      setLoi(null);
      const t = await documentService.createUniversity(tenTruongMoi);
      setDsTruong((cu) => [...cu, t]);
      setTenTruongMoi("");
      setOk(`Đã thêm trường "${t.ten}".`);
    } catch (err) {
      setLoi(getErrorMessage(err, "Không thêm được trường."));
    }
  };

  const doiTenTruong = async (t: DocumentUniversity) => {
    try {
      setLoi(null);
      // Logo doi thi luu logo truoc (kiem o may chu: /images/institution/... hoac https).
      if (logoSua.trim() !== (t.logo ?? "")) {
        const coLogo = await documentService.setUniversityLogo(t._id, logoSua.trim());
        setDsTruong((cu) =>
          cu.map((x) => (x._id === t._id ? { ...x, logo: coLogo.logo } : x)),
        );
      }
      if (!tenTruongSua.trim() || tenTruongSua.trim() === t.ten) {
        setSuaTruong(null);
        setOk(`Đã cập nhật "${t.ten}".`);
        return;
      }
      const moi = await documentService.renameUniversity(t._id, tenTruongSua);
      setDsTruong((cu) =>
        cu.map((x) => (x._id === t._id ? { ...x, ten: moi.ten, key: moi.key } : x)),
      );
      setSuaTruong(null);
      setOk(
        moi.soTaiLieuDaCapNhat > 0
          ? `Đã đổi tên thành "${moi.ten}" và cập nhật ${moi.soTaiLieuDaCapNhat} tài liệu.`
          : `Đã đổi tên thành "${moi.ten}".`,
      );
    } catch (err) {
      setLoi(getErrorMessage(err, "Không đổi được tên trường."));
    }
  };

  const xoaTruong = async (t: DocumentUniversity) => {
    if (
      !confirm(
        `Xóa trường "${t.ten}"? ${t.soTaiLieu} tài liệu đang gắn trường này sẽ thành "không có trường" (tài liệu không bị xóa).`,
      )
    )
      return;
    try {
      setLoi(null);
      await documentService.deleteUniversity(t._id);
      setDsTruong((cu) => cu.filter((x) => x._id !== t._id));
      setOk(`Đã xóa trường "${t.ten}".`);
    } catch (err) {
      setLoi(getErrorMessage(err, "Không xóa được trường."));
    }
  };

  // ------------------------------------------------------------- mon hoc

  const them = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenMoi.trim()) return;
    try {
      setDangThem(true);
      setLoi(null);
      const mon = await documentService.createSubject(tenMoi);
      setDs((cu) => [...cu, mon].sort((a, b) => a.ten.localeCompare(b.ten, "vi")));
      setTenMoi("");
      setOk(`Đã thêm môn "${mon.ten}".`);
    } catch (err) {
      // 409 = trung mon da co (ke ca khac dau/hoa thuong) - may chu noi ro.
      setLoi(getErrorMessage(err, "Không thêm được môn học."));
    } finally {
      setDangThem(false);
    }
  };

  const luuTen = async (m: DocumentSubject) => {
    if (!tenSua.trim() || tenSua.trim() === m.ten) return setDangSua(null);
    try {
      setDangLuu(true);
      setLoi(null);
      const moi = await documentService.renameSubject(m._id, tenSua);
      setDs((cu) =>
        cu
          .map((x) => (x._id === m._id ? { ...x, ten: moi.ten, key: moi.key } : x))
          .sort((a, b) => a.ten.localeCompare(b.ten, "vi")),
      );
      setDangSua(null);
      // Noi ro ca tai lieu cung doi theo: admin can biet doi ten mon khong chi
      // la sua mot dong trong danh sach nay.
      setOk(
        moi.soTaiLieuDaCapNhat > 0
          ? `Đã đổi tên thành "${moi.ten}" và cập nhật ${moi.soTaiLieuDaCapNhat} tài liệu đang dùng môn này.`
          : `Đã đổi tên thành "${moi.ten}".`,
      );
    } catch (err) {
      setLoi(getErrorMessage(err, "Không đổi được tên môn."));
    } finally {
      setDangLuu(false);
    }
  };

  const xoa = async (m: DocumentSubject) => {
    if (!confirm(`Xóa môn "${m.ten}" khỏi danh sách?`)) return;
    try {
      setDangXoa(m._id);
      setLoi(null);
      await documentService.deleteSubject(m._id);
      setDs((cu) => cu.filter((x) => x._id !== m._id));
      setOk(`Đã xóa môn "${m.ten}".`);
    } catch (err) {
      // 409 = con tai lieu dung mon nay - may chu noi ro so luong va cach xu ly.
      setLoi(getErrorMessage(err, "Không xóa được môn học."));
    } finally {
      setDangXoa(null);
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.top}>
        <h1 className={styles.title}>Lĩnh vực, trường và môn học của tài liệu</h1>
        <p className={styles.sub}>
          Lĩnh vực là nhóm lớn hiện ở trang Chia sẻ tài liệu (Luật, Kinh doanh…). Người
          đăng tài liệu chọn môn; môn thuộc lĩnh vực nào thì tài liệu hiện dưới lĩnh vực
          đó. Riêng cho kho tài liệu, không liên quan tới danh mục khóa học.
        </p>
      </header>

      {loi && (
        <div className={styles.bangLoi} role="alert">
          <AlertCircle size={16} />
          {loi}
          <button
            type="button"
            onClick={() => setLoi(null)}
            aria-label="Đóng"
            className={styles.dong}
          >
            <X size={14} />
          </button>
        </div>
      )}
      {ok && (
        <div className={styles.bangOk} role="status">
          <CheckCircle size={16} />
          {ok}
          <button
            type="button"
            onClick={() => setOk(null)}
            aria-label="Đóng"
            className={styles.dong}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* =============================================== LINH VUC */}
      <h2 className={styles.muc}>
        <Layers size={18} />
        Lĩnh vực
      </h2>
      <form onSubmit={themNhom} className={styles.them}>
        <input
          value={tenNhomMoi}
          onChange={(e) => setTenNhomMoi(e.target.value)}
          maxLength={60}
          placeholder="Tên lĩnh vực mới, VD: Luật"
          aria-label="Tên lĩnh vực mới"
          className={styles.o}
        />
        <select
          value={bieuTuongMoi}
          onChange={(e) => setBieuTuongMoi(e.target.value as BieuTuongLinhVuc)}
          aria-label="Biểu tượng"
          className={styles.oChon}
        >
          {DS_BIEU_TUONG.map(([k, v]) => (
            <option key={k} value={k}>
              {v.nhan}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={dangThemNhom || !tenNhomMoi.trim()}
          className={styles.nutChinh}
        >
          {dangThemNhom ? (
            <Loader2 size={15} className={styles.quay} />
          ) : (
            <Plus size={15} />
          )}
          Thêm lĩnh vực
        </button>
      </form>

      {!dangTai && dsNhom.length > 0 && (
        <ul className={styles.ds}>
          {dsNhom.map((n) => {
            const bt = BIEU_TUONG[n.bieuTuong] ?? BIEU_TUONG.sach;
            return (
              <li key={n._id} className={styles.dong1}>
                <span className={styles.bieuTuong} aria-hidden>
                  <bt.Icon size={16} />
                </span>
                {suaNhom === n._id ? (
                  <div className={styles.sua}>
                    <input
                      value={tenNhomSua}
                      onChange={(e) => setTenNhomSua(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") capNhatNhom(n, { ten: tenNhomSua });
                        if (e.key === "Escape") setSuaNhom(null);
                      }}
                      maxLength={60}
                      autoFocus
                      aria-label={`Tên mới cho ${n.ten}`}
                      className={styles.o}
                    />
                    <button
                      type="button"
                      onClick={() => capNhatNhom(n, { ten: tenNhomSua })}
                      className={styles.nutIcon}
                      aria-label="Lưu tên"
                    >
                      <Check size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setSuaNhom(null)}
                      className={styles.nutIcon}
                      aria-label="Hủy"
                    >
                      <X size={15} />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className={styles.ten}>{n.ten}</span>
                    <span className={styles.so}>
                      {n.soMon} môn · {n.soTaiLieu} tài liệu
                    </span>
                    <div className={styles.thaoTac}>
                      <select
                        value={n.bieuTuong}
                        onChange={(e) =>
                          capNhatNhom(n, {
                            bieuTuong: e.target.value as BieuTuongLinhVuc,
                          })
                        }
                        aria-label={`Biểu tượng của ${n.ten}`}
                        className={styles.oChonNho}
                      >
                        {DS_BIEU_TUONG.map(([k, v]) => (
                          <option key={k} value={k}>
                            {v.nhan}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          setSuaNhom(n._id);
                          setTenNhomSua(n.ten);
                        }}
                        className={styles.nutIcon}
                        title="Đổi tên"
                        aria-label={`Đổi tên ${n.ten}`}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => xoaNhom(n)}
                        className={styles.nutXoa}
                        title="Xóa lĩnh vực (môn trong đó giữ nguyên)"
                        aria-label={`Xóa ${n.ten}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {/* =============================================== TRUONG DAI HOC */}
      <h2 className={styles.muc}>
        <GraduationCap size={18} />
        Trường đại học
      </h2>
      <form onSubmit={themTruong} className={styles.them}>
        <input
          value={tenTruongMoi}
          onChange={(e) => setTenTruongMoi(e.target.value)}
          maxLength={120}
          placeholder="Tên trường mới, VD: Trường Đại học Cần Thơ"
          aria-label="Tên trường mới"
          className={styles.o}
        />
        <button type="submit" disabled={!tenTruongMoi.trim()} className={styles.nutChinh}>
          <Plus size={15} />
          Thêm trường
        </button>
      </form>
      {!dangTai && dsTruong.length > 0 && (
        <ul className={styles.ds}>
          {dsTruong.map((t) => (
            <li key={t._id} className={styles.dong1}>
              {suaTruong === t._id ? (
                <div className={styles.sua}>
                  <input
                    value={tenTruongSua}
                    onChange={(e) => setTenTruongSua(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") doiTenTruong(t);
                      if (e.key === "Escape") setSuaTruong(null);
                    }}
                    maxLength={120}
                    autoFocus
                    aria-label={`Tên mới cho ${t.ten}`}
                    className={styles.o}
                  />
                  <input
                    value={logoSua}
                    onChange={(e) => setLogoSua(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") doiTenTruong(t);
                      if (e.key === "Escape") setSuaTruong(null);
                    }}
                    maxLength={300}
                    placeholder="Logo: /images/institution/ten-file.png"
                    aria-label={`Logo của ${t.ten}`}
                    className={styles.o}
                  />
                  <button
                    type="button"
                    onClick={() => doiTenTruong(t)}
                    className={styles.nutIcon}
                    aria-label="Lưu tên"
                  >
                    <Check size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSuaTruong(null)}
                    className={styles.nutIcon}
                    aria-label="Hủy"
                  >
                    <X size={15} />
                  </button>
                </div>
              ) : (
                <>
                  <span className={styles.ten}>
                    {t.ten}
                    {t.logo && <span className={styles.coLogo}>có logo</span>}
                  </span>
                  <span className={styles.so}>{t.soTaiLieu} tài liệu</span>
                  <div className={styles.thaoTac}>
                    <button
                      type="button"
                      onClick={() => {
                        setSuaTruong(t._id);
                        setTenTruongSua(t.ten);
                        setLogoSua(t.logo ?? "");
                      }}
                      className={styles.nutIcon}
                      title="Đổi tên / logo"
                      aria-label={`Đổi tên ${t.ten}`}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => xoaTruong(t)}
                      className={styles.nutXoa}
                      title="Xóa trường (tài liệu giữ nguyên)"
                      aria-label={`Xóa ${t.ten}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* =============================================== MON HOC */}
      <h2 className={styles.muc}>
        <BookOpen size={18} />
        Môn học
      </h2>
      <form onSubmit={them} className={styles.them}>
        <input
          value={tenMoi}
          onChange={(e) => setTenMoi(e.target.value)}
          maxLength={80}
          placeholder="Tên môn mới, VD: Cấu trúc dữ liệu và giải thuật"
          aria-label="Tên môn học mới"
          className={styles.o}
        />
        <button
          type="submit"
          disabled={dangThem || !tenMoi.trim()}
          className={styles.nutChinh}
        >
          {dangThem ? <Loader2 size={15} className={styles.quay} /> : <Plus size={15} />}
          Thêm môn
        </button>
      </form>

      {dangTai ? (
        <div className={styles.trong}>
          <Loader2 size={20} className={styles.quay} />
          Đang tải…
        </div>
      ) : ds.length === 0 ? (
        <div className={styles.trong}>
          <BookOpen size={22} />
          Chưa có môn nào. Thêm môn đầu tiên ở ô phía trên — khi chưa có môn nào, người
          dùng không đăng được tài liệu.
        </div>
      ) : (
        <ul className={styles.ds}>
          {ds.map((m) => (
            <li key={m._id} className={styles.dong1}>
              {dangSua === m._id ? (
                <div className={styles.sua}>
                  <input
                    value={tenSua}
                    onChange={(e) => setTenSua(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") luuTen(m);
                      if (e.key === "Escape") setDangSua(null);
                    }}
                    maxLength={80}
                    autoFocus
                    aria-label={`Tên mới cho ${m.ten}`}
                    className={styles.o}
                  />
                  <button
                    type="button"
                    onClick={() => luuTen(m)}
                    disabled={dangLuu}
                    className={styles.nutIcon}
                    aria-label="Lưu tên"
                  >
                    {dangLuu ? (
                      <Loader2 size={15} className={styles.quay} />
                    ) : (
                      <Check size={15} />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDangSua(null)}
                    className={styles.nutIcon}
                    aria-label="Hủy"
                  >
                    <X size={15} />
                  </button>
                </div>
              ) : (
                <>
                  <span className={styles.ten}>{m.ten}</span>
                  <span className={styles.so}>{m.soTaiLieu} tài liệu</span>
                  <div className={styles.thaoTac}>
                    {/* Xep mon vao linh vuc - luu ngay khi chon. */}
                    <select
                      value={m.nhom ?? ""}
                      onChange={(e) => xepMon(m, e.target.value)}
                      aria-label={`Lĩnh vực của ${m.ten}`}
                      className={`${styles.oChonNho} ${m.nhom ? "" : styles.chuaXep}`}
                    >
                      <option value="">— Chưa có lĩnh vực —</option>
                      {dsNhom.map((n) => (
                        <option key={n._id} value={n._id}>
                          {n.ten}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => {
                        setDangSua(m._id);
                        setTenSua(m.ten);
                      }}
                      className={styles.nutIcon}
                      title="Đổi tên"
                      aria-label={`Đổi tên ${m.ten}`}
                    >
                      <Pencil size={15} />
                    </button>
                    {/* Mon con tai lieu thi khong xoa duoc - may chu cung chan
                        (409). Tat nut ngay tu dau va noi ly do ngay tren nut. */}
                    <button
                      type="button"
                      onClick={() => xoa(m)}
                      disabled={m.soTaiLieu > 0 || dangXoa === m._id}
                      className={styles.nutXoa}
                      title={
                        m.soTaiLieu > 0
                          ? "Còn tài liệu dùng môn này — chuyển chúng sang môn khác trước"
                          : "Xóa môn"
                      }
                      aria-label={`Xóa ${m.ten}`}
                    >
                      {dangXoa === m._id ? (
                        <Loader2 size={15} className={styles.quay} />
                      ) : (
                        <Trash2 size={15} />
                      )}
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
