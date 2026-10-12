"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { INSTRUCTOR_COURSE_CREATE as C } from "@/src/constants/instructor/course-create-page";
import { useStoredUser } from "@/src/hooks/userStore";
import { convertToSlug } from "@/src/lib/slug";
import { getCategories, Category } from "@/src/services/categoryService";
import { createCourse } from "@/src/services/course";
import { getProviders, ProviderData } from "@/src/services/provider";
import type { CourseCreateFormData, FieldChangeEvent } from "@/src/types/course-form";

const FORM_RONG: CourseCreateFormData = {
  title: "",
  slug: "",
  description: "",
  price: 0,
  category: [],
  providerId: "",
  level: "beginner",
};

/** Toan bo state va xu ly cua bieu mau tao khoa hoc phia giang vien. */
export function useInstructorCourseCreate() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [loadingMetadata, setLoadingMetadata] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [providers, setProviders] = useState<ProviderData[]>([]);
  const [formData, setFormData] = useState<CourseCreateFormData>(FORM_RONG);

  const user = useStoredUser();
  const [filled, setFilled] = useState<string | null>(null);

  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");

  // Đồng bộ danh mục và đối tác từ hệ thống backend
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [categoriesData, providersData] = await Promise.all([
          getCategories(),
          getProviders(),
        ]);
        setCategories(categoriesData || []);
        setProviders(providersData || []);
      } catch (error) {
        console.error("Lỗi đồng bộ metadata cấu hình:", error);
      } finally {
        setLoadingMetadata(false);
      }
    };
    fetchMetadata();
  }, []);

  // Tu dien doi tac neu giang vien da cau hinh san trong ho so.
  //
  // Chinh NGAY TRONG LUC VE, khong dung useEffect. Danh tinh den tu may chu
  // (<UserBootstrap />) nen luc fetchMetadata chay no con la null; con nhet vao
  // effect thi eslint chan vi setState dong bo trong effect (--max-warnings 0).
  // Day la mau "dieu chinh state khi du lieu ngoai doi" ma React huong dan:
  // co `filled` chan lai nen chi chay dung mot lan cho moi doi tac, khong lap
  // vo tan, va nguoi dung tu doi o vao doi tac khac thi khong bi ghi de.
  //
  // Bu them: truong `provider` nay lay tu ho so DAY DU, con ban cu doc
  // localStorage thi than phan hoi luc dang nhap khong he co no - tuc la o
  // nay truoc gio chua bao gio duoc dien tu dong.
  // typeof null cung la "object": giang vien chua gan doi tac thi provider la
  // null, phai dung ?. chu khong duoc doc thang ._id.
  const partnerProfile =
    typeof user?.provider === "object" ? user.provider?._id : user?.provider;

  if (partnerProfile && filled !== partnerProfile) {
    setFilled(partnerProfile);
    setFormData((prev) => ({ ...prev, providerId: partnerProfile }));
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, title: value, slug: convertToSlug(value) });
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, slug: convertToSlug(e.target.value) });
  };

  const handleInputChange = (e: FieldChangeEvent) => {
    setFormData({
      ...formData,
      [e.target.name]:
        e.target.name === "price" ? Number(e.target.value) : e.target.value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setThumbnail(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Chọn nhiều danh mục (Multi-select Tags) tương tự Admin
  const handleCategoryToggle = (catId: string) => {
    const current = [...formData.category];
    if (current.includes(catId)) {
      setFormData({ ...formData, category: current.filter((id) => id !== catId) });
    } else {
      setFormData({ ...formData, category: [...current, catId] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.category.length === 0) return alert(C.messages.needCategory);
    if (!thumbnail) return alert(C.messages.needThumbnail);

    try {
      setLoading(true);

      const dataToSend = new FormData();
      dataToSend.append("title", formData.title);
      dataToSend.append("slug", formData.slug);
      dataToSend.append("description", formData.description);
      dataToSend.append("price", String(formData.price));
      dataToSend.append("level", formData.level);
      dataToSend.append("providerId", formData.providerId);
      dataToSend.append("thumbnail", thumbnail);
      // Gửi mảng danh mục giống hệt bên Admin
      formData.category.forEach((id) => {
        dataToSend.append("category", id);
      });

      // createCourse dùng chung cơ chế token, URL đích với trang Admin
      const result = await createCourse(dataToSend);

      alert(C.messages.success);
      router.push(C.detailHref(result._id));
    } catch (err) {
      console.error("Lỗi khởi tạo phía Instructor:", err);
      alert(C.messages.failure);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    loadingMetadata,
    categories,
    providers,
    formData,
    previewUrl,
    handleTitleChange,
    handleSlugChange,
    handleInputChange,
    handleFileChange,
    handleCategoryToggle,
    handleSubmit,
  };
}
