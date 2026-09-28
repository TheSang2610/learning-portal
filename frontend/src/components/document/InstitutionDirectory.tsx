"use client";

import { useId, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Landmark, Search } from "lucide-react";

import type { DocumentUniversity } from "@/src/services/document";
import { duongTruong } from "./duongDan";
import { boDau, chuCaiDau, tenChinhTruong } from "./tenTruong";

import styles from "./InstitutionDirectory.module.scss";

const SO_PHO_BIEN = 36;
const SO_GOI_Y = 8;

/** Logo truong neu co, khong thi bieu tuong toa nha. */
function LogoTruong({ t }: { t: DocumentUniversity }) {
  if (t.logo) {
    // background-image thay vi <img>: logo chi de trang tri canh ten truong
    // (ten da la chu doc duoc), va khong di qua bo toi uu anh cua Next.
    return (
      <span
        className={styles.logo}
        style={{ backgroundImage: `url("${t.logo}")` }}
        aria-hidden
      />
    );
  }
  return <Landmark size={18} className={styles.bieuTuong} aria-hidden />;
}

function DongTruong({ t }: { t: DocumentUniversity }) {
  return (
    <li>
      <Link href={duongTruong(t.key)} className={styles.dong}>
        <LogoTruong t={t} />
        <span className={styles.tenTruong}>{t.ten}</span>
        {t.soTaiLieu > 0 && <span className={styles.so}>{t.soTaiLieu} tài liệu</span>}
      </Link>
    </li>
  );
}

/**
 * Trang danh sach truong (/share-document/institution): o tim truong co goi y,
 * "truong pho bien nhat" (nhieu tai lieu nhat truoc), va tra theo chu cai dau
 * cua TEN CHINH (bo "Truong Dai hoc", "Hoc vien"...).
 */
