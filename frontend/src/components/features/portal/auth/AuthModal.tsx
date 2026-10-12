"use client";

import { storeUser, requireReload } from "@/src/hooks/userStore";
import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { getErrorMessage } from "@/src/services/apiHelper";
import Image from "next/image";

import styles from "./AuthModal.module.scss";
import {
  loginUser,
  registerUser,
  requestResetCode,
  verifyResetCode,
  resetPassword,
} from "@/src/services/api";
import {
  MAX_EMAIL_LENGTH,
  MIN_PASSWORD_LENGTH,
  MAX_NAME_LENGTH,
  isValidEmail,
  isValidLoginId,
  validateName,
  newPasswordError,
  normalizePhone,
} from "@/src/services/rules";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  /** Cau giai thich vi sao hop nay hien ra, vi du khi khach bam vao hoc. */
  labelError?: string;
}

// So chu so cua ma dat lai. Khop voi DIGIT_COUNT trong
// backend/src/utils/otpCode.js - lech la nut xac nhan khong bao gio bat len.
const CODE_DIGITS = 6;

// Ba buoc cua luong quen mat khau. Chuoi rong = khong o trong luong nay.
type ForgotStep = "" | "email" | "ma" | "matKhau";

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
const goDirect = (role?: string) => {
  if (role === "admin") return window.location.replace("/admin/dashboard");
  if (role === "instructor") return window.location.replace("/instructor");

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
  const address = new URL(window.location.href);
  address.searchParams.delete("auth");
  address.searchParams.delete("vi");
  return window.location.replace(address.toString());
};

