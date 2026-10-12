"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { ADMIN_COURSE_CREATE as C } from "@/src/constants/admin/course-create-page";
import { convertToSlug } from "@/src/lib/slug";
import { getCategories, Category } from "@/src/services/categoryService";
import { createCourse } from "@/src/services/course";
import { getProviders, ProviderData } from "@/src/services/provider";
import { getUsers, User } from "@/src/services/userApi";
import type {
  AdminCourseCreateFormData,
  FieldChangeEvent,
} from "@/src/types/course-form";

/** Bieu mau tao khoa hoc cua admin: danh muc, doi tac, giang vien phu trach. */
export function useAdminCourseCreate() {
  const router = useRouter();

  const [formData, setFormData] = useState<AdminCourseCreateFormData>({
    title: "",
    slug: "",
    description: "",
    price: 0,
    category: [],
    instructor: "",
    providerId: "",
    level: "beginner",
  });

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [instructors, setInstructors] = useState<User[]>([]);
  const [providers, setProviders] = useState<ProviderData[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [categoriesData, usersData, providersData] = await Promise.all([
          getCategories(),
          getUsers(),
          getProviders(),
        ]);

        setCategories(categoriesData);
        setProviders(providersData);

        const instructorList = (usersData || []).filter(
          (u: User) => u.role === "instructor",
        );
        setInstructors(instructorList);
      } catch (error) {
        console.error("Lỗi tải metadata hệ thống:", error);
      } finally {
        setLoadingData(false);
      }
    };
    fetchMetadata();
  }, []);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, title: value, slug: convertToSlug(value) });
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, slug: convertToSlug(e.target.value) });
  };

  const changeHandler = (e: FieldChangeEvent) => {
    setFormData({
      ...formData,
      [e.target.name]:
        e.target.name === "price" ? Number(e.target.value) : e.target.value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleCategoryToggle = (catId: string) => {
    const current = [...formData.category];
    if (current.includes(catId)) {
      setFormData({ ...formData, category: current.filter((id) => id !== catId) });
    } else {
      setFormData({ ...formData, category: [...current, catId] });
    }
  };

  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.category.length === 0) return alert(C.messages.needCategory);
    if (!formData.instructor) return alert(C.messages.needInstructor);
    if (!thumbnailFile) return alert(C.messages.needThumbnail);

    try {
      setLoading(true);

      const dataToSend = new FormData();
      dataToSend.append("title", formData.title);
      dataToSend.append("slug", formData.slug);
      dataToSend.append("description", formData.description);
      dataToSend.append("price", String(formData.price));
      dataToSend.append("level", formData.level);
      dataToSend.append("instructorId", formData.instructor);
      dataToSend.append("providerId", formData.providerId);

      formData.category.forEach((id) => {
        dataToSend.append("category", id);
      });

      dataToSend.append("thumbnail", thumbnailFile);

      await createCourse(dataToSend);

      alert(C.messages.success);
      router.push(C.listHref);
    } catch (error) {
      console.error(error);
      alert(C.messages.failure);
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    imagePreview,
    loading,
    loadingData,
    categories,
    instructors,
    providers,
    handleTitleChange,
    handleSlugChange,
    changeHandler,
    handleFileChange,
    handleCategoryToggle,
    submitHandler,
  };
}
