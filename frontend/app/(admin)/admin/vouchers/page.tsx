"use client";

import { useCallback, useEffect, useState } from "react";
import { BadgePercent, Plus, Power, Users } from "lucide-react";

import styles from "./page.module.scss";
import {
  batTatMa,
  danhSachMa,
  luotDungCuaMa,
  suaMa,
  taoMa,
  type LuotDung,
  type MaGiamGia,
  type ThanMaGiamGia,
} from "@/src/services/voucher";

const ngayISO = (lech = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + lech);
  return d.toISOString().slice(0, 10);
};

const MAC_DINH: ThanMaGiamGia = {
  ma: "",
  moTa: "",
  loai: "phanTram",
  giaTri: 10,
  donToiThieu: 0,
  giamToiDa: null,
  batDau: ngayISO(),
  ketThuc: ngayISO(30),
  soLuotToiDa: null,
  moiNguoiMotLan: true,
  hoatDong: true,
};

const dinhDangNgay = (iso: string) => new Date(iso).toLocaleDateString("vi-VN");

// Ma kem co "da het han", tinh MOT LAN luc du lieu ve.
//
// Khong tinh trong luc ve (`new Date(m.ketThuc) < Date.now()` giua JSX): doc
// dong ho la mot phep khong thuan, hai lan ve co the ra hai ket qua khac nhau.
// react-hooks/purity chan dung cho do. Tinh o day thi no la mot gia tri co
// dinh di kem du lieu.
type MaHienThi = MaGiamGia & { hetHan: boolean };

const danhDauHetHan = (ds: MaGiamGia[]): MaHienThi[] => {
  const bayGio = Date.now();
  return ds.map((m) => ({ ...m, hetHan: new Date(m.ketThuc).getTime() < bayGio }));
};

const motMa = (m: MaGiamGia): MaHienThi => danhDauHetHan([m])[0];

