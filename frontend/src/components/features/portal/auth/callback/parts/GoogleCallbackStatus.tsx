"use client";

import { useGoogleCallback } from "../hooks/useGoogleCallback";
import CallbackCard from "./CallbackCard";

/** Phan client: doc ?code, ?state tren dia chi va doi lay phien dang nhap. */
export default function GoogleCallbackStatus() {
  const status = useGoogleCallback();
  return <CallbackCard status={status} />;
}
