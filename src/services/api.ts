const RAW_BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";
const BACKEND_URL = RAW_BACKEND_URL.replace(/\/+$/, "").replace(/\/api$/, "");
const API_URL = `${BACKEND_URL}/api/users`;

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

interface LoginResponse {
  _id: string;
  name: string;
  email: string;
  role: string;
  token: string;
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

export const registerUser = async (userData: RegisterUserData) => {
  let res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  if (res.status === 404) {
    res = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
  }

  const data = await parseResponse(res);
  
  // ✅ Lưu token sau khi register
  if (data.token) {
    localStorage.setItem("authToken", data.token);
    localStorage.setItem("userInfo", JSON.stringify(data));
  }
  
  return data;
};

export const loginUser = async (userData: LoginUserData): Promise<LoginResponse> => {
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  const data = await parseResponse(res);
  
  // ✅ LƯU TOKEN SAU KHI LOGIN - ĐÂY LÀ ĐIỀU QUAN TRỌNG
  if (data.token) {
    localStorage.setItem("authToken", data.token);
    localStorage.setItem("userInfo", JSON.stringify(data));
  }
  
  return data;
};

export const googleLogin = async (credential: string) => {
  const res = await fetch(`${API_URL}/google`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ credential }),
  });

  const data = await parseResponse(res);
  
  // ✅ Lưu token sau Google login
  if (data.token) {
    localStorage.setItem("authToken", data.token);
    localStorage.setItem("userInfo", JSON.stringify(data));
  }
  
  return data;
};

export const logout = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("userInfo");
};

export interface User {
  _id?: string;
  name: string;
  email: string;
  role?: string;
  createdAt?: string;
}

export const apiService = {
  getUsers: async (): Promise<User[]> => {
    const res = await fetch(API_URL);
    return parseResponse(res);
  },
  createUser: async (userData: User): Promise<User> => {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
    return parseResponse(res);
  }
};