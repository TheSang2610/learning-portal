"use client";

import { useCallback, useEffect, useState } from "react";

import { ADMIN_CERTIFICATES as C } from "@/src/constants/admin/certificates-page";
import {
  getAllCertificatesAdmin,
  revokeCertificateAdmin,
} from "@/src/services/adminService";
import { getErrorMessage } from "@/src/services/apiHelper";
import type { AdminCertificateRow } from "@/src/types/certificate";

/** Danh sach chung chi co phan trang + loc trang thai; thu hoi va chep ma. */
export function useAdminCertificates() {
  const [rows, setRows] = useState<AdminCertificateRow[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [validFilter, setValidFilter] = useState("");

  const [fetching, setFetching] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setFetching(true);
      setError("");
      const data = await getAllCertificatesAdmin({
        page,
        limit: C.pageSize,
        isValid: validFilter === "" ? undefined : validFilter === "valid",
      });
      setRows(Array.isArray(data?.certificates) ? data.certificates : []);
      setTotal(data?.pagination?.total ?? 0);
      setPages(data?.pagination?.pages ?? 1);
    } catch (e) {
      setError(getErrorMessage(e, C.messages.loadFailed));
      setRows([]);
    } finally {
      setFetching(false);
    }
  }, [page, validFilter]);

  useEffect(() => {
    // Goi qua mot vong microtask thay vi goi thang. Ham tai du lieu bat dau
    // bang setLoading(true), nen goi thang la setState dong bo ngay trong than
    // effect: React phai chay them mot vong ve lai truoc khi hien man hinh
    // (rule react-hooks/set-state-in-effect canh bao dung cho nay). Hoan mot
    // vong microtask thi mat thuong khong thay khac, ma vong ve thua het.
    void Promise.resolve().then(load);
  }, [load]);

  /** Doi bo loc thi quay ve trang 1. */
  const changeFilter = (value: string) => {
    setValidFilter(value);
    setPage(1);
  };

  const revoke = async (c: AdminCertificateRow) => {
    const ok = confirm(
      C.messages.confirmRevoke(
        c.student?.name || C.messages.studentFallback,
        c.certificateNumber || c._id,
      ),
    );
    if (!ok) return;
    try {
      setBusyId(c._id);
      setError("");
      await revokeCertificateAdmin(c._id);
      await load();
    } catch (e) {
      setError(getErrorMessage(e, C.messages.revokeFailed));
    } finally {
      setBusyId(null);
    }
  };

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      /* trinh duyet chan clipboard thi bo qua */
    }
  };

  return {
    rows,
    total,
    pages,
    page,
    setPage,
    validFilter,
    changeFilter,
    fetching,
    busyId,
    error,
    copied,
    revoke,
    copyCode,
  };
}
