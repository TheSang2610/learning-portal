"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Columns2,
  FileCheck2,
  FilePenLine,
  LayoutGrid,
  List,
  Rows3,
  Timer,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

import { doiDiaChi, duongDanDangNhap } from "@/src/components/auth/loginUrl";
import { useDangTaiNguoiDung, useNguoiDungLuu } from "@/src/hooks/userStore";

import PracticeResult from "./PracticeResult";
import { NAP_CAU_HOI, type CauHoi, type DeLuyenTap } from "./practiceData";
import {
  apThuTu,
  chiaBo,
  docThietLap,
  thuTuDapAnNgauNhien,
  traLoiDung,
  xaoTron,
  type ThietLap,
} from "./practiceSettings";
import { luuBaiLam } from "@/src/services/practice";

import styles from "./PracticeTest.module.scss";

// Phong lam bai theo mau trang thi cua chu du an: thanh tren co dinh, the cau
// hoi voi dap an A-D, cot "Danh sach cau hoi" ben phai.

type CheDo = "list" | "single" | "split";
type GiaiDoan = "nap" | "lam" | "xong";

const CHE_DO: { id: CheDo; nhan: string; Icon: typeof List }[] = [
  { id: "list", nhan: "Hiển thị danh sách câu hỏi", Icon: List },
  { id: "single", nhan: "Hiển thị từng câu hỏi", Icon: Rows3 },
  { id: "split", nhan: "Tách câu hỏi và đáp án", Icon: Columns2 },
];

const CO_CHU_MIN = 1;
const CO_CHU_MAX = 1.5;
const CHU_CAI = "ABCDEFGH";

const gon = (s: string) => s.replace(/\s+/g, " ").trim();
const hai = (n: number) => String(n).padStart(2, "0");
const dongHo = (giay: number) => {
  const g = Math.max(0, giay);
  return `${hai(Math.floor(g / 3600))} : ${hai(Math.floor((g % 3600) / 60))} : ${hai(g % 60)}`;
};

/** Du lieu da loc san luc chuyen doi (anh https, MathML, the dinh dang) nen gan thang. */
function NoiDung({ html, s }: { html?: boolean; s: string }) {
  return html ? (
    <span className={styles.giau} dangerouslySetInnerHTML={{ __html: s }} />
  ) : (
    <span>{gon(s)}</span>
  );
}

interface Props {
  de: DeLuyenTap;
}

