"use client";

import { useCallback, useEffect, useState } from "react";
import { getErrorMessage } from "@/src/services/apiHelper";
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  Award,
  Ban,
  ShieldCheck,
  Copy,
  Check,
  FileText,
} from "lucide-react";

import {
  getAllCertificatesAdmin,
  revokeCertificateAdmin,
} from "@/src/services/adminService";
import { duongDanPdfChungChi } from "@/src/services/certificate";

import styles from "./page.module.scss";
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
      const data = await getAllCertificatesAdmin({
        page,
        limit: PAGE_SIZE,
        isValid: validFilter === "" ? undefined : validFilter === "valid",
      });
      setRows(Array.isArray(data?.certificates) ? data.certificates : []);
      setTotal(data?.pagination?.total ?? 0);
      setPages(data?.pagination?.pages ?? 1);
    } catch (e) {
      setError(getErrorMessage(e, "Không tải được danh sách chứng chỉ"));
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

  const revoke = async (c: Certificate) => {
    const ok = confirm(
      `Thu hồi chứng chỉ của "${c.student?.name || "học viên"}"?\n\n` +
        `Số hiệu: ${c.certificateNumber || c._id}\n` +
        `Chứng chỉ sẽ bị đánh dấu không hợp lệ và không xác thực được nữa.`,
    );
    if (!ok) return;
    try {
      setBusyId(c._id);
      setError("");
      await revokeCertificateAdmin(c._id);
      await load();
    } catch (e) {
      setError(getErrorMessage(e, "Thu hồi thất bại"));
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

  const selectCls = styles.box3;

  return (
    <div className={styles.stack}>
      <div>
        <h1 className={styles.title}>Chứng chỉ</h1>
        <p className={styles.text}>
          {fetching ? "Đang tải..." : `${total} chứng chỉ đã cấp`}
        </p>
      </div>

      <div className={styles.row}>
        <select
          value={validFilter}
          onChange={(e) => {
            setValidFilter(e.target.value);
            setPage(1);
          }}
          className={selectCls}
        >
          <option value="">Mọi trạng thái</option>
          <option value="valid">Còn hiệu lực</option>
          <option value="revoked">Đã thu hồi</option>
        </select>
      </div>

      {error && <div className={styles.card}>{error}</div>}

      <div className={styles.card2}>
        <div className={styles.scroller}>
          <table className={styles.table}>
            <thead className={styles.thead}>
              <tr>
                <th className={styles.headCell}>Học viên</th>
                <th className={styles.headCell}>Khóa học</th>
                <th className={styles.headCell}>Số hiệu / Mã xác thực</th>
                <th className={styles.headCell}>Điểm</th>
                <th className={styles.headCell}>Ngày cấp</th>
                <th className={styles.headCell}>Bản PDF</th>
                <th className={styles.headCell2}>Trạng thái</th>
              </tr>
            </thead>
            <tbody className={styles.tbody}>
              {fetching ? (
                <tr>
                  <td colSpan={7} className={styles.cell}>
                    <Loader2 size={20} className={styles.spinner} />
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className={styles.cell2}>
                    Chưa có chứng chỉ nào được cấp.
                  </td>
                </tr>
              ) : (
                rows.map((c) => {
                  const valid = c.isValid !== false;
                  const code = c.verificationCode;
                  return (
                    <tr key={c._id} className={styles.row2}>
                      <td className={styles.headCell}>
                        <div className={styles.row3}>
                          <div className={styles.row4}>
                            <Award size={16} />
                          </div>
                          <div className={styles.box}>
                            <p className={styles.text2}>
                              {c.student?.name || "(đã xóa)"}
                            </p>
                            <p className={styles.text3}>{c.student?.email || "--"}</p>
                          </div>
                        </div>
                      </td>
                      <td className={styles.headCell}>
                        <p className={styles.text4}>
                          {c.course?.title || c.courseName || "(đã xóa)"}
                        </p>
                        {c.instructorName && (
                          <p className={styles.text3}>GV: {c.instructorName}</p>
                        )}
                      </td>
                      <td className={styles.headCell}>
                        <p className={styles.text5}>{c.certificateNumber || "--"}</p>
                        {code && (
                          <button
                            onClick={() => copyCode(code)}
                            title="Sao chép mã xác thực"
                            className={styles.button}
                          >
                            {copied === code ? <Check size={11} /> : <Copy size={11} />}
                            {code}
                          </button>
                        )}
                      </td>
                      <td className={styles.cell3}>
                        {c.scorePercentage != null
                          ? `${c.scorePercentage}%`
                          : (c.finalScore ?? "--")}
                      </td>
                      <td className={styles.cell4}>
                        {c.issuedAt || c.completionDate
                          ? new Date(
                              (c.issuedAt || c.completionDate) as string,
                            ).toLocaleDateString("vi-VN")
                          : "--"}
                      </td>
                      {/* Ban PDF do may chu dung ra, mo thang trong the moi.
                          Dung dung tep ma hoc vien tai ve - truoc day chung
                          nhan chi ton tai duoi dang HTML in tu trinh duyet nen
                          quan tri khong co gi de doi chieu khi co khieu nai. */}
                      <td className={styles.headCell}>
                        <a
                          href={duongDanPdfChungChi(c._id)}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Mở bản PDF của chứng nhận này"
                          className={styles.link}
                        >
                          <FileText size={13} />
                          Xem PDF
                        </a>
                      </td>
                      <td className={styles.headCell}>
                        <div className={styles.row5}>
                          <span
                            className={`${styles.label3} ${
                              valid ? styles.label : styles.label2
                            }`}
                          >
                            {valid ? <ShieldCheck size={12} /> : <Ban size={12} />}
                            {valid ? "Hợp lệ" : "Đã thu hồi"}
                          </span>
                          <button
                            onClick={() => revoke(c)}
                            disabled={!valid || busyId === c._id}
                            title={valid ? "Thu hồi chứng chỉ" : "Đã thu hồi rồi"}
                            className={styles.button2}
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
          <div className={styles.row6}>
            <p className={styles.text6}>
              Trang {page} / {pages}
            </p>
            <div className={styles.row7}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className={styles.box2}
              >
                <ChevronLeft size={14} /> Trước
              </button>
              <button
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page >= pages}
                className={styles.box2}
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
