"use client";

import { useEffect, useState } from "react";
import { getAdminTrendingCourses, updateCourseTags, Course } from "@/src/services/course";
import { Search, Flame, Loader2 } from "lucide-react";

export default function AdminTrendingPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function fetchCourses() {
    try {
      const data = await getAdminTrendingCourses();
      setCourses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Lỗi lấy danh sách khóa học xu hướng:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleToggleTrending = async (id: string, currentStatus: boolean) => {
    try {
      setUpdatingId(id);
      await updateCourseTags(id, { isTrending: !currentStatus });
      setCourses((prev) =>
        prev.map((c) => (c._id === id ? { ...c, isTrending: !currentStatus } : c))
      );
    } catch (error) {
      alert("Cập nhật trạng thái ghim xu hướng thất bại!");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredCourses = courses.filter((c) =>
    c.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center text-slate-500">
        <Loader2 className="animate-spin mr-2" size={24} /> Đang tải danh sách xu hướng...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-orange-100 text-orange-600 p-3 rounded-xl">
            <Flame size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Trending Now Section</h1>
            <p className="text-xs text-slate-500 mt-0.5">Danh sách sắp xếp ưu tiên theo Khóa được ghim, Rating và số lượng học viên. Tích chọn để hiển thị ra trang chủ.</p>
          </div>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            type="text"
            placeholder="Tìm kiếm khóa học..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500 transition-all bg-slate-50"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredCourses.length === 0 ? (
          <div className="p-12 text-center text-slate-500">Không tìm thấy khóa học nào.</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-4">Khóa học</th>
                <th className="px-6 py-4">Giảng viên / Cấp độ</th>
                <th className="px-6 py-4 text-center">Tổng Học viên</th>
                <th className="px-6 py-4 text-center">Hiện Trang Chủ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
              {filteredCourses.map((course) => {
                const instructorName = typeof course.instructor === "object" && course.instructor !== null
                  ? (course.instructor as any).name 
                  : `ID: ${String(course.instructor)}`;

                return (
                  <tr key={course._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={course.thumbnail || "https://placehold.co/150x100?text=No+Image"}
                          alt={course.title}
                          className="w-14 h-9 object-cover rounded-lg border border-slate-100"
                        />
                        <span className="font-semibold text-slate-800 line-clamp-1">{course.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-800 font-medium truncate max-w-[200px]">{instructorName}</p>
                      <p className="text-xs text-slate-500 uppercase font-semibold">{course.level}</p>
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-slate-700">
                      {(course.studentsCount || 0).toLocaleString()} học viên
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        type="button"
                        disabled={updatingId === course._id}
                        onClick={() => handleToggleTrending(course._id, !!course.isTrending)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                          course.isTrending ? "bg-orange-600" : "bg-slate-200"
                        } ${updatingId === course._id ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            course.isTrending ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}