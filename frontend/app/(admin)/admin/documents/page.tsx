"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Check,
  CheckCircle,
  Download,
  Eye,
  EyeOff,
  ExternalLink,
  FileText,
  Loader2,
  Pencil,
  Search,
  Trash2,
  X,
} from "lucide-react";

import { getErrorMessage } from "@/src/services/apiHelper";
import SubjectPicker from "@/src/components/document/SubjectPicker";
import {
  doiKichThuoc,
  khoaTuTenMon,
  nhanDinhDang,
  tongDungLuong,
} from "@/src/components/document/fileInfo";
import {
  documentService,
  type DocumentSubject,
  type SharedDocument,
} from "@/src/services/document";

import styles from "./page.module.scss";
import { duongTaiLieu } from "@/src/components/document/duongDan";

/**
 * Quan ly toan bo tai lieu do nguoi dung chia se.
 *
 * Quyen xoa da co san o may chu: deleteDocument cho qua khi la chu bai HOAC
 * role === 'admin'. Trang nay khong tu cap them quyen gi, chi bay ra cho admin
 * mot cho nhin duoc ca kho thay vi phai di tung trang chi tiet.
 */

const MOI_TRANG = 20;

export default function AdminDocumentsPage() {
  const [danhSach, setDanhSach] = useState<SharedDocument[]>([]);
  const [tong, setTong] = useState(0);
  const [trang, setTrang] = useState(1);
  const [tongTrang, setTongTrang] = useState(1);

  const [dangTai, setDangTai] = useState(true);
  const [loi, setLoi] = useState<string | null>(null);
  const [baoThanhCong, setBaoThanhCong] = useState<string | null>(null);

  // O tim: giu rieng voi tu khoa DANG AP DUNG. Goi API theo tung phim go thi
  // moi chu la mot luot goi; o day phai bam Tim (hoac Enter) moi goi.
  const [oTim, setOTim] = useState("");
  const [tuKhoa, setTuKhoa] = useState("");

  const [dangXoa, setDangXoa] = useState<string | null>(null);
  const [hoiXoa, setHoiXoa] = useState<SharedDocument | null>(null);

  // Sua mon hoc ngay tren bang. Can cho tai lieu dang TRUOC khi co truong mon:
  // chung khong co mon nao nen khong bao gio duoc goi y "cung mon".
  // giaTriMon la mang KHOA mon (chon trong danh sach), khong phai chu go tu do.
  const [dsMon, setDsMon] = useState<DocumentSubject[]>([]);
  const [dangSuaMon, setDangSuaMon] = useState<string | null>(null);
  const [giaTriMon, setGiaTriMon] = useState<string[]>([]);
  const [dangLuuMon, setDangLuuMon] = useState(false);
  const [dangDoiAn, setDangDoiAn] = useState<string | null>(null);

  const batDauSuaMon = (d: SharedDocument) => {
    setDangSuaMon(d._id);
    // Tai lieu luu TEN mon chuan lay tu danh sach, nen so khop ten la ra khoa.
    setGiaTriMon(khoaTuTenMon(dsMon, d.monHoc));
  };

  const luuMon = async (d: SharedDocument) => {
    if (!giaTriMon.length) return setLoi("Chọn ít nhất một môn trong danh sách.");
    try {
      setDangLuuMon(true);
      setLoi(null);
      const { monHoc } = await documentService.updateDocument(d._id, {
        monHoc: giaTriMon,
      });
      // Cap nhat tai cho thay vi tai lai ca bang: giu nguyen vi tri cuon va
      // khong nhap nhay trong khi admin dang gan mon cho nhieu dong lien tiep.
      setDanhSach((ds) => ds.map((x) => (x._id === d._id ? { ...x, monHoc } : x)));
      setDangSuaMon(null);
      setBaoThanhCong(`Đã gán môn "${(monHoc ?? []).join(", ")}" cho "${d.title}".`);
    } catch (err) {
      setLoi(getErrorMessage(err, "Không lưu được môn học."));
    } finally {
      setDangLuuMon(false);
    }
  };

  const doiAn = async (d: SharedDocument) => {
    try {
      setDangDoiAn(d._id);
      setLoi(null);
      const { daAn } = await documentService.setHidden(d._id, !d.daAn);
      setDanhSach((ds) => ds.map((x) => (x._id === d._id ? { ...x, daAn } : x)));
      setBaoThanhCong(
        daAn
          ? `Đã ẩn "${d.title}". Người dùng không còn thấy tài liệu này.`
          : `Đã hiện lại "${d.title}".`,
      );
    } catch (err) {
      setLoi(getErrorMessage(err, "Không đổi được trạng thái tài liệu."));
    } finally {
      setDangDoiAn(null);
    }
  };

  const taiDsMon = useCallback(async () => {
    try {
      setDsMon(await documentService.getSubjects());
    } catch {
      // Thieu danh sach thi chi khong gan mon duoc - bang van dung.
    }
  }, []);

  useEffect(() => {
    // Hoan mot vong microtask - xem ghi chu o effect tai danh sach ben duoi.
    void Promise.resolve().then(taiDsMon);
  }, [taiDsMon]);

  const tai = useCallback(async () => {
    try {
      setDangTai(true);
      setLoi(null);
      // Duong QUAN TRI: gom ca tai lieu da an. Duong cong khai khong bao gio
      // tra chung - an roi thi admin phai co cho de hien lai.
      const res = await documentService.getDocumentsAdmin({
        page: trang,
        limit: MOI_TRANG,
        q: tuKhoa,
      });
      setDanhSach(res.documents ?? []);
      setTong(res.total ?? 0);
      setTongTrang(res.totalPages || 1);
    } catch (err) {
      setLoi(getErrorMessage(err, "Không tải được danh sách tài liệu."));
    } finally {
      setDangTai(false);
    }
  }, [trang, tuKhoa]);

  useEffect(() => {
    // Goi qua mot vong microtask thay vi goi thang - cung cach da dung o
    // app/(admin)/admin/faqs/page.tsx. Ham tai() bat dau bang setDangTai(true),
    // nen goi thang la setState dong bo ngay trong than effect: React phai
    // chay them mot vong ve lai truoc khi hien man hinh (rule
    // react-hooks/set-state-in-effect canh bao dung cho nay). Hoan mot vong
    // microtask thi mat thuong khong thay khac, ma vong ve thua het.
    void Promise.resolve().then(tai);
  }, [tai]);

  const xacNhanXoa = async () => {
    if (!hoiXoa) return;
    try {
      setDangXoa(hoiXoa._id);
      await documentService.deleteDocument(hoiXoa._id);
      setBaoThanhCong(`Đã xóa "${hoiXoa.title}".`);
      setHoiXoa(null);

      // Xoa muc cuoi cung cua mot trang thi trang do thanh rong. Lui mot trang
      // thay vi de admin nhin mot bang trong roi tuong mat het du lieu.
      if (danhSach.length === 1 && trang > 1) setTrang((t) => t - 1);
      else await tai();
    } catch (err) {
      setLoi(getErrorMessage(err, "Không xóa được tài liệu."));
      setHoiXoa(null);
    } finally {
      setDangXoa(null);
    }
  };

  const timKiem = (e: React.FormEvent) => {
    e.preventDefault();
    setTrang(1); // ket qua moi thi phai ve trang 1, khong giu so trang cu
    setTuKhoa(oTim);
  };

  const tongLuotTai = danhSach.reduce((s, d) => s + (d.downloadCount || 0), 0);
  const soChuaCoMon = danhSach.filter((d) => !d.monHoc?.length).length;

  return (
    <div className={styles.page}>
      <header className={styles.top}>
        <div>
          <h1 className={styles.title}>Tài liệu chia sẻ</h1>
          <p className={styles.sub}>
            Toàn bộ tài liệu do người dùng đăng lên kho chia sẻ.
          </p>
        </div>
        <div className={styles.stats}>
          <span className={styles.stat}>
            <FileText size={15} />
            {tong} tài liệu
          </span>
          {/* Noi ro "trang nay": con so chi cong tu 20 dong dang hien, khong
              phai tong ca kho. Ghi tron "luot tai" la mot con so sai. */}
          <span className={styles.stat}>
            <Download size={15} />
            {tongLuotTai} lượt tải (trang này)
          </span>
          {/* Chi hien khi co: day la viec admin can lam, khong phai so lieu. */}
          {soChuaCoMon > 0 && (
            <span className={`${styles.stat} ${styles.statCanh}`}>
              <AlertCircle size={15} />
              {soChuaCoMon} chưa có môn (trang này)
            </span>
          )}
        </div>
      </header>

      <form onSubmit={timKiem} className={styles.timKhung}>
        <Search size={16} className={styles.timIcon} />
        <input
          value={oTim}
          onChange={(e) => setOTim(e.target.value)}
          placeholder="Tìm theo tiêu đề hoặc nội dung…"
          className={styles.timInput}
        />
        {tuKhoa && (
          <button
            type="button"
            onClick={() => {
              setOTim("");
              setTuKhoa("");
              setTrang(1);
            }}
            className={styles.timXoa}
            aria-label="Xóa tìm kiếm"
          >
            <X size={15} />
          </button>
        )}
        <button type="submit" className={styles.timNut}>
          Tìm
        </button>
      </form>

      {loi && (
        <div className={styles.bangLoi}>
          <AlertCircle size={16} />
          {loi}
        </div>
      )}
      {baoThanhCong && (
        <div className={styles.bangOk}>
          <CheckCircle size={16} />
          {baoThanhCong}
          <button
            type="button"
            onClick={() => setBaoThanhCong(null)}
            aria-label="Đóng"
            className={styles.dong}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {dangTai ? (
        <div className={styles.trong}>
          <Loader2 size={22} className={styles.quay} />
          Đang tải…
        </div>
      ) : danhSach.length === 0 ? (
        <div className={styles.trong}>
          <FileText size={22} />
          {tuKhoa ? `Không có tài liệu nào khớp "${tuKhoa}".` : "Chưa có tài liệu nào."}
        </div>
      ) : (
        <div className={styles.bangBoc}>
          <table className={styles.bang}>
            <thead>
              <tr>
                <th>Tài liệu</th>
                <th>Môn học</th>
                <th>Người đăng</th>
                <th>Ngày đăng</th>
                <th className={styles.phai}>Lượt tải</th>
                <th className={styles.phai}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {danhSach.map((d) => (
                <tr key={d._id} className={d.daAn ? styles.dongAn : undefined}>
                  <td>
                    {/* Tai lieu da an: trang chi tiet tra 404 voi moi nguoi, ke
                        ca admin (trang do dung san o may chu, khong mang cookie
                        admin) - nen khong de duong dan toi mot trang loi. Admin
                        van mo duoc FILE bang nut ben phai. */}
                    {d.daAn ? (
                      <span className={styles.tenTaiLieu}>{d.title}</span>
                    ) : (
                      <Link
                        href={duongTaiLieu(d._id)}
                        target="_blank"
                        className={styles.tenTaiLieu}
                      >
                        {d.title}
                      </Link>
                    )}
                    <span className={styles.meta}>
                      {d.daAn && <span className={styles.nhanAn}>Đã ẩn</span>}
                      {nhanDinhDang(d.files)} &middot;{" "}
                      {doiKichThuoc(tongDungLuong(d.files))}
                    </span>
                  </td>
                  <td>
                    {dangSuaMon === d._id ? (
                      <div className={styles.suaMonNhieu}>
                        <SubjectPicker
                          dsMon={dsMon}
                          chon={giaTriMon}
                          doiChon={setGiaTriMon}
                        />
                        <div className={styles.suaMon}>
                          <button
                            type="button"
                            onClick={() => luuMon(d)}
                            disabled={dangLuuMon}
                            className={styles.nutLuu}
                            aria-label="Lưu môn học"
                          >
                            {dangLuuMon ? (
                              <Loader2 size={14} className={styles.quay} />
                            ) : (
                              <Check size={14} />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => setDangSuaMon(null)}
                            className={styles.nutPhu}
                            aria-label="Hủy sửa môn học"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => batDauSuaMon(d)}
                        className={d.monHoc?.length ? styles.mon : styles.monTrong}
                        title="Bấm để sửa môn học"
                      >
                        {d.monHoc?.length ? d.monHoc.join(", ") : "Chưa có môn"}
                        <Pencil size={12} />
                      </button>
                    )}
                  </td>
                  <td>{d.uploader?.name || "Người dùng đã xóa"}</td>
                  <td>{new Date(d.createdAt).toLocaleDateString("vi-VN")}</td>
                  <td className={styles.phai}>{d.downloadCount}</td>
                  <td className={styles.phai}>
                    <div className={styles.thaoTac}>
                      {/* Mo file that, khong phai trang chi tiet: admin can xem
                          NOI DUNG de quyet dinh go hay giu. */}
                      <a
                        href={`/api/documents/${d._id}/file`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.nutPhu}
                        title="Mở file"
                        aria-label={`Mở file ${d.title}`}
                      >
                        <ExternalLink size={15} />
                      </a>
                      {/* An truoc, xoa sau: an la go khoi mat nguoi dung ma
                          van lay lai duoc, xoa thi mat han ca file. */}
                      <button
                        type="button"
                        onClick={() => doiAn(d)}
                        disabled={dangDoiAn === d._id}
                        className={styles.nutPhu}
                        title={d.daAn ? "Hiện lại tài liệu" : "Ẩn tài liệu"}
                        aria-label={`${d.daAn ? "Hiện lại" : "Ẩn"} ${d.title}`}
                      >
                        {dangDoiAn === d._id ? (
                          <Loader2 size={15} className={styles.quay} />
                        ) : d.daAn ? (
                          <Eye size={15} />
                        ) : (
                          <EyeOff size={15} />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setHoiXoa(d)}
                        disabled={dangXoa === d._id}
                        className={styles.nutXoa}
                        title="Xóa tài liệu"
                        aria-label={`Xóa ${d.title}`}
                      >
                        {dangXoa === d._id ? (
                          <Loader2 size={15} className={styles.quay} />
                        ) : (
                          <Trash2 size={15} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tongTrang > 1 && (
        <div className={styles.phanTrang}>
          <button
            type="button"
            onClick={() => setTrang((t) => Math.max(1, t - 1))}
            disabled={trang <= 1}
            className={styles.nutTrang}
          >
            Trước
          </button>
          <span className={styles.soTrang}>
            Trang {trang}/{tongTrang}
          </span>
          <button
            type="button"
            onClick={() => setTrang((t) => Math.min(tongTrang, t + 1))}
            disabled={trang >= tongTrang}
            className={styles.nutTrang}
          >
            Sau
          </button>
        </div>
      )}

      {/* Hoi lai truoc khi xoa. Xoa tai lieu la KHONG LAY LAI DUOC: ban ghi mat
          va file tren Cloudinary cung bi go (xem deleteDocument). */}
      {hoiXoa && (
        <div
          className={styles.lopPhu}
          role="dialog"
          aria-modal="true"
          aria-labelledby="tieu-de-xoa"
        >
          <div className={styles.hopThoai}>
            <h2 id="tieu-de-xoa" className={styles.hopTieuDe}>
              Xóa tài liệu này?
            </h2>
            <p className={styles.hopChu}>
              <strong>{hoiXoa.title}</strong> sẽ bị xóa khỏi kho, kèm cả file trên máy chủ
              lưu trữ. Không khôi phục lại được.
            </p>
            <div className={styles.hopNut}>
              <button
                type="button"
                onClick={() => setHoiXoa(null)}
                className={styles.nutHuy}
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={xacNhanXoa}
                disabled={dangXoa !== null}
                className={styles.nutXacNhan}
              >
                {dangXoa ? "Đang xóa…" : "Xóa"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
