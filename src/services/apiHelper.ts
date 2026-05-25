const API_BASE_URL = "http://localhost:5000/api";

export const getHeaders = () => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (typeof window !== "undefined") {
    const authToken = localStorage.getItem("authToken");
    
    if (authToken) {
      // ⚠️ Loại bỏ dấu ngoặc kép nếu có
      const cleanToken = authToken.replace(/^"|"$/g, "");
      headers["Authorization"] = `Bearer ${cleanToken}`;
      console.log("✅ Token gửi đi:", cleanToken.substring(0, 20) + "...");
    } else {
      console.warn("⚠️ Không tìm thấy token!");
    }
  }
  
  return headers;
};

export const handleResponse = async (res: Response) => {
  const text = await res.text();
  let data;
  
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: text || res.statusText };
  }

  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("userInfo");
      
      if (typeof window !== "undefined") {
        setTimeout(() => {
          window.location.href = "/login";
        }, 100);
      }
    }
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }
  
  return data;
};

export const apiRequest = async (path: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${path}`;

  // 1. Gộp toàn bộ headers lại thành một Object riêng để dễ xử lý
  const mergedHeaders: Record<string, string> = {
    ...getHeaders(),
    ...((options.headers as Record<string, string>) || {}),
  };

  // 2. 🔥 ĐOẠN KHẮC PHỤC LỖI: 
  // Nếu dữ liệu gửi đi (options.body) là FormData (dùng để upload file)
  // Thì bắt buộc phải XÓA Content-Type để trình duyệt tự nhận diện multipart/form-data
  if (options.body && options.body instanceof FormData) {
    delete mergedHeaders["Content-Type"];
    delete mergedHeaders["content-type"]; // Đề phòng viết thường
  }

  // 3. Tiến hành gọi fetch bình thường với headers đã được tối ưu
  const response = await fetch(url, {
    ...options,
    headers: mergedHeaders,
  });

  return handleResponse(response);
};