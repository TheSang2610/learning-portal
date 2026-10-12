"use client";

import { useCallback, useEffect, useState } from "react";

import { ADMIN_VOUCHERS as C } from "@/src/constants/admin/vouchers-page";
import {
  toggleVoucher,
  listVouchers,
  voucherUsage,
  editVoucher,
  generateCode,
  type Usage,
  type Voucher,
  type VoucherPayload,
} from "@/src/services/voucher";

const isoDate = (lech = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + lech);
  return d.toISOString().slice(0, 10);
};

/** Bieu mau ma moi (tinh mot lan luc nap module, nhu ban cu). */
export const DEFAULTS: VoucherPayload = {
  ma: "",
  moTa: "",
  loai: "phanTram",
  giaTri: 10,
  donToiThieu: 0,
  giamToiDa: null,
  batDau: isoDate(),
  ketThuc: isoDate(C.defaultDays),
  soLuotToiDa: null,
  moiNguoiMotLan: true,
  hoatDong: true,
};

// Ma kem co "da het han", tinh MOT LAN luc du lieu ve.
//
// Khong tinh trong luc ve (`new Date(m.ketThuc) < Date.now()` giua JSX): doc
// dong ho la mot phep khong thuan, hai lan ve co the ra hai ket qua khac nhau.
// react-hooks/purity chan dung cho do. Tinh o day thi no la mot gia tri co
// dinh di kem du lieu.
export type VoucherView = Voucher & { hetHan: boolean };

const markExpired = (items: Voucher[]): VoucherView[] => {
  const now = Date.now();
  return items.map((m) => ({ ...m, hetHan: new Date(m.ketThuc).getTime() < now }));
};

const oneVoucher = (m: Voucher): VoucherView => markExpired([m])[0];

/** Danh sach ma giam gia, bieu mau tao / sua, bat tat, xem luot dung. */
export function useAdminVouchers() {
  const [list, setList] = useState<VoucherView[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [openForm, setOpenForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [body, setBody] = useState<VoucherPayload>(DEFAULTS);
  const [saving, setSaving] = useState(false);

  const [viewUsage, setViewUsage] = useState<string | null>(null);
  const [attempt, setAttempt] = useState<{ danhSach: Usage[]; tongGiam: number } | null>(
    null,
  );

  const load = useCallback(async () => {
    setLoading(true);
    setErr("");

    try {
      const outcome = await listVouchers(1);
      setList(markExpired(outcome.danhSach));
    } catch (e) {
      setErr(e instanceof Error ? e.message : C.messages.loadFailed);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(load);
  }, [load]);

  const openCreate = () => {
    setEditId(null);
    setBody(DEFAULTS);
    setOpenForm(true);
  };

  const closeForm = () => {
    setOpenForm(false);
    setEditId(null);
  };

  const save = async () => {
    if (saving) return;
    setSaving(true);
    setErr("");

    try {
      if (editId) {
        // `ma` khong duoc gui khi sua: may chu khong cho doi chuoi ma sau khi
        // da phat, vi doi la lam hong moi cho da chia se ma do.
        const { ma: _omit, ...remaining } = body;
        void _omit;
        const outcome = await editVoucher(editId, remaining as VoucherPayload);
        setList((old) => old.map((m) => (m._id === editId ? oneVoucher(outcome.ma) : m)));
      } else {
        const outcome = await generateCode(body);
        setList((old) => [oneVoucher(outcome.ma), ...old]);
      }

      setOpenForm(false);
      setEditId(null);
      setBody(DEFAULTS);
    } catch (e) {
      setErr(e instanceof Error ? e.message : C.messages.saveFailed);
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (id: string) => {
    try {
      const outcome = await toggleVoucher(id);
      setList((old) => old.map((m) => (m._id === id ? oneVoucher(outcome.ma) : m)));
    } catch (e) {
      setErr(e instanceof Error ? e.message : C.messages.toggleFailed);
    }
  };

  const openUsage = async (id: string) => {
    setViewUsage(id);
    setAttempt(null);

    try {
      setAttempt(await voucherUsage(id));
    } catch {
      setAttempt({ danhSach: [], tongGiam: 0 });
    }
  };

  return {
    danhSach: list,
    loading,
    loi: err,
    openForm,
    editId,
    than: body,
    setBody,
    saving,
    viewUsage,
    closeUsage: () => setViewUsage(null),
    luot: attempt,
    openCreate,
    closeForm,
    luu: save,
    toggle,
    openUsage,
  };
}

export type AdminVouchersState = ReturnType<typeof useAdminVouchers>;
