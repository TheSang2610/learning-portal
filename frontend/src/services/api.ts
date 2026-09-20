import { datNguoiDung, yeuCauNapLai } from "@/src/hooks/nguoiDungLuu";
import { GOC_API_TRINH_DUYET as GOC_API } from "./diaChiApi";
import { clearApiCache, xoaPhien } from "./apiHelper";

// Dung chung GOC_API voi apiHelper va serverFetch. Truoc day file nay tu doc
// bien moi truong theo thu tu NGUOC lai - xem ghi chu trong diaChiApi.ts.
const API_URL = `${GOC_API}/api/users`;

interface RegisterUserData {
  name: string;
  /** Dang chuan 0XXXXXXXXX - xem chuanHoaSoDienThoai trong quyDinh.ts. */
  phone: string;
  /** Tuy chon. Chuoi rong = khong nhap; may chu se bo han truong nay. */
  email?: string;
  password: string;
  role?: string;
}

interface LoginUserData {
  email: string;
  password: string;
}

// Ba duong dang nhap/dang ky deu tra ve cung mot hinh dang: thong tin rut gon
// cua nguoi dung kem token. Rieng Google co them hai truong anh.
interface LoginResponse {
  _id: string;
  name: string;
  email: string;
  role: string;
  token: string;
}

// avatar la anh trong CSDL (rong cho toi khi nguoi dung tu tai len), con
// googlePicture la anh muon tam cua Google - CHI co trong phan hoi, khong luu.
interface GoogleLoginResponse extends LoginResponse {
  avatar: string;
  googlePicture: string;
}

const parseResponse = async (res: Response) => {
  const text = await res.text();
  let json;

  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { message: text || res.statusText };
  }

  if (!res.ok) {
    throw new Error(json.message || `Request failed with status ${res.status}`);
  }

  return json;
};

// Dang ky tra ve 201 kem danh tinh va cookie phien - vao thang, khong qua
// buoc mo hom thu.
//
// Truoc day co hinh dang thu hai: 202 { message, canXacMinh } khi may chu vua
// gui thu xac minh. Da bo cung luc voi buoc do o may chu. Van de Partial va
// `message` lai vi cac nhanh loi tra ve { message } khong kem danh tinh.
export interface RegisterResponse extends Partial<LoginResponse> {
  message?: string;
}

export const registerUser = async (
  userData: RegisterUserData,
): Promise<RegisterResponse> => {
  let res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    // Can thiet de trinh duyet NHAN cookie token may chu dat trong phan hoi.
    credentials: "include",
    body: JSON.stringify(userData),
  });

  if (res.status === 404) {
    res = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(userData),
    });
  }

  const data = await parseResponse(res);

  // ✅ Lưu token sau khi register
  // Token KHONG con di trong than phan hoi - no nam trong cookie httpOnly do
  // may chu dat. O day chi luu phan thong tin hien thi.
  if (data && data._id) {
    // Danh tinh giu trong RAM, khong ghi xuong localStorage nua (xem
    // src/hooks/nguoiDungLuu.ts). Dat tam bon truong tu than phan hoi cho
    // giao dien hien ngay, roi nho nap lai ho so day du.
    datNguoiDung(data);
    yeuCauNapLai();
    // Bo dem GET trong apiHelper song 30 giay va chi khoa theo dia chi, khong
    // theo nguoi dung. Dang nhap khong di qua apiRequest nen khong tu xoa - phai
    // xoa tay o day, neu khong nguoi vua dang nhap co the nhan lai du lieu cua
    // nguoi dung truoc do tren cung trinh duyet.
    clearApiCache();
  }

  return data;
};

export const loginUser = async (userData: LoginUserData): Promise<LoginResponse> => {
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    // Can thiet de trinh duyet NHAN cookie token may chu dat trong phan hoi.
    credentials: "include",
    body: JSON.stringify(userData),
  });

  const data = await parseResponse(res);

  // ✅ LƯU TOKEN SAU KHI LOGIN - ĐÂY LÀ ĐIỀU QUAN TRỌNG
  // Token KHONG con di trong than phan hoi - no nam trong cookie httpOnly do
  // may chu dat. O day chi luu phan thong tin hien thi.
  if (data && data._id) {
    // Danh tinh giu trong RAM, khong ghi xuong localStorage nua (xem
    // src/hooks/nguoiDungLuu.ts). Dat tam bon truong tu than phan hoi cho
    // giao dien hien ngay, roi nho nap lai ho so day du.
    datNguoiDung(data);
    yeuCauNapLai();
    // Bo dem GET trong apiHelper song 30 giay va chi khoa theo dia chi, khong
    // theo nguoi dung. Dang nhap khong di qua apiRequest nen khong tu xoa - phai
    // xoa tay o day, neu khong nguoi vua dang nhap co the nhan lai du lieu cua
    // nguoi dung truoc do tren cung trinh duyet.
    clearApiCache();
  }

  return data;
};

