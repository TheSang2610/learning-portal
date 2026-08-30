"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Loader2, ChevronLeft, ChevronRight, Award, Ban, ShieldCheck, Copy, Check,
} from "lucide-react";

import {
  getAllCertificatesAdmin,
  revokeCertificateAdmin,
} from "@/src/services/adminService";

interface Certificate {
  _id: string;
  certificateNumber?: string;
  verificationCode?: string;
  course?: { _id: string; title: string } | null;
  student?: { _id: string; name: string; email: string } | null;
  courseName?: string;
  instructorName?: string;
  scorePercentage?: number;
  finalScore?: number;
  isValid?: boolean;
  issuedAt?: string;
  completionDate?: string;
}

const PAGE_SIZE = 10;

export default function AdminCertificatesPage() {
  const [rows, setRows] = useState<Certificate[]>([]);
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
      const data: any = await getAllCertificatesAdmin({
        page,
        limit: PAGE_SIZE,
        isValid: validFilter === "" ? undefined : validFilter === "valid",
      });
      setRows(Array.isArray(data?.certificates) ? data.certificates : []);
      setTotal(data?.pagination?.total ?? 0);
      setPages(data?.pagination?.pages ?? 1);
    } catch (e: any) {
      setError(e?.message || "Không tải được danh sách chứng chỉ");
      setRows([]);
    } finally {
      setFetching(false);
    }
  }, [page, validFilter]);

  useEffect(() => { load(); }, [load]);

  const revoke = async (c: Certificate) => {
    const ok = confirm(
      `Thu hồi chứng chỉ của "${c.student?.name || "học viên"}"?\n\n` +
      `Số hiệu: ${c.certificateNumber || c._id}\n` +
      `Chứng chỉ sẽ bị đánh dấu không hợp lệ và không xác thực được nữa.`
    );
    if (!ok) return;
    try {
      setBusyId(c._id);
      setError("");
      await revokeCertificateAdmin(c._id);
      await load();
    } catch (e: any) {
      setError(e?.message || "Thu hồi thất bại");
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

  const selectCls =
    "rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none " +
    "transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Chứng chỉ</h1>
        <p className="mt-1 text-sm text-slate-500">
          {fetching ? "Đang tải..." : `${total} chứng chỉ đã cấp`}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <select
          value={validFilter}
          onChange={(e) => { setValidFilter(e.target.value); setPage(1); }}
          className={selectCls}
        >
          <option value="">Mọi trạng thái</option>
          <option value="valid">Còn hiệu lực</option>
          <option value="revoked">Đã thu hồi</option>
        </select>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wider text-slate-600">
              <tr>
                <th className="px-4 py-3">Học viên</th>
                <th className="px-4 py-3">Khóa học</th>
                <th className="px-4 py-3">Số hiệu / Mã xác thực</th>
                <th className="px-4 py-3">Điểm</th>
                <th className="px-4 py-3">Ngày cấp</th>
                <th className="px-4 py-3 text-right">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {fetching ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center text-slate-500">
                    <Loader2 size={20} className="mx-auto animate-spin" />
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center text-sm text-slate-500">
                    Chưa có chứng chỉ nào được cấp.
                  </td>
                </tr>
              ) : (
                rows.map((c) => {
                  const valid = c.isValid !== false;
                  const code = c.verificationCode;
                  return (
                    <tr key={c._id} className="transition hover:bg-slate-50/60">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                            <Award size={16} />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900">
                              {c.student?.name || "(đã xóa)"}
                            </p>
                            <p className="truncate text-xs text-slate-500">
                              {c.student?.email || "--"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="max-w-[220px] truncate text-sm text-slate-700">
                          {c.course?.title || c.courseName || "(đã xóa)"}
                        </p>
                        {c.instructorName && (
                          <p className="truncate text-xs text-slate-500">GV: {c.instructorName}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-mono text-xs text-slate-700">
                          {c.certificateNumber || "--"}
                        </p>
                        {code && (
                          <button
                            onClick={() => copyCode(code)}
                            title="Sao chép mã xác thực"
                            className="mt-0.5 inline-flex items-center gap-1 font-mono text-xs text-indigo-600 transition hover:text-indigo-800"
                          >
                            {copied === code ? <Check size={11} /> : <Copy size={11} />}
                            {code}
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {c.scorePercentage != null ? `${c.scorePercentage}%` : c.finalScore ?? "--"}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">
                        {c.issuedAt || c.completionDate
                          ? new Date((c.issuedAt || c.completionDate) as string).toLocaleDateString("vi-VN")
                          : "--"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-xs font-semibold ${
                              valid
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-red-200 bg-red-50 text-red-700"
                            }`}
                          >
                            {valid ? <ShieldCheck size={12} /> : <Ban size={12} />}
                            {valid ? "Hợp lệ" : "Đã thu hồi"}
                          </span>
                          <button
                            onClick={() => revoke(c)}
                            disabled={!valid || busyId === c._id}
                            title={valid ? "Thu hồi chứng chỉ" : "Đã thu hồi rồi"}
                            className="rounded-lg p-2 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:text-slate-400 disabled:hover:bg-transparent"
                          >
                            <Ban size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {pages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
            <p className="text-xs text-slate-600">Trang {page} / {pages}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
              >
                <ChevronLeft size={14} /> Trước
              </button>
              <button
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page >= pages}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
              >
                Sau <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
