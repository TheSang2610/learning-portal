"use client";

import { useState } from "react";

import { USER_SETTINGS } from "@/src/constants/portal/user-settings-page";
import { clearSession } from "@/src/services/apiHelper";
import { newPasswordError } from "@/src/services/rules";
import { deactivateMyAccount, type User } from "@/src/services/userApi";
import type { SettingsMessage, SettingsTabProps } from "@/src/types/settings";

const M = USER_SETTINGS.security.messages;

/** Doi / dat mat khau va vo hieu hoa tai khoan. */
export function useSecuritySettings(
  user: User,
  save: SettingsTabProps["save"],
  setMsg: (m: SettingsMessage) => void,
) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");

  const [delPassword, setDelPassword] = useState("");
  const [deleting, setDeleting] = useState(false);

  // Tai khoan tao bang Google chua tung dat mat khau
  const hasGoogle = Boolean(user.googleId);
  // Mac dinh coi nhu da co mat khau: neu backend cu chua tra truong nay thi
  // van hien o nhap mat khau hien tai (an toan hon la bo qua buoc xac minh).
  const hasPassword = user.hasPassword !== false;

  const submitPassword = async () => {
    if (hasPassword && !current) {
      setMsg({ ok: false, text: M.needCurrent });
      return false;
    }
    // Dung chung ham voi backend (services/rules.ts). Truoc day cho nay chi
    // kiem do dai toi thieu; bcrypt thi bo lang moi byte tu 73 tro di, nen mot
    // mat khau dai hon the bi cat am tham ma khong ai duoc bao.
    const passwordError = newPasswordError(next);
    if (passwordError) {
      setMsg({ ok: false, text: M.fromRule(passwordError) });
      return false;
    }
    if (next !== confirm) {
      setMsg({ ok: false, text: M.mismatch });
      return false;
    }
    const ok = await save({ password: next, currentPassword: current });
    if (ok) {
      setCurrent("");
      setNext("");
      setConfirm("");
    }
    return ok;
  };

  const submitDeactivate = async () => {
    setDeleting(true);
    setMsg(null);
    try {
      await deactivateMyAccount(delPassword);
      await clearSession();
      window.location.href = USER_SETTINGS.homeHref;
    } catch (e) {
      setMsg({
        ok: false,
        text: e instanceof Error ? e.message : M.deactivateFailed,
      });
      setDeleting(false);
    }
  };

  return {
    current,
    setCurrent,
    next,
    setNext,
    confirm,
    setConfirm,
    delPassword,
    setDelPassword,
    deleting,
    hasGoogle,
    hasPassword,
    submitPassword,
    submitDeactivate,
  };
}
