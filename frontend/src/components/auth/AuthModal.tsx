"use client";

import { datNguoiDung, yeuCauNapLai } from "@/src/hooks/nguoiDungLuu";
import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { getErrorMessage } from "@/src/services/apiHelper";
import Image from "next/image";
import {
  loginUser,
  registerUser,
  xinMaDatLai,
  kiemMaDatLai,
  datLaiMatKhau,
} from "@/src/services/api";
import {
  DAI_EMAIL_TOI_DA,
  DAI_MAT_KHAU_TOI_THIEU,
  DAI_TEN_TOI_DA,
  emailHopLe,
  dinhDanhDangNhapHopLe,
  kiemTen,
  loiMatKhauMoi,
} from "@/src/services/quyDinh";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  /** Cau giai thich vi sao hop nay hien ra, vi du khi khach bam vao hoc. */
  loiNhan?: string;
}

// So chu so cua ma dat lai. Khop voi SO_CHU_SO trong
// backend/src/utils/maOtp.js - lech la nut xac nhan khong bao gio bat len.
const SO_CHU_SO_MA = 6;

// Ba buoc cua luong quen mat khau. Chuoi rong = khong o trong luong nay.
type BuocQuen = "" | "email" | "ma" | "matKhau";

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
  // onClose() o noi goi co xoa tham so, nhung do la dieu huong cua Next chay
  // bat dong bo: no chua kip cham vao thanh dia chi thi dong duoi da tai lai
  // trang roi.
  //
  // Bo ca `vi` - cau giai thich "Bạn cần đăng nhập để vào học" khong con
  // nghia ly gi khi ho vua dang nhap xong.
  const diaChi = new URL(window.location.href);
  diaChi.searchParams.delete("auth");
  diaChi.searchParams.delete("vi");
  return window.location.replace(diaChi.toString());
};

