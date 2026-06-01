"use client";

import { useEffect, useState } from "react";

interface UserInfo {
  _id: string;
  name: string;
  fullname?: string;
  birthday?: string;
  email: string;
  role: string;
  avatar?: string;
  googlePicture?: string;
  phone?: string;
  bio?: string;
  provider?: { name: string } | string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    const userInfo = localStorage.getItem("userInfo");
    if (userInfo) {
      setUser(JSON.parse(userInfo));
      setAvatarError(false);
    }
  }, []);

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // Định dạng hiển thị ngày sinh (YYYY-MM-DD)
  const formatBirthday = (dateStr?: string) => {
    if (!dateStr) return "Chưa cập nhật";
    return new Date(dateStr).toLocaleDateString("vi-VN");
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* TOP CARD */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-6">
          <div className="flex items-center gap-6">
            {/* AVATAR */}
            {(() => {
              const src = user.avatar || user.googlePicture;
              if (src && !avatarError) {
                return (
                  <img
                    src={src}
                    alt={user.name}
                    onError={() => setAvatarError(true)}
                    className="w-24 h-24 rounded-full object-cover border"
                  />
                );
              }
              return (
                <div className="w-24 h-24 rounded-full bg-blue-600 text-white flex items-center justify-center text-4xl font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              );
            })()}

            {/* INFO */}
            <div>
              <h1 className="text-3xl font-bold">{user.fullname || user.name}</h1>
              <p className="text-gray-500 mt-1">{user.email}</p>
              <div className="flex gap-2 mt-3">
                <span className="px-4 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium capitalize">
                  {user.role}
                </span>
                {user.role === "instructor" && user.provider && (
                  <span className="px-4 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                    🏢 {typeof user.provider === "object" ? user.provider.name : "Đã liên kết đối tác"}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* PROFILE DETAILS */}
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h2 className="text-2xl font-bold mb-6">Thông tin tài khoản cá nhân</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-500 mb-2">Username hiển thị</label>
              <div className="border rounded-xl p-4 bg-gray-50">{user.name}</div>
            </div>

            <div>
              <label className="block text-sm text-gray-500 mb-2">Họ và Tên đầy đủ</label>
              <div className="border rounded-xl p-4 bg-gray-50">{user.fullname || "Chưa cập nhật"}</div>
            </div>

            <div>
              <label className="block text-sm text-gray-500 mb-2">Ngày sinh</label>
              <div className="border rounded-xl p-4 bg-gray-50">{formatBirthday(user.birthday)}</div>
            </div>

            <div>
              <label className="block text-sm text-gray-500 mb-2">Địa chỉ Email</label>
              <div className="border rounded-xl p-4 bg-gray-50">{user.email}</div>
            </div>

            {user.role === "instructor" && (
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-500 mb-2">Đơn vị giáo dục / Tổ chức công tác</label>
                <div className="border rounded-xl p-4 bg-purple-50 text-purple-900 font-medium">
                  {typeof user.provider === "object" ? user.provider.name : "Đã có đối tác (Vui lòng tải lại trang)"}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}