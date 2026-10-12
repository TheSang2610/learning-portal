"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2, MessageCircle, Reply, Send, Trash2 } from "lucide-react";

import { getErrorMessage } from "@/src/services/apiHelper";
import { documentService, type DocumentComment } from "@/src/services/document";
import { relativeTime } from "@/src/lib/post-time";
import { useStoredUser } from "@/src/hooks/userStore";

import styles from "./DocumentComments.module.scss";

const MAX_LENGTH = 2000; // khop MAX_LENGTH trong backend utils/documentComments.js

/** O viet binh luan / tra loi. */
function CommentBox({
  suggest,
  sendButton,
  onSubmit,
  onCancel,
  auto = false,
}: {
  suggest: string;
  sendButton: string;
  onSubmit: (content: string) => Promise<void>;
  onCancel?: () => void;
  auto?: boolean;
}) {
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim().length < 2) return setErrorMessage("Bình luận quá ngắn.");
    setSending(true);
    setErrorMessage("");
    try {
      await onSubmit(content);
      setContent("");
    } catch (err) {
      // Bo loc tu ngu, gioi han toc do (429)... may chu noi ro ly do.
      setErrorMessage(getErrorMessage(err, "Không gửi được bình luận."));
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={send} className={styles.form}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        maxLength={MAX_LENGTH}
        rows={auto ? 2 : 3}
        placeholder={suggest}
        // Mo o tra loi la de go ngay - khong bat bam them mot lan vao o.
        autoFocus={auto}
        className={styles.textarea}
      />
      {errorMessage && (
        <p role="alert" className={styles.loi}>
          {errorMessage}
        </p>
      )}
      <div className={styles.blockedForm}>
        <span className={styles.dem}>
          {content.length}/{MAX_LENGTH}
        </span>
        <div className={styles.formButton}>
          {onCancel && (
            <button type="button" onClick={onCancel} className={styles.cancelButton}>
              Hủy
            </button>
          )}
          <button type="submit" disabled={sending} className={styles.sendButton}>
            {sending ? <Loader2 size={14} className={styles.quay} /> : <Send size={14} />}
            {sendButton}
          </button>
        </div>
      </div>
    </form>
  );
}

