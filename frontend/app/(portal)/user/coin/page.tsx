"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Coins, Copy, Check, Loader2, Clock } from "lucide-react";

import {
  DONG_MOI_COIN,
  baoDaChuyenNap,
  huyYeuCauNap,
  layViCuaToi,
  layYeuCauNap,
  taoYeuCauNap,
  type YeuCauNap,
} from "@/src/services/coin.api";
import { baoCoinDaDoi } from "@/src/components/common/CoinBalance";
import { getErrorMessage } from "@/src/services/apiHelper";

import styles from "./page.module.scss";
// Cac muc nap goi san. Nguoi dung van go so tuy y duoc, nhung phan lon chon
// mot muc co san nhanh hon go.
const GOI = [100, 200, 500, 1000, 2000, 5000];

const dinhDangDong = (n: number) => `${n.toLocaleString("vi-VN")}đ`;

/** 754 -> "12:34". Luon hai chu so de con so khong nhay qua lai. */
const dangDongHo = (giay: number) => {
  const an = Math.max(0, giay);
  return `${String(Math.floor(an / 60)).padStart(2, "0")}:${String(an % 60).padStart(2, "0")}`;
};

function NutChep({ giaTri, nhan }: { giaTri: string; nhan: string }) {
  const [xong, setXong] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(giaTri);
          setXong(true);
          setTimeout(() => setXong(false), 2000);
        } catch {
          // Trinh duyet chan clipboard (thuong la khi khong chay https) thi
          // khong bao loi - so van hien ngay canh do de go tay.
        }
      }}
      className={styles.button}
      aria-label={`Sao chép ${nhan}`}
    >
      {xong ? <Check size={12} /> : <Copy size={12} />}
      {xong ? "Đã chép" : "Chép"}
    </button>
  );
}

