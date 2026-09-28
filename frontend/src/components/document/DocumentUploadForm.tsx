"use client";

import { useEffect, useImperativeHandle, useRef, useState, type Ref } from "react";
import { FileText, Loader2, Upload, X } from "lucide-react";

import RichTextEditor from "@/src/components/common/RichTextEditor";
import { getErrorMessage } from "@/src/services/apiHelper";
import {
  documentService,
  type DocumentSubject,
  type DocumentUniversity,
} from "@/src/services/document";
import SubjectPicker from "./SubjectPicker";
import {
  DUOI_CHO_PHEP,
  GIOI_HAN_NOI_DUNG,
  MAX_MB,
  SO_FILE_TOI_DA,
  doiKichThuoc,
} from "./fileInfo";

import styles from "./ShareDocumentClient.module.scss";

/** Cho trang cha day file vao form - vd. file tha o dai dau trang. */
export interface DocumentUploadFormHandle {
  themFile: (files: File[]) => void;
  /** Cuon toi form. */
  cuonToi: () => void;
}

const duoiCuaFile = (name: string) => name.split(".").pop()?.toLowerCase() ?? "";

/**
 * Form dang tai lieu: tieu de, 1-5 mon, noi dung (TipTap), 1-5 file.
 *
 * Dung chung o trang chu khu tai lieu (/share-document - mo khi tha file vao
 * dai dau trang) va trang tat ca tai lieu (/share-document/browse - nut "Dang
 * tai lieu"). Chi hien cho nguoi DA dang nhap - trang cha tu kiem.
 */
