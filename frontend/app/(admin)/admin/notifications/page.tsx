"use client";

import { useState } from "react";
import { Bell, Send, TriangleAlert } from "lucide-react";

import { guiThongBaoHeThong } from "@/src/services/notification";

import styles from "./page.module.scss";
const DAI_TIEU_DE = 200;
const DAI_NOI_DUNG = 1000;

export default function AdminThongBaoPage() {
  const [tieuDe, setTieuDe] = useState("");
  const [noiDung, setNoiDung] = useState("");
  const [duongDan, setDuongDan] = useState("");
  const [vaiTro, setVaiTro] = useState<"" | "student" | "instructor">("");

  const [dangGui, setDangGui] = useState(false);
  const [loi, setLoi] = useState("");
  const [xong, setXong] = useState<number | null>(null);

  // Buoc xac nhan la bat buoc, khong phai trang tri.
  //
  // Day la thao tac KHONG HOAN TAC duoc: gui xong la thong bao nam trong chuong
  // cua tat ca moi nguoi, khong co nut thu hoi. Bam nham mot cai la ca he thong
  // nhan mot thong bao viet do dang.
  const [hoiLai, setHoiLai] = useState(false);

  const gui = async () => {
    if (dangGui) return;

    setDangGui(true);
    setLoi("");
    setXong(null);

    try {
      const kq = await guiThongBaoHeThong({
        tieuDe: tieuDe.trim(),
        noiDung: noiDung.trim(),
        duongDan: duongDan.trim(),
        vaiTro,
      });

      setXong(kq.daGui);
      setTieuDe("");
      setNoiDung("");
      setDuongDan("");
    } catch (e) {
      setLoi(e instanceof Error ? e.message : "Không gửi được thông báo.");
    } finally {
      setDangGui(false);
      setHoiLai(false);
    }
  };

  const sanSang = tieuDe.trim().length > 0;

  return (
    <div className={styles.box}>
      <div className={styles.row}>
        <Bell size={22} className={styles.box2} />
        <h1 className={styles.title}>Thông báo hệ thống</h1>
      </div>

      <p className={styles.text}>
        Thông báo gửi từ đây hiện trong chuông của người nhận. Quản trị viên không nhận
        thông báo này.
      </p>

      <div className={styles.card}>
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

        <label className={styles.fieldLabel2}>
          <span className={styles.label}>Gửi cho</span>
          <select
            id="tb-vaitro"
            value={vaiTro}
            onChange={(e) => setVaiTro(e.target.value as typeof vaiTro)}
            className={styles.input}
          >
            <option value="">Tất cả học viên và giảng viên</option>
            <option value="student">Chỉ học viên</option>
            <option value="instructor">Chỉ giảng viên</option>
          </select>
        </label>

        {loi && <p className={styles.text2}>{loi}</p>}

        {xong !== null && (
          <p className={styles.text3}>
            Đã gửi tới <strong className={styles.strong}>{xong}</strong> người.
          </p>
        )}

        {hoiLai ? (
          <div className={styles.card2}>
            <p className={styles.text4}>
              <TriangleAlert size={16} className={styles.box3} />
              <span>
                Thông báo đã gửi thì <strong>không thu hồi được</strong>. Kiểm lại nội
                dung trước khi gửi.
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
                {dangGui ? "Đang gửi…" : "Gửi thật"}
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setHoiLai(true)}
            disabled={!sanSang}
            className={styles.button3}
          >
            <Send size={16} /> Gửi thông báo
          </button>
        )}
      </div>
    </div>
  );
}
