"use client";

import { useCallback, useEffect, useState } from "react";

import { ADMIN_ORDERS as C } from "@/src/constants/admin/orders-page";
import { getErrorMessage } from "@/src/services/apiHelper";
import {
  AdminOrder,
  OrderStatus,
  formatMoney,
  getAdminOrders,
  rejectOrder,
  confirmOrder,
} from "@/src/services/order";

/** Danh sach don, loc / tim theo ma, xac nhan da nhan tien hoac huy don. */
export function useAdminOrders() {
  const [items, setDs] = useState<AdminOrder[]>([]);
  const [pending, setPending] = useState(0);
  const [reported, setReported] = useState(0);
  const [query, setFilter] = useState<OrderStatus | "">("pending");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  // Ma don dang duoc xu ly - de chi khoa dung mot dong, khong khoa ca bang.
  const [processing, setProcessing] = useState("");

  // Tang so nay len la yeu cau tai lai. Xem ghi chu cung kieu o trang
  // thanh toan: tranh setState dong bo trong effect, va co cho huy request.
  const [reloadKey, setReloadKey] = useState(0);
  const reload = useCallback(() => setReloadKey((n) => n + 1), []);

  useEffect(() => {
    let leftPage = false;

    void (async () => {
      try {
        const outcome = await getAdminOrders({
          status: query,
          search: search,
          limit: C.limit,
        });
        if (leftPage) return;
        setDs(outcome.orders);
        setPending(outcome.pendingCount);
        setReported(outcome.daBaoCount ?? 0);
        setErr("");
      } catch (e) {
        if (!leftPage) setErr(getErrorMessage(e, C.messages.loadFailed));
      } finally {
        if (!leftPage) setLoading(false);
      }
    })();

    return () => {
      leftPage = true;
    };
  }, [query, search, reloadKey]);

  const confirm = async (order: AdminOrder) => {
    const ok = window.confirm(
      C.messages.confirm(
        formatMoney(order.amount),
        order.code,
        order.student?.name ?? "",
      ),
    );
    if (!ok) return;

    setProcessing(order.code);
    try {
      await confirmOrder(order.code);
      reload();
    } catch (e) {
      setErr(getErrorMessage(e, C.messages.confirmFailed));
    } finally {
      setProcessing("");
    }
  };

  const reject = async (order: AdminOrder) => {
    const reason = window.prompt(C.messages.cancelReason(order.code), "");
    if (reason === null) return;

    setProcessing(order.code);
    try {
      await rejectOrder(order.code, reason);
      reload();
    } catch (e) {
      setErr(getErrorMessage(e, C.messages.cancelFailed));
    } finally {
      setProcessing("");
    }
  };

  return {
    ds: items,
    pending,
    reported,
    query,
    setFilter,
    tim: search,
    setSearch,
    loading,
    loi: err,
    processing,
    xacNhan: confirm,
    reject,
  };
}
