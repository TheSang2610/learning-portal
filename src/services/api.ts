const API_URL = "http://localhost:5000/api/users";

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

export const registerUser = async (
  userData: RegisterUserData
) => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  if (!res.ok) {
    throw new Error("Register failed");
  }

  return res.json();
};

export const loginUser = async (
  userData: LoginUserData
) => {
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  if (!res.ok) {
    throw new Error("Login failed");
  }

  return res.json();
};