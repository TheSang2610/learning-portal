"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";

import {
  adminUi,
  buttonClass,
  Input,
  PageHeader,
  Select,
} from "@/src/components/admin-ui";
import { ADMIN_COURSES as C } from "@/src/constants/admin/courses-page";
import { fillTemplate } from "@/src/lib/format";

import { useAdminCourses } from "./hooks/useAdminCourses";
import AdminCourseRow from "./parts/AdminCourseRow";
import styles from "./AdminCourses.module.scss";

/** Trang /admin/courses - bang khoa hoc (bo giao dien chung admin-ui). */
export default function AdminCourses() {
  const { courses, loading, deletingId, handleDeleteCourse } = useAdminCourses();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");

  const keyword = q.trim().toLowerCase();
  const rows = courses.filter(
    (c) =>
      (!keyword || c.title.toLowerCase().includes(keyword)) &&
      (!status || (status === "published") === Boolean(c.isPublished)),
  );
  const published = courses.filter((c) => c.isPublished).length;

  return (
    <div>
      <PageHeader
        title={C.title}
        description={
          loading
            ? C.loading
            : fillTemplate(C.subtitle, { n: courses.length, p: published })
        }
        actions={
          <Link href={C.createHref} className={buttonClass()}>
            <Plus size={16} aria-hidden />
            {C.create}
          </Link>
        }
      />

      <div className={styles.toolbar}>
        <div className={styles.search}>
          <Search size={16} aria-hidden className={styles.searchIcon} />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={C.searchPlaceholder}
            aria-label={C.searchPlaceholder}
            className={styles.searchInput}
          />
        </div>
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          aria-label={C.statusFilter[0].label}
          className={styles.filter}
        >
          {C.statusFilter.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      </div>

      <div className={adminUi.tableWrap}>
        <table className={adminUi.table}>
          <thead>
            <tr>
              {C.columns.map((col, i) => (
                <th
                  key={i}
                  className={i === C.columns.length - 1 ? styles.actionsHead : ""}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={C.columns.length} className={styles.empty}>
                  {C.loading}
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={C.columns.length} className={styles.empty}>
                  {courses.length === 0 ? C.empty : C.noMatch}
                </td>
              </tr>
            ) : (
              rows.map((course) => (
                <AdminCourseRow
                  key={course._id}
                  course={course}
                  deleting={deletingId === course._id}
                  onDelete={handleDeleteCourse}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
