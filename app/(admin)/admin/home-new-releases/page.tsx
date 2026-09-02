"use client";

import { useEffect, useState } from "react";
import SafeImage from "@/src/components/ui/SafeImage";
import {
  getAdminNewReleasesCourses,
  updateCourseTags,
  Course,
  tenGiangVien,
} from "@/src/services/course";
import { Search, CalendarDays, Loader2 } from "lucide-react";

export default function AdminNewReleasesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function fetchCourses() {
    try {
      const data = await getAdminNewReleasesCourses();
      setCourses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Lỗi lấy danh sách khóa học mới phát hành:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Goi qua mot vong microtask thay vi goi thang. Ham tai du lieu bat dau
    // bang setLoading(true), nen goi thang la setState dong bo ngay trong than
    // effect: React phai chay them mot vong ve lai truoc khi hien man hinh
    // (rule react-hooks/set-state-in-effect canh bao dung cho nay). Hoan mot
    // vong microtask thi mat thuong khong thay khac, ma vong ve thua het.
    void Promise.resolve().then(fetchCourses);
  }, []);

  const handleToggleNewRelease = async (id: string, currentStatus: boolean) => {
    try {
      setUpdatingId(id);
      await updateCourseTags(id, { isNewRelease: !currentStatus });
      setCourses((prev) =>
        prev.map((c) => (c._id === id ? { ...c, isNewRelease: !currentStatus } : c)),
      );
    } catch {
      alert("Cập nhật trạng thái ghim mới phát hành thất bại!");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredCourses = courses.filter((c) =>
    c.title?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center text-slate-500">
        <Loader2 className="mr-2 animate-spin" size={24} /> Đang tải danh sách mới phát
        hành...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600">
            <CalendarDays size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">New Releases Section</h1>
            <p className="mt-0.5 text-xs text-slate-500">
              Danh sách sắp xếp theo thời gian khởi tạo mới nhất. Tích chọn để hiển thị ép
              buộc lên đầu mục ngoài trang chủ.
            </p>
          </div>
        </div>
        <div className="relative w-full sm:w-72">
          <Search
            className="absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-500"
            size={18}
          />
          <input
            type="text"
            placeholder="Tìm kiếm khóa học..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-4 pl-10 text-sm transition-all focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {filteredCourses.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            Không tìm thấy khóa học nào.
          </div>
        ) : (
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-bold tracking-wider text-slate-500 uppercase">
                <th className="px-6 py-4">Khóa học</th>
                <th className="px-6 py-4">Giảng viên / Cấp độ</th>
                <th className="px-6 py-4 text-center">Ngày Tạo</th>
                <th className="px-6 py-4 text-center">Hiện Trang Chủ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
              {filteredCourses.map((course) => {
                const instructorName =
                  tenGiangVien(course.instructor) || `ID: ${String(course.instructor)}`;

                const formattedDate = course.createdAt
                  ? new Date(course.createdAt).toLocaleDateString("vi-VN")
                  : "N/A";

                return (
                  <tr key={course._id} className="transition-colors hover:bg-slate-50/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <SafeImage
                          src={
                            course.thumbnail ||
                            "https://placehold.co/150x100?text=No+Image"
                          }
                          alt={course.title}
                          width={56}
                          height={36}
                          className="h-9 w-14 rounded-lg border border-slate-100 object-cover"
                        />
                        <span className="line-clamp-1 font-semibold text-slate-800">
                          {course.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="max-w-[200px] truncate font-medium text-slate-800">
                        {instructorName}
                      </p>
                      <p className="text-xs font-semibold text-slate-500 uppercase">
                        {course.level}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-slate-500">
                      {formattedDate}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        type="button"
                        disabled={updatingId === course._id}
                        onClick={() =>
                          handleToggleNewRelease(course._id, !!course.isNewRelease)
                        }
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                          course.isNewRelease ? "bg-emerald-600" : "bg-slate-200"
                        } ${updatingId === course._id ? "cursor-not-allowed opacity-50" : ""}`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            course.isNewRelease ? "translate-x-6" : "translate-x-1"
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