export const googleLogin = async (credential: string): Promise<GoogleLoginResponse> => {
  const res = await fetch(`${API_URL}/google`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    // Can thiet de trinh duyet NHAN cookie token may chu dat trong phan hoi.
    credentials: "include",
    body: JSON.stringify({ credential }),
  });

  const data = await parseResponse(res);

  // ✅ Lưu token sau Google login
  // Token KHONG con di trong than phan hoi - no nam trong cookie httpOnly do
  // may chu dat. O day chi luu phan thong tin hien thi.
  if (data && data._id) {
    // Danh tinh giu trong RAM, khong ghi xuong localStorage nua (xem
    // src/hooks/nguoiDungLuu.ts). Dat tam bon truong tu than phan hoi cho
    // giao dien hien ngay, roi nho nap lai ho so day du.
    datNguoiDung(data);
    yeuCauNapLai();
    // Bo dem GET trong apiHelper song 30 giay va chi khoa theo dia chi, khong
    // theo nguoi dung. Dang nhap khong di qua apiRequest nen khong tu xoa - phai
    // xoa tay o day, neu khong nguoi vua dang nhap co the nhan lai du lieu cua
    // nguoi dung truoc do tren cung trinh duyet.
    clearApiCache();
  }

  return data;
};

/* --------------------------- Quen mat khau ------------------------------ */
//
// Ba buoc: xin ma -> nhap ma lay "phieu" -> dung phieu dat mat khau moi.
// Toan bo chinh sach (ma song bao lau, sai may lan thi khoa) nam o may chu -
// xem backend/src/controllers/quenMatKhauController.js.
//
// HAI DIEU GIAO DIEN PHAI TON TRONG, dung "sua lai cho than thien":
//
//   1. May chu tra ve CUNG MOT CAU cho moi ket cuc cua buoc xin ma - ke ca
//      khi dia chi do khong co tai khoan nao. Do la co y: tra loi khac nhau
//      la bien duong nay thanh cai may tra loi "ai la nguoi dung cua he
//      thong". Giao dien cu hien nguyen cau do ra, dung tu suy dien them.
//
//   2. Khi bi khoa vi nhap sai qua nhieu, may chu van tra ve dung cau "ma
//      khong dung" va KHONG noi con bao lau nua thi mo lai. Nguoi dung duoc
//      bao bang mot la thu gui ve hom thu. Dung co bay ra cho nay mot bo dem
//      dem nguoc - lam vay la pha dung cai dinh giu kin.

/** Buoc 1: xin ma. Luon "thanh cong", ke ca voi dia chi khong co tai khoan. */
export const xinMaDatLai = async (email: string): Promise<{ message: string }> => {
  const res = await fetch(`${API_URL}/quen-mat-khau`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return parseResponse(res);
};

/** Buoc 2: nhap ma. Dung thi nhan ve phieu - thu mang quyen dat mat khau moi. */
export const kiemMaDatLai = async (
  email: string,
  ma: string,
): Promise<{ message: string; phieu: string }> => {
  const res = await fetch(`${API_URL}/quen-mat-khau/kiem-ma`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, ma }),
  });
  return parseResponse(res);
};

/**
 * Buoc 3: dat mat khau moi.
 *
 * KHONG dang nhap luon sau buoc nay - may chu co y tra ve phien trang. Bat
 * nguoi dung go lai mat khau vua dat mot lan nua tren man hinh dang nhap la
 * cach re nhat de ho nho no, va de ho phat hien ngay neu vua go nham.
 */
export const datLaiMatKhau = async (
  phieu: string,
  matKhauMoi: string,
  xacNhan: string,
): Promise<{ message: string }> => {
  const res = await fetch(`${API_URL}/quen-mat-khau/dat-lai`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phieu, matKhauMoi, xacNhan }),
  });
  return parseResponse(res);
};

export const logout = (): Promise<void> => {
  // Dung xoaPhien: no goi ca /users/logout de may chu xoa cookie httpOnly,
  // don bo dem GET, va ban su kien cho cac header cap nhat lai.
  //
  // Tra ve Promise cua no: noi goi phai await truoc khi dieu huong, neu khong
  // request bi huy giua chung va cookie con nguyen.
  return xoaPhien();
};

export interface User {
  _id?: string;
  name: string;
  email: string;
  role?: string;
  createdAt?: string;
}
