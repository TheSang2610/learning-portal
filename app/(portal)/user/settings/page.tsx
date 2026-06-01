"use client";

import { useEffect, useState } from "react";
import { updateUserProfileApi, getProvidersApi, Provider } from "@/src/services/userApi";

interface UserInfo {
  _id: string;
  name: string;
  fullname?: string;
  birthday?: string;
  email: string;
  role: string;
  phone?: string;
  bio?: string;
  provider?: any;
}

export default function SettingsPage() {
  const [user, setUser] = useState<UserInfo | null>(null);

  // States form dữ liệu
  const [name, setName] = useState("");
  const [fullname, setFullname] = useState("");
  const [birthday, setBirthday] = useState("");
  const [password, setPassword] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("");
  
  // State danh sách đối tác dành cho Giảng viên
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    const userInfo = localStorage.getItem("userInfo");
    if (userInfo) {
      const parsedUser = JSON.parse(userInfo);
      setUser(parsedUser);
      setName(parsedUser.name || "");
      setFullname(parsedUser.fullname || "");
      
      if (parsedUser.birthday) {
        setBirthday(new Date(parsedUser.birthday).toISOString().split("T")[0]);
      }
      
      if (parsedUser.role === "instructor") {
        setSelectedProvider(
          typeof parsedUser.provider === "object" ? parsedUser.provider._id : parsedUser.provider || ""
        );
        // Gọi API lấy danh sách các trường học/công ty đối tác
        getProvidersApi()
          .then((data) => setProviders(data))
          .catch((err) => console.error("Lỗi lấy danh sách đối tác:", err));
      }
    }
  }, []);

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      // Thiết lập payload gửi đi dựa theo cấu trúc backend yêu cầu
      const updatePayload: any = {
        name,
        fullname,
        birthday: birthday ? new Date(birthday).toISOString() : undefined,
      };

      if (password.trim().length >= 6) {
        updatePayload.password = password;
      }

      // Nếu là giảng viên thì đính kèm thêm đối tác trường học đã chọn
      if (user.role === "instructor") {
        updatePayload.provider = selectedProvider || null;
      }

      const updatedData = await updateUserProfileApi(updatePayload);
      
      // Tìm object đối tác tương ứng để lưu đầy đủ thông tin vào localStorage cho việc hiển thị ở Profile
      if (user.role === "instructor" && selectedProvider) {
        const foundProj = providers.find(p => p._id === selectedProvider);
        if (foundProj) updatedData.provider = foundProj;
      }

      // Cập nhật lại trạng thái ứng dụng toàn cục và bộ nhớ đệm
      const newUserInfo = { ...user, ...updatedData };
      localStorage.setItem("userInfo", JSON.stringify(newUserInfo));
      setUser(newUserInfo);
      setPassword(""); // Clear ô mật khẩu bảo mật
      
      setMessage({ type: "success", text: "Cập nhật hồ sơ thông tin tài khoản thành công!" });
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Xảy ra lỗi trong quá trình cập nhật." });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm p-8">
        <h1 className="text-3xl font-bold mb-2">Cấu hình tài khoản</h1>
        <p className="text-gray-500 mb-8">Cập nhật thông tin cá nhân và cài đặt phân quyền của bạn.</p>

        {message.text && (
          <div className={`p-4 mb-6 rounded-xl text-sm font-medium ${
            message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
          }`}>
            {message.text}
          </div>
        )}

        {/* USERNAME */}
        <div className="mb-6">
          <label className="block text-sm text-gray-500 mb-2">Username tài khoản</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded-xl p-4 outline-none focus:border-blue-600 transition"
          />
        </div>

        {/* FULLNAME */}
        <div className="mb-6">
          <label className="block text-sm text-gray-500 mb-2">Họ và tên đầy đủ</label>
          <input
            type="text"
            value={fullname}
            placeholder="Nhập họ tên thật của bạn"
            onChange={(e) => setFullname(e.target.value)}
            className="w-full border rounded-xl p-4 outline-none focus:border-blue-600 transition"
          />
        </div>

        {/* BIRTHDAY */}
        <div className="mb-6">
          <label className="block text-sm text-gray-500 mb-2">Ngày sinh</label>
          <input
            type="date"
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
            className="w-full border rounded-xl p-4 outline-none focus:border-blue-600 transition"
          />
        </div>

        {/* EMAIL (DISABLED) */}
        <div className="mb-6">
          <label className="block text-sm text-gray-500 mb-2">Địa chỉ Email (Không được phép sửa)</label>
          <input
            type="email"
            value={user.email}
            disabled
            className="w-full border rounded-xl p-4 bg-gray-100 text-gray-400 cursor-not-allowed"
          />
        </div>

        {/* ĐẶC QUYỀN SỬA PHÂN HỆ ĐỐI TÁC: CHỈ HIỂN THỊ CHO ROLE INSTRUCTOR */}
        {user.role === "instructor" && (
          <div className="mb-6 p-5 bg-purple-50 rounded-2xl border border-purple-100">
            <label className="block text-sm font-semibold text-purple-950 mb-2">
              🏢 Đơn vị đối tác công tác (Dành riêng cho Giảng viên)
            </label>
            <p className="text-xs text-purple-700 mb-3">Khóa học bạn tạo sau này sẽ tự động được gán về cho trường/doanh nghiệp bạn chọn tại đây.</p>
            <select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
              className="w-full border rounded-xl p-4 bg-white outline-none focus:border-purple-600 transition"
            >
              <option value="">-- Chọn trường đại học / doanh nghiệp đối tác --</option>
              {providers.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.type === "university" ? "[Trường ĐH] " : "[Doanh nghiệp] "} {p.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* PASSWORD */}
        <div className="mb-8">
          <label className="block text-sm text-gray-500 mb-2">Đổi mật khẩu mới (Nhập tối thiểu 6 ký tự nếu muốn đổi)</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Để trống nếu giữ nguyên mật khẩu cũ"
            className="w-full border rounded-xl p-4 outline-none focus:border-blue-600 transition"
          />
        </div>

        {/* BUTTON SAVE */}
        <button
          onClick={handleSave}
          disabled={loading}
          className={`text-white px-6 py-3 rounded-xl font-semibold transition ${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 shadow-sm"
          }`}
        >
          {loading ? "Đang lưu..." : "Lưu thay đổi hồ sơ"}
        </button>
      </div>
    </div>
  );
}