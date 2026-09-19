"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Award,
  Bell,
  BookOpen,
  CheckCheck,
  CircleCheck,
  CircleX,
  Coins,
  Info,
  MessageCircle,
} from "lucide-react";

import {
  danhDauDaDoc,
  danhDauTatCa,
  demChuaDoc,
  layThongBao,
  type LoaiThongBao,
  type ThongBao,
} from "@/src/services/thongBao";

// Bieu tuong va mau theo tung loai.
//
// Mau o day la mau NGU NGHIA (tot / hong / trung tinh), khong phai mau nhan
// dien cua trang. Don bi tu choi phai do du nguoi dung co doc chu hay khong.
const KIEU: Record<LoaiThongBao, { Icon: typeof Bell; mau: string }> = {
  don_duoc_duyet: { Icon: CircleCheck, mau: "text-emerald-600" },
  don_bi_tu_choi: { Icon: CircleX, mau: "text-red-600" },
  khoa_duoc_mo: { Icon: BookOpen, mau: "text-blue-600" },
  chung_nhan: { Icon: Award, mau: "text-amber-600" },
  tra_loi_hoi_dap: { Icon: MessageCircle, mau: "text-indigo-600" },
  coin_duoc_cong: { Icon: Coins, mau: "text-amber-600" },
  he_thong: { Icon: Info, mau: "text-slate-500" },
};

// Cach day bao lau, doc bang tieng Viet.
//
// Khong dung toLocaleString: mot cai nhan "14:32 12/09" bat nguoi doc phai tu
// tinh xem no la lau chua. "3 giờ trước" tra loi thang cau ho dang hoi.
const khoangCach = (moc: string): string => {
  const giay = Math.floor((Date.now() - new Date(moc).getTime()) / 1000);

  if (giay < 60) return "vừa xong";
  if (giay < 3600) return `${Math.floor(giay / 60)} phút trước`;
  if (giay < 86400) return `${Math.floor(giay / 3600)} giờ trước`;
  if (giay < 604800) return `${Math.floor(giay / 86400)} ngày trước`;

  return new Date(moc).toLocaleDateString("vi-VN");
};

// Nhip do lai so chua doc khi tab dang mo.
//
// 60 giay chu khong ngan hon: thong bao o day khong phai tin nhan tuc thi, va
// moi luot goi la mot luot cham CSDL nhan voi so nguoi dang mo trang. Bo dem
// GET trong apiHelper song 30 giay nen cung khong the ban hon muc nay.
const NHIP_DO_MS = 60_000;

