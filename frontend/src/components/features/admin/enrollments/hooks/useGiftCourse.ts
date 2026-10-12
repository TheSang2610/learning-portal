"use client";

import { useEffect, useState } from "react";

import { ADMIN_ENROLLMENTS as C } from "@/src/constants/admin/enrollments-page";
import { getAllUsersAdmin, giftCourseToStudent } from "@/src/services/adminService";
import { getErrorMessage } from "@/src/services/apiHelper";
import type { User } from "@/src/services/userApi";

export interface GiftMessage {
  ok: boolean;
  text: string;
}

/**
 * Tim hoc vien, chon khoa va tang. Truoc 08/10/2026 nam trong trang coin; coin
 * bo di thi day la cho duy nhat quan tri tu mo khoa cho ai do.
 */
export function useGiftCourse(onGifted: () => void) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);
  const [student, setStudent] = useState<User | null>(null);
  const [courseId, setCourseId] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<GiftMessage | null>(null);

  useEffect(() => {
    const word = search.trim();
    if (student || !word) return;
    // Cho mot nhip sau lan go cuoi: khong co doan nay thi go "nguyen" la ban
    // di sau luot goi may chu, ket qua ve khong theo thu tu va nhap nhay.
    const h = setTimeout(async () => {
      setSearching(true);
      try {
        const r = await getAllUsersAdmin({ limit: C.gift.searchLimit, search: word });
        setResults(r.users || []);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, C.gift.searchDelay);
    return () => clearTimeout(h);
  }, [search, student]);

  const pick = (u: User) => {
    setStudent(u);
    setResults([]);
    setMessage(null);
  };

  const clearStudent = () => {
    setStudent(null);
    setSearch("");
  };

  const send = async () => {
    if (!student || !courseId) return;
    setSending(true);
    setMessage(null);
    try {
      const r = await giftCourseToStudent(student._id, courseId);
      setMessage({ ok: true, text: r.message });
      setCourseId("");
      onGifted();
    } catch (e) {
      setMessage({ ok: false, text: getErrorMessage(e, C.gift.failed) });
    } finally {
      setSending(false);
    }
  };

  return {
    search,
    setSearch,
    results: search.trim() && !student ? results : [],
    searching,
    student,
    pick,
    clearStudent,
    courseId,
    setCourseId,
    sending,
    message,
    send,
  };
}
