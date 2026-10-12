"use client";

import { useCallback, useEffect, useState } from "react";

import { USER_SETTINGS as C } from "@/src/constants/portal/user-settings-page";
import { storeUser } from "@/src/hooks/userStore";
import {
  getMyProfile,
  getProvidersApi,
  updateUserProfileApi,
  uploadAvatarApi,
  type Provider,
  type UpdateProfilePayload,
  type User,
} from "@/src/services/userApi";
import type { SettingsMessage, SettingsTabKey } from "@/src/types/settings";

/** Tai ho so, luu tung truong / anh dai dien, tab dang mo va hang dang sua. */
export function useUserSettings() {
  const [tab, setTab] = useState<SettingsTabKey>("personal");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<SettingsMessage>(null);

  const [providers, setProviders] = useState<Provider[]>([]);

  useEffect(() => {
    (async () => {
      try {
        // Lay tu API chu khong doc localStorage: response dang nhap chi co
        // _id/name/email/role nen fullname, birthday, avatar... se luon trong.
        const p = await getMyProfile();
        setUser(p);
        if (p.role === "instructor") {
          getProvidersApi()
            .then(setProviders)
            .catch(() => {});
        }
      } catch (e) {
        setLoadError(e instanceof Error ? e.message : C.messages.loadFailed);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Header doc danh tinh tu kho chung trong RAM, nen phai cap nhat lai thi
  // ten/anh tren thanh dieu huong moi doi theo.
  //
  // Ban cu gop tay vao localStorage roi tu ban su kien. Gio storeUser() lo
  // ca hai. Cung khong con phai gop voi gia tri cu nua: `u` la ban ghi DAY DU
  // may chu vua tra ve sau khi luu, con ban cu buoc phai gop vi trong
  // localStorage chi co bon truong tu luc dang nhap.
  const syncLocal = useCallback((u: User) => {
    storeUser(u);
  }, []);

  const save = useCallback(
    async (payload: UpdateProfilePayload) => {
      setSaving(true);
      setMsg(null);
      try {
        const updated = await updateUserProfileApi(payload);
        setUser(updated);
        syncLocal(updated);
        setEditing(null);
        setMsg({ ok: true, text: C.messages.saved });
        return true;
      } catch (e) {
        setMsg({
          ok: false,
          text: e instanceof Error ? e.message : C.messages.saveFailed,
        });
        return false;
      } finally {
        setSaving(false);
      }
    },
    [syncLocal],
  );

  // Tai anh len di duong rieng (multipart) chu khong qua save() vi save() gui
  // JSON. Phan con lai - cap nhat man hinh, dong bo localStorage, bao thanh
  // cong - giong het nhau.
  const saveAvatarFile = useCallback(
    async (file: File) => {
      setSaving(true);
      setMsg(null);
      try {
        const updated = await uploadAvatarApi(file);
        setUser(updated);
        syncLocal(updated);
        setEditing(null);
        setMsg({ ok: true, text: C.messages.avatarSaved });
        return true;
      } catch (e) {
        setMsg({
          ok: false,
          text: e instanceof Error ? e.message : C.messages.avatarFailed,
        });
        return false;
      } finally {
        setSaving(false);
      }
    },
    [syncLocal],
  );

  const toggle = (key: string) => {
    setMsg(null);
    setEditing((cur) => (cur === key ? null : key));
  };

  const selectTab = (key: SettingsTabKey) => {
    setTab(key);
    setEditing(null);
    setMsg(null);
  };

  return {
    tab,
    selectTab,
    user,
    loading,
    loadError,
    editing,
    toggle,
    saving,
    msg,
    setMsg,
    providers,
    save,
    saveAvatarFile,
  };
}
