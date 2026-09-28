"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Folder, Home, Landmark, Search, Upload } from "lucide-react";

import type { ChiTietTruong, DocumentUniversity } from "@/src/services/document";
import { BIEU_TUONG } from "./DocumentCategories";
import {
  DUONG_TRANG_CHU,
  DUONG_TRUONG,
  duongDanhMucTruong,
  duongTatCa,
  duongTruong,
} from "./duongDan";
import CacHangTaiLieu from "./CacHangTaiLieu";
import { boDau, tenChinhTruong } from "./tenTruong";

import styles from "./InstitutionDetail.module.scss";

// Tab "Pho bien" hien bay nhieu mon nhieu tai lieu nhat.
const SO_PHO_BIEN = 30;
const PHO_BIEN = "phoBien";

/**
 * Chu cai dau cua ten MON (khong bo tien to nhu ten truong - "Trường điện từ"
 * la ten mon). "Đ" rieng mot chu; so gom vao "0-9"; chu co dau quy ve chu goc.
 */
function chuDauMon(ten: string): string {
  const c = ten.trim().charAt(0).toUpperCase();
  if (c === "Đ") return "Đ";
  if (/[0-9]/.test(c)) return "0-9";
  return c.normalize("NFD").replace(/[̀-ͯ]/g, "") || "#";
}

/** Logo truong neu co, khong thi bieu tuong toa nha. */
function LogoTruong({ t, lon = false }: { t: DocumentUniversity; lon?: boolean }) {
  if (t.logo) {
    return (
      <span
        className={`${styles.logo} ${lon ? styles.logoLon : ""}`}
        style={{ backgroundImage: `url("${t.logo}")` }}
        aria-hidden
      />
    );
  }
  return (
    <Landmark
      size={lon ? 30 : 18}
      className={lon ? styles.bieuTuongLon : styles.bieuTuong}
      aria-hidden
    />
  );
}

/**
 * Trang mot truong (/share-document/institution/<khoa>):
 *   dai dau (ten truong + o tim mon trong truong), duong dan,
 *   mon hoc cua truong tra theo chu cai (bam vao = tai lieu mon do cua truong),
 *   goi y / noi bat / xem gan day / moi dang cua truong, truong khac.
 */
