"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2, MessageCircle, Reply, Send, Trash2 } from "lucide-react";

import { getErrorMessage } from "@/src/services/apiHelper";
import { documentService, type DocumentComment } from "@/src/services/document";
import { thoiGianTuongDoi } from "@/src/components/common/time";
import { useNguoiDungLuu } from "@/src/hooks/userStore";

import styles from "./DocumentComments.module.scss";

const DAI_TOI_DA = 2000; // khop DAI_TOI_DA trong backend utils/documentComments.js

/** O viet binh luan / tra loi. */
function OViet({
  goiY,
  nutGui,
  khiGui,
  khiHuy,
  tuDong = false,
}: {
  goiY: string;
  nutGui: string;
  khiGui: (noiDung: string) => Promise<void>;
  khiHuy?: () => void;
  tuDong?: boolean;
}) {
  const [noiDung, setNoiDung] = useState("");
  const [dangGui, setDangGui] = useState(false);
  const [loi, setLoi] = useState("");

  const gui = async (e: React.FormEvent) => {
    e.preventDefault();
    if (noiDung.trim().length < 2) return setLoi("Bình luận quá ngắn.");
    setDangGui(true);
    setLoi("");
    try {
      await khiGui(noiDung);
      setNoiDung("");
    } catch (err) {
      // Bo loc tu ngu, gioi han toc do (429)... may chu noi ro ly do.
      setLoi(getErrorMessage(err, "Không gửi được bình luận."));
    } finally {
      setDangGui(false);
    }
  };

  return (
    <form onSubmit={gui} className={styles.form}>
      <textarea
        value={noiDung}
        onChange={(e) => setNoiDung(e.target.value)}
        maxLength={DAI_TOI_DA}
        rows={tuDong ? 2 : 3}
        placeholder={goiY}
        // Mo o tra loi la de go ngay - khong bat bam them mot lan vao o.
        autoFocus={tuDong}
        className={styles.textarea}
      />
      {loi && (
        <p role="alert" className={styles.loi}>
          {loi}
        </p>
      )}
      <div className={styles.formChan}>
        <span className={styles.dem}>
          {noiDung.length}/{DAI_TOI_DA}
        </span>
        <div className={styles.formNut}>
          {khiHuy && (
            <button type="button" onClick={khiHuy} className={styles.nutHuy}>
              Hủy
            </button>
          )}
          <button type="submit" disabled={dangGui} className={styles.nutGui}>
            {dangGui ? <Loader2 size={14} className={styles.quay} /> : <Send size={14} />}
            {nutGui}
          </button>
        </div>
      </div>
    </form>
  );
}

