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

export const registerUser = async (
  userData: RegisterUserData,
): Promise<LoginResponse> => {
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
    localStorage.setItem("userInfo", JSON.stringify(data));
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
    localStorage.setItem("userInfo", JSON.stringify(data));
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
    localStorage.setItem("userInfo", JSON.stringify(data));
    // Bo dem GET trong apiHelper song 30 giay va chi khoa theo dia chi, khong
    // theo nguoi dung. Dang nhap khong di qua apiRequest nen khong tu xoa - phai
    // xoa tay o day, neu khong nguoi vua dang nhap co the nhan lai du lieu cua
    // nguoi dung truoc do tren cung trinh duyet.
    clearApiCache();
  }

  return data;
};

export const logout = () => {
  // Dung xoaPhien: no goi ca /users/logout de may chu xoa cookie httpOnly,
  // don bo dem GET, va ban su kien cho cac header cap nhat lai.
  xoaPhien();
};

export interface User {
  _id?: string;
  name: string;
  email: string;
  role?: string;
  createdAt?: string;
}
