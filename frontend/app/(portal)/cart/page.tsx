"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { CircleCheck, CircleX, ShoppingCart, Trash2 } from "lucide-react";

import { useGioHang } from "@/src/hooks/gioHang";
import { giaRaCoin, layViCuaToi, muaBangCoin } from "@/src/services/coin.api";
import { getErrorMessage } from "@/src/services/apiHelper";
import OMaGiamGiaGioHang from "@/src/components/magiamgia/OMaGiamGiaGioHang";
import { useNguoiDungLuu, useDangTaiNguoiDung } from "@/src/hooks/nguoiDungLuu";
import { duongDanDangNhap } from "@/src/components/auth/duongDanDangNhap";

type TrangThaiMon = "cho" | "dangMua" | "xong" | "hong";

export default function CartPage() {
  const router = useRouter();
  const { gio, bo, doSach, tongTien, soMon } = useGioHang();

  const user = useNguoiDungLuu();
  const dangTai = useDangTaiNguoiDung();
  const duongDan = usePathname();

  // KHONG dung useSearchParams() o day, du cac cho khac trong du an co dung.
  //
  // Hook do bat trang phai ve o trinh duyet, nen /cart roi khoi dang dung san
  // luc build va Next bao loi "should be wrapped in a suspense boundary".
  // Doi lai duoc gi? Giu cac tham so tren thanh dia chi khi mo hop dang nhap -
  // ma /cart thi khong co tham so nao dang giu. Tra mot trang dung san lay mot
  // thu khong ton tai la lo.
  const duongDangNhap = duongDanDangNhap(duongDan, new URLSearchParams());

  const [soDu, setSoDu] = useState<number | null>(null);
  const [dangMua, setDangMua] = useState(false);
  const [trangThai, setTrangThai] = useState<Record<string, TrangThaiMon>>({});
  const [loiTheoMon, setLoiTheoMon] = useState<Record<string, string>>({});
  const [xong, setXong] = useState(false);

  // Ma giam gia an vao DUNG MOT khoa - xem ghi chu trong OMaGiamGiaGioHang.
  const [ma, setMa] = useState("");
  const [maCuaKhoa, setMaCuaKhoa] = useState("");
  const [giam, setGiam] = useState(0);

  // Dem de dung lam `key`, tang len la o nhap ma duoc dung lai tu dau.
  //
  // O nhap tu giu trang thai "da ap ma nao" ben trong no. Khi trang cha go ma
  // (nguoi dung bo khoa duoc giam ra khoi gio, hoac mua xong), khong doi `key`
  // thi o nhap van hien khung xanh "da ap MA123" trong khi tong tien khong con
  // tru gi nua - hai con so tren cung mot man hinh noi hai chuyen khac nhau.
  const [lanMa, setLanMa] = useState(0);

  useEffect(() => {
    layViCuaToi()
      .then((v) => setSoDu(v.soDuCoin))
      .catch(() => setSoDu(null));
  }, []);

  const goMa = () => {
    setMa("");
    setMaCuaKhoa("");
    setGiam(0);
    setLanMa((n) => n + 1);
  };

  // Bo khoa DANG duoc giam ra khoi gio thi ma khong con cho de an - go luon.
  //
  // Lam ngay trong tay cam nut thay vi trong useEffect: effect chay SAU khi ve
  // lai, nen co mot nhip tong tien van tru phan giam cua mot khoa da bien mat.
  const boMon = (courseId: string) => {
    if (courseId === maCuaKhoa) goMa();
    bo(courseId);
  };

  const doSachHet = () => {
    goMa();
    doSach();
  };

  const tongCoin = gio.reduce(
    (t, m) => t + giaRaCoin(m.courseId === maCuaKhoa ? Math.max(0, m.gia - giam) : m.gia),
    0,
  );
  const duCoin = soDu !== null && soDu >= tongCoin;

  /**
   * Mua LAN LUOT tung khoa bang dung duong /coin/mua da co.
   *
   * KHONG viet mot duong "mua nhieu" rieng o may chu: duong mua mot khoa da xu
   * ly san thu tu tru coin / ghi danh / hoan lai khi hong, va da chay that mot
   * thoi gian. Viet lai logic tien cho gio hang la nhan doi cho co the sai,
   * doi lay mot phan mang nhanh hon chut it.
   *
   * Lan luot chu khong song song: chay song song thi vai lenh tru coin cung
   * doc mot so du, va nguoi dung co the mua qua so coin dang co.
   */
  const thanhToan = async () => {
    if (dangMua || gio.length === 0) return;

    setDangMua(true);
    setXong(false);

    const ttMoi: Record<string, TrangThaiMon> = {};
    const loiMoi: Record<string, string> = {};

    for (const mon of gio) {
      setTrangThai({ ...ttMoi, [mon.courseId]: "dangMua" });

      try {
        // Chi gui ma kem DUNG khoa da duoc chon. Gui kem moi khoa thi khoa
        // dau an ma, cac khoa sau bi may chu tu choi vi moi nguoi mot luot -
        // va ca lenh mua do hong theo, du khoa do van mua duoc voi gia goc.
        await muaBangCoin(mon.courseId, mon.courseId === maCuaKhoa ? ma : undefined);
        ttMoi[mon.courseId] = "xong";
      } catch (e) {
        ttMoi[mon.courseId] = "hong";
        loiMoi[mon.courseId] = getErrorMessage(e);
      }

      setTrangThai({ ...ttMoi });
      setLoiTheoMon({ ...loiMoi });
    }

    // Chi bo khoi gio nhung mon DA mua duoc. Mon hong phai o lai de nguoi dung
    // thay vi sao no hong va thu lai - xoa het la ho khong con biet mon nao
    // chua mua duoc.
    for (const mon of gio) {
      if (ttMoi[mon.courseId] === "xong") bo(mon.courseId);
    }

    // Mua duoc khoa mang ma thi luot da bi tieu - giu ma tren man hinh nua la
    // moi nguoi dung bam lai mot lan chac chan hong.
    if (maCuaKhoa && ttMoi[maCuaKhoa] === "xong") goMa();

    setDangMua(false);
    setXong(true);

    // Cap nhat lai so du sau khi mua.
    layViCuaToi()
      .then((v) => setSoDu(v.soDuCoin))
      .catch(() => {});
  };

  if (soMon === 0) {
    return (
      <div className="min-h-screen bg-[#f5f7fa] py-16">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
          <ShoppingCart size={36} className="mx-auto mb-4 text-slate-300" />
          <h1 className="mb-2 text-2xl font-bold text-slate-900">Giỏ hàng trống</h1>

          {xong ? (
            <p className="mb-6 text-sm text-slate-500">
              Đã mua xong. Vào mục khóa học của bạn để bắt đầu học.
            </p>
          ) : (
            <p className="mb-6 text-sm text-slate-500">
              Bạn chưa thêm khóa học nào vào giỏ.
            </p>
          )}

          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/courses"
              className="inline-flex h-11 items-center rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Tìm khóa học
            </Link>
            {xong && (
              <Link
                href="/user/my-courses"
                className="inline-flex h-11 items-center rounded-xl border border-slate-300 bg-white px-6 text-sm font-semibold text-slate-700 transition hover:border-blue-500"
              >
                Khóa học của tôi
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7fa] pb-16">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="mb-6 flex items-center gap-2">
          <ShoppingCart size={22} className="text-blue-600" />
          <h1 className="text-2xl font-bold text-slate-900">Giỏ hàng ({soMon})</h1>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="flex flex-col gap-3 lg:col-span-2">
            {gio.map((m) => {
              const tt = trangThai[m.courseId];

              return (
                <article
                  key={m.courseId}
                  className="flex gap-3 rounded-2xl bg-white p-3 ring-1 ring-slate-200"
                >
                  <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                    {m.thumbnail && (
                      <Image
                        src={m.thumbnail}
                        alt={m.title}
                        fill
                        sizes="112px"
                        className="object-cover"
                      />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h2 className="line-clamp-2 text-sm font-bold text-slate-900">
                      {m.title}
                    </h2>
                    <p className="mt-1 text-sm font-semibold text-slate-700 tabular-nums">
                      {m.gia.toLocaleString("vi-VN")}đ
                      <span className="ml-1 text-xs font-normal text-slate-400">
                        ({giaRaCoin(m.gia).toLocaleString("vi-VN")} coin)
                      </span>
                    </p>

                    {tt === "xong" && (
                      <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-emerald-700">
                        <CircleCheck size={12} /> Đã mở khóa
                      </p>
                    )}
                    {tt === "hong" && (
                      <p className="mt-1 flex items-start gap-1 text-xs font-semibold text-red-600">
                        <CircleX size={12} className="mt-0.5 shrink-0" />
                        {loiTheoMon[m.courseId] || "Không mua được"}
                      </p>
                    )}
                    {tt === "dangMua" && (
                      <p className="mt-1 text-xs font-semibold text-blue-600">
                        Đang mua…
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => boMon(m.courseId)}
                    disabled={dangMua}
                    aria-label={`Bỏ ${m.title} khỏi giỏ`}
                    className="flex h-10 w-10 shrink-0 items-center justify-center self-start rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                  >
                    <Trash2 size={16} />
                  </button>
                </article>
              );
            })}

            <button
              type="button"
              onClick={doSachHet}
              disabled={dangMua}
              className="self-start py-2 text-sm font-semibold text-slate-500 transition hover:text-red-600 disabled:opacity-40"
            >
              Xóa hết giỏ hàng
            </button>
          </div>

          <aside className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <h2 className="mb-4 font-bold text-slate-900">Thanh toán</h2>

              <div className="mb-2 flex justify-between text-sm">
                <span className="text-slate-500">
                  {giam > 0 ? "Tạm tính" : "Tổng tiền"}
                </span>
                <span className="font-semibold tabular-nums">
                  {tongTien.toLocaleString("vi-VN")}đ
                </span>
              </div>

              {giam > 0 && (
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-slate-500">Mã giảm giá</span>
                  <span className="font-semibold text-emerald-700 tabular-nums">
                    −{giam.toLocaleString("vi-VN")}đ
                  </span>
                </div>
              )}

              <div className="mb-4 flex justify-between text-sm">
                <span className="text-slate-500">Quy ra coin</span>
                <span className="font-semibold tabular-nums">
                  {tongCoin.toLocaleString("vi-VN")}
                </span>
              </div>

              <div className="mb-4 border-t border-slate-200 pt-4">
                <OMaGiamGiaGioHang
                  key={lanMa}
                  mon={gio.map((m) => ({ courseId: m.courseId, title: m.title }))}
                  onDoiMa={(maMoi, courseId, soTienGiam) => {
                    setMa(maMoi);
                    setMaCuaKhoa(courseId);
                    setGiam(soTienGiam);
                  }}
                />
              </div>

              {/* Khach chua dang nhap van vao duoc trang nay - header co y cho
                  ho them khoa vao gio truoc roi dang nhap sau. Khong tach
                  nhanh nay thi ho thay "Ví của bạn … coin" voi mot nut xam
                  khong bam duoc va khong cau nao noi ly do. */}
              {!user && !dangTai ? (
                <div className="mb-4 border-t border-slate-200 pt-4">
                  <p className="mb-3 text-sm text-slate-500">
                    Đăng nhập để thanh toán. Giỏ hàng của bạn được giữ nguyên.
                  </p>
                  <Link
                    href={duongDangNhap}
                    className="flex h-12 w-full items-center justify-center rounded-xl bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    Đăng nhập
                  </Link>
                </div>
              ) : (
                <>
                  <div className="mb-4 border-t border-slate-200 pt-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Ví của bạn</span>
                      <span
                        className={`font-semibold tabular-nums ${
                          duCoin ? "text-emerald-700" : "text-red-600"
                        }`}
                      >
                        {soDu === null ? "…" : soDu.toLocaleString("vi-VN")} coin
                      </span>
                    </div>

                    {soDu !== null && !duCoin && (
                      <p className="mt-2 text-xs text-red-600">
                        Thiếu {(tongCoin - soDu).toLocaleString("vi-VN")} coin.
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={thanhToan}
                    disabled={dangMua || !duCoin}
                    className="mb-3 h-12 w-full rounded-xl bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    {dangMua ? "Đang mua…" : "Thanh toán bằng coin"}
                  </button>
                </>
              )}

              {/* Noi thang vi sao khong co nut chuyen khoan o day, thay vi de
                  nguoi dung tim mai khong thay. Ma QR khop tien theo TUNG don,
                  nen mot lan chuyen cho nhieu khoa se khong doi chieu duoc. */}
              <p className="text-xs leading-relaxed text-slate-500">
                Giỏ hàng chỉ thanh toán bằng coin. Muốn chuyển khoản thì mua từng khóa ở
                trang khóa học đó, hoặc{" "}
                <Link href="/user/coin" className="font-semibold text-blue-600 underline">
                  nạp coin
                </Link>{" "}
                rồi quay lại đây.
              </p>

              {xong && (
                <button
                  type="button"
                  onClick={() => router.push("/user/my-courses")}
                  className="mt-3 h-11 w-full rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 transition hover:border-blue-500"
                >
                  Tới khóa học của tôi
                </button>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
