"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { ADMIN_COURSE_DETAIL as C } from "@/src/constants/admin/course-detail-page";
import { convertToSlug } from "@/src/lib/slug";
import { getCategories, Category } from "@/src/services/categoryService";
import {
  getCourseById,
  getCategoryId,
  updateCourse,
  updateCoursePublishStatus,
} from "@/src/services/course";
import { getProviders, ProviderData } from "@/src/services/provider";
import { getUsers, User } from "@/src/services/userApi";
import type { AdminCourseEditFormData, FieldChangeEvent } from "@/src/types/course-form";

/** Nap khoa hoc (?courseId=), sua thong tin va bat/tat cong khai. */
export function useAdminCourseDetail() {
  const params = useSearchParams();
  const courseId = params.get("courseId") || "";

  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [instructors, setInstructors] = useState<User[]>([]);
  const [providers, setProviders] = useState<ProviderData[]>([]);

  const [formData, setFormData] = useState<AdminCourseEditFormData>({
    title: "",
    slug: "",
    description: "",
    price: 0,
    accessDays: 30,
    category: [],
    instructorId: "",
    providerId: "",
    level: "",
  });

  const [isPublished, setIsPublished] = useState(false);
  const [publishingLoading, setPublishingLoading] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  useEffect(() => {
    const fetchCourseAndMetadata = async () => {
      try {
        setCurrentUser(C.assumedUser);

        const [courseData, categoriesData, usersData, providersData] = await Promise.all([
          getCourseById(courseId),
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

        // getCategoryId nhan ca ba hinh dang cua category (mang id, mang doi tuong
        // da populate, hoac dang { $oid } cua ban ghi cu).
        const normalizedCategories: string[] = getCategoryId(courseData.category);

        const normalizedInstructor = courseData.instructor
          ? typeof courseData.instructor === "object"
            ? courseData.instructor._id
            : courseData.instructor
          : "";

        const normalizedProvider = courseData.provider
          ? typeof courseData.provider === "object"
            ? courseData.provider._id
            : courseData.provider
          : "";

        setFormData({
          title: courseData.title || "",
          // Ban ghi cu chua co slug thi sinh tu tieu de
          slug: courseData.slug || convertToSlug(courseData.title || ""),
          description: courseData.description || "",
          price: courseData.price || 0,
          accessDays: courseData.accessDays || 30,
          category: normalizedCategories,
          instructorId: normalizedInstructor,
          providerId: normalizedProvider || "",
          level: courseData.level || "beginner",
        });

        setIsPublished(courseData.isPublished || false);

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
    fetchCourseAndMetadata();
  }, [courseId]);

  // Doi tieu de thi slug tu nhay theo
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
        e.target.name === "price" || e.target.name === "accessDays"
          ? Number(e.target.value)
          : e.target.value,
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
      // Gui kem slug, thieu la backend bao loi 500 validation
      data.append("slug", formData.slug);
      data.append("description", formData.description);
      data.append("price", String(formData.price));
      data.append("accessDays", String(formData.accessDays));
      data.append("instructorId", formData.instructorId);
      data.append("providerId", formData.providerId);
      data.append("level", formData.level);

      formData.category.forEach((id) => data.append("category", id));

      if (thumbnailFile) {
        data.append("thumbnail", thumbnailFile);
      }

      await updateCourse(courseId, data);
      alert(C.messages.saved);
    } catch (error) {
      console.error(error);
      alert(C.messages.saveFailed);
    }
  };

  const togglePublishStatus = async () => {
    if (currentUser?.role !== "admin") {
      return alert(C.messages.notAdmin);
    }

    try {
      setPublishingLoading(true);
      const nextStatus = !isPublished;
      await updateCoursePublishStatus(courseId, nextStatus);
      setIsPublished(nextStatus);
      alert(C.messages.publishChanged(nextStatus));
    } catch (error) {
      console.error(error);
      alert(C.messages.publishFailed);
    } finally {
      setPublishingLoading(false);
    }
  };

  return {
    courseId,
    loading,
    isAdmin: currentUser?.role === "admin",
    categories,
    instructors,
    providers,
    formData,
    isPublished,
    publishingLoading,
    previewUrl,
    handleTitleChange,
    handleSlugChange,
    changeHandler,
    handleFileChange,
    handleCategoryToggle,
    updateCourseHandler,
    togglePublishStatus,
  };
}
