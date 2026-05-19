"use client";

import { useEffect, useState } from "react";

interface UserInfo {
  _id: string;
  name: string;
  email: string;
  role: string;
  picture?: string;
  googlePicture?: string;
  avatar?: string;
}

export default function ProfilePage() {
  const [user, setUser] =
    useState<UserInfo | null>(null);
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    const userInfo =
      localStorage.getItem("userInfo");

    if (userInfo) {
      setUser(JSON.parse(userInfo));
      setAvatarError(false);
    }
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">

      <div className="max-w-4xl mx-auto">

        {/* TOP CARD */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-6">

          <div className="flex items-center gap-6">

            {/* AVATAR */}
            {(() => {
              const src = user.avatar || user.picture || user.googlePicture;
              if (src && !avatarError) {
                return (
                  <img
                    src={src}
                    alt={user.name}
                    onError={() => setAvatarError(true)}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                );
              }

              return (
                <div className="w-24 h-24 rounded-full bg-blue-600 text-white flex items-center justify-center text-4xl font-bold">
                  {user.name.charAt(0)}
                </div>
              );
            })()}

            {/* INFO */}
            <div>
              <h1 className="text-3xl font-bold">
                {user.name}
              </h1>

              <p className="text-gray-500 mt-1">
                {user.email}
              </p>

              <span className="inline-block mt-3 px-4 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium capitalize">
                {user.role}
              </span>
            </div>
          </div>
        </div>

        {/* PROFILE DETAILS */}
        <div className="bg-white rounded-2xl shadow-sm p-8">

          <h2 className="text-2xl font-bold mb-6">
            Profile Information
          </h2>

          <div className="grid md:grid-cols-2 gap-6">

            <div>
              <label className="block text-sm text-gray-500 mb-2">
                Full Name
              </label>

              <div className="border rounded-xl p-4 bg-gray-50">
                {user.name}
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-500 mb-2">
                Email Address
              </label>

              <div className="border rounded-xl p-4 bg-gray-50">
                {user.email}
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-500 mb-2">
                Account Role
              </label>

              <div className="border rounded-xl p-4 bg-gray-50 capitalize">
                {user.role}
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-500 mb-2">
                Account Status
              </label>

              <div className="border rounded-xl p-4 bg-gray-50 text-green-600 font-medium">
                Active
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}