export default function DocumentUploadForm({
  dsMon,
  khiDong,
  khiDangXong,
  truongMacDinh = "",
  ref,
}: {
  dsMon: DocumentSubject[];
  khiDong: () => void;
  /** Dang xong - trang cha tai lai danh sach / so dem neu can. */
  khiDangXong?: () => void;
  /** KHOA truong chon san - vd. dang tu trang cua mot truong. */
  truongMacDinh?: string;
  ref?: Ref<DocumentUploadFormHandle>;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [tieuDe, setTieuDe] = useState("");
  // KHOA cac mon da chon (1-5).
  const [monHoc, setMonHoc] = useState<string[]>([]);
  const [noiDung, setNoiDung] = useState("");
  // 1-5 file, dung thu tu se hien (chuong 1, 2, 3...).
  const [dsFile, setDsFile] = useState<File[]>([]);
  // Truong dai hoc - khong bat buoc. KHOA truong, "" = khong chon.
  const [dsTruong, setDsTruong] = useState<DocumentUniversity[]>([]);
  const [truong, setTruong] = useState(truongMacDinh);

  useEffect(() => {
    let huy = false;
    documentService
      .getUniversities()
      .then((ds) => {
        if (!huy) setDsTruong(ds);
      })
      // Khong tai duoc danh sach truong thi o chon an di - truong khong bat buoc.
      .catch(() => {});
    return () => {
      huy = true;
    };
  }, []);
  const [dangGui, setDangGui] = useState(false);
  const [loiForm, setLoiForm] = useState("");
  const [thanhCong, setThanhCong] = useState("");

  /**
   * Them file vao danh sach (khong thay the). File sai dinh dang / qua nang
   * bi bo va noi ro ten; qua 5 file thi chi lay cho du 5 va bao so bi bo.
   */
  const themFile = (moi: File[]) => {
    setLoiForm("");
    setThanhCong("");
    const loi: string[] = [];
    const hopLe = moi.filter((f) => {
      if (!DUOI_CHO_PHEP.includes(duoiCuaFile(f.name))) {
        loi.push(`"${f.name}" không phải PDF, DOC hoặc DOCX`);
        return false;
      }
      if (f.size > MAX_MB * 1024 * 1024) {
        loi.push(`"${f.name}" nặng ${doiKichThuoc(f.size)} (tối đa ${MAX_MB}MB)`);
        return false;
      }
      return true;
    });

    setDsFile((cu) => {
      // Bo file trung (cung ten + cung dung luong) - chon lai lan hai la chuyen hay gap.
      const chuaCo = hopLe.filter(
        (f) => !cu.some((c) => c.name === f.name && c.size === f.size),
      );
      const conCho = SO_FILE_TOI_DA - cu.length;
      if (chuaCo.length > conCho) {
        loi.push(
          `chỉ đính kèm tối đa ${SO_FILE_TOI_DA} file, đã bỏ ${chuaCo.length - conCho} file`,
        );
      }
      return [...cu, ...chuaCo.slice(0, Math.max(0, conCho))];
    });
    if (loi.length) setLoiForm(`Không thêm được: ${loi.join("; ")}.`);
  };

  useImperativeHandle(ref, () => ({
    themFile,
    cuonToi: () =>
      // Doi mot khung hinh: form co the vua duoc bat, chua ve xong.
      requestAnimationFrame(() =>
        formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
      ),
  }));

  const boFile = (i: number) => setDsFile((cu) => cu.filter((_, j) => j !== i));

  const guiBai = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoiForm("");
    setThanhCong("");

    // Kiem CHU chu khong kiem chuoi HTML: o soan TipTap de trong van tra ve
    // "<p></p>", tuc la chuoi khong rong - kiem noiDung.trim() thi o trong van
    // lot qua, toi may chu moi bi chan.
    const coChu = noiDung
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim();
    if (!tieuDe.trim() || !coChu) {
      return setLoiForm("Vui lòng nhập đầy đủ tiêu đề và nội dung.");
    }
    if (!monHoc.length) return setLoiForm("Vui lòng chọn ít nhất một môn học.");

    setDangGui(true);
    try {
      await documentService.createDocument({
        title: tieuDe.trim(),
        description: noiDung.trim(),
        monHoc,
        files: dsFile,
        truong,
      });
      setTieuDe("");
      setMonHoc([]);
      setNoiDung("");
      setDsFile([]);
      setTruong("");
      setThanhCong("Đã đăng tài liệu. Cảm ơn bạn đã chia sẻ!");
      khiDangXong?.();
    } catch (err) {
      // Bai bi bo loc chan cung ve day - thong bao tu may chu noi ro ly do.
      setLoiForm(getErrorMessage(err, "Không đăng được tài liệu."));
    } finally {
      setDangGui(false);
    }
  };

  return (
    <form ref={formRef} onSubmit={guiBai} className={styles.form}>
      <div className={styles.row3}>
        <div>
          <h2 className={styles.heading}>Đăng tài liệu của bạn</h2>
          <p className={styles.text4}>
            Mọi người đều xem và tải được tài liệu bạn chia sẻ.
          </p>
        </div>
        <button
          type="button"
          onClick={khiDong}
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
          <span id="mon-hoc" className={styles.fieldLabel}>
            Môn học <span className={styles.label}>*</span>
            <span className={styles.nhanPhu}> — chọn một hoặc nhiều, tối đa 5</span>
          </span>
          {/* CHON trong danh sach admin quan ly, khong go tu do: go tu do thi mot
              mon ra nhieu cach viet va bo loc theo mon thanh vo dung. Gia tri
              gui di la KHOA mon; may chu tra lai ten chuan tu danh sach. */}
          <SubjectPicker
            dsMon={dsMon}
            chon={monHoc}
            doiChon={setMonHoc}
            idNhan="mon-hoc"
          />
        </div>

        {dsTruong.length > 0 && (
          <div>
            <label htmlFor="truong-dh" className={styles.fieldLabel}>
              Trường đại học
              <span className={styles.nhanPhu}> — không bắt buộc</span>
            </label>
            <select
              id="truong-dh"
              value={truong}
              onChange={(e) => setTruong(e.target.value)}
              className={styles.input}
            >
              <option value="">— Không chọn trường —</option>
              {dsTruong.map((t) => (
                <option key={t.key} value={t.key}>
                  {t.ten}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label htmlFor="noi-dung" className={styles.fieldLabel}>
            Nội dung <span className={styles.label}>*</span>
          </label>
          <RichTextEditor
            giaTri={noiDung}
            doiGiaTri={setNoiDung}
            toiDa={GIOI_HAN_NOI_DUNG}
            taiAnh={documentService.uploadImage}
            placeholder="Mô tả tài liệu, hoặc viết một bài hướng dẫn: Bước 1… (bấm nút ảnh để chèn ảnh chụp màn hình)…"
          />
          <p className={styles.goiY}>
            Viết bài hướng dẫn như blog: dùng <strong>Tiêu đề nhỏ</strong> cho từng bước
            và nút <strong>chèn ảnh</strong> để thêm ảnh chụp màn hình ngay dưới bước đó.
          </p>
        </div>

        <div>
          <span className={styles.fieldLabel}>
            File đính kèm
            <span className={styles.nhanPhu}>
              {" "}
              — không bắt buộc, tối đa {SO_FILE_TOI_DA} file, vd. chương 1, 2, 3…
            </span>
          </span>

          {/* Moi file mot dong, dung thu tu se hien o trang chi tiet. */}
          {dsFile.length > 0 && (
            <ol className={styles.dsFile}>
              {dsFile.map((f, i) => (
                <li key={`${f.name}-${f.size}`} className={styles.card2}>
                  <span className={styles.soThuTu}>{i + 1}</span>
                  <FileText size={20} className={styles.box3} />
                  <div className={styles.box4}>
                    <p className={styles.text8}>{f.name}</p>
                    <p className={styles.text9}>{doiKichThuoc(f.size)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => boFile(i)}
                    aria-label={`Bỏ file ${f.name}`}
                    className={styles.button3}
                  >
                    <X size={16} />
                  </button>
                </li>
              ))}
            </ol>
          )}

          {dsFile.length < SO_FILE_TOI_DA && (
            <label htmlFor="file-tai-lieu" className={styles.fieldLabel2}>
              <Upload size={24} className={styles.box5} />
              <span className={styles.label2}>
                {dsFile.length ? "Thêm file" : "Bấm để chọn file"}
              </span>
              <span className={styles.label3}>
                PDF, DOC hoặc DOCX &middot; mỗi file tối đa {MAX_MB}MB &middot; còn{" "}
                {SO_FILE_TOI_DA - dsFile.length} chỗ
              </span>
            </label>
          )}
          <input
            id="file-tai-lieu"
            type="file"
            accept=".pdf,.doc,.docx"
            multiple
            className={styles.input2}
            onChange={(e) => {
              themFile(Array.from(e.target.files ?? []));
              // Xoa gia tri: chon lai dung file vua bo van ban su kien change.
              e.target.value = "";
            }}
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
  );
}
