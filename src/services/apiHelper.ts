const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ;
const API_BASE_URL = `${BACKEND_URL}/api`;

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

  const mergedHeaders: Record<string, string> = {
    ...getHeaders(),
    ...((options.headers as Record<string, string>) || {}),
  };

  if (options.body && options.body instanceof FormData) {
    delete mergedHeaders["Content-Type"];
    delete mergedHeaders["content-type"];
  }

  const response = await fetch(url, {
    ...options,
    headers: mergedHeaders,
  });

  return handleResponse(response);
};