"use client";

import { useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Building2, GraduationCap, ImageIcon, Upload } from "lucide-react";

import {
  Button,
  buttonClass,
  Card,
  Field,
  Input,
  PageHeader,
} from "@/src/components/admin-ui";
import { ADMIN_PROVIDERS as C } from "@/src/constants/admin/providers-page";
import type { ProviderKind } from "@/src/types/provider";

import { useProviderForm } from "./hooks/useProviders";
import styles from "./AdminProviders.module.scss";

const F = C.form;
const KIND_ICONS = { company: Building2, university: GraduationCap } as const;

/** Trang /admin/provider-create - them doi tac / truong hoc; kem ?id= la sua. */
export default function AdminProviderCreate() {
  const router = useRouter();
  const id = useSearchParams().get("id");
  const s = useProviderForm(id, () => router.push(C.listHref));
  const fileRef = useRef<HTMLInputElement>(null);

  const header = (
    <>
      <Link href={C.listHref} className={styles.back}>
        <ArrowLeft size={16} aria-hidden />
        {F.back}
      </Link>
      <PageHeader
        title={id ? F.editTitle : F.createTitle}
        description={id ? F.editDesc : F.createDesc}
      />
    </>
  );

  if (s.loading) {
    return (
      <div>
        {header}
        <p className={styles.muted}>{F.loading}</p>
      </div>
    );
  }

  if (s.notFound) {
    return (
      <div>
        {header}
        <p className={styles.muted}>{F.notFound}</p>
      </div>
    );
  }

  return (
    <form onSubmit={s.submit}>
      {header}

      <div className={styles.formGrid}>
        <Card title={F.infoTitle}>
          <div className={styles.fields}>
            <Field label={F.name} htmlFor="provider-name">
              <Input
                id="provider-name"
                value={s.name}
                onChange={(e) => s.setName(e.target.value)}
                placeholder={F.namePlaceholder}
                maxLength={120}
                autoFocus={!id}
              />
            </Field>

            <Field label={F.kind}>
              <div className={styles.kinds} role="radiogroup" aria-label={F.kind}>
                {F.kinds.map((k) => {
                  const Icon = KIND_ICONS[k.value];
                  const active = s.type === k.value;
                  return (
                    <button
                      key={k.value}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => s.setType(k.value as ProviderKind)}
                      className={`${styles.kind} ${active ? styles.kindActive : ""}`}
                    >
                      <Icon size={18} aria-hidden />
                      <span>
                        <span className={styles.kindLabel}>{k.label}</span>
                        <span className={styles.kindHint}>{k.hint}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </Field>
          </div>
        </Card>

        <Card title={F.logoTitle} description={F.logoDesc}>
          <div className={styles.logoBox}>
            <span className={styles.logoPreview}>
              {s.previewUrl ? (
                // Anh xem truoc co the la blob: cuc bo - khong qua next/image.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={s.previewUrl} alt="" />
              ) : (
                <span className={styles.logoEmpty}>
                  <ImageIcon size={24} aria-hidden />
                  {F.noLogo}
                </span>
              )}
            </span>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={s.pickFile}
              className={styles.hiddenInput}
            />
            <Button variant="outline" onClick={() => fileRef.current?.click()}>
              <Upload size={16} aria-hidden />
              {s.previewUrl ? F.changeLogo : F.pickLogo}
            </Button>
          </div>
        </Card>
      </div>

      {s.error && <p className={styles.formError}>{s.error}</p>}

      <div className={styles.formActions}>
        <Link href={C.listHref} className={buttonClass("outline")}>
          {F.cancel}
        </Link>
        <Button type="submit" disabled={s.saving}>
          {s.saving ? F.busy : id ? F.update : F.create}
        </Button>
      </div>
    </form>
  );
}
