"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { loginUser, registerUser } from "@/src/services/api";

export default function AuthPage() {
  const router = useRouter();

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

  // LOGIN INPUT
  const handleLoginChange = (e: ChangeEvent<HTMLInputElement>) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    });
  };

  // REGISTER INPUT
  const handleRegisterChange = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    setRegisterData({
      ...registerData,
      [e.target.name]: e.target.value,
    });
  };

  // LOGIN SUBMIT
    const handleLoginSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
        const data = await loginUser(loginData);

        localStorage.setItem("userInfo", JSON.stringify(data));

        // Kích hoạt sự kiện để header biết và cập nhật ngay lập tức
        window.dispatchEvent(new Event("userInfoChanged"));

        alert("Login success");

        router.push("/");
        } catch (error) {
        console.log(error);
        alert("Login failed");
        }
    };

  // REGISTER SUBMIT
  const handleRegisterSubmit = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    try {
      await registerUser(registerData);

      alert("Register success");

      setIsLogin(true);
    } catch (error) {
      console.log(error);
      alert("Register failed");
    }
  };

  const handleClose = () => {
    router.push("/");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8">
      <div
        className="absolute inset-0"
        onClick={handleClose}
      />

      <div className="relative w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl ring-1 ring-slate-200">
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-full bg-slate-100 p-2 text-slate-600 transition hover:bg-slate-200"
          aria-label="Close login modal"
        >
          ×
        </button>

        <h1 className="text-3xl font-bold text-center mb-6">
          {isLogin ? "Login" : "Register"}
        </h1>

        {/* SWITCH BUTTON */}
        <div className="flex bg-slate-100 rounded-2xl p-1 mb-6">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 rounded-2xl py-2 text-sm font-semibold transition ${
              isLogin
                ? "bg-blue-600 text-white"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Login
          </button>

          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 rounded-2xl py-2 text-sm font-semibold transition ${
              !isLogin
                ? "bg-blue-600 text-white"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Register
          </button>
        </div>

        {/* LOGIN FORM */}
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
          <form
            onSubmit={handleRegisterSubmit}
            className="space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
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