export default function PracticeTest({ de }: Props) {
  const router = useRouter();
  const duongDan = usePathname();
  const nguoiDung = useNguoiDungLuu();
  const dangTai = useDangTaiNguoiDung();
  const napCauHoi = NAP_CAU_HOI[de.id];

  const [giaiDoan, setGiaiDoan] = useState<GiaiDoan>("nap");
  const [tl, setTl] = useState<ThietLap | null>(null);
  const [goc, setGoc] = useState<CauHoi[]>([]); // bo cau theo thu tu goc
  const [ds, setDs] = useState<CauHoi[]>([]); // bo cau dang lam (co the da xao)
  const [tuCau, setTuCau] = useState(1);
  const [chon, setChon] = useState<(number[] | undefined)[]>([]);
  const [hienTai, setHienTai] = useState(0);
  const [cheDo, setCheDo] = useState<CheDo>("list");
  const [coChu, setCoChu] = useState(1);
  const [batDau, setBatDau] = useState(0);
  const [bayGio, setBayGio] = useState(0);
  const [ketThuc, setKetThuc] = useState(0);
  const [hop, setHop] = useState<"nop" | "thoat" | null>(null);
  const [moMenu, setMoMenu] = useState(false);
  const [moDs, setMoDs] = useState(false);
  const [loiNap, setLoiNap] = useState(false);
  // Vi tri cau trong file de + thu tu dap an da hien: du de dung lai dung bai
  // nay khi mo lai tu lich su. Xem backend/src/utils/practiceAttempt.js.
  const [nguon, setNguon] = useState<{ cau: number[]; dapAn: number[][] }>({
    cau: [],
    dapAn: [],
  });
  const [luu, setLuu] = useState<"dang" | "xong" | "loi" | null>(null);
  const daGui = useRef(false);

  const vungCuon = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Bat dau (hoac lam lai) mot luot tu bo cau goc
  const batDauLuot = useCallback((bo: CauHoi[], t: ThietLap, tu: number) => {
    const chiSo = bo.map((_, k) => k);
    const thuTuCau = t.xaoTron ? xaoTron(chiSo) : chiSo;
    const thuTuDapAn = thuTuCau.map((k) => (t.xaoTron ? thuTuDapAnNgauNhien(bo[k]) : []));
    const moi = thuTuCau.map((k, i) => apThuTu(bo[k], thuTuDapAn[i]));
    setNguon({ cau: thuTuCau.map((k) => tu - 1 + k), dapAn: thuTuDapAn });
    setLuu(null);
    daGui.current = false;
    setDs(moi);
    setChon(Array(moi.length).fill(undefined));
    setHienTai(0);
    const now = Date.now();
    setBatDau(now);
    setBayGio(now);
    setGiaiDoan("lam");
    vungCuon.current?.scrollTo({ top: 0 });
  }, []);

  // Nap de + thiet lap sau khi gan vao trinh duyet (thiet lap nam o localStorage,
  // bo cau dang chon nam o ?bo= tren dia chi).
  useEffect(() => {
    if (!napCauHoi || !nguoiDung) return;
    let huy = false;
    const t = docThietLap();
    const cacBo = chiaBo(de.soCau, t.soLuong);
    const so = Number(new URLSearchParams(window.location.search).get("bo"));
    const bo = cacBo[Number.isInteger(so) && so >= 0 ? so : 0] ?? cacBo[0];
    napCauHoi()
      .then((tat) => {
        if (huy) return;
        const lat = tat.slice(bo.tu - 1, bo.den);
        setTl(t);
        setTuCau(bo.tu);
        setGoc(lat);
        batDauLuot(lat, t, bo.tu);
      })
      .catch(() => !huy && setLoiNap(true));
    return () => {
      huy = true;
    };
    // nguoiDung chi can co/khong: doi ten hien thi khong duoc nap lai bai
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [napCauHoi, de.soCau, !!nguoiDung, batDauLuot]);

  // Phong lam bai phu kin man hinh: khoa cuon trang phia sau
  useEffect(() => {
    const truoc = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = truoc;
    };
  }, []);

  const daQua = Math.floor(((giaiDoan === "xong" ? ketThuc : bayGio) - batDau) / 1000);
  const soDaLam = chon.filter((c) => c && c.length).length;

  const nopBai = useCallback(() => {
    setHop(null);
    setLuu("dang");
    setKetThuc(Date.now());
    setGiaiDoan("xong");
    setCheDo("list");
    setMoDs(false);
    vungCuon.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Nop xong thi luu vao lich su (mot lan - ref chan viec gui lai khi effect
  // chay hai lan o che do dev). Loi mang khong chan xem ket qua, chi bao lai.
  useEffect(() => {
    if (luu !== "dang" || daGui.current) return;
    daGui.current = true;
    luuBaiLam({
      deId: de.id,
      cau: nguon.cau,
      dapAn: nguon.dapAn,
      chon: chon.map((c) => c ?? []),
      soDung: ds.filter((c, i) => traLoiDung(chon[i], c.dung)).length,
      giay: Math.max(0, Math.floor((ketThuc - batDau) / 1000)),
    })
      .then(() => setLuu("xong"))
      .catch(() => setLuu("loi"));
  }, [luu, de.id, nguon, chon, ds, ketThuc, batDau]);

  // Dong ho dem thoi gian da lam, moi giay mot nhip. Khong gioi han gio: chu
  // du an da bo "thoi gian dem nguoc" - luyen tap thi lam bao lau cung duoc.
  useEffect(() => {
    if (giaiDoan !== "lam") return;
    const id = setInterval(() => setBayGio(Date.now()), 1000);
    return () => clearInterval(id);
  }, [giaiDoan]);

  // Dang lam do dang ma dong tab / tai lai: hoi truoc
  useEffect(() => {
    if (giaiDoan !== "lam" || soDaLam === 0) return;
    const hoi = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", hoi);
    return () => window.removeEventListener("beforeunload", hoi);
  }, [giaiDoan, soDaLam]);

  // Menu kieu hien thi: bam ra ngoai / Esc de dong
  useEffect(() => {
    if (!moMenu) return;
    const ngoai = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMoMenu(false);
    };
    const phim = (e: KeyboardEvent) => e.key === "Escape" && setMoMenu(false);
    document.addEventListener("mousedown", ngoai);
    window.addEventListener("keydown", phim);
    return () => {
      document.removeEventListener("mousedown", ngoai);
      window.removeEventListener("keydown", phim);
    };
  }, [moMenu]);

  const daXongCau = (i: number) => {
    const c = chon[i];
    return !!c && c.length === ds[i].dung.length;
  };
  // Dang lam KHONG lo dung/sai (chu du an da bo "hien dap an sau cau hoi"):
  // doi lai lua chon thoai mai, nop bai xong moi xem dap an.
  const chonDapAn = (i: number, j: number) => {
    if (giaiDoan !== "lam") return;
    const c = ds[i];
    const cu = chon[i] ?? [];
    const moi =
      c.dung.length > 1
        ? cu.includes(j)
          ? cu.filter((x) => x !== j)
          : cu.length < c.dung.length
            ? [...cu, j]
            : cu
        : [j];
    setChon((ds0) => ds0.map((x, k) => (k === i ? moi : x)));
  };

  const denCau = (i: number) => {
    setMoDs(false);
    if (cheDo === "list") {
      document
        .getElementById(`cau-${i}`)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setHienTai(i);
  };

  // Che do tung cau: phim mui ten de chuyen, A-D de chon
  useEffect(() => {
    if (cheDo === "list" || giaiDoan === "nap") return;
    const phim = (e: KeyboardEvent) => {
      if (hop || (e.target as HTMLElement).closest("input, select, textarea")) return;
      if (e.key === "ArrowRight") denCau(Math.min(hienTai + 1, ds.length - 1));
      else if (e.key === "ArrowLeft") denCau(Math.max(hienTai - 1, 0));
      else {
        const j = CHU_CAI.indexOf(e.key.toUpperCase());
        if (j >= 0 && j < (ds[hienTai]?.dapAn.length ?? 0)) chonDapAn(hienTai, j);
      }
    };
    window.addEventListener("keydown", phim);
    return () => window.removeEventListener("keydown", phim);
  });

  const quayLai = () => {
    if (giaiDoan === "lam" && soDaLam > 0) setHop("thoat");
    else router.push(`/practice/${de.id}`);
  };

  const ten = nguoiDung?.fullname || nguoiDung?.name || "Bạn";

  /* ---------- Chua dang nhap / dang nap ---------- */
  if (!dangTai && !nguoiDung) {
    return (
      <div className={styles.phong}>
        <div className={styles.giua}>
          <p className={styles.giuaChu}>Đăng nhập để bắt đầu làm bài luyện tập.</p>
          <div className={styles.giuaNut}>
            <Link href={`/practice/${de.id}`} className={styles.nutPhu}>
              Quay lại
            </Link>
            <button
              type="button"
              className={styles.nutChinh}
              onClick={() =>
                doiDiaChi(
                  duongDanDangNhap(duongDan, new URLSearchParams(window.location.search)),
                )
              }
            >
              Đăng nhập
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (giaiDoan === "nap" || !tl) {
    return (
      <div className={styles.phong}>
        <div className={styles.giua}>
          <p className={styles.giuaChu}>
            {loiNap || !napCauHoi
              ? "Không tải được câu hỏi của đề."
              : "Đang chuẩn bị đề…"}
          </p>
          {(loiNap || !napCauHoi) && (
            <Link href={`/practice/${de.id}`} className={styles.nutPhu}>
              Quay lại
            </Link>
          )}
        </div>
      </div>
    );
  }

  /* ---------- Mot the cau hoi ---------- */
  const theCau = (i: number) => {
    const c = ds[i];
    const daChon = chon[i] ?? [];
    const nhieu = c.dung.length > 1;
    const phanCau = (
      <div className={styles.cauDau}>
        <div className={styles.cauSo}>Câu&nbsp; {i + 1}</div>
        <div className={styles.cauChu}>
          <NoiDung html={c.html} s={c.cau} />
        </div>
      </div>
    );
    const phanDapAn = (
      <div>
        <div className={styles.gach}>
          <span>
            {nhieu ? `Chọn ${c.dung.length} đáp án đúng` : "Chọn một đáp án đúng"}
          </span>
        </div>
        <div className={styles.dsDapAn} role={nhieu ? "group" : "radiogroup"}>
          {c.dapAn.map((a, j) => {
            const duocChon = daChon.includes(j);
            const lop = duocChon ? `${styles.dapAn} ${styles.dapAnChon}` : styles.dapAn;
            return (
              <button
                key={j}
                type="button"
                role={nhieu ? "checkbox" : "radio"}
                aria-checked={duocChon}
                disabled={giaiDoan !== "lam"}
                onClick={() => chonDapAn(i, j)}
                className={lop}
              >
                <span className={styles.chuCai}>{CHU_CAI[j]}</span>
                <span className={styles.dapAnChu}>
                  <NoiDung html={c.html} s={a} />
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
    return (
      <article
        key={i}
        id={`cau-${i}`}
        className={cheDo === "split" ? `${styles.the} ${styles.theTach}` : styles.the}
      >
        {phanCau}
        {phanDapAn}
      </article>
    );
  };

  const oDs = (
    <div className={styles.oDs}>
      <h2 className={styles.oDsTieuDe}>Danh sách câu hỏi</h2>
      <div className={styles.luoi}>
        {ds.map((c, i) => {
          const lop = [
            styles.oSo,
            daXongCau(i) && styles.oSoLam,
            cheDo !== "list" && i === hienTai && styles.oSoHienTai,
          ]
            .filter(Boolean)
            .join(" ");
          return (
            <button
              key={i}
              type="button"
              className={lop}
              onClick={() => denCau(i)}
              aria-label={`Câu ${i + 1}${daXongCau(i) ? ", đã làm" : ""}`}
              aria-current={cheDo !== "list" && i === hienTai ? "true" : undefined}
            >
              {hai(i + 1)}
            </button>
          );
        })}
      </div>
      <p className={styles.oDsChu}>
        Đã làm {soDaLam}/{ds.length} câu
        {tuCau > 1 && ` · câu ${tuCau} - ${tuCau + ds.length - 1} của đề`}
      </p>
    </div>
  );

  // Nop xong: man "da gui" roi trang xem dap an
  if (giaiDoan === "xong") {
    return (
      <div className={styles.phong}>
        <PracticeResult
          tieuDe={de.title}
          ten={ten}
          ds={ds}
          chon={chon}
          daQua={daQua}
          ketThuc={ketThuc}
          quayLai={() => router.push(`/practice/${de.id}`)}
          lamLai={() => batDauLuot(goc, tl, tuCau)}
          luu={luu}
        />
      </div>
    );
  }

  return (
    <div className={styles.phong}>
      {/* ============ THANH TREN ============ */}
      <header className={styles.thanh}>
        <button
          type="button"
          onClick={quayLai}
          className={styles.nutVien}
          aria-label="Quay lại"
        >
          <ChevronLeft size={18} aria-hidden="true" />
          <span className={styles.chuRong}>Quay lại</span>
        </button>

        <span className={styles.thiSinh}>Thí sinh: {ten}</span>

        <div className={styles.phai}>
          <span className={styles.dongHo} role="timer" aria-label="Thời gian đã làm">
            <Timer size={18} aria-hidden="true" />
            {dongHo(daQua)}
          </span>

          <button
            type="button"
            className={`${styles.nutXam} ${styles.chuRong}`}
            disabled={coChu <= CO_CHU_MIN}
            onClick={() => setCoChu((v) => Math.max(CO_CHU_MIN, v - 0.125))}
            aria-label="Thu nhỏ chữ"
            title="Thu nhỏ chữ"
          >
            <ZoomOut size={18} aria-hidden="true" />
          </button>
          <button
            type="button"
            className={`${styles.nutXam} ${styles.chuRong}`}
            disabled={coChu >= CO_CHU_MAX}
            onClick={() => setCoChu((v) => Math.min(CO_CHU_MAX, v + 0.125))}
            aria-label="Phóng to chữ"
            title="Phóng to chữ"
          >
            <ZoomIn size={18} aria-hidden="true" />
          </button>

          <div className={styles.menuBoc} ref={menuRef}>
            <button
              type="button"
              className={styles.nutXam}
              aria-haspopup="menu"
              aria-expanded={moMenu}
              aria-label="Kiểu hiển thị"
              title="Kiểu hiển thị"
              onClick={() => setMoMenu((v) => !v)}
            >
              <List size={18} aria-hidden="true" />
            </button>
            {moMenu && (
              <div className={styles.menu} role="menu">
                {CHE_DO.map(({ id, nhan, Icon }) => (
                  <button
                    key={id}
                    type="button"
                    role="menuitemradio"
                    aria-checked={cheDo === id}
                    className={
                      cheDo === id
                        ? `${styles.menuMuc} ${styles.menuChon}`
                        : styles.menuMuc
                    }
                    onClick={() => {
                      setCheDo(id);
                      setMoMenu(false);
                    }}
                  >
                    <Icon size={18} aria-hidden="true" />
                    {nhan}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            className={`${styles.nutXam} ${styles.chiDienThoai}`}
            aria-label="Danh sách câu hỏi"
            aria-expanded={moDs}
            onClick={() => setMoDs((v) => !v)}
          >
            <LayoutGrid size={18} aria-hidden="true" />
          </button>

          <button type="button" className={styles.nutNop} onClick={() => setHop("nop")}>
            <FilePenLine size={16} aria-hidden="true" /> Nộp bài
          </button>
        </div>
      </header>

      {/* ============ THAN ============ */}
      <div className={styles.cuon} ref={vungCuon}>
        <div className={styles.khung}>
          <section
            className={styles.cot}
            style={{ fontSize: `${coChu}em` }}
            aria-label="Nội dung bài làm"
          >
            {cheDo === "list" ? (
              ds.map((_, i) => theCau(i))
            ) : (
              <>
                {theCau(hienTai)}
                <nav className={styles.chuyen} aria-label="Chuyển câu">
                  <button
                    type="button"
                    className={styles.nutVien}
                    disabled={hienTai === 0}
                    onClick={() => denCau(hienTai - 1)}
                  >
                    <ChevronLeft size={18} aria-hidden="true" /> Câu trước
                  </button>
                  <button
                    type="button"
                    className={styles.nutVien}
                    disabled={hienTai === ds.length - 1}
                    onClick={() => denCau(hienTai + 1)}
                  >
                    Câu sau <ChevronRight size={18} aria-hidden="true" />
                  </button>
                </nav>
              </>
            )}
          </section>

          <aside className={moDs ? `${styles.ben} ${styles.benMo}` : styles.ben}>
            {oDs}
          </aside>
        </div>
      </div>

      {hop && (
        <div className={styles.nenHop} onClick={() => setHop(null)}>
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="hop-tieu-de"
            className={styles.hop}
            onClick={(e) => e.stopPropagation()}
          >
            {hop === "nop" ? (
              // Theo mau hop nop bai cua trang thi goc
              <div className={styles.hopThan}>
                <h2 id="hop-tieu-de" className={styles.hopTieuDe}>
                  <FileCheck2 size={24} className={styles.hopIcon} aria-hidden="true" />
                  Bạn có chắc chắn muốn nộp bài ?
                </h2>
                <p className={styles.hopDong}>
                  Thời gian bạn đã làm:{" "}
                  <strong className={styles.soGio}>{dongHo(daQua)}</strong>
                </p>
                {ds.length - soDaLam > 0 && (
                  <p className={styles.hopCanhBao}>
                    <strong>Cảnh báo: </strong>
                    Bạn còn {ds.length - soDaLam} câu hỏi trắc nghiệm chưa trả lời. Bạn có
                    chắc muốn kết thúc bài thi?
                  </p>
                )}
                <p className={styles.hopGhiChu}>
                  Khi xác nhận nhấn nộp bài, bạn sẽ không thể sửa lại bài thi của mình.
                  Hãy chắc chắn bạn đã xem lại tất cả các đáp án. Chúc bạn may mắn!
                </p>
              </div>
            ) : (
              <div className={styles.hopThan}>
                <h2 id="hop-tieu-de" className={styles.hopTieuDe}>
                  Thoát khỏi bài làm?
                </h2>
                <p className={styles.hopDong}>Bài đang làm sẽ không được lưu lại.</p>
              </div>
            )}
            <div className={styles.hopNut}>
              <button
                type="button"
                className={styles.nutHuy}
                onClick={() => setHop(null)}
                autoFocus
              >
                Hủy
              </button>
              <button
                type="button"
                className={styles.nutChinh}
                onClick={() =>
                  hop === "nop" ? nopBai() : router.push(`/practice/${de.id}`)
                }
              >
                {hop === "nop" ? "Nộp bài" : "Thoát"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
