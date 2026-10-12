"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { INSTRUCTOR_COURSE_DETAIL as C } from "@/src/constants/instructor/course-detail-page";
import { getCategories, Category } from "@/src/services/categoryService";
import { getCourseById, updateCourse, getCategoryId } from "@/src/services/course";
import { getProviders, ProviderData } from "@/src/services/provider";
import type { CourseEditFormData, FieldChangeEvent } from "@/src/types/course-form";

/** Nap khoa hoc theo ?courseId=, giu state bieu mau sua va gui cap nhat. */
export function useInstructorCourseDetail() {
  const params = useSearchParams();
  const courseId = params.get("courseId") || "";

  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [providers, setProviders] = useState<ProviderData[]>([]);

  const [formData, setFormData] = useState<CourseEditFormData>({
    title: "",
    description: "",
    price: 0,
    category: [],
    providerId: "",
    level: "",
  });

  const [isPublished, setIsPublished] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  useEffect(() => {
    const fetchCourseAndMetadata = async () => {
      try {
        const [courseData, categoriesData, providersData] = await Promise.all([
          getCourseById(courseId),
          getCategories(),
          getProviders(),
        ]);

        setCategories(categoriesData);
        setProviders(providersData);
        setIsPublished(courseData.isPublished || false);

        // getCategoryId nhan ca ba hinh dang cua category (mang id, mang doi tuong
        // da populate, hoac dang { $oid } cua ban ghi cu).
        const normalizedCategories: string[] = getCategoryId(courseData.category);

        const normalizedProvider = courseData.provider
          ? typeof courseData.provider === "object"
            ? courseData.provider._id
            : courseData.provider
          : "";

        setFormData({
          title: courseData.title || "",
          description: courseData.description || "",
          price: courseData.price || 0,
          category: normalizedCategories,
          providerId: normalizedProvider || "",
          level: courseData.level || "beginner",
        });

        if (courseData.thumbnail) {
          setPreviewUrl(courseData.thumbnail);
        }
      } catch (error) {
        console.error(error);
        alert(C.messages.loadFailed);
      } finally {
        setLoading(false);
      }
    };
    if (courseId) fetchCourseAndMetadata();
  }, [courseId]);

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
      setPreviewUrl(URL.createObjectURL(file));
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

  const updateCourseHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.category.length === 0) return alert(C.messages.needCategory);

    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("price", String(formData.price));
      data.append("providerId", formData.providerId);
      data.append("level", formData.level);
      formData.category.forEach((id) => data.append("category", id));

      if (thumbnailFile) {
        data.append("thumbnail", thumbnailFile);
      }

      await updateCourse(courseId, data);
      alert(C.messages.success);
    } catch (error) {
      console.error(error);
      alert(C.messages.failure);
    }
  };

  return {
    courseId,
    loading,
    categories,
    providers,
    formData,
    isPublished,
    previewUrl,
    changeHandler,
    handleFileChange,
    handleCategoryToggle,
    updateCourseHandler,
  };
}
