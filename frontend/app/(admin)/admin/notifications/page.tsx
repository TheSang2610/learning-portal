"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Bell,
  Eye,
  EyeOff,
  Megaphone,
  Pencil,
  Send,
  Trash2,
  TriangleAlert,
} from "lucide-react";

import {
  guiThongBaoQuanTri,
  layThongBaoChungQuanTri,
  suaThongBaoQuanTri,
  xoaThongBaoQuanTri,
  type MucDoThongBaoChung,
  type ThongBaoChung,
  type VaiTroNhan,
} from "@/src/services/announcement";

import styles from "./page.module.scss";
const DAI_TIEU_DE = 200;
const DAI_NOI_DUNG = 1000;

const dinhDangNgay = (iso: string) =>
  new Date(iso).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" });

const conHieuLuc = (tb: ThongBaoChung) =>
  Boolean(tb.dangHien) && (!tb.hetHan || new Date(tb.hetHan).getTime() > Date.now());

// <input type="datetime-local"> can chuoi gio dia phuong "YYYY-MM-DDTHH:mm",
// khong nhan ISO co mui gio. Doi khi nap thong bao cu vao form de sua.
const sangGioDiaPhuong = (iso?: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};

const TEN_VAI_TRO: Record<VaiTroNhan, string> = {
  "": "học viên và giảng viên",
  student: "học viên",
  instructor: "giảng viên",
};

