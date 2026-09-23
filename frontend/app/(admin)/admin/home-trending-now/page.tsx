"use client";

import { useEffect, useState } from "react";
import SafeImage from "@/src/components/ui/SafeImage";
import {
  getAdminTrendingCourses,
  updateCourseTags,
  Course,
  tenGiangVien,
} from "@/src/services/course";
import { Search, Flame, Loader2 } from "lucide-react";

import styles from "./page.module.scss";
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
    // Goi qua mot vong microtask thay vi goi thang. Ham tai du lieu bat dau
    // bang setLoading(true), nen goi thang la setState dong bo ngay trong than
    // effect: React phai chay them mot vong ve lai truoc khi hien man hinh
    // (rule react-hooks/set-state-in-effect canh bao dung cho nay). Hoan mot
    // vong microtask thi mat thuong khong thay khac, ma vong ve thua het.
    void Promise.resolve().then(fetchCourses);
  }, []);

  const handleToggleTrending = async (id: string, currentStatus: boolean) => {
    try {
      setUpdatingId(id);
      await updateCourseTags(id, { isTrending: !currentStatus });
      setCourses((prev) =>
        prev.map((c) => (c._id === id ? { ...c, isTrending: !currentStatus } : c)),
      );
    } catch {
      alert("Cập nhật trạng thái ghim xu hướng thất bại!");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredCourses = courses.filter((c) =>
    c.title?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) {
    return (
      <div className={styles.row}>
        <Loader2 className={styles.spinner} size={24} /> Đang tải danh sách xu hướng...
      </div>
    );
  }

  return (
    <div className={styles.stack}>
      <div className={styles.card}>
        <div className={styles.row2}>
          <div className={styles.box}>
            <Flame size={24} />
          </div>
          <div>
            <h1 className={styles.title}>Trending Now Section</h1>
            <p className={styles.text}>
              Danh sách sắp xếp ưu tiên theo Khóa được ghim, Rating và số lượng học viên.
              Tích chọn để hiển thị ra trang chủ.
            </p>
          </div>
        </div>
        <div className={styles.box2}>
          <Search className={styles.floating} size={18} />
          <input
            type="text"
            placeholder="Tìm kiếm khóa học..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.input}
          />
        </div>
      </div>

      <div className={styles.card2}>
        {filteredCourses.length === 0 ? (
          <div className={styles.box3}>Không tìm thấy khóa học nào.</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr className={styles.row3}>
                <th className={styles.headCell}>Khóa học</th>
                <th className={styles.headCell}>Giảng viên / Cấp độ</th>
                <th className={styles.headCell2}>Tổng Học viên</th>
                <th className={styles.headCell2}>Hiện Trang Chủ</th>
              </tr>
            </thead>
            <tbody className={styles.tbody}>
              {filteredCourses.map((course) => {
                const instructorName =
                  tenGiangVien(course.instructor) || `ID: ${String(course.instructor)}`;

                return (
                  <tr key={course._id} className={styles.row4}>
                    <td className={styles.headCell}>
                      <div className={styles.row2}>
                        <SafeImage
                          src={
                            course.thumbnail ||
                            "https://placehold.co/150x100?text=No+Image"
                          }
                          alt={course.title}
                          width={56}
                          height={36}
                          className={styles.box4}
                        />
                        <span className={styles.label}>{course.title}</span>
                      </div>
                    </td>
                    <td className={styles.headCell}>
                      <p className={styles.text2}>{instructorName}</p>
                      <p className={styles.text3}>{course.level}</p>
                    </td>
                    <td className={styles.cell}>
                      {(course.studentsCount || 0).toLocaleString()} học viên
                    </td>
                    <td className={styles.headCell2}>
                      <button
                        type="button"
                        disabled={updatingId === course._id}
                        onClick={() =>
                          handleToggleTrending(course._id, !!course.isTrending)
                        }
                        className={`${styles.button4} ${
                          course.isTrending ? styles.button : styles.button2
                        } ${updatingId === course._id ? styles.button3 : ""}`}
                      >
                        <span
                          className={`${styles.label4} ${
                            course.isTrending ? styles.label2 : styles.label3
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
