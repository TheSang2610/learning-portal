"use client";

import { useCallback, useEffect, useState } from "react";

import { ADMIN_NOTIFICATIONS as C } from "@/src/constants/admin/notifications-page";
import {
  sendAdminAnnouncement,
  getAdminAnnouncements,
  editAdminAnnouncement,
  deleteAdminAnnouncement,
  type AnnouncementLevel,
  type Announcement,
  type RecipientRole,
} from "@/src/services/announcement";

// <input type="datetime-local"> can chuoi gio dia phuong "YYYY-MM-DDTHH:mm",
// khong nhan ISO co mui gio. Doi khi nap thong bao cu vao form de sua.
const toLocalTime = (iso?: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};

/** Soan / sua / gui thong bao he thong, bat tat ghim, thu hoi. */
export function useAdminAnnouncements() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [path, setPath] = useState("");
  const [role, setRole] = useState<RecipientRole>("");

  // Hai kenh doc lap. Mac dinh chi gui chuong nhu truoc day, de quan tri quen
  // tay khong vo tinh dang len dau trang cho ca khach thay.
  const [sendBell, setSendBell] = useState(true);
  const [showPublic, setShowPublic] = useState(false);
  const [level, setLevel] = useState<AnnouncementLevel>("thong_tin");
  const [expiresAt, setExpiresAt] = useState("");

  // Dang sua dot nao (null = dang soan dot moi).
  const [editing, setEditing] = useState<Announcement | null>(null);

  const [sending, setSending] = useState(false);
  const [err, setErr] = useState("");
  const [result, setResult] = useState("");

  const [list, setList] = useState<Announcement[]>([]);
  const [processing, setProcessing] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  // Buoc xac nhan truoc khi gui: gui xong la moi nguoi thay ngay. Van sua va
  // thu hoi duoc, nhung trong luc chua kip sua thi ai dang mo trang cung da doc.
  const [confirmAgain, setConfirmAgain] = useState(false);

  const loadList = useCallback(async () => {
    try {
      const outcome = await getAdminAnnouncements();
      setList(outcome.danhSach ?? []);
    } catch {
      // Danh sach chi de xem va thao tac; tai hong thi de trong, form van dung duoc.
      setList([]);
    }
  }, []);

  // Lan tai dau viet bang .then chu khong goi loadList(): goi mot ham co
  // setState ngay trong effect bi lint react-hooks/set-state-in-effect chan.
  useEffect(() => {
    let cancel = false;
    getAdminAnnouncements()
      .then((outcome) => {
        if (!cancel) setList(outcome.danhSach ?? []);
      })
      .catch(() => undefined);
    return () => {
      cancel = true;
    };
  }, []);

  const resetForm = () => {
    setTitle("");
    setContent("");
    setPath("");
    setExpiresAt("");
    setLevel("thong_tin");
    setEditing(null);
    setConfirmAgain(false);
  };

  const startEdit = (tb: Announcement) => {
    setEditing(tb);
    setTitle(tb.tieuDe);
    setContent(tb.noiDung ?? "");
    setPath(tb.duongDan ?? "");
    setLevel(tb.mucDo ?? "thong_tin");
    setExpiresAt(toLocalTime(tb.hetHan));
    setShowPublic(Boolean(tb.dangHien));
    setErr("");
    setResult("");
    setConfirmAgain(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const formContent = () => ({
    tieuDe: title.trim(),
    noiDung: content.trim(),
    duongDan: path.trim(),
    mucDo: level,
    // Gio dia phuong tu o nhap -> ISO, de may chu nhan dung thoi diem.
    hetHan: expiresAt ? new Date(expiresAt).toISOString() : "",
  });

  const send = async () => {
    if (sending) return;
    setSending(true);
    setErr("");
    setResult("");

    try {
      if (editing) {
        const outcome = await editAdminAnnouncement(editing._id, {
          ...formContent(),
          hienDauTrang: showPublic,
        });
        setResult(
          editing.guiChuong
            ? C.messages.savedWithBell(outcome.daCapNhat)
            : C.messages.saved,
        );
      } else {
        const outcome = await sendAdminAnnouncement({
          ...formContent(),
          hienDauTrang: showPublic,
          guiChuong: sendBell,
          vaiTro: role,
        });
        const part: string[] = [];
        if (showPublic) part.push(C.messages.pinnedAll);
        if (sendBell) part.push(C.messages.sentTo(outcome.daGui));
        setResult(C.messages.done(part.join(", ")));
      }
      resetForm();
      await loadList();
    } catch (e) {
      setErr(e instanceof Error ? e.message : C.messages.sendFailed);
    } finally {
      setSending(false);
      setConfirmAgain(false);
    }
  };

  const togglePinned = async (tb: Announcement) => {
    if (processing) return;
    setProcessing(tb._id);
    setErr("");
    try {
      await editAdminAnnouncement(tb._id, {
        tieuDe: tb.tieuDe,
        noiDung: tb.noiDung,
        duongDan: tb.duongDan,
        mucDo: tb.mucDo,
        // Giu han cu chi khi con o tuong lai; da qua han thi bo, khong may chu
        // tu choi vi "ngay het han phai o sau hien tai".
        hetHan: tb.hetHan && new Date(tb.hetHan).getTime() > Date.now() ? tb.hetHan : "",
        hienDauTrang: !tb.dangHien,
      });
      await loadList();
    } catch (e) {
      setErr(e instanceof Error ? e.message : C.messages.toggleFailed);
    } finally {
      setProcessing(null);
    }
  };

  const remove = async (tb: Announcement) => {
    if (processing) return;
    setProcessing(tb._id);
    setErr("");
    try {
      const outcome = await deleteAdminAnnouncement(tb._id);
      setResult(
        tb.guiChuong
          ? C.messages.recalled(tb.tieuDe, outcome.daThuHoi)
          : C.messages.deleted(tb.tieuDe),
      );
      if (editing?._id === tb._id) resetForm();
      await loadList();
    } catch (e) {
      setErr(e instanceof Error ? e.message : C.messages.deleteFailed);
    } finally {
      setProcessing(null);
      setPendingDelete(null);
    }
  };

  const ready = title.trim().length > 0 && (editing ? true : sendBell || showPublic);

  return {
    tieuDe: title,
    setTitle: (v: string) => setTitle(v.slice(0, C.maxTitle)),
    noiDung: content,
    setContent: (v: string) => setContent(v.slice(0, C.maxBody)),
    duongDan: path,
    setPath,
    vaiTro: role,
    setRole,
    guiChuong: sendBell,
    setSendBell,
    showPublic,
    setShowPublic,
    mucDo: level,
    setLevel,
    hetHan: expiresAt,
    setExpiresAt,
    editing,
    sending,
    loi: err,
    ketQua: result,
    danhSach: list,
    processing,
    pendingDelete,
    setPendingDelete,
    confirmAgain,
    setConfirmAgain,
    ready,
    resetForm,
    startEdit,
    gui: send,
    togglePinned,
    xoa: remove,
  };
}

export type AdminAnnouncementsState = ReturnType<typeof useAdminAnnouncements>;
