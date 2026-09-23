"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import {
  Download,
  FileText,
  Loader2,
  LogIn,
  Newspaper,
  Search,
  ShieldAlert,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import FeedCard from "@/src/components/common/FeedCard";
import { thoiGianTuongDoi } from "@/src/components/common/time";
import {
  documentService,
  type DocumentListResponse,
  type SharedDocument,
} from "@/src/services/document";
import { useNguoiDungLuu } from "@/src/hooks/userStore";
import { getErrorMessage } from "@/src/services/apiHelper";

import styles from "./ShareDocumentClient.module.scss";
const MAX_MB = 20;
const DUOI_CHO_PHEP = ["pdf", "doc", "docx"];

interface Props {
  /** Trang dau lay san tu server - xem ghi chu trong page.tsx */
  initialData: DocumentListResponse;
}

function doiKichThuoc(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function duoiCuaFile(name: string): string {
  return name.split(".").pop()?.toLowerCase() ?? "";
}

// Mau nhan theo duoi file. Truoc day la chuoi lop Tailwind dat thang o day;
// go Tailwind xong thi nhan pdf va nhan doc nhin y het nhau.
const MAU_LOAI: Record<string, string> = {
  pdf: styles.nhanPdf,
  doc: styles.nhanDoc,
  docx: styles.nhanDoc,
};

export default function ShareDocumentClient({ initialData }: Props) {
  const [data, setData] = useState<DocumentListResponse>(initialData);
  const [dangTai, setDangTai] = useState(false);
  const [loiDanhSach, setLoiDanhSach] = useState("");

  const [tuKhoa, setTuKhoa] = useState("");
  const [tuKhoaDangDung, setTuKhoaDangDung] = useState("");

  // Danh tinh lay tu kho chung o RAM; <NapNguoiDung /> lo nap va dong bo giua
  // cac tab - xem src/hooks/userStore.ts.
  const user = useNguoiDungLuu();
  const [moForm, setMoForm] = useState(false);

  const [tieuDe, setTieuDe] = useState("");
  const [noiDung, setNoiDung] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dangGui, setDangGui] = useState(false);
  const [loiForm, setLoiForm] = useState("");
  const [thanhCong, setThanhCong] = useState("");

  // Chi goi lai khi nguoi dung bam tim / doi trang / vua dang xong.
  // Danh sach lan dau da co san tu server nen khong fetch luc mount.
  const taiLai = useCallback(async (page: number, q: string) => {
    setDangTai(true);
    setLoiDanhSach("");
    try {
      const res = await documentService.getDocuments({ page, q, limit: 12 });
      setData(res);
    } catch (err) {
      setLoiDanhSach(getErrorMessage(err, "Không tải được danh sách tài liệu."));
    } finally {
      setDangTai(false);
    }
  }, []);

  const timKiem = (e: React.FormEvent) => {
    e.preventDefault();
    setTuKhoaDangDung(tuKhoa);
    taiLai(1, tuKhoa);
  };

  const chonFile = (f: File | null) => {
    setLoiForm("");
    if (!f) return setFile(null);
    if (!DUOI_CHO_PHEP.includes(duoiCuaFile(f.name))) {
      setFile(null);
      return setLoiForm("Chỉ nhận file PDF, DOC hoặc DOCX.");
    }
    if (f.size > MAX_MB * 1024 * 1024) {
      setFile(null);
      return setLoiForm(
        `File tối đa ${MAX_MB}MB. File bạn chọn nặng ${doiKichThuoc(f.size)}.`,
      );
    }
    setFile(f);
  };

  const guiBai = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoiForm("");
    setThanhCong("");

    if (!tieuDe.trim() || !noiDung.trim()) {
      return setLoiForm("Vui lòng nhập đầy đủ tiêu đề và nội dung.");
    }
    if (!file) return setLoiForm("Vui lòng chọn file PDF hoặc Word.");

    setDangGui(true);
    try {
      await documentService.createDocument({
        title: tieuDe.trim(),
        description: noiDung.trim(),
        file,
      });
      setTieuDe("");
      setNoiDung("");
      setFile(null);
      setThanhCong("Đã đăng tài liệu. Cảm ơn bạn đã chia sẻ!");
      await taiLai(1, tuKhoaDangDung);
    } catch (err) {
      // Bai bi bo loc chan cung ve day - thong bao tu may chu noi ro ly do.
      setLoiForm(getErrorMessage(err, "Không đăng được tài liệu."));
    } finally {
      setDangGui(false);
    }
  };

  const xoaBai = async (doc: SharedDocument) => {
    if (!confirm(`Xóa tài liệu "${doc.title}"? Thao tác này không hoàn tác được.`))
      return;
    try {
      await documentService.deleteDocument(doc._id);
      await taiLai(data.page, tuKhoaDangDung);
    } catch (err) {
      alert(getErrorMessage(err, "Không xóa được tài liệu."));
    }
  };

  const coTheXoa = (doc: SharedDocument) =>
    Boolean(user && (user.role === "admin" || user._id === doc.uploader?._id));

  return (
    <div className={styles.container}>
      {/* ------------------------------------------------------------------ */}
      {/* Khu dang bai - de tren cung, ngoai luoi hai cot                     */}
      {/* ------------------------------------------------------------------ */}
      {!user ? (
        <div className={styles.card}>
          <div className={styles.row}>
            <span className={styles.row2}>
              <LogIn size={20} className={styles.box} />
            </span>
            <div>
              <p className={styles.text}>Đăng nhập để chia sẻ tài liệu</p>
              <p className={styles.text2}>
                Xem và tải thì không cần tài khoản, chỉ khi đăng lên mới cần.
              </p>
            </div>
          </div>
          <Link href="/?auth=login" className={styles.box2}>
            Đăng nhập
          </Link>
        </div>
      ) : !moForm ? (
        <div className={styles.card}>
          <p className={styles.text3}>Bạn có đề cương, đề thi hay slide muốn chia sẻ?</p>
          <button type="button" onClick={() => setMoForm(true)} className={styles.button}>
            <Upload size={16} />
            Đăng tài liệu
          </button>
        </div>
      ) : (
        <form onSubmit={guiBai} className={styles.form}>
          <div className={styles.row3}>
            <div>
              <h2 className={styles.heading}>Đăng tài liệu của bạn</h2>
              <p className={styles.text4}>
                Mọi người đều xem và tải được tài liệu bạn chia sẻ.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setMoForm(false)}
              aria-label="Đóng biểu mẫu"
              className={styles.button2}
            >
              <X size={18} />
            </button>
          </div>

          <div className={styles.stack}>
            <div>
              <label htmlFor="tieu-de" className={styles.fieldLabel}>
                Tiêu đề <span className={styles.label}>*</span>
              </label>
              <input
                id="tieu-de"
                value={tieuDe}
                onChange={(e) => setTieuDe(e.target.value)}
                maxLength={200}
                placeholder="VD: Đề cương ôn tập Cấu trúc dữ liệu và giải thuật"
                className={styles.input}
              />
              <p className={styles.text5}>{tieuDe.length}/200</p>
            </div>

            <div>
              <label htmlFor="noi-dung" className={styles.fieldLabel}>
                Nội dung <span className={styles.label}>*</span>
              </label>
              <textarea
                id="noi-dung"
                value={noiDung}
                onChange={(e) => setNoiDung(e.target.value)}
                maxLength={5000}
                rows={9}
                placeholder={
                  "Viết toàn bộ nội dung bài ở đây.\n\n" +
                  "Chương 1: Tên chương\n" +
                  "Nội dung của chương...\n\n" +
                  "Mục 1.1 Tên mục nhỏ\n" +
                  "- Ý thứ nhất\n" +
                  "- Ý thứ hai"
                }
                className={styles.textarea}
              />
              <div className={styles.row4}>
                {/* Muc luc ben trai trang chi tiet duoc dung tu chinh nhung dong
                    nay. Khong noi ro thi nguoi dang go mot khoi van lien, va
                    trang chi tiet khong co gi de dieu huong. */}
                <p className={styles.text6}>
                  Dòng bắt đầu bằng <code className={styles.code}>Chương 1:</code>,{" "}
                  <code className={styles.code}>Mục 1.1</code> hoặc{" "}
                  <code className={styles.code}>## Tiêu đề</code> sẽ thành mục lục ở trang
                  xem bài.
                </p>
                <p className={styles.text7}>{noiDung.length}/5000</p>
              </div>
            </div>

            <div>
              <span className={styles.fieldLabel}>
                File tài liệu <span className={styles.label}>*</span>
              </span>

              {file ? (
                <div className={styles.card2}>
                  <FileText size={20} className={styles.box3} />
                  <div className={styles.box4}>
                    <p className={styles.text8}>{file.name}</p>
                    <p className={styles.text9}>{doiKichThuoc(file.size)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    aria-label="Bỏ file đã chọn"
                    className={styles.button3}
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <label htmlFor="file-tai-lieu" className={styles.fieldLabel2}>
                  <Upload size={24} className={styles.box5} />
                  <span className={styles.label2}>Bấm để chọn file</span>
                  <span className={styles.label3}>
                    PDF, DOC hoặc DOCX &middot; tối đa {MAX_MB}MB
                  </span>
                </label>
              )}
              <input
                id="file-tai-lieu"
                type="file"
                accept=".pdf,.doc,.docx"
                className={styles.input2}
                onChange={(e) => chonFile(e.target.files?.[0] ?? null)}
              />
            </div>
          </div>

          {loiForm && (
            <p role="alert" className={styles.text10}>
              {loiForm}
            </p>
          )}
          {thanhCong && (
            <p role="status" className={styles.text11}>
              {thanhCong}
            </p>
          )}

          <button type="submit" disabled={dangGui} className={styles.button4}>
            {dangGui ? (
              <Loader2 size={16} className={styles.spinner} />
            ) : (
              <Upload size={16} />
            )}
            {dangGui ? "Đang đăng..." : "Đăng tài liệu"}
          </button>
        </form>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Luoi hai cot: danh sach ben trai, thong tin phu ben phai            */}
      {/* ------------------------------------------------------------------ */}
      <div className={styles.grid}>
        <div>
          <div className={styles.row5}>
            <h2 className={styles.heading}>
              Tài liệu đã chia sẻ <span className={styles.label4}>({data.total})</span>
            </h2>

            <form onSubmit={timKiem} className={styles.form2}>
              <div className={styles.box6}>
                <Search size={16} className={styles.floating} />
                <input
                  value={tuKhoa}
                  onChange={(e) => setTuKhoa(e.target.value)}
                  placeholder="Tìm tài liệu"
                  aria-label="Tìm tài liệu"
                  className={styles.input3}
                />
              </div>
              <button type="submit" className={styles.button5}>
                Tìm
              </button>
            </form>
          </div>

          {loiDanhSach && (
            <p role="alert" className={styles.text10}>
              {loiDanhSach}
            </p>
          )}

          {dangTai ? (
            <div className={styles.card3}>
              <Loader2 size={18} className={styles.spinner} />
              Đang tải...
            </div>
          ) : data.documents.length === 0 ? (
            <div className={styles.card4}>
              <FileText size={32} className={styles.box7} />
              <p className={styles.text12}>
                {tuKhoaDangDung
                  ? "Không tìm thấy tài liệu phù hợp"
                  : "Chưa có tài liệu nào"}
              </p>
              <p className={styles.text13}>
                {tuKhoaDangDung
                  ? "Thử từ khóa khác xem sao."
                  : "Hãy là người đầu tiên chia sẻ."}
              </p>
            </div>
          ) : (
            <div className={styles.stack2}>
              {data.documents.map((doc) => (
                <FeedCard
                  key={doc._id}
                  href={`/share-document/${doc._id}`}
                  tacGia={doc.uploader?.name || "Người dùng đã xóa"}
                  anhTacGia={doc.uploader?.avatar || null}
                  tieuDe={doc.title}
                  moTa={doc.description}
                  meta={
                    <>
                      <span
                        className={`${styles.label8} ${
                          MAU_LOAI[doc.fileExt] ?? MAU_LOAI.pdf
                        }`}
                      >
                        {doc.fileExt.toUpperCase()}
                      </span>
                      <span>{thoiGianTuongDoi(doc.createdAt)}</span>
                      <span aria-hidden className={styles.label5}>
                        &middot;
                      </span>
                      <span className={styles.label6}>
                        <Download size={13} />
                        {doc.downloadCount} lượt tải
                      </span>
                      <span aria-hidden className={styles.label5}>
                        &middot;
                      </span>
                      <span>{doiKichThuoc(doc.fileSize)}</span>
                    </>
                  }
                  themMuc={
                    coTheXoa(doc)
                      ? [
                          {
                            nhan: "Xóa tài liệu",
                            icon: <Trash2 size={15} />,
                            onChon: () => xoaBai(doc),
                            nguyHiem: true,
                          },
                        ]
                      : undefined
                  }
                />
              ))}
            </div>
          )}

          {data.totalPages > 1 && (
            <div className={styles.row6}>
              <button
                type="button"
                disabled={data.page <= 1 || dangTai}
                onClick={() => taiLai(data.page - 1, tuKhoaDangDung)}
                className={styles.card5}
              >
                Trước
              </button>
              <span className={styles.label7}>
                Trang {data.page}/{data.totalPages}
              </span>
              <button
                type="button"
                disabled={data.page >= data.totalPages || dangTai}
                onClick={() => taiLai(data.page + 1, tuKhoaDangDung)}
                className={styles.card5}
              >
                Sau
              </button>
            </div>
          )}
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Cot phai                                                          */}
        {/* Quy dinh dat o day thay vi mot dai bang ngang phia tren: nguoi   */}
        {/* dung van thay no khi cuon danh sach, khong chi luc vao trang.    */}
        {/* ---------------------------------------------------------------- */}
        <aside className={styles.aside}>
          <h2 className={styles.heading2}>Quy định khi đăng</h2>
          <div className={styles.card6}>
            <div className={styles.row7}>
              <ShieldAlert size={18} className={styles.box8} />
              <p className={styles.text14}>
                Hệ thống tự động từ chối bài có nội dung{" "}
                <strong>chửi thề, tục tĩu</strong>, <strong>kỳ thị chủng tộc</strong>,
                hoặc <strong>kích động gây hấn</strong>.
              </p>
            </div>
          </div>

          <h2 className={styles.heading3}>Định dạng nhận</h2>
          <ul className={styles.list}>
            {DUOI_CHO_PHEP.map((d) => (
              <li key={d} className={`${styles.item2} ${MAU_LOAI[d]}`}>
                {d.toUpperCase()}
              </li>
            ))}
            <li className={styles.item}>tối đa {MAX_MB}MB</li>
          </ul>

          <div className={styles.card7}>
            <p className={styles.text15}>
              <Newspaper size={16} className={styles.box} />
              Đọc bài viết
            </p>
            <p className={styles.text16}>
              Kinh nghiệm tự học lập trình và các kỹ thuật lập trình web.
            </p>
            <Link href="/blog" className={styles.box9}>
              Xem bài viết
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
