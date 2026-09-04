"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { DonHang, dinhDangTien, huyDon, layDonTheoMa } from "@/src/services/order";
import { getErrorMessage } from "@/src/services/apiHelper";

// Bao lau hoi lai may chu mot lan xem don da duoc xac nhan chua.
//
// 10 giay: du nhanh de nguoi vua chuyen khoan thay khoa mo ra gan nhu ngay,
// va du cham de mot nguoi ngoi cho 15 phut chi ton khoang 90 luot goi.
const NHIP_HOI_MS = 10_000;

/** 754 -> "12:34". Luon hai chu so de con so khong nhay qua lai. */
const dangDongHo = (giay: number) => {
  const an = Math.max(0, giay);
  const phut = Math.floor(an / 60);
  const con = an % 60;
  return `${String(phut).padStart(2, "0")}:${String(con).padStart(2, "0")}`;
};

/** Nut sao chep, tu doi thanh "Đã chép" trong 2 giay roi tra ve nhu cu. */
function NutChep({ giaTri, nhan }: { giaTri: string; nhan: string }) {
  const [daChep, setDaChep] = useState(false);

  useEffect(() => {
    if (!daChep) return;
    const h = setTimeout(() => setDaChep(false), 2000);
    return () => clearTimeout(h);
  }, [daChep]);

  const chep = async () => {
    try {
      await navigator.clipboard.writeText(giaTri);
      setDaChep(true);
    } catch {
      // Trinh duyet cu hoac trang khong chay https thi khong co clipboard API.
      // Khong bao loi: nguoi dung van boi den chu de chep tay duoc.
    }
  };

  return (
    <button
      type="button"
      onClick={chep}
      aria-label={`Sao chép ${nhan}`}
      className="ml-2 rounded px-2 py-0.5 text-xs font-medium text-blue-600 transition hover:bg-blue-50"
    >
      {daChep ? "Đã chép" : "Chép"}
    </button>
  );
}