export default function TrangNapCoin() {
  const [soDu, setSoDu] = useState<number | null>(null);
  const [soCoin, setSoCoin] = useState<number>(500);
  const [yeuCau, setYeuCau] = useState<YeuCauNap | null>(null);
  const [conLai, setConLai] = useState(0);
  const [dangTai, setDangTai] = useState(true);
  const [dangTao, setDangTao] = useState(false);
  const [dangBao, setDangBao] = useState(false);
  const [daBao, setDaBao] = useState(false);
  const [mailHong, setMailHong] = useState(false);
  const [loi, setLoi] = useState("");

  // CHI doc so du, KHONG khoi phuc ma dang cho.
  //
  // Truoc day cho nay goi layYeuCauDangCho() nen reload hay bam back xong van
  // thay lai ma cu. Chu du an muon nguoc lai: roi khoi trang la mat ma, phai
  // bam tao lai. Ma chi song trong state cua trang nay.
  //
  // Ban ghi cu o may chu thi KHONG bi huy - no chuyen sang 'abandoned' va van
  // nhan tien toi het han 15 phut, nen ai lo tay F5 sau khi da chuyen khoan
  // van duoc cong dung. Xem coinNapController.taoYeuCauNap.
  const dongBo = useCallback(async () => {
    try {
      const vi = await layViCuaToi().catch(() => null);
      if (vi) setSoDu(vi.soDuCoin);
    } catch (e) {
      setLoi(getErrorMessage(e, "Không đọc được thông tin ví"));
    } finally {
      setDangTai(false);
    }
  }, []);

  useEffect(() => {
    // Goi qua mot vong microtask thay vi goi thang trong than effect, de
    // setState khong nam dong bo trong do (rule react-hooks/set-state-in-effect).
    void Promise.resolve().then(dongBo);
  }, [dongBo]);

  // Dong ho dem nguoc. Chi dem o may nguoi dung cho muot; con SO GIAY THAT thi
  // lay tu may chu moi lan dong bo, vi dong ho may nguoi dung co the sai gio.
  useEffect(() => {
    if (!yeuCau || yeuCau.status !== "pending") return;
    const id = setInterval(() => setConLai((n) => Math.max(0, n - 1)), 1000);
    return () => clearInterval(id);
  }, [yeuCau]);

  // Do ket qua tu may chu.
  //
  // Coin gio duoc cong TU DONG khi ngan hang bao co, khong ai bam nut nao ca.
  // Khong do thi nguoi dung chuyen tien xong ngoi nhin man hinh "dang cho" mai
  // du coin da vao vi - phai tu F5 moi thay, ma F5 thi mat ma.
  //
  // 5 giay mot lan: tien ve thuong mat 5-30 giay, do thua thi ton request ma
  // khong nhanh hon duoc, do thua thi nguoi dung tuong hong.
  useEffect(() => {
    if (!yeuCau || yeuCau.status !== "pending") return;

    let dungLai = false;
    const id = setInterval(async () => {
      try {
        const { yeuCau: moi } = await layYeuCauNap(yeuCau.code);
        if (dungLai) return;

        setYeuCau(moi);
        setConLai(moi.secondsLeft);

        if (moi.status === "paid") {
          const vi = await layViCuaToi().catch(() => null);
          if (vi && !dungLai) {
            setSoDu(vi.soDuCoin);
            // Bao cho o so du tren thanh dieu huong doc lai, khong thi hai cho
            // tren cung mot man hinh hien hai con so khac nhau.
            baoCoinDaDoi();
          }
        }
      } catch {
        // Mat mang mot nhip thi bo qua, lan do sau se bat lai. Khong hien loi
        // o day: nguoi dung dang cho tien, mot dong bao loi mang lam ho tuong
        // chuyen khoan that bai.
      }
    }, 5000);

    return () => {
      dungLai = true;
      clearInterval(id);
    };
  }, [yeuCau]);

  const tao = async () => {
    setLoi("");
    if (!Number.isInteger(soCoin) || soCoin <= 0) {
      setLoi("Số coin phải là số nguyên lớn hơn 0");
      return;
    }
    setDangTao(true);
    try {
      const { yeuCau: moi } = await taoYeuCauNap(soCoin);
      setYeuCau(moi);
      setConLai(moi.secondsLeft);
      setDaBao(Boolean(moi.daBaoChuyenKhoanLuc));
    } catch (e) {
      setLoi(getErrorMessage(e, "Không tạo được yêu cầu nạp"));
    } finally {
      setDangTao(false);
    }
  };

  const huy = async () => {
    if (!yeuCau) return;
    try {
      await huyYeuCauNap(yeuCau.code);
      setYeuCau(null);
      setDaBao(false);
    } catch (e) {
      setLoi(getErrorMessage(e, "Không hủy được yêu cầu"));
    }
  };

  const bao = async () => {
    if (!yeuCau) return;
    setDangBao(true);
    try {
      const r = await baoDaChuyenNap(yeuCau.code);
      setDaBao(true);
      // Chua cau hinh mail hoac gui hong -> phai noi that. De hoc vien ngoi cho
      // mot cai mail khong bao gio den la cach chac chan nhat de mat khach: ho
      // tuong da bao roi, con quan tri thi khong biet gi.
      setMailHong(!r.daGuiMail);
    } catch (e) {
      setLoi(getErrorMessage(e, "Không gửi được thông báo"));
      setMailHong(true);
    } finally {
      setDangBao(false);
    }
  };

  const ck = yeuCau?.chuyenKhoan;

  return (
    <div className={styles.container}>
      <div>
        <Link href="/user/profile" className={styles.box}>
          <ArrowLeft size={16} /> Về hồ sơ của tôi
        </Link>
        <h1 className={styles.title}>
          <Coins size={22} className={styles.box2} /> Nạp coin
        </h1>
        <p className={styles.text}>
          1 coin = {dinhDangDong(DONG_MOI_COIN)}. Coin dùng để mở khóa học ngay, không
          phải chờ đối chiếu từng lần mua.
        </p>
      </div>

      {soDu !== null && (
        <div className={styles.card}>
          <p className={styles.text2}>Số dư hiện tại</p>
          <p className={styles.text3}>{soDu.toLocaleString("vi-VN")} coin</p>
        </div>
      )}

      {loi && <p className={styles.text4}>{loi}</p>}

      {dangTai ? (
        <div className={styles.row}>
          <Loader2 size={22} className={styles.spinner} />
        </div>
      ) : yeuCau && yeuCau.status === "pending" ? (
        <section className={styles.section}>
          <div className={styles.row2}>
            <h2 className={styles.heading}>
              Chuyển khoản {dinhDangDong(yeuCau.amount)} để nhận{" "}
              {yeuCau.soCoin.toLocaleString("vi-VN")} coin
            </h2>
            <span className={styles.label}>
              <Clock size={13} /> {dangDongHo(conLai)}
            </span>
          </div>

          {ck?.daCauHinh ? (
            <div className={styles.grid}>
              <div className={styles.col}>
                {ck.anhQR && (
                  <Image
                    src={ck.anhQR}
                    alt={`Mã QR chuyển khoản ${dinhDangDong(yeuCau.amount)} nội dung ${yeuCau.code}`}
                    width={280}
                    height={380}
                    unoptimized
                    referrerPolicy="no-referrer"
                    className={styles.box3}
                  />
                )}
                <p className={styles.text5}>
                  Quét mã là mọi ô đã điền sẵn, không phải gõ tay.
                </p>
              </div>

              <dl className={styles.stack}>
                <div className={styles.row3}>
                  <dt className={styles.box4}>Ngân hàng</dt>
                  <dd className={styles.box5}>{ck.nganHang}</dd>
                </div>
                <div className={styles.row3}>
                  <dt className={styles.box4}>Số tài khoản</dt>
                  <dd className={styles.row4}>
                    {ck.soTaiKhoan} <NutChep giaTri={ck.soTaiKhoan} nhan="số tài khoản" />
                  </dd>
                </div>
                <div className={styles.row3}>
                  <dt className={styles.box4}>Tên tài khoản</dt>
                  <dd className={styles.box5}>{ck.tenTaiKhoan}</dd>
                </div>
                <div className={styles.row3}>
                  <dt className={styles.box4}>Số tiền</dt>
                  <dd className={styles.row4}>
                    {dinhDangDong(yeuCau.amount)}{" "}
                    <NutChep giaTri={String(yeuCau.amount)} nhan="số tiền" />
                  </dd>
                </div>
                <div className={styles.row5}>
                  <dt className={styles.box4}>Nội dung</dt>
                  <dd className={styles.row6}>
                    {yeuCau.code} <NutChep giaTri={yeuCau.code} nhan="nội dung" />
                  </dd>
                </div>
              </dl>
            </div>
          ) : (
            <p className={styles.text6}>
              Máy chủ chưa khai báo tài khoản nhận tiền nên chưa sinh được mã QR. Mã{" "}
              <strong>{yeuCau.code}</strong> vẫn hợp lệ — liên hệ ban quản trị để lấy
              thông tin chuyển khoản.
            </p>
          )}

          {/* Ma nay la thu DUY NHAT noi khoan tien voi yeu cau nap. Nhac rieng
              mot dong vi day la cho hay sai nhat: thieu ma thi tien ve toi noi
              ma khong ai biet la cua ai. */}
          <p className={styles.text7}>
            Nội dung chuyển khoản <strong>bắt buộc</strong> là <b>{yeuCau.code}</b>. Ghi
            thiếu hoặc ghi sai thì ban quản trị không biết khoản tiền đó là của ai.
          </p>

          {daBao ? (
            // KHONG bao "tai lai trang de xem" nhu truoc nua: tai lai la mat ma.
            // Trang tu do may chu 5 giay mot lan, coin vao la no tu doi.
            <p className={`${styles.text13} ${mailHong ? styles.text8 : styles.text9}`}>
              Đã báo cho ban quản trị. Coin sẽ vào ví sau khi đối chiếu sao kê — bạn cứ để
              yên trang này, có coin là nó tự hiện.
              {mailHong && (
                <>
                  {" "}
                  Tuy nhiên mail báo chưa gửi được, nên bạn nhắn thêm cho ban quản trị kèm
                  mã <strong className={styles.strong}>{yeuCau.code}</strong> cho chắc.
                </>
              )}
            </p>
          ) : (
            <div className={styles.row7}>
              <button onClick={bao} disabled={dangBao} className={styles.button2}>
                {dangBao ? "Đang gửi..." : "Tôi đã chuyển khoản"}
              </button>
              <button onClick={huy} className={styles.button3}>
                Hủy yêu cầu
              </button>
            </div>
          )}

          <button
            onClick={() => {
              void dongBo();
              baoCoinDaDoi();
            }}
            className={styles.button4}
          >
            Kiểm tra lại xem coin đã vào chưa
          </button>
        </section>
      ) : (
        <section className={styles.section}>
          <h2 className={styles.heading}>Chọn số coin muốn nạp</h2>

          <div className={styles.grid2}>
            {GOI.map((g) => (
              <button
                key={g}
                onClick={() => setSoCoin(g)}
                className={`${styles.button7} ${
                  soCoin === g ? styles.button5 : styles.button6
                }`}
              >
                <p className={styles.text10}>{g.toLocaleString("vi-VN")} coin</p>
                <p className={styles.text11}>{dinhDangDong(g * DONG_MOI_COIN)}</p>
              </button>
            ))}
          </div>

          <div>
            <label htmlFor="so-coin" className={styles.fieldLabel}>
              Hoặc nhập số coin khác
            </label>
            <input
              id="so-coin"
              type="number"
              min={1}
              step={1}
              value={soCoin || ""}
              onChange={(e) => setSoCoin(Math.floor(Number(e.target.value)) || 0)}
              className={styles.input}
            />
            <p className={styles.text12}>
              Phải chuyển: <b>{dinhDangDong(Math.max(0, soCoin) * DONG_MOI_COIN)}</b>
            </p>
          </div>

          <button onClick={tao} disabled={dangTao || soCoin <= 0} className={styles.box6}>
            {dangTao ? "Đang tạo yêu cầu..." : "Tạo yêu cầu nạp"}
          </button>
        </section>
      )}
    </div>
  );
}