export default function InstitutionDirectory({
  dsTruong,
}: {
  dsTruong: DocumentUniversity[];
}) {
  const router = useRouter();
  const idDs = useId();
  const [tuKhoa, setTuKhoa] = useState("");
  const [moGoiY, setMoGoiY] = useState(false);
  const [dangTro, setDangTro] = useState(-1);
  const [chuDangChon, setChuDangChon] = useState<string | null>(null);

  // Nhieu tai lieu nhat truoc; bang nhau thi theo thu tu admin dat.
  const phoBien = useMemo(
    () =>
      [...dsTruong]
        .sort((a, b) => b.soTaiLieu - a.soTaiLieu || a.thuTu - b.thuTu)
        .slice(0, SO_PHO_BIEN),
    [dsTruong],
  );

  // Nhom theo chu cai dau, xep chu va ten theo tieng Viet.
  const theoChu = useMemo(() => {
    const m = new Map<string, DocumentUniversity[]>();
    for (const t of dsTruong) {
      const c = chuCaiDau(t.ten);
      if (!m.has(c)) m.set(c, []);
      m.get(c)!.push(t);
    }
    for (const ds of m.values()) {
      ds.sort((a, b) => tenChinhTruong(a.ten).localeCompare(tenChinhTruong(b.ten), "vi"));
    }
    return m;
  }, [dsTruong]);
  const cacChu = [...theoChu.keys()].sort((a, b) => a.localeCompare(b, "vi"));

  const goiY = useMemo(() => {
    const q = boDau(tuKhoa.trim());
    if (!q) return [];
    return dsTruong.filter((t) => boDau(t.ten).includes(q)).slice(0, SO_GOI_Y);
  }, [tuKhoa, dsTruong]);

  const denTruong = (t: DocumentUniversity) => router.push(duongTruong(t.key));

  const khiGoPhim = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!goiY.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setMoGoiY(true);
      setDangTro((i) => (i + 1) % goiY.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setDangTro((i) => (i <= 0 ? goiY.length - 1 : i - 1));
    } else if (e.key === "Escape") {
      setMoGoiY(false);
    }
  };

  const khiTim = (e: React.FormEvent) => {
    e.preventDefault();
    // Enter: truong dang tro, khong thi goi y dau tien.
    const chon = goiY[dangTro] ?? goiY[0];
    if (chon) denTruong(chon);
  };

  const hienGoiY = moGoiY && tuKhoa.trim().length > 0;

  return (
    <>
      <section className={styles.dau}>
        <div className={styles.dauNoiDung}>
          <span className={styles.minhHoa} aria-hidden />
          <h1 className={styles.tieuDe}>Bạn đang học ở trường nào?</h1>
          <p className={styles.giaiThich}>Tìm trường của bạn để xem tài liệu học tập</p>

          <form role="search" onSubmit={khiTim} className={styles.oTim}>
            <input
              type="search"
              role="combobox"
              aria-label="Tìm trường đại học"
              aria-autocomplete="list"
              aria-expanded={hienGoiY}
              aria-controls={idDs}
              aria-activedescendant={dangTro >= 0 ? `${idDs}-${dangTro}` : undefined}
              autoComplete="off"
              placeholder="Gõ tên trường để tìm…"
              value={tuKhoa}
              onChange={(e) => {
                setTuKhoa(e.target.value);
                setMoGoiY(true);
                setDangTro(-1);
              }}
              onFocus={() => setMoGoiY(true)}
              // Tre mot nhip: bam vao goi y can click chay truoc khi danh sach an.
              onBlur={() => setTimeout(() => setMoGoiY(false), 150)}
              onKeyDown={khiGoPhim}
              className={styles.nhap}
            />
            <button type="submit" aria-label="Tìm" className={styles.nutTim}>
              <Search size={18} />
            </button>

            {hienGoiY && (
              <div
                id={idDs}
                role="listbox"
                aria-label="Trường đại học"
                className={styles.goiY}
              >
                {goiY.length === 0 ? (
                  <p role="alert" className={styles.khongCo}>
                    Không tìm thấy trường nào
                  </p>
                ) : (
                  goiY.map((t, i) => (
                    <button
                      key={t._id}
                      id={`${idDs}-${i}`}
                      type="button"
                      role="option"
                      aria-selected={i === dangTro}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => denTruong(t)}
                      className={`${styles.goiYMuc} ${i === dangTro ? styles.goiYDangTro : ""}`}
                    >
                      <LogoTruong t={t} />
                      <span>{t.ten}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </form>
        </div>
      </section>

      {/* Nen trang tran ngang - layout chung cua khu portal la xam nhat. */}
      <div className={styles.nen}>
        <div className={styles.than}>
          <section aria-labelledby="truong-pho-bien">
            <h2 id="truong-pho-bien" className={styles.tieuDeMuc}>
              Trường đại học phổ biến nhất
            </h2>
            <ul className={styles.luoi}>
              {phoBien.map((t) => (
                <DongTruong key={t._id} t={t} />
              ))}
            </ul>
          </section>

          <section aria-labelledby="truong-theo-chu" className={styles.mucChu}>
            <h2 id="truong-theo-chu" className={styles.tieuDeMuc}>
              Tài liệu theo tất cả các trường
            </h2>
            <p className={styles.phu}>Tìm trường theo chữ cái đầu</p>
            <div className={styles.chuCai} role="group" aria-label="Chữ cái đầu">
              {cacChu.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-pressed={chuDangChon === c}
                  onClick={() => setChuDangChon((cu) => (cu === c ? null : c))}
                  className={`${styles.chu} ${chuDangChon === c ? styles.chuOn : ""}`}
                >
                  {c}
                </button>
              ))}
            </div>

            {chuDangChon && (
              <ul
                className={`${styles.luoi} ${styles.luoiChu}`}
                aria-label={`Trường bắt đầu bằng ${chuDangChon}`}
              >
                {(theoChu.get(chuDangChon) ?? []).map((t) => (
                  <DongTruong key={t._id} t={t} />
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
