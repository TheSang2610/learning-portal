"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { loginUser, registerUser } from "@/src/services/api";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

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
    const data = await loginUser(loginData); // data chính là { _id, name, email, role, token }

    if (data.token) {
      localStorage.setItem("authToken", data.token);
    }

    // Bóc tách token ra, chỉ lưu các thông tin user còn lại vào userInfo
    const { token, ...userWithoutToken } = data;
    localStorage.setItem("userInfo", JSON.stringify(userWithoutToken));
    
    window.dispatchEvent(new Event("userInfoChanged"));
    alert("Đăng nhập thành công");
    onClose();
    
    setTimeout(() => { window.location.reload(); }, 500);
    
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
    // 1. Đăng ký và nhận ngay data chứa token từ backend
    const data = await registerUser(registerData); 

    if (data.token) {
      localStorage.setItem("authToken", data.token);
    }

    // 2. Lọc bỏ token trước khi lưu thông tin user vào localStorage
    const { token, ...userWithoutToken } = data;
    localStorage.setItem("userInfo", JSON.stringify(userWithoutToken));
    
    window.dispatchEvent(new Event("userInfoChanged"));
    alert("Đăng ký thành công");
    onClose();
    
    setTimeout(() => { window.location.reload(); }, 500);
    
  } catch (error: any) {
    setError(error.message || "Đăng ký thất bại");
  } finally {
    setLoading(false);
  }
};

  const handleGoogleSignIn = () => {
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
        if (e.origin !== window.location.origin) return;

        const { type, payload } = e.data || {};

        if (type === "google-auth-success") {
          const { user, token } = payload;
          
          // ✅ LƯU TOKEN ĐÚNG - KHÔNG DÙNG JSON.stringify()
          if (token) {
            localStorage.setItem("authToken", token); // Lưu token sạch
          }
          localStorage.setItem("userInfo", JSON.stringify(user));
          
          console.log("✅ Google login success, token saved:", token);
          
          window.dispatchEvent(new Event("userInfoChanged"));
          onClose();
          
          // Reload để cập nhật app state
          setTimeout(() => {
            window.location.reload();
          }, 500);
          
          window.removeEventListener("message", messageHandler);
        }

        if (type === "google-auth-failed") {
          setError("Đăng nhập Google thất bại");
          alert("Đăng nhập Google thất bại");
          window.removeEventListener("message", messageHandler);
        }
      } catch (err) {
        console.error("❌ Google auth error:", err);
      }
    };

    window.addEventListener("message", messageHandler);

    // cleanup if popup closed manually
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
              className="w-full rounded-2xl border border-slate-300 p-3 outline-none transition focus:border-blue-600"
            />
            <input
              type="password"
              name="password"
              placeholder="Mật khẩu"
              value={loginData.password}
              onChange={handleLoginChange}
              required
              className="w-full rounded-2xl border border-slate-300 p-3 outline-none transition focus:border-blue-600"
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
              className="w-full rounded-2xl border border-slate-300 p-3 outline-none transition focus:border-blue-600"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={registerData.email}
              onChange={handleRegisterChange}
              required
              className="w-full rounded-2xl border border-slate-300 p-3 outline-none transition focus:border-blue-600"
            />
            <input
              type="password"
              name="password"
              placeholder="Mật khẩu (tối thiểu 6 ký tự)"
              value={registerData.password}
              onChange={handleRegisterChange}
              required
              minLength={6}
              className="w-full rounded-2xl border border-slate-300 p-3 outline-none transition focus:border-blue-600"
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