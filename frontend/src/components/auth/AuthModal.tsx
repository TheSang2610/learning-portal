"use client";

import { datNguoiDung, yeuCauNapLai } from "@/src/hooks/nguoiDungLuu";
import { useState, ChangeEvent, FormEvent } from "react";
import { getErrorMessage } from "@/src/services/apiHelper";
import Image from "next/image";
import { loginUser, registerUser } from "@/src/services/api";
import {
  DAI_EMAIL_TOI_DA,
  DAI_MAT_KHAU_TOI_THIEU,
  DAI_TEN_TOI_DA,
  emailHopLe,
  kiemTen,
  loiMatKhauMoi,
} from "@/src/services/quyDinh";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Vao thang khu vuc cua nguoi vua dang nhap.
 *
 * Dung window.location chu khong phai router cua Next: token nam trong cookie
 * httpOnly, ma Server Component chi doc cookie luc tai trang. Dieu huong bang
 * router thi phan render tren may chu van la cua phien cu.
 *
 * replace() chu khong phai assign(): khong de lai trang truoc trong lich su,
 * nen bam Back sau khi dang nhap khong quay ve man hinh chua dang nhap.
 */
const vaoThang = (vaiTro?: string) => {
  if (vaiTro === "admin") return window.location.replace("/admin/dashboard");
  if (vaiTro === "instructor") return window.location.replace("/instructor");

  // Hoc vien: o lai dung trang dang xem, chi tai lai de lay phien moi.
  //
  // Phai BO tham so ?auth truoc khi tai lai. O day tung dung reload(), ma
  // reload() tai lai DUNG dia chi hien tai - van con ?auth=login. Modal nay
  // mo ra chinh vi tham so do (xem AuthModalGate), nen nguoi dung dang nhap
  // xong lai thay hop dang nhap hien len lan nua, du da vao duoc tai khoan.
  //
  // onClose() o noi goi co router.replace("/") de xoa tham so, nhung do la
  // dieu huong cua Next chay bat dong bo: no chua kip cham vao thanh dia chi
  // thi dong duoi da tai lai trang roi.
  const diaChi = new URL(window.location.href);
  diaChi.searchParams.delete("auth");
  return window.location.replace(diaChi.toString());
};