export default function AuthModal({ open, onClose, labelError }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // Hien cau nhac "neu ban dang ky bang Google..." sau khi dang nhap that bai.
  // May chu tra cung mot cau cho moi truong hop that bai (co y - xem
  // backend/src/controllers/userController.js), nen phia giao dien phai tu
  // nhac de nguoi dung Google khong ket o day.
  const [googleHint, setGoogleHint] = useState(false);
  // Cau bao thanh cong nhung KHONG dong hop lai: sau khi dang ky, nguoi dung
  // chua dang nhap ma phai mo hom thu, nen ho can doc duoc cau nay.
  const [notification, setNotification] = useState("");

  // Escape de dong. Truoc day khong co, va do la loi that chu khong phai thieu
  // tien nghi: tren dien thoai xoay ngang nut dong bi troi ra ngoai man hinh
  // (xem ghi chu o lop phu ben duoi), luc do ban phim la loi thoat duy nhat
  // con lai cho nguoi dung ban phim. Gio ca hai duong deu thong.
  useEffect(() => {
    if (!open) return;

    const onKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    // Khoa cuon cua trang ben duoi. Khong khoa thi tren dien thoai, luot trong
    // bang den cuoi se keo theo ca trang phia sau troi di - dong bang ra thi
    // nguoi dung dung o mot cho hoan toan khac.
    const previousScroll = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyPress);

    return () => {
      window.removeEventListener("keydown", onKeyPress);
      document.body.style.overflow = previousScroll;
    };
  }, [open, onClose]);

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [registerData, setRegisterData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    role: "student",
  });

  /* ------------------------- Quen mat khau ------------------------------ */
  //
  // Ba buoc, ba man hinh, mot hop. Toan bo chinh sach nam o may chu - xem
  // src/services/api.ts va backend/src/controllers/passwordResetController.js.
  //
  // KHONG duoc them bo dem nguoc "thu lai sau N phut" o day. May chu co y
  // khong noi con bao lau nua thi mo lai, va nguoi dung duoc bao bang mot la
  // thu gui ve hom thu. Bay ra mot con so o giao dien la pha dung cai dinh
  // giu kin.
  const [forgotStep, setForgotStep] = useState<ForgotStep>("");
  const [quenEmail, setQuenEmail] = useState("");
  const [forgotCode, setForgotCode] = useState("");
  // Cap ra sau khi nhap dung ma. Chi song trong bo nho cua trang nay: dong
  // tab la mat, va phieu chi co han 5 phut ben may chu.
  const [ticket, setTicket] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Dua hop ve mot trang thai sach. Goi khi doi tab hoac ra/vao luong quen
  // mat khau, de cau bao loi cua man hinh truoc khong dinh sang man hinh sau.
  const cleanup = () => {
    setError("");
    setNotification("");
    setGoogleHint(false);
  };

  const exitForgotFlow = () => {
    cleanup();
    setForgotStep("");
    setForgotCode("");
    setTicket("");
    setNewPassword("");
    setConfirmPassword("");
  };

  // Buoc 1: xin ma.
  //
  // Dung chung cho ca lan gui DAU va lan GUI LAI - may chu tu dem so lan gui,
  // giao dien khong can biet dang o lan thu may.
  const sendCode = async (e?: FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    cleanup();

    // Nhan ca ten tai khoan ngan, giong o dang nhap: bat nguoi da quen mat
    // khau phai nho chinh xac ca dia chi thi vo ly.
    const email = quenEmail.trim().toLowerCase();
    if (!isValidLoginId(email)) {
      setError("Email hoặc tên tài khoản không hợp lệ");
      return;
    }

    setLoading(true);
    try {
      const outcome = await requestResetCode(email);
      setQuenEmail(email);
      setForgotStep("ma");
      // Hien NGUYEN cau may chu tra ve. Cau do co y khong khang dinh dia chi
      // nay co tai khoan hay khong - viet lai thanh "Đã gửi mã tới <email>"
      // la bien hop nay thanh cai may tra loi "dia chi nay co tai khoan
      // khong". Xem ghi chu o src/services/api.ts.
      setNotification(outcome.message);
    } catch (err) {
      setError(getErrorMessage(err, "Không gửi được mã. Vui lòng thử lại."));
    } finally {
      setLoading(false);
    }
  };

  // Buoc 2: nhap ma, doi lay phieu.
  const confirmCode = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    cleanup();

    if (forgotCode.length !== CODE_DIGITS) {
      setError(`Mã gồm ${CODE_DIGITS} chữ số`);
      return;
    }

    setLoading(true);
    try {
      const outcome = await verifyResetCode(quenEmail, forgotCode);
      setTicket(outcome.phieu);
      setForgotStep("matKhau");
    } catch (err) {
      // May chu tra CUNG mot cau cho ma sai, ma het han, va ca truong hop dang
      // bi khoa. Hien nguyen cau do - dung doan ho la dang o truong hop nao.
      setError(getErrorMessage(err, "Mã không đúng hoặc đã hết hạn."));
      setForgotCode("");
    } finally {
      setLoading(false);
    }
  };

  // Buoc 3: dat mat khau moi.
  const changePassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    cleanup();

    // Kiem o day de nguoi dung biet ngay, khong phai doi mot luot mang. May
    // chu VAN kiem lai ca hai dieu nay - giao dien khong phai duong duy nhat
    // goi toi do duoc.
    const passwordError = newPasswordError(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Hai lần nhập mật khẩu không giống nhau");
      return;
    }

    setLoading(true);
    try {
      const outcome = await resetPassword(ticket, newPassword, confirmPassword);
      // Ve man hinh dang nhap, dien san email de ho chi phai go mat khau moi.
      exitForgotFlow();
      setIsLogin(true);
      setLoginData({ email: quenEmail, password: "" });
      setNotification(outcome.message);
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
    setNotification("");
    setGoogleHint(false);

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
      // backend/src/utils/loginIdentifier.js.
      if (!isValidLoginId(email)) {
        setError("Email hoặc tên tài khoản không hợp lệ");
        setLoading(false);
        return;
      }

      // Gui chuoi da chuan hoa, khong gui nguyen thu nguoi dung go
      const data = await loginUser({ email, password: loginData.password });

      // Token nam trong cookie httpOnly do may chu dat, khong con trong than
      // phan hoi. localStorage chi giu phan thong tin de hien thi.
      // Danh tinh giu trong RAM (xem src/hooks/userStore.ts).
      // storeUser() da tu ban su kien "userInfoChanged".
      storeUser(data);
      requireReload();
      onClose();
      goDirect(data?.role);
    } catch (error) {
      setError(getErrorMessage(error, "Đăng nhập thất bại"));
      // May chu CO Y tra cung mot cau cho ca ba truong hop: email khong ton
      // tai, sai mat khau, va tai khoan chi dang nhap bang Google. Tra khac
      // nhau la bien duong dang nhap thanh cai may tra loi "email nay co trong
      // he thong khong". Nhac nut Google o day de nguoi dung Google khong bi
      // ket - cau nhac nay hien cho MOI nguoi nen no khong to them gi.
      setGoogleHint(true);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setNotification("");
    setGoogleHint(false);

    try {
      // ✅ Validate trước khi gửi
      const name = registerData.name.trim();

      // Số điện thoại là thứ bắt buộc duy nhất để định danh; email tùy chọn.
      const phone = normalizePhone(registerData.phone);

      // Email để trống thì gửi chuỗi rỗng — máy chủ hiểu là "không nhập" và
      // bỏ hẳn trường đó khỏi bản ghi. Xem registerUser bên backend: lưu null
      // hay chuỗi rỗng đều làm hỏng chỉ mục sparse của cột email.
      const email = registerData.email.trim().toLowerCase();

      if (!name || !registerData.phone.trim() || !registerData.password) {
        setError("Vui lòng điền họ tên, số điện thoại và mật khẩu");
        setLoading(false);
        return;
      }

      if (!phone) {
        setError(
          "Số điện thoại không hợp lệ. Nhập số di động 10 chữ số, ví dụ 0901234567.",
        );
        setLoading(false);
        return;
      }

      if (email && !isValidEmail(email)) {
        setError("Email không hợp lệ");
        setLoading(false);
        return;
      }

      const nameError = validateName(name);
      if (nameError) {
        setError(nameError);
        setLoading(false);
        return;
      }

      // Dung chung ham voi backend (xem services/rules.ts). Truoc day cho
      // nay chi kiem do dai TOI THIEU, khong kiem toi da - ma bcrypt bo lang
      // moi byte tu 73 tro di, nen nguoi dung dat mat khau that dai roi tin
      // rang ca chuoi deu duoc tinh.
      const passwordError = newPasswordError(registerData.password);
      if (passwordError) {
        setError(passwordError);
        setLoading(false);
        return;
      }

      // Gửi số đã CHUẨN HÓA chứ không gửi nguyên thứ người dùng gõ. Máy chủ
      // cũng chuẩn hóa lại, nhưng gửi dạng chuẩn thì hai bên chắc chắn thấy
      // cùng một giá trị.
      const data = await registerUser({ ...registerData, name, phone, email });

      // Dang ky xong la vao thang, khong qua buoc mo hom thu.
      //
      // Truoc day cho nay con mot nhanh nua: may chu tra 202 khong kem danh
      // tinh, giao dien hien "da gui thu, mo hom thu de hoan tat". Da bo cung
      // luc voi buoc xac minh o may chu - email gio chi dung de doi mat khau
      // va de quan tri gui thong bao.

      // Danh tinh giu trong RAM (xem src/hooks/userStore.ts).
      // storeUser() da tu ban su kien "userInfoChanged".
      storeUser(data);
      requireReload();
      onClose();
      goDirect(data?.role);
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
          // Danh tinh giu trong RAM (xem src/hooks/userStore.ts).
          storeUser(user);
          requireReload();
          window.removeEventListener("message", messageHandler);
          onClose();
          goDirect(user?.role);
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
    <div className={styles.overlay}>
      <div className={styles.floating} onClick={onClose} />

      <div className={styles.card}>
        <button
          type="button"
          onClick={onClose}
          // h-11 w-11: 44px la kich thuoc vung cham toi thieu Apple khuyen
          // nghi. Ban cu la 25x40 - hut mot nut nho nhu vay tren dien thoai
          // rat de truot tay.
          className={styles.button}
          aria-label="Close auth modal"
        >
          ×
        </button>

        <h2 className={styles.heading}>
          {forgotStep ? "Quên mật khẩu" : isLogin ? "Đăng nhập" : "Đăng ký"}
        </h2>

        {/* Vi sao hop nay hien ra. Khach bam "Vào học" roi thay mot o dang
            nhap khong loi giai thich se tuong minh bam nham. */}
        {labelError && !forgotStep && <p className={styles.text}>{labelError}</p>}

        {/* Trong luong quen mat khau thi KHONG hien hai tab: dang o giua mot
            viec co ba buoc, bam sang "Đăng ký" la mat het cong da lam ma
            khong ai bao truoc. */}
        {!forgotStep && (
          <div className={styles.row}>
            <button
              type="button"
              onClick={() => {
                setIsLogin(true);
                cleanup();
              }}
              className={`${styles.button10} ${
                isLogin ? styles.button2 : styles.button3
              }`}
            >
              Đăng nhập
            </button>

            <button
              type="button"
              onClick={() => {
                setIsLogin(false);
                cleanup();
              }}
              className={`${styles.button10} ${
                !isLogin ? styles.button2 : styles.button3
              }`}
            >
              Đăng ký
            </button>
          </div>
        )}

        {error && (
          <div className={styles.card2}>
            {error}
            {googleHint && (
              <p className={styles.text2}>
                Nếu bạn đã đăng ký bằng Google, hãy dùng nút “Tiếp tục với Google” ở trên.
              </p>
            )}
          </div>
        )}

        {notification && <div className={styles.card3}>{notification}</div>}

        {!forgotStep && (
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className={styles.button4}
          >
            <Image
              src="https://www.svgrepo.com/show/355037/google.svg"
              alt="Google logo"
              width={20}
              height={20}
              className={styles.box}
            />
            Tiếp tục với Google
          </button>
        )}

        {forgotStep === "email" ? (
          <form onSubmit={sendCode} className={styles.form}>
            {/* Nói rõ là phải có EMAIL, không nhận số điện thoại.
                Đăng ký chỉ bắt buộc số điện thoại, nên có tài khoản không có
                email — và chưa gắn nhà cung cấp SMS nào thì không có chỗ nào
                gửi mã tới. Không nói trước thì người dùng gõ số vào, nhận câu
                "đã gửi mã" rồi ngồi đợi một tin nhắn không bao giờ tới.

                Máy chủ vẫn trả đúng một câu cho mọi trường hợp, kể cả tài
                khoản không có email — nói riêng ra là biến đường này thành
                máy trả lời câu hỏi ai có email ai không. */}
            <p className={styles.text3}>
              Nhập email của tài khoản. Chúng tôi sẽ gửi một mã gồm {CODE_DIGITS} chữ số
              tới hộp thư đó.
            </p>
            <p className={styles.text4}>
              Tài khoản đăng ký bằng số điện thoại mà chưa thêm email thì chưa tự lấy lại
              mật khẩu được — nhắn quản trị viên để được đặt lại.
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
              maxLength={MAX_EMAIL_LENGTH}
              className={styles.input}
            />
            <button type="submit" disabled={loading} className={styles.button5}>
              {loading ? "Đang gửi..." : "Gửi mã"}
            </button>
            <button type="button" onClick={exitForgotFlow} className={styles.button6}>
              Quay lại đăng nhập
            </button>
          </form>
        ) : forgotStep === "ma" ? (
          <form onSubmit={confirmCode} className={styles.form}>
            <p className={styles.text3}>
              Mở hộp thư <span className={styles.label}>{quenEmail}</span> và nhập mã vào
              ô dưới. Nhớ xem cả mục Spam.
            </p>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="000000"
              value={forgotCode}
              // Loc bo moi thu khong phai chu so ngay luc go: nguoi dung hay
              // dan ca cum "Mã: 482913" tu email vao.
              onChange={(e) =>
                setForgotCode(e.target.value.replace(/\D/g, "").slice(0, CODE_DIGITS))
              }
              required
              autoFocus
              maxLength={CODE_DIGITS}
              className={styles.input2}
            />
            <button
              type="submit"
              disabled={loading || forgotCode.length !== CODE_DIGITS}
              className={styles.button5}
            >
              {loading ? "Đang kiểm tra..." : "Xác nhận"}
            </button>
            <div className={styles.row2}>
              {/* Gui lai ma. May chu tu dem so lan gui va tu chan khi du -
                  giao dien khong khoa nut nay va khong dem nguoc, vi lam vay
                  la noi cho nguoi ta biet con bao nhieu lan va bao lau. */}
              <button
                type="button"
                onClick={() => sendCode()}
                disabled={loading}
                className={styles.button7}
              >
                Gửi lại mã
              </button>
              <button type="button" onClick={exitForgotFlow} className={styles.button8}>
                Quay lại đăng nhập
              </button>
            </div>
          </form>
        ) : forgotStep === "matKhau" ? (
          <form onSubmit={changePassword} className={styles.form}>
            <p className={styles.text3}>
              Mã hợp lệ. Đặt mật khẩu mới cho tài khoản{" "}
              <span className={styles.label}>{quenEmail}</span>.
            </p>
            <input
              type="password"
              placeholder={`Mật khẩu mới (tối thiểu ${MIN_PASSWORD_LENGTH} ký tự)`}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              autoFocus
              autoComplete="new-password"
              minLength={MIN_PASSWORD_LENGTH}
              className={styles.input}
            />
            <input
              type="password"
              placeholder="Nhập lại mật khẩu mới"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              minLength={MIN_PASSWORD_LENGTH}
              className={styles.input}
            />
            <button type="submit" disabled={loading} className={styles.button5}>
              {loading ? "Đang đổi..." : "Đổi mật khẩu"}
            </button>
          </form>
        ) : isLogin ? (
          <form
            onSubmit={handleLoginSubmit}
            className={styles.form}
            onClick={(e) => e.stopPropagation()}
          >
            {/* type="text" chu KHONG phai "email": trinh duyet tu chan
                khong cho gui khi o type="email" khong chua dau @, nen de
                nguyen la khong ai dang nhap bang ten tai khoan ngan duoc. */}
            <input
              type="text"
              name="email"
              placeholder="Số điện thoại hoặc email"
              value={loginData.email}
              onChange={handleLoginChange}
              required
              autoComplete="username"
              maxLength={MAX_EMAIL_LENGTH}
              className={styles.input}
            />
            <input
              type="password"
              name="password"
              placeholder="Mật khẩu"
              value={loginData.password}
              onChange={handleLoginChange}
              required
              autoComplete="current-password"
              className={styles.input}
            />
            <button type="submit" disabled={loading} className={styles.button5}>
              {loading ? "Đang xử lý..." : "Đăng nhập"}
            </button>
            <button
              type="button"
              onClick={() => {
                cleanup();
                // Mang san email ho vua go sang buoc 1 - gan nhu luon la dia
                // chi ho dinh dat lai, bat go lai la vo ich.
                setQuenEmail(loginData.email.trim().toLowerCase());
                setForgotStep("email");
              }}
              className={styles.button9}
            >
              Quên mật khẩu?
            </button>
          </form>
        ) : (
          <form
            onSubmit={handleRegisterSubmit}
            className={styles.form}
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
              maxLength={MAX_NAME_LENGTH}
              className={styles.input}
            />
            {/* inputMode="tel" mở bàn phím số trên điện thoại. type vẫn là
                "tel" chứ không phải "number": "number" cắt mất số 0 ở đầu ở
                một số trình duyệt, và 0 đầu là thứ không được mất. */}
            <input
              type="tel"
              name="phone"
              inputMode="tel"
              placeholder="Số điện thoại"
              value={registerData.phone}
              onChange={handleRegisterChange}
              required
              autoComplete="tel"
              maxLength={15}
              className={styles.input}
            />

            <input
              type="email"
              name="email"
              placeholder="Email (không bắt buộc)"
              value={registerData.email}
              onChange={handleRegisterChange}
              autoComplete="email"
              maxLength={MAX_EMAIL_LENGTH}
              className={styles.input}
            />

            <input
              type="password"
              name="password"
              placeholder={`Mật khẩu (tối thiểu ${MIN_PASSWORD_LENGTH} ký tự)`}
              value={registerData.password}
              onChange={handleRegisterChange}
              required
              autoComplete="new-password"
              minLength={MIN_PASSWORD_LENGTH}
              className={styles.input}
            />
            <button type="submit" disabled={loading} className={styles.button5}>
              {loading ? "Đang xử lý..." : "Đăng ký"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
