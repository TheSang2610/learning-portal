"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { CircleCheck, CircleX, ShoppingCart, Trash2 } from "lucide-react";

import { useGioHang } from "@/src/hooks/cart";
import { giaRaCoin, layViCuaToi, muaBangCoin } from "@/src/services/coin.api";
import { getErrorMessage } from "@/src/services/apiHelper";
import OMaGiamGiaGioHang from "@/src/components/vouchers/CartVoucherBox";
import { useNguoiDungLuu, useDangTaiNguoiDung } from "@/src/hooks/userStore";
import { duongDanDangNhap } from "@/src/components/auth/loginUrl";

import styles from "./page.module.scss";
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
      <div className={styles.page}>
        <div className={styles.container}>
          <ShoppingCart size={36} className={styles.box} />
          <h1 className={styles.title}>Giỏ hàng trống</h1>

          {xong ? (
            <p className={styles.text}>
              Đã mua xong. Vào mục khóa học của bạn để bắt đầu học.
            </p>
          ) : (
            <p className={styles.text}>Bạn chưa thêm khóa học nào vào giỏ.</p>
          )}

          <div className={styles.row}>
            <Link href="/courses" className={styles.box2}>
              Tìm khóa học
            </Link>
            {xong && (
              <Link href="/user/my-courses" className={styles.card}>
                Khóa học của tôi
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page2}>
      <div className={styles.container2}>
        <div className={styles.row2}>
          <ShoppingCart size={22} className={styles.box3} />
          <h1 className={styles.title2}>Giỏ hàng ({soMon})</h1>
        </div>

        <div className={styles.grid}>
          <div className={styles.col}>
            {gio.map((m) => {
              const tt = trangThai[m.courseId];

              return (
                <article key={m.courseId} className={styles.article}>
                  <div className={styles.box4}>
                    {m.thumbnail && (
                      <Image
                        src={m.thumbnail}
                        alt={m.title}
                        fill
                        sizes="112px"
                        className={styles.box5}
                      />
                    )}
                  </div>

                  <div className={styles.box6}>
                    <h2 className={styles.heading}>{m.title}</h2>
                    <p className={styles.text2}>
                      {m.gia.toLocaleString("vi-VN")}đ
                      <span className={styles.label}>
                        ({giaRaCoin(m.gia).toLocaleString("vi-VN")} coin)
                      </span>
                    </p>

                    {tt === "xong" && (
                      <p className={styles.text3}>
                        <CircleCheck size={12} /> Đã mở khóa
                      </p>
                    )}
                    {tt === "hong" && (
                      <p className={styles.text4}>
                        <CircleX size={12} className={styles.box7} />
                        {loiTheoMon[m.courseId] || "Không mua được"}
                      </p>
                    )}
                    {tt === "dangMua" && <p className={styles.text5}>Đang mua…</p>}
                  </div>

                  <button
                    type="button"
                    onClick={() => boMon(m.courseId)}
                    disabled={dangMua}
                    aria-label={`Bỏ ${m.title} khỏi giỏ`}
                    className={styles.button}
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
              className={styles.button2}
            >
              Xóa hết giỏ hàng
            </button>
          </div>

          <aside className={styles.aside}>
            <div className={styles.sticky}>
              <h2 className={styles.heading2}>Thanh toán</h2>

              <div className={styles.row3}>
                <span className={styles.label2}>
                  {giam > 0 ? "Tạm tính" : "Tổng tiền"}
                </span>
                <span className={styles.label3}>{tongTien.toLocaleString("vi-VN")}đ</span>
              </div>

              {giam > 0 && (
                <div className={styles.row3}>
                  <span className={styles.label2}>Mã giảm giá</span>
                  <span className={styles.label4}>−{giam.toLocaleString("vi-VN")}đ</span>
                </div>
              )}

              <div className={styles.row4}>
                <span className={styles.label2}>Quy ra coin</span>
                <span className={styles.label3}>{tongCoin.toLocaleString("vi-VN")}</span>
              </div>

              <div className={styles.box8}>
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
                <div className={styles.box8}>
                  <p className={styles.text6}>
                    Đăng nhập để thanh toán. Giỏ hàng của bạn được giữ nguyên.
                  </p>
                  <Link href={duongDangNhap} className={styles.row5}>
                    Đăng nhập
                  </Link>
                </div>
              ) : (
                <>
                  <div className={styles.box9}>
                    <div className={styles.row6}>
                      <span className={styles.label2}>Ví của bạn</span>
                      <span
                        className={`${styles.label7} ${
                          duCoin ? styles.label5 : styles.label6
                        }`}
                      >
                        {soDu === null ? "…" : soDu.toLocaleString("vi-VN")} coin
                      </span>
                    </div>

                    {soDu !== null && !duCoin && (
                      <p className={styles.text7}>
                        Thiếu {(tongCoin - soDu).toLocaleString("vi-VN")} coin.
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={thanhToan}
                    disabled={dangMua || !duCoin}
                    className={styles.button3}
                  >
                    {dangMua ? "Đang mua…" : "Thanh toán bằng coin"}
                  </button>
                </>
              )}

              {/* Noi thang vi sao khong co nut chuyen khoan o day, thay vi de
                  nguoi dung tim mai khong thay. Ma QR khop tien theo TUNG don,
                  nen mot lan chuyen cho nhieu khoa se khong doi chieu duoc. */}
              <p className={styles.text8}>
                Giỏ hàng chỉ thanh toán bằng coin. Muốn chuyển khoản thì mua từng khóa ở
                trang khóa học đó, hoặc{" "}
                <Link href="/user/coin" className={styles.box10}>
                  nạp coin
                </Link>{" "}
                rồi quay lại đây.
              </p>

              {xong && (
                <button
                  type="button"
                  onClick={() => router.push("/user/my-courses")}
                  className={styles.button4}
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