export default function AuthModal({ open, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // Hien cau nhac "neu ban dang ky bang Google..." sau khi dang nhap that bai.
  // May chu tra cung mot cau cho moi truong hop that bai (co y - xem
  // backend/src/controllers/userController.js), nen phia giao dien phai tu
  // nhac de nguoi dung Google khong ket o day.
  const [goiYGoogle, setGoiYGoogle] = useState(false);
  // Cau bao thanh cong nhung KHONG dong hop lai: sau khi dang ky, nguoi dung
  // chua dang nhap ma phai mo hom thu, nen ho can doc duoc cau nay.
  const [thongBao, setThongBao] = useState("");

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });

  const handleLoginChange = (e: ChangeEvent<HTMLInputElement>) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegisterChange = (e: ChangeEvent<HTMLInputElement>) => {
    setRegisterData({
      ...registerData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLoginSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setThongBao("");
    setGoiYGoogle(false);

    try {
      // ✅ Validate trước khi gửi
      const email = loginData.email.trim().toLowerCase();

      if (!email || !loginData.password) {
        setError("Email và mật khẩu không được để trống");
        setLoading(false);
        return;
      }

      if (!emailHopLe(email)) {
        setError("Email không hợp lệ");
        setLoading(false);
        return;
      }

      // Gui email da chuan hoa, khong gui nguyen chuoi nguoi dung go
      const data = await loginUser({ email, password: loginData.password });

      // Token nam trong cookie httpOnly do may chu dat, khong con trong than
      // phan hoi. localStorage chi giu phan thong tin de hien thi.
      // Danh tinh giu trong RAM (xem src/hooks/nguoiDungLuu.ts).
      // datNguoiDung() da tu ban su kien "userInfoChanged".
      datNguoiDung(data);
      yeuCauNapLai();
      onClose();
      vaoThang(data?.role);
    } catch (error) {
      setError(getErrorMessage(error, "Đăng nhập thất bại"));
      // May chu CO Y tra cung mot cau cho ca ba truong hop: email khong ton
      // tai, sai mat khau, va tai khoan chi dang nhap bang Google. Tra khac
      // nhau la bien duong dang nhap thanh cai may tra loi "email nay co trong
      // he thong khong". Nhac nut Google o day de nguoi dung Google khong bi
      // ket - cau nhac nay hien cho MOI nguoi nen no khong to them gi.
      setGoiYGoogle(true);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setThongBao("");
    setGoiYGoogle(false);

    try {
      // ✅ Validate trước khi gửi
      const name = registerData.name.trim();
      const email = registerData.email.trim().toLowerCase();

      if (!name || !email || !registerData.password) {
        setError("Vui lòng điền đầy đủ thông tin");
        setLoading(false);
        return;
      }

      if (!emailHopLe(email)) {
        setError("Email không hợp lệ");
        setLoading(false);
        return;
      }

      const loiTen = kiemTen(name);
      if (loiTen) {
        setError(loiTen);
        setLoading(false);
        return;
      }

      // Dung chung ham voi backend (xem services/quyDinh.ts). Truoc day cho
      // nay chi kiem do dai TOI THIEU, khong kiem toi da - ma bcrypt bo lang
      // moi byte tu 73 tro di, nen nguoi dung dat mat khau that dai roi tin
      // rang ca chuoi deu duoc tinh.
      const loiMk = loiMatKhauMoi(registerData.password);
      if (loiMk) {
        setError(loiMk);
        setLoading(false);
        return;
      }

      const data = await registerUser({ ...registerData, name, email });

      // May chu KHONG con dang nhap thang sau khi dang ky. No gui mot la thu
      // xac minh roi tra ve 202 khong kem danh tinh nao - do la cach duy nhat
      // de duong dang ky thoi tra loi duoc cau hoi "dia chi nay da co tai
      // khoan chua". Xem backend/src/controllers/userController.js.
      //
      // Van giu nhanh cu ben duoi: khi may chu chua cau hinh hom thu (thuong
      // la may dev), no tao tai khoan va dang nhap luon nhu truoc, tuc la co
      // tra ve _id.
      if (!data?._id) {
        setThongBao(
          data?.message ||
            "Chúng tôi đã gửi một email tới địa chỉ này. Vui lòng mở thư để hoàn tất đăng ký.",
        );
        setRegisterData({ ...registerData, password: "" });
        return;
      }

      // Danh tinh giu trong RAM (xem src/hooks/nguoiDungLuu.ts).
      // datNguoiDung() da tu ban su kien "userInfoChanged".
      datNguoiDung(data);
      yeuCauNapLai();
      onClose();
      vaoThang(data?.role);
    } catch (error) {
      setError(getErrorMessage(error, "Đăng ký thất bại"));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    // ✅ Kiểm tra localStorage có sẵn không (SSR safety)
    if (typeof window === "undefined") return;

    const width = 600;
    const height = 700;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2.5;

    const popup = window.open(
      "/api/auth/google",
      "googleSignIn",
      `width=${width},height=${height},left=${left},top=${top}`,
    );

    if (!popup) {
      alert("Popup bị chặn. Vui lòng cho phép popup cho trang này.");
      return;
    }

    const messageHandler = (e: MessageEvent) => {
      try {
        // ✅ Check origin để tránh XSS
        if (e.origin !== window.location.origin) {
          console.warn("Invalid origin:", e.origin);
          return;
        }

        const { type, payload } = e.data || {};

        if (type === "google-auth-success") {
          const { user } = payload;

          // Khong con nhan token qua postMessage: cua so bat len da dang nhap
          // voi may chu roi, va cookie httpOnly duoc dat cho ca mien nay nen
          // tab chinh dung duoc ngay.
          // Danh tinh giu trong RAM (xem src/hooks/nguoiDungLuu.ts).
          datNguoiDung(user);
          yeuCauNapLai();
          window.removeEventListener("message", messageHandler);
          onClose();
          vaoThang(user?.role);
        }

        if (type === "google-auth-failed") {
          setError(payload?.error || "Đăng nhập Google thất bại");
          window.removeEventListener("message", messageHandler);
        }
      } catch (err) {
        console.error("❌ Google auth error:", err);
        setError("Lỗi trong quá trình xác thực");
      }
    };

    window.addEventListener("message", messageHandler);

    const popupChecker = setInterval(() => {
      if (popup.closed) {
        clearInterval(popupChecker);
        window.removeEventListener("message", messageHandler);
      }
    }, 500);
  };

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white p-8 shadow-2xl ring-1 ring-slate-200">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full bg-slate-100 p-2 text-slate-600 transition hover:bg-slate-200"
          aria-label="Close auth modal"
        >
          ×
        </button>

        <h2 className="mb-6 text-center text-3xl font-bold">
          {isLogin ? "Đăng nhập" : "Đăng ký"}
        </h2>

        <div className="mb-6 flex rounded-2xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => {
              setIsLogin(true);
              setError("");
              setThongBao("");
              setGoiYGoogle(false);
            }}
            className={`flex-1 rounded-2xl py-2 text-sm font-semibold transition ${
              isLogin ? "bg-blue-600 text-white" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Đăng nhập
          </button>

          <button
            type="button"
            onClick={() => {
              setIsLogin(false);
              setError("");
              setThongBao("");
              setGoiYGoogle(false);
            }}
            className={`flex-1 rounded-2xl py-2 text-sm font-semibold transition ${
              !isLogin ? "bg-blue-600 text-white" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Đăng ký
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-600">
            {error}
            {goiYGoogle && (
              <p className="mt-1 text-slate-600">
                Nếu bạn đã đăng ký bằng Google, hãy dùng nút “Tiếp tục với Google” ở trên.
              </p>
            )}
          </div>
        )}

        {thongBao && (
          <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700">
            {thongBao}
          </div>
        )}

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="mb-4 flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
        >
          <Image
            src="https://www.svgrepo.com/show/355037/google.svg"
            alt="Google logo"
            width={20}
            height={20}
            className="h-5 w-5"
          />
          Tiếp tục với Google
        </button>

        {isLogin ? (
          <form
            onSubmit={handleLoginSubmit}
            className="space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={loginData.email}
              onChange={handleLoginChange}
              required
              autoComplete="email"
              maxLength={DAI_EMAIL_TOI_DA}
              className="w-full rounded-2xl border border-slate-300 p-3 text-black transition outline-none placeholder:text-slate-500 focus:border-blue-600"
            />
            <input
              type="password"
              name="password"
              placeholder="Mật khẩu"
              value={loginData.password}
              onChange={handleLoginChange}
              required
              autoComplete="current-password"
              className="w-full rounded-2xl border border-slate-300 p-3 text-black transition outline-none placeholder:text-slate-500 focus:border-blue-600"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-blue-600 py-3 text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Đang xử lý..." : "Đăng nhập"}
            </button>
          </form>
        ) : (
          <form
            onSubmit={handleRegisterSubmit}
            className="space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="text"
              name="name"
              placeholder="Họ và tên"
              value={registerData.name}
              onChange={handleRegisterChange}
              required
              autoComplete="name"
              maxLength={DAI_TEN_TOI_DA}
              className="w-full rounded-2xl border border-slate-300 p-3 text-black transition outline-none placeholder:text-slate-500 focus:border-blue-600"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={registerData.email}
              onChange={handleRegisterChange}
              required
              autoComplete="email"
              maxLength={DAI_EMAIL_TOI_DA}
              className="w-full rounded-2xl border border-slate-300 p-3 text-black transition outline-none placeholder:text-slate-500 focus:border-blue-600"
            />
            <input
              type="password"
              name="password"
              placeholder={`Mật khẩu (tối thiểu ${DAI_MAT_KHAU_TOI_THIEU} ký tự)`}
              value={registerData.password}
              onChange={handleRegisterChange}
              required
              autoComplete="new-password"
              minLength={DAI_MAT_KHAU_TOI_THIEU}
              className="w-full rounded-2xl border border-slate-300 p-3 text-black transition outline-none placeholder:text-slate-500 focus:border-blue-600"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-blue-600 py-3 text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Đang xử lý..." : "Đăng ký"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
