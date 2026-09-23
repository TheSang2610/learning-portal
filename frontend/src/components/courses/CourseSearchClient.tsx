"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { layDanhSachKhoa, Course } from "@/src/services/course";
import { getCategories, Category } from "@/src/services/categoryService";
import TieuDeMuc from "@/src/components/home/SectionHeading";
import TheKhoaHoc from "@/src/components/home/CourseCard";

import styles from "./CourseSearchClient.module.scss";
interface Props {
  /**
   * Du lieu lay san tu may chu (xem app/(portal)/courses/page.tsx).
   *
   * Chi dung cho lan ve DAU TIEN va chi khi khong co bo loc nao tren dia chi:
   * ban dung san la danh sach day du chua loc. Co ?search= thi phai hoi may chu
   * ngay, khong the dung ban do.
   */
  initialCourses?: Course[] | null;
  initialCategories?: Category[] | null;
}

// Cho bao lau sau phim cuoi cung roi moi hoi may chu.
//
// Truoc day trang nay goi API MOI LAN GO MOT CHU - doi mot chu la mot luot
// mang. Cach sua cu la keo ca danh sach ve roi loc o trinh duyet, nhung cach
// do co tran: vai tram khoa la moi luot vao trang keo ve ca danh muc kem mo ta.
//
// Hoan nhip giai quyet ca hai: loc o may chu (dung o moi quy mo) nhung go mot
// tu sau chu chi ton MOT luot goi, khong phai sau.
const HOAN_NHIP_MS = 350;

const SO_MOI_TRANG = 24;

export default function CourseSearchClient({ initialCourses, initialCategories }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchKeyword = searchParams.get("search") || ""; // /courses?search=...
  const categoryParam = searchParams.get("category") || ""; // /courses?category=...

  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>(initialCategories ?? []);
  const [tong, setTong] = useState(0);
  const [conNua, setConNua] = useState(false);
  const [trang, setTrang] = useState(1);
  const [loading, setLoading] = useState(true);
  const [dangTaiThem, setDangTaiThem] = useState(false);

  // Dung ban dung san cho lan ve dau, va CHI khi khong loc gi.
  //
  // useRef chu khong useState: day la co dung mot lan, doi no khong duoc phep
  // lam ve lai. Dat trong state thi lan ve thu hai se doc gia tri cu va dung
  // lai ban dung san sau khi nguoi dung da go tu khoa.
  const daDungBanSan = useRef(false);

  useEffect(() => {
    if (initialCategories) return;

    getCategories()
      .then((ds) => {
        if (Array.isArray(ds)) setCategories(ds);
      })
      .catch(() => {});
  }, [initialCategories]);

  useEffect(() => {
    const khongLoc = !searchKeyword.trim() && !categoryParam.trim();

    if (!daDungBanSan.current && khongLoc && initialCourses?.length) {
      daDungBanSan.current = true;
      setCourses(initialCourses.slice(0, SO_MOI_TRANG));
      setTong(initialCourses.length);
      setConNua(initialCourses.length > SO_MOI_TRANG);
      setLoading(false);
      return;
    }

    daDungBanSan.current = true;
    setLoading(true);

    // Hoan nhip. Doi dia chi lien tuc (go tu khoa) thi lan hen truoc bi huy o
    // ham don dep, chi lan cuoi cung thuc su goi.
    const hen = setTimeout(() => {
      layDanhSachKhoa({
        trang: 1,
        soDong: SO_MOI_TRANG,
        search: searchKeyword,
        category: categoryParam,
      })
        .then((kq) => {
          setCourses(kq.danhSach);
          setTong(kq.tong);
          setConNua(kq.conNua);
          setTrang(1);
        })
        .catch((error) => {
          console.error("Lỗi khi tìm kiếm khóa học:", error);
          setCourses([]);
          setTong(0);
          setConNua(false);
        })
        .finally(() => setLoading(false));
    }, HOAN_NHIP_MS);

    return () => clearTimeout(hen);
  }, [searchKeyword, categoryParam, initialCourses]);

  const taiThem = useCallback(async () => {
    if (dangTaiThem || !conNua) return;

    setDangTaiThem(true);

    try {
      const kq = await layDanhSachKhoa({
        trang: trang + 1,
        soDong: SO_MOI_TRANG,
        search: searchKeyword,
        category: categoryParam,
      });

      // Noi vao cuoi chu khong thay the: nguoi dung dang doc do dai danh sach
      // hien co, thay ca danh sach la mat vi tri cuon.
      setCourses((cu) => [...cu, ...kq.danhSach]);
      setConNua(kq.conNua);
      setTrang(kq.trang);
    } catch (error) {
      console.error("Lỗi khi tải thêm khóa học:", error);
    } finally {
      setDangTaiThem(false);
    }
  }, [dangTaiThem, conNua, trang, searchKeyword, categoryParam]);

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  return (
    <div className={styles.page2}>
      <div className={styles.container}>
        <button onClick={() => router.push("/")} className={styles.button}>
          <ArrowLeft size={14} /> VỀ TRANG CHỦ
        </button>

        <TieuDeMuc
          nhu="h1"
          tieuDe={
            searchKeyword
              ? `Kết quả cho "${searchKeyword}"`
              : categoryParam
                ? categories.find((c) => c.slug === categoryParam)?.name || categoryParam
                : "Tất cả khoá học"
          }
          moTa={
            // Dem TONG o may chu chu khong phai so the dang hien: dang hien 24
            // ma noi "24 khoa hoc" trong khi con 80 nua la noi sai.
            tong > 0
              ? `${tong} khoá học${categoryParam ? " trong danh mục này" : ""}.`
              : undefined
          }
        />

        {courses.length === 0 ? (
          <div className={styles.card}>
            {/* Khong con noi cung mot cau cho moi truong hop: tim khong ra va
                danh muc rong la hai chuyen khac nhau, ma cau cu luon chen tu
                khoa vao - vao tu danh muc thi hien ra cap nhay rong. */}
            {searchKeyword ? (
              <>
                Không tìm thấy khoá học nào cho{" "}
                <strong className={styles.strong}>&quot;{searchKeyword}&quot;</strong>.
              </>
            ) : (
              "Danh mục này chưa có khoá học nào."
            )}
          </div>
        ) : (
          <>
            <div className={styles.grid}>
              {courses.map((course) => (
                <TheKhoaHoc
                  key={course._id}
                  khoa={course}
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              ))}
            </div>

            {conNua && (
              <div className={styles.row}>
                <button
                  type="button"
                  onClick={taiThem}
                  disabled={dangTaiThem}
                  className={styles.button2}
                >
                  {dangTaiThem ? "Đang tải…" : `Xem thêm (còn ${tong - courses.length})`}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