export default function AuthModal({ open, onClose, loiNhan }: AuthModalProps) {
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

  // Escape de dong. Truoc day khong co, va do la loi that chu khong phai thieu
  // tien nghi: tren dien thoai xoay ngang nut dong bi troi ra ngoai man hinh
  // (xem ghi chu o lop phu ben duoi), luc do ban phim la loi thoat duy nhat
  // con lai cho nguoi dung ban phim. Gio ca hai duong deu thong.
  useEffect(() => {
    if (!open) return;

    const khiNhanPhim = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    // Khoa cuon cua trang ben duoi. Khong khoa thi tren dien thoai, luot trong
    // bang den cuoi se keo theo ca trang phia sau troi di - dong bang ra thi
    // nguoi dung dung o mot cho hoan toan khac.
    const cuonCu = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", khiNhanPhim);

    return () => {
      window.removeEventListener("keydown", khiNhanPhim);
      document.body.style.overflow = cuonCu;
    };
  }, [open, onClose]);

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

  /* ------------------------- Quen mat khau ------------------------------ */
  //
  // Ba buoc, ba man hinh, mot hop. Toan bo chinh sach nam o may chu - xem
  // src/services/api.ts va backend/src/controllers/quenMatKhauController.js.
  //
  // KHONG duoc them bo dem nguoc "thu lai sau N phut" o day. May chu co y
  // khong noi con bao lau nua thi mo lai, va nguoi dung duoc bao bang mot la
  // thu gui ve hom thu. Bay ra mot con so o giao dien la pha dung cai dinh
  // giu kin.
  const [quenBuoc, setQuenBuoc] = useState<BuocQuen>("");
  const [quenEmail, setQuenEmail] = useState("");
  const [quenMa, setQuenMa] = useState("");
  // Cap ra sau khi nhap dung ma. Chi song trong bo nho cua trang nay: dong
  // tab la mat, va phieu chi co han 5 phut ben may chu.
  const [phieu, setPhieu] = useState("");
  const [mkMoi, setMkMoi] = useState("");
  const [mkXacNhan, setMkXacNhan] = useState("");

  // Dua hop ve mot trang thai sach. Goi khi doi tab hoac ra/vao luong quen
  // mat khau, de cau bao loi cua man hinh truoc khong dinh sang man hinh sau.
  const donDep = () => {
    setError("");
    setThongBao("");
    setGoiYGoogle(false);
  };

  const thoatLuongQuen = () => {
    donDep();
    setQuenBuoc("");
    setQuenMa("");
    setPhieu("");
    setMkMoi("");
    setMkXacNhan("");
  };

  // Buoc 1: xin ma.
  //
  // Dung chung cho ca lan gui DAU va lan GUI LAI - may chu tu dem so lan gui,
  // giao dien khong can biet dang o lan thu may.
  const guiMa = async (e?: FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    donDep();

    // Nhan ca ten tai khoan ngan, giong o dang nhap: bat nguoi da quen mat
    // khau phai nho chinh xac ca dia chi thi vo ly.
    const email = quenEmail.trim().toLowerCase();
    if (!dinhDanhDangNhapHopLe(email)) {
      setError("Email hoặc tên tài khoản không hợp lệ");
      return;
    }

    setLoading(true);
    try {
      const kq = await xinMaDatLai(email);
      setQuenEmail(email);
      setQuenBuoc("ma");
      // Hien NGUYEN cau may chu tra ve. Cau do co y khong khang dinh dia chi
      // nay co tai khoan hay khong - viet lai thanh "Đã gửi mã tới <email>"
      // la bien hop nay thanh cai may tra loi "dia chi nay co tai khoan
      // khong". Xem ghi chu o src/services/api.ts.
      setThongBao(kq.message);
    } catch (err) {
      setError(getErrorMessage(err, "Không gửi được mã. Vui lòng thử lại."));
    } finally {
      setLoading(false);
    }
  };

  // Buoc 2: nhap ma, doi lay phieu.
  const xacNhanMa = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    donDep();

    if (quenMa.length !== SO_CHU_SO_MA) {
      setError(`Mã gồm ${SO_CHU_SO_MA} chữ số`);
      return;
    }

    setLoading(true);
    try {
      const kq = await kiemMaDatLai(quenEmail, quenMa);
      setPhieu(kq.phieu);
      setQuenBuoc("matKhau");
    } catch (err) {
      // May chu tra CUNG mot cau cho ma sai, ma het han, va ca truong hop dang
      // bi khoa. Hien nguyen cau do - dung doan ho la dang o truong hop nao.
      setError(getErrorMessage(err, "Mã không đúng hoặc đã hết hạn."));
      setQuenMa("");
    } finally {
      setLoading(false);
    }
  };

  // Buoc 3: dat mat khau moi.
  const doiMatKhau = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    donDep();

    // Kiem o day de nguoi dung biet ngay, khong phai doi mot luot mang. May
    // chu VAN kiem lai ca hai dieu nay - giao dien khong phai duong duy nhat
    // goi toi do duoc.
    const loiMk = loiMatKhauMoi(mkMoi);
    if (loiMk) {
      setError(loiMk);
      return;
    }
    if (mkMoi !== mkXacNhan) {
      setError("Hai lần nhập mật khẩu không giống nhau");
      return;
    }

    setLoading(true);
    try {
      const kq = await datLaiMatKhau(phieu, mkMoi, mkXacNhan);
      // Ve man hinh dang nhap, dien san email de ho chi phai go mat khau moi.
      thoatLuongQuen();
      setIsLogin(true);
      setLoginData({ email: quenEmail, password: "" });
      setThongBao(kq.message);
    } catch (err) {
      setError(getErrorMessage(err, "Không đổi được mật khẩu. Vui lòng thử lại."));
    } finally {
      setLoading(false);
    }
  };

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

      // Dang nhap nhan CA dia chi day du lan ten tai khoan ngan ("thesang"
      // thay cho "thesang@gmail.com"). Quy tac tra cuu o may chu - xem
      // backend/src/utils/dinhDanhDangNhap.js.
      if (!dinhDanhDangNhapHopLe(email)) {
        setError("Email hoặc tên tài khoản không hợp lệ");
        setLoading(false);
        return;
      }

      // Gui chuoi da chuan hoa, khong gui nguyen thu nguoi dung go
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
    // overflow-y-auto tren lop phu, KHONG phai items-center don thuan.
    //
    // Ban cu dung "flex items-center" ma lop phu khong cuon duoc. Khi bang cao
    // hon man hinh, items-center day phan thua ra ca TREN lan duoi - va nut
    // dong nam o goc tren nen no troi han ra ngoai man hinh. Do duoc tren ban
    // that o 844x390 (iPhone 12 Pro xoay ngang): nut dong o y = -22, tuc la
    // khach mo bang ra roi thi khong con cach nao dong lai.
    //
    // my-auto giu bang nam giua khi con du cho, va tu bo can giua khi khong
    // du - luc do bang bat dau tu mep tren va cuon xuong, nut dong luon cham
    // toi duoc.
    // z-[60] chu KHONG phai z-50: header la `fixed ... z-50`. Bang cung z-50
    // thi hai ben ngang co, va header - dung sau trong cay - thang. Tren man
    // hinh cao thi bang nam duoi dai header nen khong ai thay; tren dien thoai
    // xoay ngang thi dinh bang chui vao dung dai do, va cu bam nut dong la
    // trung link tren header. Do duoc: bam "dong" nhay sang /gpa-calculator.
    <div className="fixed inset-0 z-[60] flex justify-center overflow-y-auto overscroll-contain bg-black/50 p-4">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative my-auto w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-slate-200 sm:p-8">
        <button
          type="button"
          onClick={onClose}
          // h-11 w-11: 44px la kich thuoc vung cham toi thieu Apple khuyen
          // nghi. Ban cu la 25x40 - hut mot nut nho nhu vay tren dien thoai
          // rat de truot tay.
          className="absolute top-3 right-3 flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-xl leading-none text-slate-600 transition hover:bg-slate-200"
          aria-label="Close auth modal"
        >
          ×
        </button>

        <h2 className="mb-2 text-center text-3xl font-bold">
          {quenBuoc ? "Quên mật khẩu" : isLogin ? "Đăng nhập" : "Đăng ký"}
        </h2>

        {/* Vi sao hop nay hien ra. Khach bam "Vào học" roi thay mot o dang
            nhap khong loi giai thich se tuong minh bam nham. */}
        {loiNhan && !quenBuoc && (
          <p className="mb-4 text-center text-xs text-slate-500">{loiNhan}</p>
        )}

        {/* Trong luong quen mat khau thi KHONG hien hai tab: dang o giua mot
            viec co ba buoc, bam sang "Đăng ký" la mat het cong da lam ma
            khong ai bao truoc. */}
        {!quenBuoc && (
          <div className="mt-4 mb-6 flex rounded-2xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => {
                setIsLogin(true);
                donDep();
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
                donDep();
              }}
              className={`flex-1 rounded-2xl py-2 text-sm font-semibold transition ${
                !isLogin
                  ? "bg-blue-600 text-white"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Đăng ký
            </button>
          </div>
        )}

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

        {!quenBuoc && (
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
        )}

        {quenBuoc === "email" ? (
          <form onSubmit={guiMa} className="space-y-4">
            <p className="text-xs leading-relaxed text-slate-600">
              Nhập email hoặc tên tài khoản bạn dùng để đăng nhập. Chúng tôi sẽ gửi một mã
              gồm {SO_CHU_SO_MA} chữ số tới hộp thư đó.
            </p>
            {/* Xem ghi chu o o dang nhap: type="email" se chan ten ngan. */}
            <input
              type="text"
              placeholder="Email hoặc tên tài khoản"
              value={quenEmail}
              onChange={(e) => setQuenEmail(e.target.value)}
              required
              autoFocus
              autoComplete="username"
              maxLength={DAI_EMAIL_TOI_DA}
              className="w-full rounded-2xl border border-slate-300 p-3 text-black transition outline-none placeholder:text-slate-500 focus:border-blue-600"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-blue-600 py-3 text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Đang gửi..." : "Gửi mã"}
            </button>
            <button
              type="button"
              onClick={thoatLuongQuen}
              className="w-full text-center text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              Quay lại đăng nhập
            </button>
          </form>
        ) : quenBuoc === "ma" ? (
          <form onSubmit={xacNhanMa} className="space-y-4">
            <p className="text-xs leading-relaxed text-slate-600">
              Mở hộp thư <span className="font-semibold">{quenEmail}</span> và nhập mã vào
              ô dưới. Nhớ xem cả mục Spam.
            </p>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="000000"
              value={quenMa}
              // Loc bo moi thu khong phai chu so ngay luc go: nguoi dung hay
              // dan ca cum "Mã: 482913" tu email vao.
              onChange={(e) =>
                setQuenMa(e.target.value.replace(/\D/g, "").slice(0, SO_CHU_SO_MA))
              }
              required
              autoFocus
              maxLength={SO_CHU_SO_MA}
              className="w-full rounded-2xl border border-slate-300 p-3 text-center font-mono text-2xl tracking-[0.5em] text-black transition outline-none placeholder:text-slate-300 focus:border-blue-600"
            />
            <button
              type="submit"
              disabled={loading || quenMa.length !== SO_CHU_SO_MA}
              className="w-full rounded-2xl bg-blue-600 py-3 text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Đang kiểm tra..." : "Xác nhận"}
            </button>
            <div className="flex items-center justify-between text-xs font-semibold">
              {/* Gui lai ma. May chu tu dem so lan gui va tu chan khi du -
                  giao dien khong khoa nut nay va khong dem nguoc, vi lam vay
                  la noi cho nguoi ta biet con bao nhieu lan va bao lau. */}
              <button
                type="button"
                onClick={() => guiMa()}
                disabled={loading}
                className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
              >
                Gửi lại mã
              </button>
              <button
                type="button"
                onClick={thoatLuongQuen}
                className="text-slate-500 hover:text-slate-800"
              >
                Quay lại đăng nhập
              </button>
            </div>
          </form>
        ) : quenBuoc === "matKhau" ? (
          <form onSubmit={doiMatKhau} className="space-y-4">
            <p className="text-xs leading-relaxed text-slate-600">
              Mã hợp lệ. Đặt mật khẩu mới cho tài khoản{" "}
              <span className="font-semibold">{quenEmail}</span>.
            </p>
            <input
              type="password"
              placeholder={`Mật khẩu mới (tối thiểu ${DAI_MAT_KHAU_TOI_THIEU} ký tự)`}
              value={mkMoi}
              onChange={(e) => setMkMoi(e.target.value)}
              required
              autoFocus
              autoComplete="new-password"
              minLength={DAI_MAT_KHAU_TOI_THIEU}
              className="w-full rounded-2xl border border-slate-300 p-3 text-black transition outline-none placeholder:text-slate-500 focus:border-blue-600"
            />
            <input
              type="password"
              placeholder="Nhập lại mật khẩu mới"
              value={mkXacNhan}
              onChange={(e) => setMkXacNhan(e.target.value)}
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
              {loading ? "Đang đổi..." : "Đổi mật khẩu"}
            </button>
          </form>
        ) : isLogin ? (
          <form
            onSubmit={handleLoginSubmit}
            className="space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* type="text" chu KHONG phai "email": trinh duyet tu chan
                khong cho gui khi o type="email" khong chua dau @, nen de
                nguyen la khong ai dang nhap bang ten tai khoan ngan duoc. */}
            <input
              type="text"
              name="email"
              placeholder="Email hoặc tên tài khoản"
              value={loginData.email}
              onChange={handleLoginChange}
              required
              autoComplete="username"
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
            <button
              type="button"
              onClick={() => {
                donDep();
                // Mang san email ho vua go sang buoc 1 - gan nhu luon la dia
                // chi ho dinh dat lai, bat go lai la vo ich.
                setQuenEmail(loginData.email.trim().toLowerCase());
                setQuenBuoc("email");
              }}
              className="w-full text-center text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              Quên mật khẩu?
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
