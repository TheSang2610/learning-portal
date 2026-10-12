"use client";

import { useEffect, useState } from "react";

import { ADMIN_PROVIDERS as C } from "@/src/constants/admin/providers-page";
import { getErrorMessage } from "@/src/services/apiHelper";
import {
  createProviderAdmin,
  deleteProviderAdmin,
  getProviders,
  updateProviderAdmin,
} from "@/src/services/provider";
import type { ProviderKind, ProviderRow } from "@/src/types/provider";

/** Danh sach doi tac + bieu mau them/sua (kem logo) + xoa. */
export function useAdminProviders() {
  const [providers, setProviders] = useState<ProviderRow[]>([]);
  const [name, setName] = useState("");
  const [type, setType] = useState<ProviderKind>("company");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const loadProviders = async () => {
    try {
      setFetching(true);
      const data = await getProviders();
      if (Array.isArray(data)) {
        setProviders(data);
      }
    } catch (err) {
      alert(getErrorMessage(err, C.messages.loadFailed));
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    // Goi qua mot vong microtask thay vi goi thang. Ham tai du lieu bat dau
    // bang setLoading(true), nen goi thang la setState dong bo ngay trong than
    // effect: React phai chay them mot vong ve lai truoc khi hien man hinh
    // (rule react-hooks/set-state-in-effect canh bao dung cho nay). Hoan mot
    // vong microtask thi mat thuong khong thay khac, ma vong ve thua het.
    void Promise.resolve().then(loadProviders);
  }, []);

  // Chon anh -> tao link xem truoc tam thoi
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const resetForm = () => {
    setName("");
    setType("company");
    setFile(null);
    setPreviewUrl(null);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return alert(C.messages.needName);

    setLoading(true);
    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("type", type);
    if (file) {
      // Key "logo" khop uploadCloud.single("logo") o backend
      formData.append("logo", file);
    }

    try {
      if (editingId) {
        await updateProviderAdmin(editingId, formData);
        alert(C.messages.updated);
      } else {
        if (!file) {
          return alert(C.messages.needLogo);
        }
        await createProviderAdmin(formData);
        alert(C.messages.created);
      }
      resetForm();
      loadProviders();
    } catch (err) {
      alert(getErrorMessage(err, C.messages.saveFailed));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (provider: ProviderRow) => {
    if (!provider._id) return;
    setEditingId(provider._id);
    setName(provider.name);
    setType(provider.type);
    // Hien san anh cu tren Cloudinary lam xem truoc
    setPreviewUrl(provider.logo);
    setFile(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(C.messages.confirmDelete)) return;
    try {
      const res = await deleteProviderAdmin(id);
      alert(res.message || C.messages.deleted);
      loadProviders();
    } catch (err) {
      alert(getErrorMessage(err, C.messages.deleteFailed));
    }
  };

  return {
    providers,
    name,
    setName,
    type,
    setType,
    previewUrl,
    editingId,
    loading,
    fetching,
    loadProviders,
    handleFileChange,
    resetForm,
    handleSubmit,
    handleEdit,
    handleDelete,
  };
}

export type AdminProvidersState = ReturnType<typeof useAdminProviders>;
