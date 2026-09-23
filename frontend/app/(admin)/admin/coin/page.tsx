"use client";

import { useCallback, useEffect, useState } from "react";
import { Coins, Gift, Search, Loader2 } from "lucide-react";
import { getAllUsersAdmin } from "@/src/services/adminService";
import { getCourses, Course } from "@/src/services/course";
import type { User } from "@/src/services/userApi";
import {
  layViHocVien,
  napCoin,
  tangKhoa,
  giaRaCoin,
  type ThongTinVi,
} from "@/src/services/coin.api";
import { getErrorMessage } from "@/src/services/apiHelper";
import DongGiaoDichCoin from "@/src/components/common/CoinTransactionRow";

import styles from "./page.module.scss";
const dinhDang = (n: number) => n.toLocaleString("vi-VN");

export default function AdminCoinPage() {
  const [dsNguoi, setDsNguoi] = useState<User[]>([]);
  const [tuKhoa, setTuKhoa] = useState("");
  const [dangTimNguoi, setDangTimNguoi] = useState(false);

  const [dsKhoa, setDsKhoa] = useState<Course[]>([]);
  const [chon, setChon] = useState<User | null>(null);
  const [vi, setVi] = useState<ThongTinVi | null>(null);
  const [dangTaiVi, setDangTaiVi] = useState(false);

  const [soCoin, setSoCoin] = useState("");
  const [ghiChuCoin, setGhiChuCoin] = useState("");
  const [khoaTang, setKhoaTang] = useState("");
  const [dangGui, setDangGui] = useState(false);
  const [bao, setBao] = useState<{ loai: "ok" | "loi"; chu: string } | null>(null);

  useEffect(() => {
    getCourses()
      .then(setDsKhoa)
      .catch(() => setDsKhoa([]));
  }, []);

  const timNguoi = useCallback(async (tu: string) => {
    setDangTimNguoi(true);
    try {
      const r = await getAllUsersAdmin({ limit: 20, search: tu || undefined });
      setDsNguoi(r.users || []);
    } catch {
      setDsNguoi([]);
    } finally {
      setDangTimNguoi(false);
    }
  }, []);

  useEffect(() => {
    // Cho 350ms sau lan go cuoi. Khong co doan nay thi go "nguyen" la ban di
    // sau luot goi may chu, va ket qua ve khong theo thu tu - man hinh nhap
    // nhay giua cac ket qua cu.
    const h = setTimeout(() => timNguoi(tuKhoa), 350);
    return () => clearTimeout(h);
  }, [tuKhoa, timNguoi]);

  const moVi = async (nguoi: User) => {
    setChon(nguoi);
    setVi(null);
    setBao(null);
    setDangTaiVi(true);
    try {
      setVi(await layViHocVien(nguoi._id));
    } catch (e) {
      setBao({ loai: "loi", chu: getErrorMessage(e, "Không đọc được ví") });
    } finally {
      setDangTaiVi(false);
    }
  };

  const taiLaiVi = async () => {
    if (!chon) return;
    try {
      setVi(await layViHocVien(chon._id));
    } catch {
      /* giu nguyen so lieu cu tren man hinh con hon xoa trang */
    }
  };

  const guiNapCoin = async () => {
    if (!chon) return;
    setDangGui(true);
    setBao(null);
    try {
      const r = await napCoin(chon._id, Number(soCoin), ghiChuCoin);
      setBao({ loai: "ok", chu: r.message });
      setSoCoin("");
      setGhiChuCoin("");
      await taiLaiVi();
    } catch (e) {
      setBao({ loai: "loi", chu: getErrorMessage(e, "Không nạp được coin") });
    } finally {
      setDangGui(false);
    }
  };

  const guiTangKhoa = async () => {
    if (!chon || !khoaTang) return;
    setDangGui(true);
    setBao(null);
    try {
      const r = await tangKhoa(chon._id, khoaTang);
      setBao({ loai: "ok", chu: r.message });
      setKhoaTang("");
      await taiLaiVi();
    } catch (e) {
      setBao({ loai: "loi", chu: getErrorMessage(e, "Không tặng được khoá") });
    } finally {
      setDangGui(false);
    }
  };

  // So coin phai la so nguyen khac 0 - trung dieu kien ben may chu, de nguoi
  // dung biet ngay chu khong phai bam roi doi loi tra ve.
  const soHopLe = Number.isInteger(Number(soCoin)) && Number(soCoin) !== 0;

  return (
    <div className={styles.stack}>
      <div>
        <h1 className={styles.title}>
          <Coins className={styles.box} size={26} />
          Coin &amp; Quà tặng
        </h1>
        <p className={styles.text}>
          Nạp coin hoặc tặng thẳng khoá học cho học viên. 1 coin = 1.000đ.
        </p>
      </div>

      <div className={styles.grid}>
        {/* ------------------------- Chọn học viên ------------------------- */}
        <div className={styles.card}>
          <div className={styles.box2}>
            <div className={styles.box3}>
              <Search size={16} className={styles.floating} />
              <input
                value={tuKhoa}
                onChange={(e) => setTuKhoa(e.target.value)}
                placeholder="Tìm theo tên hoặc email"
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.scroller}>
            {dangTimNguoi && dsNguoi.length === 0 ? (
              <p className={styles.text2}>Đang tìm…</p>
            ) : dsNguoi.length === 0 ? (
              <p className={styles.text2}>Không có ai khớp.</p>
            ) : (
              dsNguoi.map((u) => (
                <button
                  key={u._id}
                  onClick={() => moVi(u)}
                  className={`${styles.button4} ${
                    chon?._id === u._id ? styles.button : ""
                  }`}
                >
                  <span className={styles.grid2}>
                    {u.name?.[0]?.toUpperCase() ?? "?"}
                  </span>
                  <span className={styles.label}>
                    <span className={styles.label2}>{u.name}</span>
                    <span className={styles.label3}>{u.email}</span>
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* ---------------------------- Ví + thao tác ---------------------- */}
        {!chon ? (
          <div className={styles.card2}>
            Chọn một học viên ở cột bên trái để xem ví và nạp coin.
          </div>
        ) : (
          <div className={styles.stack2}>
            <div className={styles.card3}>
              <p className={styles.text3}>{chon.name}</p>
              <p className={styles.text4}>{chon.email}</p>

              {dangTaiVi ? (
                <p className={styles.text5}>
                  <Loader2 size={15} className={styles.spinner} /> Đang đọc ví…
                </p>
              ) : vi ? (
                <div className={styles.grid3}>
                  <ODem
                    nhan="Số dư"
                    chinh={`${dinhDang(vi.soDuCoin)} coin`}
                    phu={`≈ ${dinhDang(vi.soDuQuyDoi)}đ`}
                    noiBat
                  />
                  <ODem nhan="Tổng đã nạp" chinh={`${dinhDang(vi.tongDaNap)} coin`} />
                  <ODem nhan="Số giao dịch" chinh={dinhDang(vi.soGiaoDich)} />
                </div>
              ) : null}
            </div>

            {bao && (
              <p
                className={`${styles.text13} ${
                  bao.loai === "ok" ? styles.text6 : styles.text7
                }`}
              >
                {bao.chu}
              </p>
            )}

            <div className={styles.grid4}>
              {/* Nạp / thu hồi coin */}
              <div className={styles.card3}>
                <h2 className={styles.heading}>
                  <Coins size={16} className={styles.box} />
                  Nạp / thu hồi coin
                </h2>

                <input
                  type="number"
                  step={1}
                  value={soCoin}
                  onChange={(e) => setSoCoin(e.target.value)}
                  placeholder="Ví dụ 500"
                  className={styles.input2}
                />
                <p className={styles.text8}>
                  {soHopLe ? (
                    Number(soCoin) > 0 ? (
                      <>
                        Cộng <b>{dinhDang(Number(soCoin))}</b> coin (≈{" "}
                        {dinhDang(Number(soCoin) * 1000)}đ)
                      </>
                    ) : (
                      <>
                        Thu hồi <b>{dinhDang(-Number(soCoin))}</b> coin
                      </>
                    )
                  ) : (
                    "Nhập số nguyên. Số âm là thu hồi."
                  )}
                </p>

                <input
                  value={ghiChuCoin}
                  onChange={(e) => setGhiChuCoin(e.target.value)}
                  placeholder="Ghi chú (không bắt buộc)"
                  maxLength={300}
                  className={styles.input2}
                />

                <button
                  onClick={guiNapCoin}
                  disabled={!soHopLe || dangGui}
                  className={styles.button2}
                >
                  {dangGui ? "Đang xử lý…" : "Xác nhận"}
                </button>
              </div>

              {/* Tặng khoá học */}
              <div className={styles.card3}>
                <h2 className={styles.heading}>
                  <Gift size={16} className={styles.box4} />
                  Tặng khoá học
                </h2>

                <select
                  value={khoaTang}
                  onChange={(e) => setKhoaTang(e.target.value)}
                  className={styles.input2}
                >
                  <option value="">— Chọn khoá học —</option>
                  {dsKhoa.map((k) => (
                    <option key={k._id} value={k._id}>
                      {k.title}
                      {k.price > 0 ? ` (${giaRaCoin(k.price)} coin)` : " (miễn phí)"}
                    </option>
                  ))}
                </select>

                <p className={styles.text8}>
                  Mở khoá thẳng, <b>không trừ coin</b> của học viên.
                </p>

                <button
                  onClick={guiTangKhoa}
                  disabled={!khoaTang || dangGui}
                  className={styles.button3}
                >
                  {dangGui ? "Đang xử lý…" : "Tặng khoá này"}
                </button>
              </div>
            </div>

            {/* Sổ nhật ký */}
            <div className={styles.card4}>
              <h2 className={styles.heading2}>Lịch sử giao dịch</h2>

              {!vi || vi.nhatKy.length === 0 ? (
                <p className={styles.text9}>Chưa có giao dịch nào.</p>
              ) : (
                <div className={styles.box5}>
                  {vi.nhatKy.map((g) => (
                    // hienNguoiTao bat: quan tri can biet dong nghiep nao vua
                    // nap coin cho nguoi nay.
                    <DongGiaoDichCoin key={g._id} giaoDich={g} hienNguoiTao />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ODem({
  nhan,
  chinh,
  phu,
  noiBat,
}: {
  nhan: string;
  chinh: string;
  phu?: string;
  noiBat?: boolean;
}) {
  return (
    <div className={`${styles.box8} ${noiBat ? styles.box6 : styles.box7}`}>
      <p className={styles.text10}>{nhan}</p>
      <p className={styles.text11}>{chinh}</p>
      {phu && <p className={styles.text12}>{phu}</p>}
    </div>
  );
}
