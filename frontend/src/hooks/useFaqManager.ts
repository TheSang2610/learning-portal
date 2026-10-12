"use client";

import { useCallback, useEffect, useState } from "react";

import { getErrorMessage } from "@/src/services/apiHelper";
import { faqService, type FaqItem } from "@/src/services/faq";

interface FaqManagerOptions<S> {
  /** Pham vi dang quan ly (courseId, khu vuc...) - doi la tai lai. */
  scope: S;
  /**
   * Tai danh sach FAQ cua pham vi. Nen la ham khai bao ngoai component (on
   * dinh) de khoi phai boc useCallback o noi goi.
   */
  load: (scope: S) => Promise<FaqItem[] | null | undefined>;
  /** Tao cau hoi moi - moi trang gan them courseId / viTri rieng. */
  create: (scope: S, question: string, answer: string) => Promise<unknown>;
  /** false = chua du dieu kien tai (vd. chua co courseId). */
  enabled?: boolean;
  messages: {
    loadFailed: string;
    updated: string;
    created: string;
    saveFailed: string;
    confirmDelete: string;
    deleted: string;
    deleteFailed: string;
  };
}

/**
 * Logic quan ly FAQ dung chung cho /admin/faqs va /admin/course-faqs:
 * danh sach, thong bao thanh cong tu tat sau 3 giay, hop them/sua, xoa.
 */
export function useFaqManager<S>({
  scope,
  load,
  create,
  enabled = true,
  messages,
}: FaqManagerOptions<S>) {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [question, setQuestion] = useState<string>("");
  const [answer, setAnswer] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fetchFaqs = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await load(scope);
      setFaqs(data || []);
    } catch (err) {
      setError(getErrorMessage(err, messages.loadFailed));
    } finally {
      setIsLoading(false);
    }
  }, [load, scope, messages.loadFailed]);

  useEffect(() => {
    // Goi qua mot vong microtask thay vi goi thang. Ham tai du lieu bat dau
    // bang setLoading(true), nen goi thang la setState dong bo ngay trong than
    // effect: React phai chay them mot vong ve lai truoc khi hien man hinh
    // (rule react-hooks/set-state-in-effect canh bao dung cho nay). Hoan mot
    // vong microtask thi mat thuong khong thay khac, ma vong ve thua het.
    if (enabled) void Promise.resolve().then(fetchFaqs);
  }, [fetchFaqs, enabled]);

  // Tu tat thong bao thanh cong sau 3 giay
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  const openCreate = () => {
    setEditingId(null);
    setQuestion("");
    setAnswer("");
    setIsOpenModal(true);
  };

  const openEdit = (faq: FaqItem) => {
    setEditingId(faq._id || null);
    setQuestion(faq.question);
    setAnswer(faq.answer);
    setIsOpenModal(true);
  };

  const closeModal = () => setIsOpenModal(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) return;

    try {
      setIsSubmitting(true);
      if (editingId) {
        await faqService.updateFaq(editingId, { question, answer });
        setSuccessMsg(messages.updated);
      } else {
        await create(scope, question, answer);
        setSuccessMsg(messages.created);
      }
      setIsOpenModal(false);
      fetchFaqs();
    } catch (err) {
      alert(getErrorMessage(err, messages.saveFailed));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(messages.confirmDelete)) return;

    try {
      await faqService.deleteFaq(id);
      setSuccessMsg(messages.deleted);
      fetchFaqs();
    } catch (err) {
      alert(getErrorMessage(err, messages.deleteFailed));
    }
  };

  return {
    faqs,
    isLoading,
    error,
    successMsg,
    isOpenModal,
    editingId,
    question,
    setQuestion,
    answer,
    setAnswer,
    isSubmitting,
    openCreate,
    openEdit,
    closeModal,
    handleSubmit,
    handleDelete,
  };
}

export type FaqManager = ReturnType<typeof useFaqManager<unknown>>;
