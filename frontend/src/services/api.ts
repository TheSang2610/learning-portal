import { datNguoiDung, yeuCauNapLai } from "@/src/hooks/nguoiDungLuu";
import { GOC_API_TRINH_DUYET as GOC_API } from "./diaChiApi";
import { clearApiCache, xoaPhien } from "./apiHelper";

// Dung chung GOC_API voi apiHelper va serverFetch. Truoc day file nay tu doc
// bien moi truong theo thu tu NGUOC lai - xem ghi chu trong diaChiApi.ts.
const API_URL = `${GOC_API}/api/users`;

interface RegisterUserData {
  name: string;
  email: string;
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

// Dang ky co HAI hinh dang phan hoi, va noi goi phai phan biet duoc:
//
//   202 { message, canXacMinh }  binh thuong - may chu vua gui thu xac minh,
//                                CHUA co phien dang nhap nao.
//   201 { _id, name, ... }       chi khi may chu chua cau hinh hom thu (may
//                                dev): tao tai khoan va dang nhap luon.
//
// Vi sao khong con dang nhap thang: xem registerUser trong
// backend/src/controllers/userController.js.
export interface RegisterResponse extends Partial<LoginResponse> {
  message?: string;
  canXacMinh?: boolean;
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

// Kich hoat tai khoan bang token trong email dang ky.
//
// May chu tra ve dung hinh dang cua dang nhap (kem cookie phien), vi bam duoc
// vao lien ket trong hom thu la da chung minh so huu dia chi - bat go lai mat
// khau mot lan nua chi lam phien chu khong them an toan.
export const verifyEmail = async (token: string): Promise<LoginResponse> => {
  const res = await fetch(`${API_URL}/verify-email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    // Can thiet de trinh duyet NHAN cookie token may chu dat trong phan hoi.
    credentials: "include",
    body: JSON.stringify({ token }),
  });

  const data = await parseResponse(res);

  if (data && data._id) {
    datNguoiDung(data);
    yeuCauNapLai();
    // Cung ly do voi loginUser: bo dem GET khoa theo dia chi chu khong theo
    // nguoi dung, khong xoa thi nguoi vua vao co the nhan du lieu cua nguoi truoc.
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