export default function AdminMaGiamGiaPage() {
  const [danhSach, setDanhSach] = useState<MaHienThi[]>([]);
  const [dangTai, setDangTai] = useState(true);
  const [loi, setLoi] = useState("");

  const [moForm, setMoForm] = useState(false);
  const [suaId, setSuaId] = useState<string | null>(null);
  const [than, setThan] = useState<ThanMaGiamGia>(MAC_DINH);
  const [dangLuu, setDangLuu] = useState(false);

  const [xemLuot, setXemLuot] = useState<string | null>(null);
  const [luot, setLuot] = useState<{ danhSach: LuotDung[]; tongGiam: number } | null>(
    null,
  );

  const nap = useCallback(async () => {
    setDangTai(true);
    setLoi("");

    try {
      const kq = await danhSachMa(1);
      setDanhSach(danhDauHetHan(kq.danhSach));
    } catch (e) {
      setLoi(e instanceof Error ? e.message : "Không tải được danh sách mã.");
    } finally {
      setDangTai(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(nap);
  }, [nap]);

  const luu = async () => {
    if (dangLuu) return;
    setDangLuu(true);
    setLoi("");

    try {
      if (suaId) {
        // `ma` khong duoc gui khi sua: may chu khong cho doi chuoi ma sau khi
        // da phat, vi doi la lam hong moi cho da chia se ma do.
        const { ma: _bo, ...conLai } = than;
        void _bo;
        const kq = await suaMa(suaId, conLai as ThanMaGiamGia);
        setDanhSach((cu) => cu.map((m) => (m._id === suaId ? motMa(kq.ma) : m)));
      } else {
        const kq = await taoMa(than);
        setDanhSach((cu) => [motMa(kq.ma), ...cu]);
      }

      setMoForm(false);
      setSuaId(null);
      setThan(MAC_DINH);
    } catch (e) {
      setLoi(e instanceof Error ? e.message : "Không lưu được mã giảm giá.");
    } finally {
      setDangLuu(false);
    }
  };

  const batTat = async (id: string) => {
    try {
      const kq = await batTatMa(id);
      setDanhSach((cu) => cu.map((m) => (m._id === id ? motMa(kq.ma) : m)));
    } catch (e) {
      setLoi(e instanceof Error ? e.message : "Không đổi được trạng thái.");
    }
  };

  const moLuot = async (id: string) => {
    setXemLuot(id);
    setLuot(null);

    try {
      setLuot(await luotDungCuaMa(id));
    } catch {
      setLuot({ danhSach: [], tongGiam: 0 });
    }
  };

  return (
    <div className={styles.box}>
      <div className={styles.row}>
        <div className={styles.row2}>
          <BadgePercent size={22} className={styles.box2} />
          <h1 className={styles.title}>Mã giảm giá</h1>
        </div>

        <button
          type="button"
          onClick={() => {
            setSuaId(null);
            setThan(MAC_DINH);
            setMoForm(true);
          }}
          className={styles.button}
        >
          <Plus size={16} /> Tạo mã mới
        </button>
      </div>

      {loi && <p className={styles.text}>{loi}</p>}

      {moForm && (
        <div className={styles.card}>
          <h2 className={styles.heading}>
            {suaId ? "Sửa mã giảm giá" : "Tạo mã giảm giá"}
          </h2>

          <div className={styles.grid}>
            {!suaId && (
              <label className={styles.fieldLabel}>
                <span className={styles.label}>Mã</span>
                <input
                  id="mgg-ma"
                  value={than.ma ?? ""}
                  onChange={(e) =>
                    setThan({ ...than, ma: e.target.value.toUpperCase().slice(0, 32) })
                  }
                  placeholder="GIAM10"
                  className={styles.input}
                />
              </label>
            )}

            <label className={styles.fieldLabel}>
              <span className={styles.label}>Mô tả</span>
              <input
                id="mgg-mota"
                value={than.moTa ?? ""}
                onChange={(e) => setThan({ ...than, moTa: e.target.value })}
                placeholder="Khuyến mãi khai giảng"
                className={styles.input2}
              />
            </label>

            <label className={styles.fieldLabel}>
              <span className={styles.label}>Loại</span>
              <select
                id="mgg-loai"
                value={than.loai}
                onChange={(e) =>
                  setThan({
                    ...than,
                    loai: e.target.value as ThanMaGiamGia["loai"],
                    // Doi sang so tien thi tran giam khong con nghia - xoa luon
                    // de khong luu mot gia tri vo nghia vao CSDL.
                    giamToiDa: e.target.value === "phanTram" ? than.giamToiDa : null,
                  })
                }
                className={styles.input2}
              >
                <option value="phanTram">Phần trăm (%)</option>
                <option value="soTien">Số tiền (đ)</option>
              </select>
            </label>

            <label className={styles.fieldLabel}>
              <span className={styles.label}>
                Giá trị {than.loai === "phanTram" ? "(%)" : "(đ)"}
              </span>
              <input
                id="mgg-giatri"
                type="number"
                min={than.loai === "phanTram" ? 1 : 0}
                max={than.loai === "phanTram" ? 100 : undefined}
                value={than.giaTri}
                onChange={(e) => setThan({ ...than, giaTri: Number(e.target.value) })}
                className={styles.input2}
              />
            </label>

            {/* Tran giam chi co nghia voi ma phan tram. Hien no o ma so tien la
                mot o khong bao gio duoc dung toi - nguoi go se phan van. */}
            {than.loai === "phanTram" && (
              <label className={styles.fieldLabel}>
                <span className={styles.label}>
                  Giảm tối đa (đ) — để trống là không chặn
                </span>
                <input
                  id="mgg-tran"
                  type="number"
                  min={0}
                  value={than.giamToiDa ?? ""}
                  onChange={(e) =>
                    setThan({
                      ...than,
                      giamToiDa: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                  className={styles.input2}
                />
              </label>
            )}

            <label className={styles.fieldLabel}>
              <span className={styles.label}>Đơn tối thiểu (đ)</span>
              <input
                id="mgg-toithieu"
                type="number"
                min={0}
                value={than.donToiThieu ?? 0}
                onChange={(e) =>
                  setThan({ ...than, donToiThieu: Number(e.target.value) })
                }
                className={styles.input2}
              />
            </label>

            <label className={styles.fieldLabel}>
              <span className={styles.label}>Bắt đầu</span>
              <input
                id="mgg-batdau"
                type="date"
                value={(than.batDau ?? "").slice(0, 10)}
                onChange={(e) => setThan({ ...than, batDau: e.target.value })}
                className={styles.input2}
              />
            </label>

            <label className={styles.fieldLabel}>
              <span className={styles.label}>Kết thúc</span>
              <input
                id="mgg-ketthuc"
                type="date"
                value={(than.ketThuc ?? "").slice(0, 10)}
                onChange={(e) => setThan({ ...than, ketThuc: e.target.value })}
                className={styles.input2}
              />
            </label>

            <label className={styles.fieldLabel}>
              <span className={styles.label}>
                Tổng số lượt — để trống là không giới hạn
              </span>
              <input
                id="mgg-soluot"
                type="number"
                min={1}
                value={than.soLuotToiDa ?? ""}
                onChange={(e) =>
                  setThan({
                    ...than,
                    soLuotToiDa: e.target.value ? Number(e.target.value) : null,
                  })
                }
                className={styles.input2}
              />
            </label>

            <label className={styles.fieldLabel2}>
              <input
                id="mgg-motlan"
                type="checkbox"
                checked={than.moiNguoiMotLan !== false}
                onChange={(e) => setThan({ ...than, moiNguoiMotLan: e.target.checked })}
                className={styles.input3}
              />
              <span className={styles.label2}>
                Mỗi người chỉ dùng một lần
                <span className={styles.label3}>
                  (bỏ chọn là một người dùng mã này bao nhiêu lần cũng được)
                </span>
              </span>
            </label>
          </div>

          <div className={styles.row3}>
            <button
              type="button"
              onClick={() => {
                setMoForm(false);
                setSuaId(null);
              }}
              className={styles.button2}
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={luu}
              disabled={dangLuu || (!suaId && !than.ma?.trim())}
              className={styles.button3}
            >
              {dangLuu ? "Đang lưu…" : "Lưu"}
            </button>
          </div>
        </div>
      )}

      {dangTai && <p className={styles.text2}>Đang tải…</p>}

      {!dangTai && danhSach.length === 0 && (
        <div className={styles.card2}>Chưa có mã giảm giá nào.</div>
      )}

      {/* overflow-x-auto: bang nay 7 cot, khong the vua man hinh dien thoai.
          Cuon rieng trong khung chu khong day ca trang di ngang. */}
      {!dangTai && danhSach.length > 0 && (
        <div className={styles.card3}>
          <table className={styles.table}>
            <thead className={styles.thead}>
              <tr>
                <th className={styles.headCell}>Mã</th>
                <th className={styles.headCell}>Giảm</th>
                <th className={styles.headCell}>Điều kiện</th>
                <th className={styles.headCell}>Hiệu lực</th>
                <th className={styles.headCell2}>Đã dùng</th>
                <th className={styles.headCell}>Trạng thái</th>
                <th className={styles.headCell}></th>
              </tr>
            </thead>
            <tbody>
              {danhSach.map((m) => {
                const hetHan = m.hetHan;

                return (
                  <tr key={m._id} className={styles.row4}>
                    <td className={styles.headCell}>
                      <p className={styles.text3}>{m.ma}</p>
                      {m.moTa && <p className={styles.text4}>{m.moTa}</p>}
                    </td>
                    <td className={styles.cell}>
                      {m.loai === "phanTram"
                        ? `${m.giaTri}%`
                        : `${m.giaTri.toLocaleString("vi-VN")}đ`}
                      {m.giamToiDa ? (
                        <span className={styles.label4}>
                          tối đa {m.giamToiDa.toLocaleString("vi-VN")}đ
                        </span>
                      ) : null}
                    </td>
                    <td className={styles.cell2}>
                      {m.donToiThieu > 0
                        ? `Đơn từ ${m.donToiThieu.toLocaleString("vi-VN")}đ`
                        : "Không"}
                      <span className={styles.label5}>
                        {m.moiNguoiMotLan ? "1 lần/người" : "Không giới hạn/người"}
                      </span>
                    </td>
                    <td className={styles.cell3}>
                      {dinhDangNgay(m.batDau)} → {dinhDangNgay(m.ketThuc)}
                    </td>
                    <td className={styles.cell4}>
                      {m.daDung}
                      {m.soLuotToiDa ? ` / ${m.soLuotToiDa}` : ""}
                    </td>
                    <td className={styles.headCell}>
                      {/* Het han va bi tat la HAI chuyen khac nhau: mot cai tu
                          het theo ngay, mot cai do quan tri chu dong tat. Gop
                          lam mot nhan la quan tri khong biet co can bam gi khong. */}
                      <span
                        className={`${styles.label10} ${
                          !m.hoatDong
                            ? styles.label6
                            : hetHan
                              ? styles.label7
                              : styles.label8
                        }`}
                      >
                        {!m.hoatDong ? "Đã tắt" : hetHan ? "Hết hạn" : "Đang chạy"}
                      </span>
                    </td>
                    <td className={styles.headCell}>
                      <div className={styles.row5}>
                        <button
                          type="button"
                          onClick={() => moLuot(m._id)}
                          aria-label="Xem lượt dùng"
                          className={styles.button4}
                        >
                          <Users size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => batTat(m._id)}
                          aria-label={m.hoatDong ? "Tắt mã" : "Bật mã"}
                          className={`${styles.button8} ${
                            m.hoatDong ? styles.button5 : styles.button6
                          }`}
                        >
                          <Power size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {xemLuot && (
        <div className={styles.overlay} onClick={() => setXemLuot(null)}>
          <div className={styles.box3} onClick={(e) => e.stopPropagation()}>
            <div className={styles.row6}>
              <h2 className={styles.text3}>Lượt dùng mã</h2>
              <button
                type="button"
                onClick={() => setXemLuot(null)}
                className={styles.button7}
              >
                ✕
              </button>
            </div>

            {!luot && <p className={styles.text5}>Đang tải…</p>}

            {luot && luot.danhSach.length === 0 && (
              <p className={styles.text5}>Chưa có ai dùng mã này.</p>
            )}

            {luot && luot.danhSach.length > 0 && (
              <>
                <p className={styles.text6}>
                  Tổng đã giảm:{" "}
                  <strong className={styles.strong}>
                    {luot.tongGiam.toLocaleString("vi-VN")}đ
                  </strong>
                </p>
                <div className={styles.scroller}>
                  {luot.danhSach.map((l) => (
                    <div key={l._id} className={styles.row7}>
                      <div className={styles.box4}>
                        <p className={styles.text7}>
                          {l.user?.name || l.user?.email || "Người dùng đã xóa"}
                        </p>
                        <p className={styles.text8}>{l.course?.title || "—"}</p>
                      </div>
                      <span className={styles.label9}>
                        −{l.soTienGiam.toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