export default function DocumentComments({ documentId }: { documentId: string }) {
  const user = useStoredUser();
  const laAdmin = user?.role === "admin";

  const [items, setDs] = useState<DocumentComment[]>([]);
  const [total, setTotal] = useState(0);
  const [postOwner, setPostOwner] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  // Id binh luan GOC dang mo o tra loi. Chi mot o mo mot luc.
  const [replying, setReplying] = useState<string | null>(null);

  const download = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const res = await documentService.getComments(documentId);
      setDs(res.binhLuan ?? []);
      setTotal(res.tong ?? 0);
      setPostOwner(res.chuBai ?? "");
    } catch (err) {
      setErrorMessage(getErrorMessage(err, "Không tải được bình luận."));
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  // Tai lai khi doi nguoi dang nhap: admin thay them binh luan da an, dang xuat
  // thi phai mat di. Hoan mot vong microtask - cung cach faqs/page.tsx, tranh
  // setState dong bo trong than effect (react-hooks/set-state-in-effect).
  const currentUserId = user?._id;
  useEffect(() => {
    void Promise.resolve().then(download);
  }, [download, currentUserId]);

  const writeComment = async (content: string) => {
    const { binhLuan: comment } = await documentService.createComment(
      documentId,
      content,
    );
    setDs((old) => [...old, comment]);
    setTotal((t) => t + 1);
  };

  const reply = async (idGoc: string, content: string) => {
    const { binhLuan: comment } = await documentService.createComment(
      documentId,
      content,
      idGoc,
    );
    // May chu co the gan tra loi vao mot goc KHAC voi idGoc (tra loi vao mot tra
    // loi thi gan vao goc cua no) - dung traLoi ma may chu tra ve.
    const origin = comment.traLoi ?? idGoc;
    setDs((old) =>
      old.map((g) =>
        g._id === origin ? { ...g, cacTraLoi: [...g.cacTraLoi, comment] } : g,
      ),
    );
    setTotal((t) => t + 1);
    setReplying(null);
  };

  const remove = async (b: DocumentComment) => {
    const hasReplies = !b.traLoi && b.cacTraLoi.length > 0;
    if (
      !confirm(
        hasReplies
          ? `Xóa bình luận này và ${b.cacTraLoi.length} trả lời bên dưới?`
          : "Xóa bình luận này?",
      )
    )
      return;
    try {
      await documentService.deleteComment(b._id);
      if (b.traLoi) {
        setDs((old) =>
          old.map((g) =>
            g._id === b.traLoi
              ? { ...g, cacTraLoi: g.cacTraLoi.filter((t) => t._id !== b._id) }
              : g,
          ),
        );
        setTotal((t) => t - 1);
      } else {
        setDs((old) => old.filter((g) => g._id !== b._id));
        setTotal((t) => t - 1 - b.cacTraLoi.length);
      }
    } catch (err) {
      alert(getErrorMessage(err, "Không xóa được bình luận."));
    }
  };

  const toggleHidden = async (b: DocumentComment) => {
    try {
      const { daAn: hidden } = await documentService.setCommentHidden(b._id, !b.daAn);
      const edit = (x: DocumentComment) => (x._id === b._id ? { ...x, daAn: hidden } : x);
      setDs((old) => old.map((g) => ({ ...edit(g), cacTraLoi: g.cacTraLoi.map(edit) })));
    } catch (err) {
      alert(getErrorMessage(err, "Không đổi được trạng thái bình luận."));
    }
  };

  const one = (b: DocumentComment, idGoc: string) => {
    const isMine = Boolean(user && b.user && b.user._id === user._id);
    return (
      <div className={`${styles.mot} ${b.daAn ? styles.daAn : ""}`}>
        <div className={styles.dau}>
          <span className={styles.ten}>{b.user?.name || "Người dùng đã xóa"}</span>
          {b.user && b.user._id === postOwner && (
            <span className={styles.authorLabel}>Tác giả</span>
          )}
          {b.user?.role === "admin" && (
            <span className={styles.adminLabel}>Quản trị</span>
          )}
          {b.daAn && <span className={styles.hiddenLabel}>Đã ẩn</span>}
          <span className={styles.gio}>{relativeTime(b.createdAt)}</span>
        </div>

        {/* {noiDung} - React tu thoat ky tu, binh luan la chu thuong khong phai
            HTML. white-space: pre-wrap o CSS giu xuong dong nguoi viet go. */}
        <p className={styles.noiDung}>{b.noiDung}</p>

        <div className={styles.actions}>
          {user && !b.daAn && (
            <button
              type="button"
              onClick={() => setReplying(replying === idGoc ? null : idGoc)}
              className={styles.smallButton}
            >
              <Reply size={13} />
              Trả lời
            </button>
          )}
          {(isMine || laAdmin) && (
            <button
              type="button"
              onClick={() => remove(b)}
              className={styles.smallButton}
            >
              <Trash2 size={13} />
              Xóa
            </button>
          )}
          {laAdmin && (
            <button
              type="button"
              onClick={() => toggleHidden(b)}
              className={styles.smallButton}
            >
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
        Bình luận {total > 0 && <span className={styles.so}>({total})</span>}
      </h2>

      {user ? (
        <CommentBox
          suggest="Chia sẻ cảm nhận, hỏi thêm về tài liệu, hoặc góp ý cho người đăng…"
          sendButton="Gửi bình luận"
          onSubmit={writeComment}
        />
      ) : (
        <p className={styles.promptLogin}>
          <Link href="/?auth=login" className={styles.loginLink}>
            Đăng nhập
          </Link>{" "}
          để bình luận. Ai cũng đọc được bình luận, kể cả khi chưa có tài khoản.
        </p>
      )}

      {errorMessage && (
        <p role="alert" className={styles.loi}>
          {errorMessage}
        </p>
      )}

      {loading ? (
        <p className={styles.trong}>
          <Loader2 size={16} className={styles.quay} /> Đang tải bình luận…
        </p>
      ) : items.length === 0 ? (
        <p className={styles.trong}>Chưa có bình luận nào. Hãy là người đầu tiên.</p>
      ) : (
        <ul className={styles.danhSach}>
          {items.map((g) => (
            <li key={g._id} className={styles.cum}>
              {one(g, g._id)}

              {(g.cacTraLoi.length > 0 || replying === g._id) && (
                <div className={styles.traLoi}>
                  {g.cacTraLoi.map((t) => (
                    <div key={t._id}>{one(t, g._id)}</div>
                  ))}
                  {replying === g._id && (
                    <CommentBox
                      suggest={`Trả lời ${g.user?.name || "bình luận"}…`}
                      sendButton="Trả lời"
                      onSubmit={(contentText) => reply(g._id, contentText)}
                      onCancel={() => setReplying(null)}
                      auto
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
