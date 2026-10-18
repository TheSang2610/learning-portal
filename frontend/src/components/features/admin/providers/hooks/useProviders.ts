"use client";

import { useCallback, useEffect, useState } from "react";

import { ADMIN_PROVIDERS as C } from "@/src/constants/admin/providers-page";
import { getErrorMessage } from "@/src/services/apiHelper";
import {
  createProviderAdmin,
  deleteProviderAdmin,
  getProviders,
  updateProviderAdmin,
} from "@/src/services/provider";
import type { ProviderKind, ProviderRow } from "@/src/types/provider";

/** Danh sach doi tac / truong hoc + xoa. Dung o /admin/providers. */
export function useProviderList() {
  const [providers, setProviders] = useState<ProviderRow[]>([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setFetching(true);
    try {
      const data = await getProviders();
      setProviders(Array.isArray(data) ? (data as ProviderRow[]) : []);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    // Hoan mot vong microtask: load() bat dau bang setState, goi thang trong
    // than effect thi React canh bao (react-hooks/set-state-in-effect).
    void Promise.resolve().then(load);
  }, [load]);

  const remove = async (p: ProviderRow) => {
    if (!p._id || !confirm(C.messages.confirmDelete(p.name))) return;
    try {
      await deleteProviderAdmin(p._id);
      setProviders((list) => list.filter((x) => x._id !== p._id));
    } catch (err) {
      alert(getErrorMessage(err, C.messages.deleteFailed));
    }
  };

  return { providers, fetching, error, reload: load, remove };
}

/**
 * Bieu mau them / sua mot don vi. Co `id` thi tai don vi do (tu danh sach -
 * backend khong co duong lay mot don vi rieng) va luu bang cap nhat.
 */
export function useProviderForm(id: string | null, onDone: () => void) {
  const [name, setName] = useState("");
  const [type, setType] = useState<ProviderKind>("company");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [notFound, setNotFound] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    let alive = true;
    getProviders()
      .then((list) => {
        if (!alive) return;
        const p = (Array.isArray(list) ? (list as ProviderRow[]) : []).find(
          (x) => x._id === id,
        );
        if (!p) {
          setNotFound(true);
          return;
        }
        setName(p.name);
        setType(p.type);
        setPreviewUrl(p.logo || null);
      })
      .catch(() => alive && setNotFound(true))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [id]);

  const pickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError(C.messages.needName);
    if (!id && !file) return setError(C.messages.needLogo);

    const fd = new FormData();
    fd.append("name", name.trim());
    fd.append("type", type);
    // Khoa "logo" khop uploadCloud.single("logo") o backend.
    if (file) fd.append("logo", file);

    setSaving(true);
    setError("");
    try {
      if (id) await updateProviderAdmin(id, fd);
      else await createProviderAdmin(fd);
      onDone();
    } catch (err) {
      setError(getErrorMessage(err, C.messages.saveFailed));
    } finally {
      setSaving(false);
    }
  };

  return {
    name,
    setName,
    type,
    setType,
    previewUrl,
    pickFile,
    loading,
    notFound,
    saving,
    error,
    submit,
  };
}