export default function InstitutionDetail({
  truong,
  monHoc,
  linhVuc = [],
  truongKhac,
}: ChiTietTruong) {
  const router = useRouter();
  const [tuKhoa, setTuKhoa] = useState("");
  const [tab, setTab] = useState(PHO_BIEN);

  // Nhom mon theo chu cai dau, xep theo tieng Viet.
  const theoChu = useMemo(() => {
    const m = new Map<string, typeof monHoc>();
    for (const mon of monHoc) {
      const c = chuDauMon(mon.ten);
      if (!m.has(c)) m.set(c, []);
      m.get(c)!.push(mon);
    }
    for (const ds of m.values()) ds.sort((a, b) => a.ten.localeCompare(b.ten, "vi"));
    return m;
  }, [monHoc]);
  // "0-9" xep cuoi nhu ban mau tham chieu.
  const cacChu = [...theoChu.keys()].sort((a, b) =>
    a === "0-9" ? 1 : b === "0-9" ? -1 : a.localeCompare(b, "vi"),
  );

  const q = boDau(tuKhoa.trim());
  const dangTim = q.length > 0;
  const hien = dangTim
    ? monHoc.filter((m) => boDau(m.ten).includes(q))
    : tab === PHO_BIEN
      ? monHoc.slice(0, SO_PHO_BIEN)
      : (theoChu.get(tab) ?? []);

  // _id linh vuc -> khoa, de dua link mon vao trang linh vuc cua truong.
  const khoaNhom = new Map(linhVuc.map((n) => [n._id, n.key]));
  const duongMon = (m: (typeof monHoc)[number]) => {
    const nhom = m.nhom ? khoaNhom.get(m.nhom) : undefined;
    return nhom
      ? duongDanhMucTruong(truong.key, nhom, { mon: m.key })
      : duongTatCa({ truong: truong.key, mon: m.key });
  };

  const khiTim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dangTim) return;
    // Trung dung mot mon thi vao thang mon do; khong thi tim chu trong tai lieu
    // cua truong - nguoi dung co the dang go ten tai lieu chu khong phai ten mon.
    router.push(
      hien.length === 1
        ? duongMon(hien[0])
        : duongTatCa({ truong: truong.key, q: tuKhoa }),
    );
  };

  return (
    <>
      <section className={styles.dau}>
        {/* Hinh trang tri - cac dom mau cua khu tai lieu. */}
        <span className={`${styles.dom} ${styles.dom1}`} aria-hidden />
        <span className={`${styles.dom} ${styles.dom2}`} aria-hidden />
        <span className={`${styles.dom} ${styles.dom3}`} aria-hidden />
        <span className={`${styles.dom} ${styles.dom4}`} aria-hidden />
        <span className={`${styles.dom} ${styles.dom5}`} aria-hidden />
        <span className={`${styles.dom} ${styles.dom6}`} aria-hidden />

        <div className={styles.dauNoiDung}>
          <span className={styles.oLogo}>
            <LogoTruong t={truong} lon />
          </span>
          <h1 className={styles.tieuDe}>{truong.ten}</h1>
          <p className={styles.soLieu}>
            <strong>{truong.soTaiLieu}</strong> tài liệu &middot;{" "}
            <strong>{monHoc.length}</strong> môn học
          </p>

          <form role="search" onSubmit={khiTim} className={styles.oTim}>
            <Search size={18} className={styles.iconTim} aria-hidden />
            <input
              type="search"
              aria-label="Tìm môn học trong trường này"
              placeholder="Tìm môn học trong trường này…"
              autoComplete="off"
              value={tuKhoa}
              onChange={(e) => setTuKhoa(e.target.value)}
              className={styles.nhap}
            />
          </form>
        </div>
      </section>

      <div className={styles.nen}>
        <div className={styles.than}>
          <nav aria-label="Đường dẫn" className={styles.duongDan}>
            <Link href={DUONG_TRANG_CHU} aria-label="Chia sẻ tài liệu">
              <Home size={15} />
            </Link>
            <ChevronRight size={14} aria-hidden />
            <Link href={DUONG_TRUONG}>Trường đại học</Link>
            <ChevronRight size={14} aria-hidden />
            <span aria-current="page" className={styles.duongDanHienTai}>
              {truong.ten}
            </span>
          </nav>

          {/* ================================================ danh muc (linh vuc) */}
          {linhVuc.length > 0 && (
            <section aria-labelledby="danh-muc-truong" className={styles.muc}>
              <h2 id="danh-muc-truong" className={styles.tieuDeMuc}>
                Danh mục môn học
              </h2>
              <ul className={styles.luoiDanhMuc}>
                {linhVuc.map((n) => {
                  const bt = BIEU_TUONG[n.bieuTuong] ?? BIEU_TUONG.sach;
                  return (
                    <li key={n._id}>
                      <Link
                        href={duongDanhMucTruong(truong.key, n.key)}
                        className={styles.danhMuc}
                      >
                        <span
                          className={`${styles.oBieuTuong} ${styles[bt.mau]}`}
                          aria-hidden
                        >
                          <bt.Icon size={22} />
                        </span>
                        <span className={styles.chuDanhMuc}>
                          <span className={styles.tenDanhMuc}>{n.ten}</span>
                          <span className={styles.phuDanhMuc}>
                            {n.soMon} môn · {n.soTaiLieu} tài liệu
                          </span>
                        </span>
                        <ChevronRight size={18} className={styles.muiTen} aria-hidden />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {/* ================================================ mon hoc */}
          <section aria-labelledby="mon-cua-truong" className={styles.muc}>
            <div className={styles.hangTieuDe}>
              <h2 id="mon-cua-truong" className={styles.tieuDeMuc}>
                Môn học ({monHoc.length})
              </h2>
              {truong.soTaiLieu > 0 && (
                <Link href={duongTatCa({ truong: truong.key })} className={styles.xemHet}>
                  Xem tất cả tài liệu của trường
                  <ChevronRight size={16} aria-hidden />
                </Link>
              )}
            </div>

            {monHoc.length === 0 ? (
              <div className={styles.trong}>
                <span className={styles.trongHinh} aria-hidden />
                <p className={styles.trongTieuDe}>Chưa có tài liệu nào của trường này</p>
                <p>
                  Bạn học ở {truong.ten}? Hãy là người đầu tiên chia sẻ đề cương, đề thi
                  hoặc bài giải cho các bạn cùng trường.
                </p>
                <Link
                  href={duongTatCa({ truong: truong.key, dang: true })}
                  className={styles.nutDang}
                >
                  <Upload size={16} aria-hidden />
                  Chia sẻ tài liệu đầu tiên
                </Link>
              </div>
            ) : (
              <>
                {!dangTim && (
                  <div
                    className={styles.chuCai}
                    role="group"
                    aria-label="Lọc môn theo chữ cái đầu"
                  >
                    {[PHO_BIEN, ...cacChu].map((c) => (
                      <button
                        key={c}
                        type="button"
                        aria-pressed={tab === c}
                        onClick={() => setTab(c)}
                        className={`${styles.chu} ${tab === c ? styles.chuOn : ""}`}
                      >
                        {c === PHO_BIEN ? "Phổ biến" : c}
                      </button>
                    ))}
                  </div>
                )}
                {dangTim && (
                  <p className={styles.ketQuaTim} role="status">
                    {hien.length
                      ? `${hien.length} môn khớp "${tuKhoa.trim()}"`
                      : `Không có môn nào khớp "${tuKhoa.trim()}" - nhấn Enter để tìm trong tài liệu của trường.`}
                  </p>
                )}

                <ul className={styles.dsMon}>
                  {hien.map((m) => (
                    <li key={m.key}>
                      <Link href={duongMon(m)} className={styles.mon}>
                        <Folder size={22} className={styles.iconMon} aria-hidden />
                        <span className={styles.chuMon}>
                          <span className={styles.tenMon}>{m.ten}</span>
                          <span className={styles.phuMon}>
                            {m.soTaiLieu ? `${m.soTaiLieu} tài liệu` : "Chưa có tài liệu"}
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>

          {/* ================================================ cac hang: goi y, noi bat, xem gan day, moi dang */}
          <CacHangTaiLieu
            loc={{ truong: truong.key }}
            tenPhamVi={tenChinhTruong(truong.ten)}
          />

          {/* ================================================ truong khac */}
          {truongKhac.length > 0 && (
            <section aria-labelledby="truong-khac" className={styles.muc}>
              <div className={styles.hangTieuDe}>
                <h2 id="truong-khac" className={styles.tieuDeMuc}>
                  Trường khác
                </h2>
                <Link href={DUONG_TRUONG} className={styles.xemHet}>
                  Tất cả trường
                  <ChevronRight size={16} aria-hidden />
                </Link>
              </div>
              <ul className={styles.dsTruong}>
                {truongKhac.map((t) => (
                  <li key={t._id}>
                    <Link href={duongTruong(t.key)} className={styles.truong}>
                      <LogoTruong t={t} />
                      <span className={styles.tenTruong}>{t.ten}</span>
                      {t.soTaiLieu > 0 && (
                        <span className={styles.soTruong}>{t.soTaiLieu} tài liệu</span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