function NoiDungThanhToan() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ma = searchParams.get("code") || "";

  const [don, setDon] = useState<DonHang | null>(null);
  const [dangTai, setDangTai] = useState(true);
  const [loi, setLoi] = useState("");
  const [conLai, setConLai] = useState(0);
  const [dangHuy, setDangHuy] = useState(false);
  const [daChepHet, setDaChepHet] = useState(false);

  // Giu trang thai gan nhat de vong hoi khong phai phu thuoc vao state,
  // tranh dat lai setInterval moi lan don thay doi.
  const trangThaiRef = useRef<string>("");

  // Tang so nay len la yeu cau tai lai.
  //
  // Kieu nay thay cho mot ham tai() goi thang trong effect: goi thang thi
  // React canh bao setState dong bo trong effect, va quan trong hon la khong
  // co cho nao huy request khi nguoi dung roi trang giua chung - phan hoi ve
  // muon se goi setState tren mot component da bi go bo.
  const [lanTai, setLanTai] = useState(0);
  const taiLai = useCallback(() => setLanTai((n) => n + 1), []);

  useEffect(() => {
    if (!ma) return;
    let daRoiTrang = false;

    void (async () => {
      try {
        const { order } = await layDonTheoMa(ma);
        if (daRoiTrang) return;
        setDon(order);
        setConLai(order.secondsLeft);
        trangThaiRef.current = order.status;
        setLoi("");
      } catch (e) {
        if (!daRoiTrang) setLoi(getErrorMessage(e, "Không đọc được đơn hàng"));
      } finally {
        if (!daRoiTrang) setDangTai(false);
      }
    })();

    return () => {
      daRoiTrang = true;
    };
  }, [ma, lanTai]);

  // Dem nguoc tai cho. Chi la hien thi - moc het han that nam o may chu.
  useEffect(() => {
    if (!don || don.status !== "pending") return;
    const h = setInterval(() => setConLai((g) => Math.max(0, g - 1)), 1000);
    return () => clearInterval(h);
  }, [don]);

  // Hoi lai may chu xem quan tri da xac nhan chua.
  useEffect(() => {
    if (!don || don.status !== "pending") return;
    const h = setInterval(() => {
      if (trangThaiRef.current === "pending") taiLai();
    }, NHIP_HOI_MS);
    return () => clearInterval(h);
  }, [don, taiLai]);

  const chepThongTin = async () => {
    if (!don?.chuyenKhoan) return;
    const ck = don.chuyenKhoan;
    const chuoi = [
      `Ngân hàng: ${ck.nganHang}`,
      `Số tài khoản: ${ck.soTaiKhoan}`,
      `Tên tài khoản: ${ck.tenTaiKhoan}`,
      `Số tiền: ${ck.soTien}`,
      `Nội dung: ${ck.noiDung}`,
    ].join("\n");
    try {
      await navigator.clipboard.writeText(chuoi);
      setDaChepHet(true);
      setTimeout(() => setDaChepHet(false), 2000);
    } catch {
      /* khong co clipboard API - bo qua */
    }
  };

  const huy = async () => {
    if (!don) return;
    setDangHuy(true);
    try {
      await huyDon(don.code);
      router.push("/courses");
    } catch (e) {
      setLoi(getErrorMessage(e, "Không hủy được đơn"));
      setDangHuy(false);
    }
  };

  if (!ma) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="mb-6 text-slate-700">Thiếu mã đơn hàng.</p>
        <Link
          href="/courses"
          className="rounded-2xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Về danh sách khóa học
        </Link>
      </div>
    );
  }

  if (dangTai) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center text-slate-500">
        Đang tải đơn hàng…
      </div>
    );
  }

  if (loi && !don) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="mb-6 text-slate-700">{loi}</p>
        <Link
          href="/courses"
          className="rounded-2xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Về danh sách khóa học
        </Link>
      </div>
    );
  }

  if (!don) return null;

  // --- Đơn đã thanh toán -----------------------------------------------
  if (don.status === "paid") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-3xl text-green-600">
          ✓
        </div>
        <h1 className="mb-3 text-2xl font-bold text-slate-900">Thanh toán thành công</h1>
        <p className="mb-8 text-slate-600">
          Khóa học <strong>{don.course?.title}</strong> đã được mở cho tài khoản của bạn.
        </p>
        <Link
          href={don.course ? `/learn?slug=${don.course.slug}` : "/courses"}
          className="rounded-2xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Vào học ngay
        </Link>
      </div>
    );
  }

  // --- Đơn đã hủy hoặc hết hạn ------------------------------------------
  if (don.status === "cancelled" || don.status === "expired") {
    const daHuy = don.status === "cancelled";
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="mb-3 text-2xl font-bold text-slate-900">
          {daHuy ? "Đơn hàng đã hủy" : "Đơn hàng đã hết hạn"}
        </h1>
        <p className="mb-8 text-slate-600">
          {daHuy
            ? "Đơn này đã được hủy. Bạn có thể đặt lại đơn mới bất cứ lúc nào."
            : "Đơn chỉ được giữ trong 15 phút. Bạn đặt lại đơn mới để lấy mã chuyển khoản còn hiệu lực nhé."}
        </p>
        <Link
          href={don.course ? `/course?slug=${don.course.slug}` : "/courses"}
          className="rounded-2xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Quay lại khóa học
        </Link>
      </div>
    );
  }

  // --- Đơn đang chờ thanh toán ------------------------------------------
  const ck = don.chuyenKhoan;
  const hetGio = conLai <= 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      {/* Đồng hồ giữ đơn */}
      <div
        aria-live="polite"
        className={`mb-6 flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm ${
          hetGio ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-800"
        }`}
      >
        {hetGio ? (
          <span>
            Đơn đã quá hạn giữ. Nếu bạn đã chuyển khoản, đừng lo — đơn vẫn được xác nhận
            khi tiền về.
          </span>
        ) : (
          <span>
            Giữ đơn cho bạn trong{" "}
            <strong className="tabular-nums">{dangDongHo(conLai)}</strong>
          </span>
        )}
      </div>

      <h1 className="mb-2 text-3xl font-bold text-slate-900">Thanh toán đơn hàng</h1>
      <p className="mb-8 text-slate-600">
        Bạn cần chuyển <strong>{dinhDangTien(don.amount)}</strong>. Quét mã QR bên dưới
        thì mọi thông tin tự điền sẵn. Nếu tự gõ, nhớ ghi nội dung{" "}
        <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono font-semibold text-slate-900">
          {don.code}
        </span>
        .
      </p>

      {/* Các mục trong đơn */}
      <section className="mb-8" aria-labelledby="muc-don-hang">
        <h2 id="muc-don-hang" className="mb-3 text-sm font-semibold text-slate-500">
          Các mục trong đơn hàng
        </h2>
        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 p-4">
          <div className="flex h-14 w-14 flex-none items-center justify-center rounded-xl bg-slate-100 text-xs font-semibold text-slate-500">
            KH
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-semibold text-slate-900">
              {don.course?.title ?? "Khóa học"}
            </h3>
            <p className="text-sm text-slate-500">Khóa học</p>
          </div>
          <p className="flex-none font-semibold text-slate-900">
            {dinhDangTien(don.amount)}
          </p>
        </div>
      </section>

      {/* Chưa khai báo tài khoản nhận tiền */}
      {ck && !ck.daCauHinh && (
        <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Máy chủ chưa được khai báo tài khoản nhận tiền, nên chưa sinh được mã QR. Đơn
          hàng và mã <strong>{don.code}</strong> vẫn hợp lệ — liên hệ ban quản trị để lấy
          thông tin chuyển khoản.
        </div>
      )}

      {ck?.daCauHinh && (
        <section
          className="mb-8 grid gap-6 rounded-2xl border border-slate-200 p-5 md:grid-cols-2"
          aria-label="Mã QR và thông tin chuyển khoản"
        >
          {/* Cột QR */}
          <div className="flex flex-col items-center gap-3">
            {ck.anhQR && (
              <Image
                src={ck.anhQR}
                alt={`Mã QR chuyển khoản ${dinhDangTien(don.amount)} nội dung ${don.code}`}
                width={280}
                height={380}
                unoptimized
                referrerPolicy="no-referrer"
                className="h-auto w-full max-w-[280px] rounded-xl border border-slate-200"
              />
            )}
            {ck.anhQR && (
              <a
                href={ck.anhQR}
                download={`QR-${don.code}.jpg`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Tải mã QR
              </a>
            )}
            <p className="text-center text-xs leading-relaxed text-slate-500">
              Đang xem trên điện thoại? Bấm <strong>Tải mã QR</strong> rồi mở app ngân
              hàng, chọn quét mã từ ảnh trong thư viện. Hoặc dùng{" "}
              <strong>Sao chép thông tin</strong> rồi dán vào app — không cần quét.
            </p>
          </div>

          {/* Cột thông tin */}
          <div className="flex flex-col gap-3">
            <dl className="divide-y divide-slate-100 rounded-xl bg-slate-50 px-4">
              <div className="flex items-baseline justify-between gap-3 py-3">
                <dt className="text-sm text-slate-500">Ngân hàng</dt>
                <dd className="font-medium text-slate-900">{ck.nganHang}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-3 py-3">
                <dt className="text-sm text-slate-500">Số tài khoản</dt>
                <dd className="font-medium text-slate-900">
                  <span className="font-mono">{ck.soTaiKhoan}</span>
                  <NutChep giaTri={ck.soTaiKhoan} nhan="số tài khoản" />
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-3 py-3">
                <dt className="text-sm text-slate-500">Tên tài khoản</dt>
                <dd className="text-right font-medium text-slate-900">
                  {ck.tenTaiKhoan}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-3 py-3">
                <dt className="text-sm text-slate-500">Số tiền</dt>
                <dd className="font-medium text-slate-900">
                  <span className="tabular-nums">{dinhDangTien(ck.soTien)}</span>
                  <NutChep giaTri={String(ck.soTien)} nhan="số tiền" />
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-3 py-3">
                <dt className="text-sm text-slate-500">Nội dung</dt>
                <dd className="font-semibold text-slate-900">
                  <span className="font-mono">{ck.noiDung}</span>
                  <NutChep giaTri={ck.noiDung} nhan="nội dung" />
                </dd>
              </div>
            </dl>

            <button
              type="button"
              onClick={chepThongTin}
              className="rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              {daChepHet ? "Đã sao chép" : "Sao chép thông tin"}
            </button>
          </div>
        </section>
      )}

      <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
        Sau khi chuyển khoản, đơn được xác nhận thủ công nên có thể mất vài phút. Trang
        này tự kiểm tra lại, bạn cứ để mở — khóa học mở ra là thấy ngay.
      </div>

      {loi && (
        <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {loi}
        </p>
      )}

      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={huy}
          disabled={dangHuy}
          className="text-sm text-slate-500 underline transition hover:text-slate-800 disabled:opacity-50"
        >
          {dangHuy ? "Đang hủy…" : "Hủy đơn hàng"}
        </button>
      </div>
    </div>
  );
}

export default function TrangThanhToan() {
  // useSearchParams bắt buộc phải nằm trong Suspense, nếu không Next từ chối
  // build trang này ở chế độ tĩnh.
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-3xl px-4 py-20 text-center text-slate-500">
          Đang tải…
        </div>
      }
    >
      <NoiDungThanhToan />
    </Suspense>
  );
}
