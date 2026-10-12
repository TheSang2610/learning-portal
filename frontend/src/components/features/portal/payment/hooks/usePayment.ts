"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { PAYMENT as P } from "@/src/constants/portal/payment-page";
import { useCartStore } from "@/src/hooks/cart";
import { coursesInOrder } from "@/src/lib/order";
import { getErrorMessage } from "@/src/services/apiHelper";
import {
  reportTransfer,
  cancelOrder,
  getOrderByCode,
  createCartOrder,
  createOrder,
  type Order,
} from "@/src/services/order";

/** Doc don theo ?code=, dem nguoc, hoi lai trang thai, bao da chuyen / huy / tao ma moi. */
export function usePayment() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code") || "";

  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [remaining, setRemaining] = useState(0);
  const [cancelling, setCancelling] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [reportResult, setReportResult] = useState<{
    chu: string;
    mailHong: boolean;
  } | null>(null);
  const [recreating, setRecreating] = useState(false);

  // Giu trang thai gan nhat de vong hoi khong phai phu thuoc vao state,
  // tranh dat lai setInterval moi lan don thay doi.
  const statusRef = useRef<string>("");

  // Tang so nay len la yeu cau tai lai.
  //
  // Kieu nay thay cho mot ham tai() goi thang trong effect: goi thang thi
  // React canh bao setState dong bo trong effect, va quan trong hon la khong
  // co cho nao huy request khi nguoi dung roi trang giua chung - phan hoi ve
  // muon se goi setState tren mot component da bi go bo.
  const [reloadKey, setReloadKey] = useState(0);
  const reload = useCallback(() => setReloadKey((n) => n + 1), []);

  useEffect(() => {
    if (!code) return;
    let leftPage = false;

    void (async () => {
      try {
        const { order } = await getOrderByCode(code);
        if (leftPage) return;
        setCurrentOrder(order);
        setRemaining(order.secondsLeft);
        statusRef.current = order.status;
        setErr("");
      } catch (e) {
        if (!leftPage) setErr(getErrorMessage(e, P.messages.loadFailed));
      } finally {
        if (!leftPage) setLoading(false);
      }
    })();

    return () => {
      leftPage = true;
    };
  }, [code, reloadKey]);

  // Don da duoc xac nhan thi bo cac khoa do khoi gio. Trang gio hang co y KHONG
  // xoa luc tao don (nguoi dung co the bo do giua chung), nen day la cho duy
  // nhat don gio sau khi tien da vao. Khong bo thi lan sau mo gio van thay khoa
  // da mua, bam thanh toan la bi bao "bạn đã có khóa này".
  const { bo: removeFromCart } = useCartStore();
  useEffect(() => {
    if (currentOrder?.status !== "paid") return;
    coursesInOrder(currentOrder).forEach((k) => removeFromCart(k._id));
  }, [currentOrder, removeFromCart]);

  // Dem nguoc tai cho. Chi la hien thi - moc het han that nam o may chu.
  useEffect(() => {
    if (!currentOrder || currentOrder.status !== "pending") return;
    const h = setInterval(() => setRemaining((g) => Math.max(0, g - 1)), 1000);
    return () => clearInterval(h);
  }, [currentOrder]);

  // Hoi lai may chu xem quan tri da xac nhan chua.
  useEffect(() => {
    if (!currentOrder || currentOrder.status !== "pending") return;
    const h = setInterval(() => {
      if (statusRef.current === "pending") reload();
    }, P.pollMs);
    return () => clearInterval(h);
  }, [currentOrder, reload]);

  const clickTransferred = async () => {
    if (!currentOrder) return;
    setReporting(true);
    try {
      const r = await reportTransfer(currentOrder.code);
      setReportResult({
        chu: r.message,
        // Chua cau hinh mail hoac gui hong -> phai noi that. De hoc vien ngoi
        // cho mot cai mail khong bao gio den la cach chac chan nhat de mat
        // khach: ho tuong da bao roi, con quan tri thi khong biet gi.
        mailHong: !r.daGuiMail,
      });
      reload();
    } catch (e) {
      setReportResult({
        chu: getErrorMessage(e, P.messages.reportFailed),
        mailHong: true,
      });
    } finally {
      setReporting(false);
    }
  };

  // Ma cu het han thi tao thang don moi va nhay sang, thay vi day nguoi dung
  // ve trang khoa hoc bat bam Mua lai tu dau.
  const regenerateCode = async () => {
    if (!currentOrder?.course) return;
    setRecreating(true);
    try {
      // Don gio hang thi tao lai don gio hang voi dung bo khoa do - goi
      // createOrder(don.course) o day la ma moi chi con tinh tien khoa dau.
      const items = coursesInOrder(currentOrder);
      const { order } =
        items.length > 1
          ? await createCartOrder(items.map((k) => k._id))
          : await createOrder(currentOrder.course._id);
      router.push(P.paymentHref(order.code));
    } catch (e) {
      setErr(getErrorMessage(e, P.messages.newCodeFailed));
      setRecreating(false);
    }
  };

  const copyDetails = async () => {
    if (!currentOrder?.chuyenKhoan) return;
    const chuoi = P.bank.clipboardLines(currentOrder.chuyenKhoan);
    try {
      await navigator.clipboard.writeText(chuoi);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    } catch {
      /* khong co clipboard API - bo qua */
    }
  };

  const cancel = async () => {
    if (!currentOrder) return;
    setCancelling(true);
    try {
      await cancelOrder(currentOrder.code);
      router.push(P.coursesHref);
    } catch (e) {
      setErr(getErrorMessage(e, P.messages.cancelFailed));
      setCancelling(false);
    }
  };

  return {
    ma: code,
    don: currentOrder,
    loading,
    loi: err,
    conLai: remaining,
    cancelling,
    copiedAll,
    reporting,
    reportResult,
    recreating,
    clickTransferred,
    regenerateCode,
    copyDetails,
    cancel,
  };
}

export type PaymentState = ReturnType<typeof usePayment>;
