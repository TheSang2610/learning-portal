"use client";

import { useEffect, useState } from "react";

interface UserInfo {
  _id: string;
  name: string;
  email: string;
  role: string;
  token: string;
}

export default function SettingsPage() {
  const [user, setUser] =
    useState<UserInfo | null>(null);

  const [name, setName] = useState("");
  const [password, setPassword] =
    useState("");

  useEffect(() => {
    const userInfo =
      localStorage.getItem("userInfo");

    if (userInfo) {
      const parsedUser = JSON.parse(userInfo);

      setUser(parsedUser);
      setName(parsedUser.name);
    }
  }, []);

  const handleSave = () => {
    alert(
      "Settings saved (frontend only for now)"
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">

      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm p-8">

        <h1 className="text-3xl font-bold mb-8">
          Account Settings
        </h1>

        {/* NAME */}
        <div className="mb-6">
          <label className="block text-sm text-gray-500 mb-2">
            Full Name
          </label>

          <input
            type="text"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            className="w-full border rounded-xl p-4 outline-none focus:border-blue-600"
          />
        </div>

        {/* EMAIL */}
        <div className="mb-6">
          <label className="block text-sm text-gray-500 mb-2">
            Email Address
          </label>

          <input
            type="email"
            value={user.email}
            disabled
            className="w-full border rounded-xl p-4 bg-gray-100 text-gray-500"
          />
        </div>

        {/* PASSWORD */}
        <div className="mb-8">
          <label className="block text-sm text-gray-500 mb-2">
            New Password
          </label>

          <input
            type="password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            placeholder="Enter new password"
            className="w-full border rounded-xl p-4 outline-none focus:border-blue-600"
          />
        </div>

        {/* BUTTON */}
        <button
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}