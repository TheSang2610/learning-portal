"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getCourseList, Course } from "@/src/services/course";
import { getCategories, Category } from "@/src/services/categoryService";
import {
  CourseGrid,
  coursesHref,
  ListingHero,
  type ListingChip,
  type ListingStats,
} from "@/src/components/features/portal/course-listing";
import { COURSES_PAGE } from "@/src/constants/portal/courses-page";
import { fillTemplate } from "@/src/lib/format";

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
  /** So khoa theo id danh muc - cho chip danh muc o dai dau trang. */
  countByCategory?: Record<string, number>;
  /** So lieu cua ca kho (khong theo bo loc) - null khi may chu tai loi. */
  stats?: ListingStats | null;
}

const R = COURSES_PAGE.results;
const H = COURSES_PAGE.hero;

// Slug danh muc: ban ghi cu co the thieu slug - suy tu ten, giong HomeCategories.
const slugOf = (c: Category) => c.slug || c.name.toLowerCase().replace(/ /g, "-");

// Cho bao lau sau phim cuoi cung roi moi hoi may chu.
//
// Truoc day trang nay goi API MOI LAN GO MOT CHU - doi mot chu la mot luot
// mang. Cach sua cu la keo ca danh sach ve roi loc o trinh duyet, nhung cach
// do co tran: vai tram khoa la moi luot vao trang keo ve ca danh muc kem mo ta.
//
// Hoan nhip giai quyet ca hai: loc o may chu (dung o moi quy mo) nhung go mot
// tu sau chu chi ton MOT luot goi, khong phai sau.
const DEBOUNCE_MS = 350;

const PAGE_SIZE = 24;

export default function CourseSearchClient({
  initialCourses,
  initialCategories,
  countByCategory = {},
  stats = null,
}: Props) {
  const searchParams = useSearchParams();
  const searchKeyword = searchParams.get("search") || ""; // /courses?search=...
  const categoryParam = searchParams.get("category") || ""; // /courses?category=...

  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>(initialCategories ?? []);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Dung ban dung san cho lan ve dau, va CHI khi khong loc gi.
  //
  // useRef chu khong useState: day la co dung mot lan, doi no khong duoc phep
  // lam ve lai. Dat trong state thi lan ve thu hai se doc gia tri cu va dung
  // lai ban dung san sau khi nguoi dung da go tu khoa.
  const usedPrefetched = useRef(false);

  useEffect(() => {
    if (initialCategories) return;

    getCategories()
      .then((items) => {
        if (Array.isArray(items)) setCategories(items);
      })
      .catch(() => {});
  }, [initialCategories]);

  useEffect(() => {
    const noFilter = !searchKeyword.trim() && !categoryParam.trim();

    if (!usedPrefetched.current && noFilter && initialCourses?.length) {
      usedPrefetched.current = true;
      setCourses(initialCourses.slice(0, PAGE_SIZE));
      setTotal(initialCourses.length);
      setHasMore(initialCourses.length > PAGE_SIZE);
      setLoading(false);
      return;
    }

    usedPrefetched.current = true;
    setLoading(true);

    // Hoan nhip. Doi dia chi lien tuc (go tu khoa) thi lan hen truoc bi huy o
    // ham don dep, chi lan cuoi cung thuc su goi.
    const hen = setTimeout(() => {
      getCourseList({
        trang: 1,
        soDong: PAGE_SIZE,
        search: searchKeyword,
        category: categoryParam,
      })
        .then((outcome) => {
          setCourses(outcome.danhSach);
          setTotal(outcome.tong);
          setHasMore(outcome.conNua);
          setPage(1);
        })
        .catch((error) => {
          console.error("Lỗi khi tìm kiếm khóa học:", error);
          setCourses([]);
          setTotal(0);
          setHasMore(false);
        })
        .finally(() => setLoading(false));
    }, DEBOUNCE_MS);

    return () => clearTimeout(hen);
  }, [searchKeyword, categoryParam, initialCourses]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);

    try {
      const outcome = await getCourseList({
        trang: page + 1,
        soDong: PAGE_SIZE,
        search: searchKeyword,
        category: categoryParam,
      });

      // Noi vao cuoi chu khong thay the: nguoi dung dang doc do dai danh sach
      // hien co, thay ca danh sach la mat vi tri cuon.
      setCourses((old) => [...old, ...outcome.danhSach]);
      setHasMore(outcome.conNua);
      setPage(outcome.trang);
    } catch (error) {
      console.error("Lỗi khi tải thêm khóa học:", error);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, page, searchKeyword, categoryParam]);

  const activeCategory = categories.find((c) => slugOf(c) === categoryParam);

  // Chi hien danh muc dang co khoa (hoac dang duoc chon) - chip dan toi trang
  // rong la mat mot cu bam. Bam lai chip dang chon = bo loc.
  const chips: ListingChip[] = [
    {
      key: "",
      label: COURSES_PAGE.chips.all,
      href: coursesHref({ search: searchKeyword }),
      active: !categoryParam,
    },
    ...categories
      .filter((c) => (countByCategory[c._id] ?? 0) > 0 || slugOf(c) === categoryParam)
      .map((c) => ({
        key: c._id,
        label: c.name,
        count: countByCategory[c._id] ?? 0,
        href: coursesHref({
          search: searchKeyword,
          category: slugOf(c) === categoryParam ? "" : slugOf(c),
        }),
        active: slugOf(c) === categoryParam,
      })),
  ];

  return (
    <div className={styles.page2}>
      <ListingHero
        key={searchKeyword}
        crumbs={[
          { label: H.breadcrumbHome, href: H.breadcrumbHref },
          {
            label: H.breadcrumbCurrent,
            href: searchKeyword || categoryParam ? "/courses" : undefined,
          },
          ...(searchKeyword
            ? [{ label: `"${searchKeyword}"` }]
            : activeCategory
              ? [{ label: activeCategory.name }]
              : []),
        ]}
        title={
          searchKeyword
            ? fillTemplate(H.titleSearch, { q: searchKeyword })
            : (activeCategory?.name ?? (categoryParam || H.titleAll))
        }
        subtitle={searchKeyword ? undefined : H.subtitle}
        keyword={searchKeyword}
        searchCategory={categoryParam}
        stats={stats}
        chipsLabel={COURSES_PAGE.chips.label}
        chips={chips.length > 1 ? chips : []}
      />

      <CourseGrid
        courses={courses}
        loading={loading}
        // Dem TONG o may chu chu khong phai so the dang hien.
        countText={fillTemplate(categoryParam ? R.countInCategory : R.count, {
          n: total,
        })}
        empty={
          // Tim khong ra va danh muc rong la hai chuyen khac nhau.
          searchKeyword ? (
            <>
              {R.emptySearch} <strong>&quot;{searchKeyword}&quot;</strong>.
              <br />
              {R.emptyHint}
            </>
          ) : (
            R.emptyCategory
          )
        }
        loadMore={
          hasMore
            ? {
                label: loadingMore
                  ? R.loadingMore
                  : fillTemplate(R.loadMore, { n: total - courses.length }),
                busy: loadingMore,
                onClick: loadMore,
              }
            : null
        }
      />
    </div>
  );
}
