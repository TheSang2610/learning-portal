"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { loginUser, registerUser } from "@/src/services/api";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

// Kiem tra dinh dang co ban, khop voi validate phia backend
const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

export default function AuthModal({ open, onClose }: AuthModalProps) {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

    try {
      // ✅ Validate trước khi gửi
      const email = loginData.email.trim().toLowerCase();

      if (!email || !loginData.password) {
        setError("Email và mật khẩu không được để trống");
        setLoading(false);
        return;
      }

      if (!isValidEmail(email)) {
        setError("Email không hợp lệ");
        setLoading(false);
        return;
      }

      // Gui email da chuan hoa, khong gui nguyen chuoi nguoi dung go
      const data = await loginUser({ email, password: loginData.password });

      if (data.token) {
        localStorage.setItem("authToken", data.token);
      }

      const { token, ...userWithoutToken } = data;
      localStorage.setItem("userInfo", JSON.stringify(userWithoutToken));

      window.dispatchEvent(new Event("userInfoChanged"));
      alert("Đăng nhập thành công");
      onClose();

      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error: any) {
      setError(error.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // ✅ Validate trước khi gửi
      const name = registerData.name.trim();
      const email = registerData.email.trim().toLowerCase();

      if (!name || !email || !registerData.password) {
        setError("Vui lòng điền đầy đủ thông tin");
        setLoading(false);
        return;
      }

      if (!isValidEmail(email)) {
        setError("Email không hợp lệ");
        setLoading(false);
        return;
      }

      if (registerData.password.length < 6) {
        setError("Mật khẩu phải có ít nhất 6 ký tự");
        setLoading(false);
        return;
      }

      const data = await registerUser({ ...registerData, name, email });

      if (data.token) {
        localStorage.setItem("authToken", data.token);
      }

      const { token, ...userWithoutToken } = data;
      localStorage.setItem("userInfo", JSON.stringify(userWithoutToken));

      window.dispatchEvent(new Event("userInfoChanged"));
      alert("Đăng ký thành công");
      onClose();

      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error: any) {
      setError(error.message || "Đăng ký thất bại");
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
      `width=${width},height=${height},left=${left},top=${top}`
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
          const { user, token } = payload;

          if (token) {
            localStorage.setItem("authToken", token);
          }
          localStorage.setItem("userInfo", JSON.stringify(user));

          console.log("✅ Google login success");

          window.dispatchEvent(new Event("userInfoChanged"));
          onClose();

          setTimeout(() => {
            window.location.reload();
          }, 500);

          window.removeEventListener("message", messageHandler);
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
          className="absolute right-4 top-4 rounded-full bg-slate-100 p-2 text-slate-600 transition hover:bg-slate-200"
          aria-label="Close auth modal"
        >
          ×
        </button>

        <h2 className="text-3xl font-bold text-center mb-6">
          {isLogin ? "Đăng nhập" : "Đăng ký"}
        </h2>

        <div className="flex bg-slate-100 rounded-2xl p-1 mb-6">
          <button
            type="button"
            onClick={() => {
              setIsLogin(true);
              setError("");
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
            }}
            className={`flex-1 rounded-2xl py-2 text-sm font-semibold transition ${
              !isLogin ? "bg-blue-600 text-white" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Đăng ký
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="mb-4 flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
        >
          <img src="https://www.svgrepo.com/show/355037/google.svg" alt="Google logo" className="h-5 w-5" />
          Tiếp tục với Google
        </button>

        {isLogin ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4" onClick={(e) => e.stopPropagation()}>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={loginData.email}
              onChange={handleLoginChange}
              required
              className="w-full rounded-2xl border border-slate-300 p-3 text-black placeholder:text-slate-500 outline-none transition focus:border-blue-600"
            />
            <input
              type="password"
              name="password"
              placeholder="Mật khẩu"
              value={loginData.password}
              onChange={handleLoginChange}
              required
              className="w-full rounded-2xl border border-slate-300 p-3 text-black placeholder:text-slate-500 outline-none transition focus:border-blue-600"
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
          <form onSubmit={handleRegisterSubmit} className="space-y-4" onClick={(e) => e.stopPropagation()}>
            <input
              type="text"
              name="name"
              placeholder="Họ và tên"
              value={registerData.name}
              onChange={handleRegisterChange}
              required
              className="w-full rounded-2xl border border-slate-300 p-3 text-black placeholder:text-slate-500 outline-none transition focus:border-blue-600"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={registerData.email}
              onChange={handleRegisterChange}
              required
              className="w-full rounded-2xl border border-slate-300 p-3 text-black placeholder:text-slate-500 outline-none transition focus:border-blue-600"
            />
            <input
              type="password"
              name="password"
              placeholder="Mật khẩu (tối thiểu 6 ký tự)"
              value={registerData.password}
              onChange={handleRegisterChange}
              required
              minLength={6}
              className="w-full rounded-2xl border border-slate-300 p-3 text-black placeholder:text-slate-500 outline-none transition focus:border-blue-600"
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