export default function ChuongThongBao() {
  const [mo, setMo] = useState(false);
  const [chuaDoc, setChuaDoc] = useState(0);
  const [danhSach, setDanhSach] = useState<ThongBao[]>([]);
  const [dangTai, setDangTai] = useState(false);
  const [loi, setLoi] = useState("");
  const boc = useRef<HTMLDivElement>(null);

  const doSoChuaDoc = useCallback(async () => {
    try {
      const kq = await demChuaDoc();
      setChuaDoc(kq.chuaDoc);
    } catch {
      // Im lang. Dem hong thi cung lam cai cham do khong hien - khong dang de
      // nem mot thong bao loi che len man hinh vi mot con so phu.
    }
  }, []);

  useEffect(() => {
    // Lan do dau tien day sang microtask thay vi goi thang trong than effect.
    //
    // Goi thang la mot vong ve lai noi tiep ngay sau lan ve dau (react-hooks/
    // set-state-in-effect chan dung cho nay). Day sang microtask thi lan ve dau
    // hoan tat truoc, roi con so moi toi - nguoi dung khong thay khac gi vi day
    // la mot luot goi mang, luon cham hon mot khung hinh.
    queueMicrotask(doSoChuaDoc);

    const dinhKy = setInterval(() => {
      // Tab bi an thi khong do: nguoi dung khong nhin thay cai cham do, ma may
      // chu van phai tra loi. Trinh duyet cung tu bop nhip setInterval o tab
      // nen, nhung khong bo han - phai tu chan.
      if (!document.hidden) doSoChuaDoc();
    }, NHIP_DO_MS);

    return () => clearInterval(dinhKy);
  }, [doSoChuaDoc]);

  useEffect(() => {
    const bamNgoai = (e: MouseEvent) => {
      if (boc.current && !boc.current.contains(e.target as Node)) setMo(false);
    };
    const nhanPhim = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMo(false);
    };

    document.addEventListener("mousedown", bamNgoai);
    window.addEventListener("keydown", nhanPhim);

    return () => {
      document.removeEventListener("mousedown", bamNgoai);
      window.removeEventListener("keydown", nhanPhim);
    };
  }, []);

  // Chi tai danh sach KHI MO, khong tai san luc dung trang.
  //
  // Phan lon nguoi dung khong bam chuong trong mot luot xem. Tai san la moi
  // trang deu keo ve hai chuc ban ghi khong ai doc.
  const moBang = async () => {
    const sapMo = !mo;
    setMo(sapMo);
    if (!sapMo) return;

    setDangTai(true);
    setLoi("");

    try {
      const kq = await layThongBao(1);
      setDanhSach(kq.danhSach);
      setChuaDoc(kq.chuaDoc);
    } catch {
      setLoi("Không tải được thông báo. Thử lại sau.");
    } finally {
      setDangTai(false);
    }
  };

  // Danh dau da doc NGAY tren giao dien roi moi goi may chu.
  //
  // Nguoi dung bam vao thong bao la dieu huong di luon; cho may chu tra loi
  // xong moi doi mau thi ho da roi khoi trang truoc khi thay gi. Hong thi cung
  // khong sao: lan sau mo lai no van con dau chua doc, dung trang thai that.
  const doDaDoc = (tb: ThongBao) => {
    if (tb.daDoc) return;

    setDanhSach((cu) => cu.map((m) => (m._id === tb._id ? { ...m, daDoc: true } : m)));
    setChuaDoc((n) => Math.max(0, n - 1));

    danhDauDaDoc(tb._id).catch(() => {});
  };

  const doTatCa = async () => {
    setDanhSach((cu) => cu.map((m) => ({ ...m, daDoc: true })));
    setChuaDoc(0);

    try {
      await danhDauTatCa();
    } catch {
      // Hong thi do lai tu may chu de con so tren man hinh khong noi sai.
      doSoChuaDoc();
    }
  };

  return (
    <div className="relative shrink-0" ref={boc}>
      <button
        type="button"
        onClick={moBang}
        aria-label={chuaDoc > 0 ? `Thông báo, ${chuaDoc} chưa đọc` : "Thông báo"}
        aria-expanded={mo}
        // h-11 w-11: nguong cham toi thieu 44px. Cai chuong nho hon thi tren
        // dien thoai bam truot sang avatar ben canh.
        className="relative flex h-11 w-11 items-center justify-center rounded-full text-slate-600 transition hover:bg-gray-100 hover:text-slate-900"
      >
        <Bell size={20} />

        {chuaDoc > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white tabular-nums">
            {chuaDoc > 99 ? "99+" : chuaDoc}
          </span>
        )}
      </button>

      {mo && (
        // w-[min(...)]: tren man hinh 390px mot bang rong co dinh 22rem se troi
        // ra ngoai le phai. Lay be nao nho hon.
        <div className="absolute top-14 right-0 z-50 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <p className="font-semibold text-slate-900">Thông báo</p>

            {chuaDoc > 0 && (
              <button
                type="button"
                onClick={doTatCa}
                className="flex items-center gap-1 rounded px-1 py-1 text-xs font-semibold text-blue-600 transition hover:underline"
              >
                <CheckCheck size={14} /> Đọc hết
              </button>
            )}
          </div>

          {/* max-h + overflow: danh sach 20 muc se dai hon man hinh dien thoai.
              Cuon trong chinh cai bang chu khong day ca trang di. */}
          <div className="max-h-[min(26rem,60vh)] overflow-y-auto overscroll-contain">
            {dangTai && (
              <p className="px-4 py-8 text-center text-sm text-slate-500">Đang tải…</p>
            )}

            {!dangTai && loi && (
              <p className="px-4 py-8 text-center text-sm text-red-600">{loi}</p>
            )}

            {!dangTai && !loi && danhSach.length === 0 && (
              <div className="px-4 py-10 text-center">
                <Bell size={28} className="mx-auto mb-2 text-slate-300" />
                <p className="text-sm text-slate-500">Chưa có thông báo nào.</p>
              </div>
            )}

            {!dangTai &&
              !loi &&
              danhSach.map((tb) => {
                const { Icon, mau } = KIEU[tb.loai] ?? KIEU.he_thong;

                const ben = (
                  <>
                    <Icon size={18} className={`mt-0.5 shrink-0 ${mau}`} />
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-sm leading-snug ${
                          tb.daDoc ? "text-slate-600" : "font-semibold text-slate-900"
                        }`}
                      >
                        {tb.tieuDe}
                      </p>
                      {tb.noiDung && (
                        <p className="mt-0.5 text-sm leading-snug text-slate-500">
                          {tb.noiDung}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-slate-400">
                        {khoangCach(tb.createdAt)}
                      </p>
                    </div>
                    {!tb.daDoc && (
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                    )}
                  </>
                );

                const lop = `flex w-full gap-3 border-b border-slate-100 px-4 py-3 text-left transition last:border-b-0 hover:bg-slate-50 ${
                  tb.daDoc ? "" : "bg-blue-50/40"
                }`;

                // Co duong dan thi la mot lien ket that (mo tab moi duoc, bam
                // giua duoc). Khong co thi dung <button> — mot the <a> khong co
                // href khong bam duoc bang ban phim.
                return tb.duongDan ? (
                  <Link
                    key={tb._id}
                    href={tb.duongDan}
                    onClick={() => {
                      doDaDoc(tb);
                      setMo(false);
                    }}
                    className={lop}
                  >
                    {ben}
                  </Link>
                ) : (
                  <button
                    key={tb._id}
                    type="button"
                    onClick={() => doDaDoc(tb)}
                    className={lop}
                  >
                    {ben}
                  </button>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