export default function DocumentComments({ docId }: { docId: string }) {
  const user = useNguoiDungLuu();
  const laAdmin = user?.role === "admin";

  const [ds, setDs] = useState<DocumentComment[]>([]);
  const [tong, setTong] = useState(0);
  const [chuBai, setChuBai] = useState("");
  const [dangTai, setDangTai] = useState(true);
  const [loi, setLoi] = useState("");
  // Id binh luan GOC dang mo o tra loi. Chi mot o mo mot luc.
  const [dangTraLoi, setDangTraLoi] = useState<string | null>(null);

  const tai = useCallback(async () => {
    setDangTai(true);
    setLoi("");
    try {
      const res = await documentService.getComments(docId);
      setDs(res.binhLuan ?? []);
      setTong(res.tong ?? 0);
      setChuBai(res.chuBai ?? "");
    } catch (err) {
      setLoi(getErrorMessage(err, "Không tải được bình luận."));
    } finally {
      setDangTai(false);
    }
  }, [docId]);

  // Tai lai khi doi nguoi dang nhap: admin thay them binh luan da an, dang xuat
  // thi phai mat di. Hoan mot vong microtask - cung cach faqs/page.tsx, tranh
  // setState dong bo trong than effect (react-hooks/set-state-in-effect).
  const idNguoiDung = user?._id;
  useEffect(() => {
    void Promise.resolve().then(tai);
  }, [tai, idNguoiDung]);

  const vietBinhLuan = async (noiDung: string) => {
    const { binhLuan } = await documentService.createComment(docId, noiDung);
    setDs((cu) => [...cu, binhLuan]);
    setTong((t) => t + 1);
  };

  const traLoi = async (idGoc: string, noiDung: string) => {
    const { binhLuan } = await documentService.createComment(docId, noiDung, idGoc);
    // May chu co the gan tra loi vao mot goc KHAC voi idGoc (tra loi vao mot tra
    // loi thi gan vao goc cua no) - dung traLoi ma may chu tra ve.
    const goc = binhLuan.traLoi ?? idGoc;
    setDs((cu) =>
      cu.map((g) =>
        g._id === goc ? { ...g, cacTraLoi: [...g.cacTraLoi, binhLuan] } : g,
      ),
    );
    setTong((t) => t + 1);
    setDangTraLoi(null);
  };

  const xoa = async (b: DocumentComment) => {
    const coTraLoi = !b.traLoi && b.cacTraLoi.length > 0;
    if (
      !confirm(
        coTraLoi
          ? `Xóa bình luận này và ${b.cacTraLoi.length} trả lời bên dưới?`
          : "Xóa bình luận này?",
      )
    )
      return;
    try {
      await documentService.deleteComment(b._id);
      if (b.traLoi) {
        setDs((cu) =>
          cu.map((g) =>
            g._id === b.traLoi
              ? { ...g, cacTraLoi: g.cacTraLoi.filter((t) => t._id !== b._id) }
              : g,
          ),
        );
        setTong((t) => t - 1);
      } else {
        setDs((cu) => cu.filter((g) => g._id !== b._id));
        setTong((t) => t - 1 - b.cacTraLoi.length);
      }
    } catch (err) {
      alert(getErrorMessage(err, "Không xóa được bình luận."));
    }
  };

  const doiAn = async (b: DocumentComment) => {
    try {
      const { daAn } = await documentService.setCommentHidden(b._id, !b.daAn);
      const sua = (x: DocumentComment) => (x._id === b._id ? { ...x, daAn } : x);
      setDs((cu) => cu.map((g) => ({ ...sua(g), cacTraLoi: g.cacTraLoi.map(sua) })));
    } catch (err) {
      alert(getErrorMessage(err, "Không đổi được trạng thái bình luận."));
    }
  };

  const mot = (b: DocumentComment, idGoc: string) => {
    const laCuaMinh = Boolean(user && b.user && b.user._id === user._id);
    return (
      <div className={`${styles.mot} ${b.daAn ? styles.daAn : ""}`}>
        <div className={styles.dau}>
          <span className={styles.ten}>{b.user?.name || "Người dùng đã xóa"}</span>
          {b.user && b.user._id === chuBai && (
            <span className={styles.nhanTacGia}>Tác giả</span>
          )}
          {b.user?.role === "admin" && <span className={styles.nhanAdmin}>Quản trị</span>}
          {b.daAn && <span className={styles.nhanAn}>Đã ẩn</span>}
          <span className={styles.gio}>{thoiGianTuongDoi(b.createdAt)}</span>
        </div>

        {/* {noiDung} - React tu thoat ky tu, binh luan la chu thuong khong phai
            HTML. white-space: pre-wrap o CSS giu xuong dong nguoi viet go. */}
        <p className={styles.noiDung}>{b.noiDung}</p>

        <div className={styles.thaoTac}>
          {user && !b.daAn && (
            <button
              type="button"
              onClick={() => setDangTraLoi(dangTraLoi === idGoc ? null : idGoc)}
              className={styles.nutNho}
            >
              <Reply size={13} />
              Trả lời
            </button>
          )}
          {(laCuaMinh || laAdmin) && (
            <button type="button" onClick={() => xoa(b)} className={styles.nutNho}>
              <Trash2 size={13} />
              Xóa
            </button>
          )}
          {laAdmin && (
            <button type="button" onClick={() => doiAn(b)} className={styles.nutNho}>
              {b.daAn ? <Eye size={13} /> : <EyeOff size={13} />}
              {b.daAn ? "Hiện lại" : "Ẩn"}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <section className={styles.khung} aria-labelledby="tieu-de-binh-luan">
      <h2 id="tieu-de-binh-luan" className={styles.tieuDe}>
        <MessageCircle size={18} />
        Bình luận {tong > 0 && <span className={styles.so}>({tong})</span>}
      </h2>

      {user ? (
        <OViet
          goiY="Chia sẻ cảm nhận, hỏi thêm về tài liệu, hoặc góp ý cho người đăng…"
          nutGui="Gửi bình luận"
          khiGui={vietBinhLuan}
        />
      ) : (
        <p className={styles.moiDangNhap}>
          <Link href="/?auth=login" className={styles.linkDangNhap}>
            Đăng nhập
          </Link>{" "}
          để bình luận. Ai cũng đọc được bình luận, kể cả khi chưa có tài khoản.
        </p>
      )}

      {loi && (
        <p role="alert" className={styles.loi}>
          {loi}
        </p>
      )}

      {dangTai ? (
        <p className={styles.trong}>
          <Loader2 size={16} className={styles.quay} /> Đang tải bình luận…
        </p>
      ) : ds.length === 0 ? (
        <p className={styles.trong}>Chưa có bình luận nào. Hãy là người đầu tiên.</p>
      ) : (
        <ul className={styles.danhSach}>
          {ds.map((g) => (
            <li key={g._id} className={styles.cum}>
              {mot(g, g._id)}

              {(g.cacTraLoi.length > 0 || dangTraLoi === g._id) && (
                <div className={styles.traLoi}>
                  {g.cacTraLoi.map((t) => (
                    <div key={t._id}>{mot(t, g._id)}</div>
                  ))}
                  {dangTraLoi === g._id && (
                    <OViet
                      goiY={`Trả lời ${g.user?.name || "bình luận"}…`}
                      nutGui="Trả lời"
                      khiGui={(nd) => traLoi(g._id, nd)}
                      khiHuy={() => setDangTraLoi(null)}
                      tuDong
                    />
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
