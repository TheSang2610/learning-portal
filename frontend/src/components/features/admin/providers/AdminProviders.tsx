"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Building2,
  GraduationCap,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";

import {
  adminUi,
  Badge,
  Button,
  buttonClass,
  Input,
  PageHeader,
} from "@/src/components/admin-ui";
import SafeImage from "@/src/components/ui/SafeImage";
import { ADMIN_PROVIDERS as C } from "@/src/constants/admin/providers-page";
import { fillTemplate } from "@/src/lib/format";

import { useProviderList } from "./hooks/useProviders";
import styles from "./AdminProviders.module.scss";

const L = C.list;

/** Trang /admin/providers - danh sach doi tac & truong hoc (them moi o trang rieng). */
export default function AdminProviders() {
  const { providers, fetching, reload, remove } = useProviderList();
  const [tab, setTab] = useState("");
  const [q, setQ] = useState("");

  const companies = providers.filter((p) => p.type === "company").length;
  const keyword = q.trim().toLowerCase();
  const rows = providers.filter(
    (p) =>
      (!tab || p.type === tab) &&
      (!keyword ||
        p.name.toLowerCase().includes(keyword) ||
        p.slug?.toLowerCase().includes(keyword)),
  );

  return (
    <div>
      <PageHeader
        title={L.title}
        description={
          fetching && providers.length === 0
            ? L.loading
            : fillTemplate(L.subtitle, {
                n: providers.length,
                c: companies,
                u: providers.length - companies,
              })
        }
        actions={
          <>
            <Button
              variant="outline"
              onClick={reload}
              disabled={fetching}
              title={L.refresh}
            >
              <RefreshCw size={16} className={fetching ? styles.spin : ""} aria-hidden />
              {L.refresh}
            </Button>
            <Link href={C.createHref} className={buttonClass()}>
              <Plus size={16} aria-hidden />
              {L.add}
            </Link>
          </>
        }
      />

      <div className={styles.toolbar}>
        <div className={styles.tabs} role="tablist">
          {L.tabs.map((t) => (
            <button
              key={t.value}
              type="button"
              role="tab"
              aria-selected={tab === t.value}
              onClick={() => setTab(t.value)}
              className={`${styles.tab} ${tab === t.value ? styles.tabActive : ""}`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className={styles.search}>
          <Search size={16} aria-hidden className={styles.searchIcon} />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={L.searchPlaceholder}
            aria-label={L.searchPlaceholder}
            className={styles.searchInput}
          />
        </div>
      </div>

      <div className={adminUi.tableWrap}>
        <table className={adminUi.table}>
          <thead>
            <tr>
              {L.columns.map((c, i) => (
                <th
                  key={i}
                  className={i === L.columns.length - 1 ? styles.actionsHead : ""}
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {fetching && providers.length === 0 ? (
              <tr>
                <td colSpan={L.columns.length} className={styles.empty}>
                  {L.loading}
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={L.columns.length} className={styles.empty}>
                  {providers.length === 0 ? L.empty : L.noMatch}
                </td>
              </tr>
            ) : (
              rows.map((p) => (
                <tr key={p._id}>
                  <td>
                    <div className={styles.unit}>
                      <span className={styles.logo}>
                        {p.logo ? (
                          <SafeImage
                            src={p.logo}
                            alt=""
                            width={32}
                            height={32}
                            className={styles.logoImage}
                            hideOnError
                          />
                        ) : (
                          <Building2 size={16} aria-hidden />
                        )}
                      </span>
                      <span className={styles.unitName}>{p.name}</span>
                    </div>
                  </td>
                  <td>
                    <code className={styles.slug}>{p.slug}</code>
                  </td>
                  <td>
                    {p.type === "university" ? (
                      <Badge tone="info">
                        <GraduationCap size={12} aria-hidden />
                        {L.tabs[2].label}
                      </Badge>
                    ) : (
                      <Badge>
                        <Building2 size={12} aria-hidden />
                        {L.tabs[1].label}
                      </Badge>
                    )}
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <Link
                        href={C.editHref(p._id ?? "")}
                        className={buttonClass("ghost", "icon")}
                        title={L.edit}
                        aria-label={`${L.edit}: ${p.name}`}
                      >
                        <Pencil size={16} />
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(p)}
                        title={L.delete}
                        aria-label={`${L.delete}: ${p.name}`}
                        className={styles.danger}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
