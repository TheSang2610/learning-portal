"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { loginUser, registerUser } from "@/src/services/api";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AuthModal({ open, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);

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

    try {
      const data = await loginUser(loginData);

      localStorage.setItem("userInfo", JSON.stringify(data));
      window.dispatchEvent(new Event("userInfoChanged"));

      alert("Login success");
      onClose();
    } catch (error) {
      console.error(error);
      alert("Login failed");
    }
  };

  const handleRegisterSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await registerUser(registerData);

      alert("Register success");
      setIsLogin(true);
    } catch (error) {
      console.error(error);
      alert("Register failed");
    }
  };

  const handleGoogleSignIn = () => {
    const width = 600;
    const height = 700;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2.5;

    const popup = window.open(
      "/api/auth/google?popup=1",
      "googleSignIn",
      `width=${width},height=${height},left=${left},top=${top}`
    );

    if (!popup) {
      alert("Popup blocked. Please allow popups for this site.");
      return;
    }

    const messageHandler = (e: MessageEvent) => {
      try {
        if (e.origin !== window.location.origin) return;

        const { type, payload } = e.data || {};

        if (type === "google-auth-success") {
          const { user, token } = payload;
          localStorage.setItem("userInfo", JSON.stringify(user));
          // also store token if provided
          if (token) localStorage.setItem("authToken", JSON.stringify(token));
          window.dispatchEvent(new Event("userInfoChanged"));
          onClose();
          window.removeEventListener("message", messageHandler);
        }

        if (type === "google-auth-failed") {
          alert("Google login failed");
          window.removeEventListener("message", messageHandler);
        }
      } catch (err) {
        console.error(err);
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
          {isLogin ? "Login" : "Register"}
        </h2>

        <div className="flex bg-slate-100 rounded-2xl p-1 mb-6">
          <button
            type="button"
            onClick={() => setIsLogin(true)}
            className={`flex-1 rounded-2xl py-2 text-sm font-semibold transition ${
              isLogin ? "bg-blue-600 text-white" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Login
          </button>

          <button
            type="button"
            onClick={() => setIsLogin(false)}
            className={`flex-1 rounded-2xl py-2 text-sm font-semibold transition ${
              !isLogin ? "bg-blue-600 text-white" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Register
          </button>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="mb-4 flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <img src="https://www.svgrepo.com/show/355037/google.svg" alt="Google logo" className="h-5 w-5" />
          Continue with Google
        </button>

        {isLogin ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4" onClick={(e) => e.stopPropagation()}>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={loginData.email}
              onChange={handleLoginChange}
              className="w-full rounded-2xl border border-slate-300 p-3 outline-none transition focus:border-blue-600"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={loginData.password}
              onChange={handleLoginChange}
              className="w-full rounded-2xl border border-slate-300 p-3 outline-none transition focus:border-blue-600"
            />
            <button
              type="submit"
              className="w-full rounded-2xl bg-blue-600 py-3 text-white transition hover:bg-blue-700"
            >
              Login
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="space-y-4" onClick={(e) => e.stopPropagation()}>
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={registerData.name}
              onChange={handleRegisterChange}
              className="w-full rounded-2xl border border-slate-300 p-3 outline-none transition focus:border-blue-600"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={registerData.email}
              onChange={handleRegisterChange}
              className="w-full rounded-2xl border border-slate-300 p-3 outline-none transition focus:border-blue-600"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={registerData.password}
              onChange={handleRegisterChange}
              className="w-full rounded-2xl border border-slate-300 p-3 outline-none transition focus:border-blue-600"
            />
            <button
              type="submit"
              className="w-full rounded-2xl bg-blue-600 py-3 text-white transition hover:bg-blue-700"
            >
              Register
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