export default function AdminThongBaoPage() {
  const [tieuDe, setTieuDe] = useState("");
  const [noiDung, setNoiDung] = useState("");
  const [duongDan, setDuongDan] = useState("");
  const [vaiTro, setVaiTro] = useState<VaiTroNhan>("");

  // Hai kenh doc lap. Mac dinh chi gui chuong nhu truoc day, de quan tri quen
  // tay khong vo tinh dang len dau trang cho ca khach thay.
  const [guiChuong, setGuiChuong] = useState(true);
  const [hienCongKhai, setHienCongKhai] = useState(false);
  const [mucDo, setMucDo] = useState<MucDoThongBaoChung>("thong_tin");
  const [hetHan, setHetHan] = useState("");

  // Dang sua dot nao (null = dang soan dot moi).
  const [dangSua, setDangSua] = useState<ThongBaoChung | null>(null);

  const [dangGui, setDangGui] = useState(false);
  const [loi, setLoi] = useState("");
  const [ketQua, setKetQua] = useState("");

  const [danhSach, setDanhSach] = useState<ThongBaoChung[]>([]);
  const [dangXuLy, setDangXuLy] = useState<string | null>(null);
  const [hoiXoa, setHoiXoa] = useState<string | null>(null);

  // Buoc xac nhan truoc khi gui: gui xong la moi nguoi thay ngay. Van sua va
  // thu hoi duoc, nhung trong luc chua kip sua thi ai dang mo trang cung da doc.
  const [hoiLai, setHoiLai] = useState(false);

  const taiDanhSach = useCallback(async () => {
    try {
      const kq = await layThongBaoChungQuanTri();
      setDanhSach(kq.danhSach ?? []);
    } catch {
      // Danh sach chi de xem va thao tac; tai hong thi de trong, form van dung duoc.
      setDanhSach([]);
    }
  }, []);

  // Lan tai dau viet bang .then chu khong goi taiDanhSach(): goi mot ham co
  // setState ngay trong effect bi lint react-hooks/set-state-in-effect chan.
  useEffect(() => {
    let huy = false;
    layThongBaoChungQuanTri()
      .then((kq) => {
        if (!huy) setDanhSach(kq.danhSach ?? []);
      })
      .catch(() => undefined);
    return () => {
      huy = true;
    };
  }, []);

  const datLaiForm = () => {
    setTieuDe("");
    setNoiDung("");
    setDuongDan("");
    setHetHan("");
    setMucDo("thong_tin");
    setDangSua(null);
    setHoiLai(false);
  };

  const batDauSua = (tb: ThongBaoChung) => {
    setDangSua(tb);
    setTieuDe(tb.tieuDe);
    setNoiDung(tb.noiDung ?? "");
    setDuongDan(tb.duongDan ?? "");
    setMucDo(tb.mucDo ?? "thong_tin");
    setHetHan(sangGioDiaPhuong(tb.hetHan));
    setHienCongKhai(Boolean(tb.dangHien));
    setLoi("");
    setKetQua("");
    setHoiLai(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const noiDungForm = () => ({
    tieuDe: tieuDe.trim(),
    noiDung: noiDung.trim(),
    duongDan: duongDan.trim(),
    mucDo,
    // Gio dia phuong tu o nhap -> ISO, de may chu nhan dung thoi diem.
    hetHan: hetHan ? new Date(hetHan).toISOString() : "",
  });

  const gui = async () => {
    if (dangGui) return;
    setDangGui(true);
    setLoi("");
    setKetQua("");

    try {
      if (dangSua) {
        const kq = await suaThongBaoQuanTri(dangSua._id, {
          ...noiDungForm(),
          hienDauTrang: hienCongKhai,
        });
        setKetQua(
          dangSua.guiChuong
            ? `Đã lưu. Cập nhật luôn trong chuông của ${kq.daCapNhat} người.`
            : "Đã lưu thay đổi.",
        );
      } else {
        const kq = await guiThongBaoQuanTri({
          ...noiDungForm(),
          hienDauTrang: hienCongKhai,
          guiChuong,
          vaiTro,
        });
        const phan: string[] = [];
        if (hienCongKhai) phan.push("đã ghim vào chuông của mọi người");
        if (guiChuong) phan.push(`đã gửi vào chuông của ${kq.daGui} người`);
        setKetQua(`Xong: ${phan.join(", ")}.`);
      }
      datLaiForm();
      await taiDanhSach();
    } catch (e) {
      setLoi(e instanceof Error ? e.message : "Không gửi được thông báo.");
    } finally {
      setDangGui(false);
      setHoiLai(false);
    }
  };

  const batTatDauTrang = async (tb: ThongBaoChung) => {
    if (dangXuLy) return;
    setDangXuLy(tb._id);
    setLoi("");
    try {
      await suaThongBaoQuanTri(tb._id, {
        tieuDe: tb.tieuDe,
        noiDung: tb.noiDung,
        duongDan: tb.duongDan,
        mucDo: tb.mucDo,
        // Giu han cu chi khi con o tuong lai; da qua han thi bo, khong may chu
        // tu choi vi "ngay het han phai o sau hien tai".
        hetHan: tb.hetHan && new Date(tb.hetHan).getTime() > Date.now() ? tb.hetHan : "",
        hienDauTrang: !tb.dangHien,
      });
      await taiDanhSach();
    } catch (e) {
      setLoi(e instanceof Error ? e.message : "Không đổi được trạng thái.");
    } finally {
      setDangXuLy(null);
    }
  };

  const xoa = async (tb: ThongBaoChung) => {
    if (dangXuLy) return;
    setDangXuLy(tb._id);
    setLoi("");
    try {
      const kq = await xoaThongBaoQuanTri(tb._id);
      setKetQua(
        tb.guiChuong
          ? `Đã thu hồi "${tb.tieuDe}" khỏi chuông của ${kq.daThuHoi} người.`
          : `Đã xóa "${tb.tieuDe}".`,
      );
      if (dangSua?._id === tb._id) datLaiForm();
      await taiDanhSach();
    } catch (e) {
      setLoi(e instanceof Error ? e.message : "Không xóa được thông báo.");
    } finally {
      setDangXuLy(null);
      setHoiXoa(null);
    }
  };

  const sanSang =
    tieuDe.trim().length > 0 && (dangSua ? true : guiChuong || hienCongKhai);

  return (
    <div className={styles.box}>
      <div className={styles.row}>
        <Bell size={22} className={styles.box2} />
        <h1 className={styles.title}>Thông báo hệ thống</h1>
      </div>

      <p className={styles.text}>
        Thông báo hiện trong ô chuông. Gửi riêng cho học viên hoặc giảng viên, hoặc ghim
        một thông báo chung cho mọi người. Đã gửi rồi vẫn sửa hoặc thu hồi được ở danh
        sách bên dưới.
      </p>

      <div className={styles.card}>
        {dangSua && (
          <p className={styles.editing}>
            <Pencil size={14} /> Đang sửa: <strong>{dangSua.tieuDe}</strong>
          </p>
        )}

        <label className={styles.fieldLabel}>
          <span className={styles.label}>Tiêu đề</span>
          <input
            id="tb-tieude"
            value={tieuDe}
            onChange={(e) => setTieuDe(e.target.value.slice(0, DAI_TIEU_DE))}
            placeholder="Hệ thống bảo trì tối nay"
            className={styles.input}
          />
          <span className={styles.label2}>
            {tieuDe.length}/{DAI_TIEU_DE}
          </span>
        </label>

        <label className={styles.fieldLabel}>
          <span className={styles.label}>Nội dung</span>
          <textarea
            id="tb-noidung"
            value={noiDung}
            onChange={(e) => setNoiDung(e.target.value.slice(0, DAI_NOI_DUNG))}
            rows={4}
            placeholder="Hệ thống sẽ bảo trì từ 23h đến 1h sáng mai."
            className={styles.textarea}
          />
          <span className={styles.label2}>
            {noiDung.length}/{DAI_NOI_DUNG}
          </span>
        </label>

        <label className={styles.fieldLabel}>
          <span className={styles.label}>Đường dẫn khi bấm vào (tùy chọn)</span>
          <input
            id="tb-duongdan"
            value={duongDan}
            onChange={(e) => setDuongDan(e.target.value)}
            placeholder="/courses"
            className={styles.input}
          />
          {/* May chu CHAN moi dia chi ben ngoai (xem duongDanNoiBo trong
              notificationContent.js). Noi truoc o day de quan tri khong go mot dia
              chi ngoai roi thac mac vi sao lien ket bien mat. */}
          <span className={styles.label3}>
            Chỉ nhận đường dẫn trong trang, bắt đầu bằng dấu gạch chéo. Địa chỉ bên ngoài
            sẽ bị bỏ.
          </span>
        </label>

        <fieldset className={styles.channels}>
          <legend className={styles.label}>Hiện ở đâu</legend>

          {dangSua ? (
            // Luc sua khong gui them chuong cho nguoi moi: sua la sua dot cu.
            <p className={styles.checkHint}>
              {dangSua.guiChuong
                ? `Đã gửi vào chuông của ${dangSua.soNguoiNhan ?? 0} người — sửa ở đây sẽ cập nhật luôn trong chuông của họ.`
                : "Đợt này không gửi vào chuông."}
            </p>
          ) : (
            <>
              <label className={styles.check}>
                <input
                  id="tb-kenh-chuong"
                  type="checkbox"
                  checked={guiChuong}
                  onChange={(e) => setGuiChuong(e.target.checked)}
                />
                <span>
                  <strong>Chuông thông báo</strong>
                  <span className={styles.checkHint}>
                    Chỉ người đã đăng nhập thấy. Sửa hoặc thu hồi được sau khi gửi.
                  </span>
                </span>
              </label>

              {guiChuong && (
                <label className={styles.subField}>
                  <span className={styles.label}>Gửi cho</span>
                  <select
                    id="tb-vaitro"
                    value={vaiTro}
                    onChange={(e) => setVaiTro(e.target.value as VaiTroNhan)}
                    className={styles.input}
                  >
                    <option value="">Tất cả học viên và giảng viên</option>
                    <option value="student">Chỉ học viên</option>
                    <option value="instructor">Chỉ giảng viên</option>
                  </select>
                </label>
              )}
            </>
          )}

          <label className={styles.check}>
            <input
              id="tb-kenh-congkhai"
              type="checkbox"
              checked={hienCongKhai}
              onChange={(e) => setHienCongKhai(e.target.checked)}
            />
            <span>
              <strong>Thông báo chung cho mọi người</strong>
              <span className={styles.checkHint}>
                Ghim ở đầu ô chuông của mọi người đã đăng nhập, kể cả người mới đăng ký
                sau này. Bỏ ghim hoặc xóa được bất cứ lúc nào.
              </span>
            </span>
          </label>

          {hienCongKhai && (
            <div className={styles.subGrid}>
              <label className={styles.subField}>
                <span className={styles.label}>Mức độ</span>
                <select
                  id="tb-mucdo"
                  value={mucDo}
                  onChange={(e) => setMucDo(e.target.value as MucDoThongBaoChung)}
                  className={styles.input}
                >
                  <option value="thong_tin">Thông tin (biểu tượng xanh)</option>
                  <option value="quan_trong">Quan trọng (biểu tượng đỏ)</option>
                </select>
              </label>
              <label className={styles.subField}>
                <span className={styles.label}>Tự ẩn lúc (tùy chọn)</span>
                <input
                  id="tb-hethan"
                  type="datetime-local"
                  value={hetHan}
                  onChange={(e) => setHetHan(e.target.value)}
                  className={styles.input}
                />
              </label>
            </div>
          )}
        </fieldset>

        {loi && <p className={styles.text2}>{loi}</p>}

        {ketQua && <p className={styles.text3}>{ketQua}</p>}

        {hoiLai ? (
          <div className={styles.card2}>
            <p className={styles.text4}>
              <TriangleAlert size={16} className={styles.box3} />
              <span>
                {dangSua
                  ? "Thay đổi sẽ hiện ngay với mọi người đã nhận thông báo này."
                  : "Thông báo sẽ hiện ngay với người nhận. Vẫn sửa hoặc thu hồi được sau."}{" "}
                Kiểm lại nội dung trước khi gửi.
              </span>
            </p>
            <div className={styles.row2}>
              <button
                type="button"
                onClick={() => setHoiLai(false)}
                className={styles.button}
              >
                Quay lại sửa
              </button>
              <button
                type="button"
                onClick={gui}
                disabled={dangGui}
                className={styles.button2}
              >
                {dangGui ? "Đang lưu…" : dangSua ? "Lưu thật" : "Gửi thật"}
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.row2Start}>
            <button
              type="button"
              onClick={() => setHoiLai(true)}
              disabled={!sanSang}
              className={styles.button3}
            >
              {dangSua ? (
                <>
                  <Pencil size={16} /> Lưu thay đổi
                </>
              ) : (
                <>
                  <Send size={16} /> Gửi thông báo
                </>
              )}
            </button>
            {dangSua && (
              <button type="button" onClick={datLaiForm} className={styles.button}>
                Hủy sửa
              </button>
            )}
          </div>
        )}
      </div>

      <section className={styles.listCard} aria-labelledby="tb-dasgui-tieude">
        <div className={styles.row}>
          <Megaphone size={20} className={styles.box2} />
          <h2 id="tb-dasgui-tieude" className={styles.listTitle}>
            Thông báo đã gửi
          </h2>
        </div>

        {danhSach.length === 0 ? (
          <p className={styles.empty}>Chưa gửi thông báo nào từ trang này.</p>
        ) : (
          <ul className={styles.list}>
            {danhSach.map((tb) => {
              const dangHienNgoai = conHieuLuc(tb);
              return (
                <li key={tb._id} className={styles.item}>
                  <div className={styles.itemMain}>
                    <div className={styles.badges}>
                      {dangHienNgoai && (
                        <span
                          className={
                            tb.mucDo === "quan_trong"
                              ? styles.badgeImportant
                              : styles.badgeInfo
                          }
                        >
                          Đang ghim cho mọi người
                        </span>
                      )}
                      {tb.guiChuong && (
                        <span className={styles.badgeBell}>
                          Chuông · {tb.soNguoiNhan ?? 0} {TEN_VAI_TRO[tb.vaiTro ?? ""]}
                        </span>
                      )}
                      {!dangHienNgoai && !tb.guiChuong && (
                        <span className={styles.badgeMuted}>Đã ẩn</span>
                      )}
                    </div>
                    <strong className={styles.itemTitle}>{tb.tieuDe}</strong>
                    {tb.noiDung && <p className={styles.itemBody}>{tb.noiDung}</p>}
                    <span className={styles.itemMeta}>
                      Gửi {dinhDangNgay(tb.createdAt)}
                      {tb.dangHien && tb.hetHan
                        ? ` · tự ẩn ${dinhDangNgay(tb.hetHan)}`
                        : ""}
                    </span>
                  </div>

                  {hoiXoa === tb._id ? (
                    <div className={styles.actions}>
                      <span className={styles.confirmText}>
                        {tb.guiChuong
                          ? `Thu hồi khỏi chuông của ${tb.soNguoiNhan ?? 0} người?`
                          : "Xóa thông báo này?"}
                      </span>
                      <button
                        type="button"
                        onClick={() => setHoiXoa(null)}
                        className={styles.button}
                      >
                        Không
                      </button>
                      <button
                        type="button"
                        onClick={() => xoa(tb)}
                        disabled={dangXuLy === tb._id}
                        className={styles.buttonDanger}
                      >
                        {dangXuLy === tb._id ? "Đang xóa…" : "Xóa"}
                      </button>
                    </div>
                  ) : (
                    <div className={styles.actions}>
                      <button
                        type="button"
                        onClick={() => batDauSua(tb)}
                        className={styles.button}
                      >
                        <Pencil size={14} /> Sửa
                      </button>
                      <button
                        type="button"
                        onClick={() => batTatDauTrang(tb)}
                        disabled={dangXuLy === tb._id}
                        className={styles.button}
                      >
                        {tb.dangHien ? (
                          <>
                            <EyeOff size={14} /> Bỏ ghim
                          </>
                        ) : (
                          <>
                            <Eye size={14} /> Ghim lại
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setHoiXoa(tb._id)}
                        className={styles.buttonDangerGhost}
                      >
                        <Trash2 size={14} /> {tb.guiChuong ? "Thu hồi" : "Xóa"}
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
