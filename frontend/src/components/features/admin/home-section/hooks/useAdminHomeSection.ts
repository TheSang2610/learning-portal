"use client";

import { useEffect, useState } from "react";

import {
  ADMIN_HOME_SECTIONS,
  type AdminHomeSectionKind,
} from "@/src/constants/admin/home-sections-page";
import type { Course } from "@/src/services/course";

import { SECTION_CONFIG } from "../config";

/**
 * Thu hang khoa hoc cua mot muc trang chu va o tim kiem.
 *
 * Backend tra danh sach DA XEP dung thu tu trang chu dung, nen thu hang = vi tri
 * trong danh sach goc. Phai tinh truoc khi loc tim kiem, khong thi go chu vao o
 * tim la khoa nao cung thanh "#1".
 */
export function useAdminHomeSection(kind: AdminHomeSectionKind) {
  const cfg = SECTION_CONFIG[kind];
  const text = ADMIN_HOME_SECTIONS[kind];

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchCourses() {
      try {
        const data = await cfg.fetch();
        setCourses(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(text.loadError, error);
      } finally {
        setLoading(false);
      }
    }

    // Goi qua mot vong microtask thay vi goi thang. Ham tai du lieu bat dau
    // bang setLoading(true), nen goi thang la setState dong bo ngay trong than
    // effect: React phai chay them mot vong ve lai truoc khi hien man hinh
    // (rule react-hooks/set-state-in-effect canh bao dung cho nay). Hoan mot
    // vong microtask thi mat thuong khong thay khac, ma vong ve thua het.
    void Promise.resolve().then(fetchCourses);
  }, [cfg, text]);

  const filteredCourses = courses
    .map((course, i) => ({ course, rank: i + 1 }))
    .filter(({ course }) =>
      course.title?.toLowerCase().includes(searchTerm.toLowerCase()),
    );

  return {
    loading,
    searchTerm,
    setSearchTerm,
    filteredCourses,
  };
}
