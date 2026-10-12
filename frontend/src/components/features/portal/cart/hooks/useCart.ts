"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { loginUrl } from "@/src/components/features/portal/auth/loginUrl";
import { CART } from "@/src/constants/portal/cart-page";
import { useCartStore } from "@/src/hooks/cart";
import { useUserLoading, useStoredUser } from "@/src/hooks/userStore";
import { getErrorMessage } from "@/src/services/apiHelper";
import { createCartOrder } from "@/src/services/order";

/** Gio hang, ma giam gia va tao mot don QR cho ca gio. */
export function useCart() {
  const router = useRouter();
  const {
    gio: hour,
    bo: remove,
    clear,
    totalPrice,
    soMon: subjectCount,
  } = useCartStore();

  const user = useStoredUser();
  const loading = useUserLoading();
  const path = usePathname();

  // KHONG dung useSearchParams() o day, du cac cho khac trong du an co dung.
  //
  // Hook do bat trang phai ve o trinh duyet, nen /cart roi khoi dang dung san
  // luc build va Next bao loi "should be wrapped in a suspense boundary".
  // Doi lai duoc gi? Giu cac tham so tren thanh dia chi khi mo hop dang nhap -
  // ma /cart thi khong co tham so nao dang giu. Tra mot trang dung san lay mot
  // thu khong ton tai la lo.
  const loginHref = loginUrl(path, new URLSearchParams());

  // Ma giam gia an vao DUNG MOT khoa - xem ghi chu trong CartVoucherBox.
  const [code, setCode] = useState("");
  const [voucherCourseId, setVoucherCourseId] = useState("");
  const [discount, setDiscount] = useState(0);

  // Dem de dung lam `key`, tang len la o nhap ma duoc dung lai tu dau.
  //
  // O nhap tu giu trang thai "da ap ma nao" ben trong no. Khi trang cha go ma
  // (nguoi dung bo khoa duoc giam ra khoi gio), khong doi `key`
  // thi o nhap van hien khung xanh "da ap MA123" trong khi tong tien khong con
  // tru gi nua - hai con so tren cung mot man hinh noi hai chuyen khac nhau.
  const [voucherVersion, setVoucherVersion] = useState(0);

  const [creatingOrder, setCreatingOrder] = useState(false);
  const [orderError, setOrderError] = useState("");

  /**
   * Gom ca gio vao MOT don roi sang trang QR. Gio KHONG bi xoa o day: nguoi
   * dung co the dong trang QR ma chua chuyen tien, xoa gio luc nay la mat het
   * nhung gi ho da chon. Trang thanh toan tu bo cac khoa khoi gio khi don da
   * duoc xac nhan.
   */
  const payWithQr = async () => {
    if (creatingOrder || hour.length === 0) return;
    setCreatingOrder(true);
    setOrderError("");
    try {
      const { order } = await createCartOrder(
        hour.map((m) => m.courseId),
        code && voucherCourseId
          ? { maGiamGia: code, courseIdGiam: voucherCourseId }
          : undefined,
      );
      router.push(CART.paymentHref(order.code));
    } catch (e) {
      setOrderError(getErrorMessage(e));
      setCreatingOrder(false);
    }
  };

  const clearVoucher = () => {
    setCode("");
    setVoucherCourseId("");
    setDiscount(0);
    setVoucherVersion((n) => n + 1);
  };

  const changeVoucher = (newCode: string, courseId: string, discountAmount: number) => {
    setCode(newCode);
    setVoucherCourseId(courseId);
    setDiscount(discountAmount);
  };

  // Bo khoa DANG duoc giam ra khoi gio thi ma khong con cho de an - go luon.
  //
  // Lam ngay trong tay cam nut thay vi trong useEffect: effect chay SAU khi ve
  // lai, nen co mot nhip tong tien van tru phan giam cua mot khoa da bien mat.
  const removeItem = (courseId: string) => {
    if (courseId === voucherCourseId) clearVoucher();
    remove(courseId);
  };

  const clearAll = () => {
    clearVoucher();
    clear();
  };

  return {
    gio: hour,
    totalPrice,
    soMon: subjectCount,
    user,
    loading,
    loginHref,
    giam: discount,
    voucherVersion,
    creatingOrder,
    orderError,
    payWithQr,
    changeVoucher,
    removeItem,
    clearAll,
  };
}

export type CartState = ReturnType<typeof useCart>;
