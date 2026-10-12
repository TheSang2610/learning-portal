"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { ADMIN_CATEGORY_CREATE as C } from "@/src/constants/admin/category-create-page";
import { convertToSlug } from "@/src/lib/slug";
import { getErrorMessage } from "@/src/services/apiHelper";
import { createCategory } from "@/src/services/categoryService";

/** Ten + slug (tu sinh theo ten) va gui tao danh muc. */
export function useCategoryCreate() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Doi ten thi tu dien slug tuong ung
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    setSlug(convertToSlug(value));
  };

  // Nguoi dung go tay slug van ra dung dinh dang
  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSlug(convertToSlug(e.target.value));

  const backToList = () => router.push(C.listHref);

  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return alert(C.messages.needName);
    if (!slug.trim()) return alert(C.messages.needSlug);

    try {
      setSubmitting(true);
      await createCategory({ name, slug: slug.trim() });
      alert(C.messages.success);
      backToList();
    } catch (error) {
      alert(getErrorMessage(error, C.messages.failure));
    } finally {
      setSubmitting(false);
    }
  };

  return {
    name,
    slug,
    submitting,
    handleNameChange,
    handleSlugChange,
    backToList,
    submitHandler,
  };
}
