"use client";

import { useCallback, useEffect, useState } from "react";

import { keyFromSubjectName } from "@/src/lib/document/file-info";
import { ADMIN_DOCUMENTS as C } from "@/src/constants/admin/documents-page";
import { getErrorMessage } from "@/src/services/apiHelper";
import {
  documentService,
  type DocumentSubject,
  type SharedDocument,
} from "@/src/services/document";

/**
 * Quan ly toan bo tai lieu do nguoi dung chia se.
 *
 * Quyen xoa da co san o may chu: deleteDocument cho qua khi la chu bai HOAC
 * role === 'admin'. Trang nay khong tu cap them quyen gi, chi bay ra cho admin
 * mot cho nhin duoc ca kho thay vi phai di tung trang chi tiet.
 */
export function useAdminDocuments() {
  const [list, setList] = useState<SharedDocument[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState<string | null>(null);

  // O tim: giu rieng voi tu khoa DANG AP DUNG. Goi API theo tung phim go thi
  // moi chu la mot luot goi; o day phai bam Tim (hoac Enter) moi goi.
  const [searchInput, setSearchInput] = useState("");
  const [keyword, setKeyword] = useState("");

  const [deleting, setDeleting] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<SharedDocument | null>(null);

  // Sua mon hoc ngay tren bang. Can cho tai lieu dang TRUOC khi co truong mon:
  // chung khong co mon nao nen khong bao gio duoc goi y "cung mon".
  // subjectValue la mang KHOA mon (chon trong danh sach), khong phai chu go tu do.
  const [subjectList, setSubjectList] = useState<DocumentSubject[]>([]);
  const [editingSubject, setEditingSubject] = useState<string | null>(null);
  const [subjectValue, setSubjectValue] = useState<string[]>([]);
  const [savingSubject, setSavingSubject] = useState(false);
  const [togglingHidden, setTogglingHidden] = useState<string | null>(null);

  const startEditSubject = (d: SharedDocument) => {
    setEditingSubject(d._id);
    // Tai lieu luu TEN mon chuan lay tu danh sach, nen so khop ten la ra khoa.
    setSubjectValue(keyFromSubjectName(subjectList, d.monHoc));
  };

  const saveSubject = async (d: SharedDocument) => {
    if (!subjectValue.length) return setErrorMessage(C.messages.needSubject);
    try {
      setSavingSubject(true);
      setErrorMessage(null);
      const { monHoc: subject } = await documentService.updateDocument(d._id, {
        monHoc: subjectValue,
      });
      // Cap nhat tai cho thay vi tai lai ca bang: giu nguyen vi tri cuon va
      // khong nhap nhay trong khi admin dang gan mon cho nhieu dong lien tiep.
      setList((items) =>
        items.map((x) => (x._id === d._id ? { ...x, monHoc: subject } : x)),
      );
      setEditingSubject(null);
      setShowSuccess(C.messages.subjectsSaved((subject ?? []).join(", "), d.title));
    } catch (err) {
      setErrorMessage(getErrorMessage(err, C.messages.subjectsFailed));
    } finally {
      setSavingSubject(false);
    }
  };

  const toggleHidden = async (d: SharedDocument) => {
    try {
      setTogglingHidden(d._id);
      setErrorMessage(null);
      const { daAn: hidden } = await documentService.setHidden(d._id, !d.daAn);
      setList((items) =>
        items.map((x) => (x._id === d._id ? { ...x, daAn: hidden } : x)),
      );
      setShowSuccess(hidden ? C.messages.hidden(d.title) : C.messages.shown(d.title));
    } catch (err) {
      setErrorMessage(getErrorMessage(err, C.messages.toggleFailed));
    } finally {
      setTogglingHidden(null);
    }
  };

  const loadSubjects = useCallback(async () => {
    try {
      setSubjectList(await documentService.getSubjects());
    } catch {
      // Thieu danh sach thi chi khong gan mon duoc - bang van dung.
    }
  }, []);

  useEffect(() => {
    // Hoan mot vong microtask - xem ghi chu o effect tai danh sach ben duoi.
    void Promise.resolve().then(loadSubjects);
  }, [loadSubjects]);

  const download = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      // Duong QUAN TRI: gom ca tai lieu da an. Duong cong khai khong bao gio
      // tra chung - an roi thi admin phai co cho de hien lai.
      const res = await documentService.getDocumentsAdmin({
        page: page,
        limit: C.pageSize,
        q: keyword,
      });
      setList(res.documents ?? []);
      setTotal(res.total ?? 0);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      setErrorMessage(getErrorMessage(err, C.messages.loadFailed));
    } finally {
      setLoading(false);
    }
  }, [page, keyword]);

  useEffect(() => {
    // Goi qua mot vong microtask thay vi goi thang. Ham tai() bat dau bang
    // setLoading(true), nen goi thang la setState dong bo ngay trong than
    // effect: React phai chay them mot vong ve lai truoc khi hien man hinh
    // (rule react-hooks/set-state-in-effect canh bao dung cho nay). Hoan mot
    // vong microtask thi mat thuong khong thay khac, ma vong ve thua het.
    void Promise.resolve().then(download);
  }, [download]);

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      setDeleting(pendingDelete._id);
      await documentService.deleteDocument(pendingDelete._id);
      setShowSuccess(C.messages.deleted(pendingDelete.title));
      setPendingDelete(null);

      // Xoa muc cuoi cung cua mot trang thi trang do thanh rong. Lui mot trang
      // thay vi de admin nhin mot bang trong roi tuong mat het du lieu.
      if (list.length === 1 && page > 1) setPage((t) => t - 1);
      else await download();
    } catch (err) {
      setErrorMessage(getErrorMessage(err, C.messages.deleteFailed));
      setPendingDelete(null);
    } finally {
      setDeleting(null);
    }
  };

  const search = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // ket qua moi thi phai ve trang 1, khong giu so trang cu
    setKeyword(searchInput);
  };

  const clearSearch = () => {
    setSearchInput("");
    setKeyword("");
    setPage(1);
  };

  const totalDownloads = list.reduce((s, d) => s + (d.downloadCount || 0), 0);
  const missingSubjectCount = list.filter((d) => !d.monHoc?.length).length;

  return {
    danhSach: list,
    tong: total,
    trang: page,
    setPage,
    totalPages,
    loading,
    loi: errorMessage,
    showSuccess,
    closeNotice: () => setShowSuccess(null),
    searchInput,
    setSearchInput,
    tuKhoa: keyword,
    deleting,
    pendingDelete,
    setPendingDelete,
    subjectList,
    editingSubject,
    cancelEditSubject: () => setEditingSubject(null),
    subjectValue,
    setSubjectValue,
    savingSubject,
    togglingHidden,
    startEditSubject,
    saveSubject,
    toggleHidden,
    confirmDelete,
    search,
    clearSearch,
    tongLuotTai: totalDownloads,
    missingSubjectCount,
  };
}

export type AdminDocumentsState = ReturnType<typeof useAdminDocuments>;
