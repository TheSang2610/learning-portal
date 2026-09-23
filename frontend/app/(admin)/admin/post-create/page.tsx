"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  ExternalLink,
  Eye,
  ImageOff,
  ListTree,
  Loader2,
  PenLine,
  Save,
} from "lucide-react";
import SafeImage from "@/src/components/ui/SafeImage";
import { layMucLuc, phanTichNoiDung } from "@/src/components/common/articleOutline";
import { laHtml, neoHoaTieuDe } from "@/src/components/common/postHtml";
import TrinhSoanBai from "@/src/components/admin/PostEditor";
import { getErrorMessage } from "@/src/services/apiHelper";
import { postService, type Topic } from "@/src/services/post";

import styles from "./page.module.scss";
const MAX_TIEU_DE = 200;
const MAX_MO_TA = 400;
// Con so nay do phan NGUOI VIET GO VAO, khong phai phan duoc luu.
//
// Rong tay hon han gioi han 120.000 cua co so du lieu vi viec thuong lam nhat
// la dan ca doan HTML tu mot trang bao vao: doan tho keo theo script, khung
// quang cao va hang tram class, co the gap may lan bai that. May chu se cat
// het truoc khi luu. De maxLength dung bang gioi han luu tru thi cu dan la bi
// cat cut giua mot the, hong ca bai - te hon nhieu.
const MAX_NOI_DUNG = 400000;

function AdminPostEditor() {
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get("id");
  const laSua = Boolean(id);

  const [topics, setTopics] = useState<Topic[]>([]);
  const [dangNap, setDangNap] = useState(laSua);

  const [tieuDe, setTieuDe] = useState("");
  const [moTa, setMoTa] = useState("");
  const [noiDung, setNoiDung] = useState("");
  const [chuDe, setChuDe] = useState("others");
  const [tags, setTags] = useState("");
  const [anh, setAnh] = useState("");
  const [daDang, setDaDang] = useState(true);
  const [slug, setSlug] = useState("");

  const [dangLuu, setDangLuu] = useState(false);
  const [loi, setLoi] = useState("");
  const [thanhCong, setThanhCong] = useState("");

  useEffect(() => {
    postService
      .getTopics()
      .then(setTopics)
      .catch(() => setTopics([]));
  }, []);

  // Lay bai cu khi sua. Dung /admin/:id chu khong phai /:slug vi ham cong khai
  // co dinh loc isPublished: true - ban nhap se ra 404.
  useEffect(() => {
    if (!id) return;
    let huy = false;
    postService
      .getAdminPost(id)
      .then((p) => {
        if (huy) return;
        setTieuDe(p.title);
        setMoTa(p.excerpt);
        setNoiDung(p.content ?? "");
        setChuDe(p.topic);
        setTags(p.tags.join(", "));
        setAnh(p.thumbnail ?? "");
        setDaDang(p.isPublished !== false);
        setSlug(p.slug);
      })
      .catch((err) => {
        if (!huy) setLoi(getErrorMessage(err, "Không tải được bài viết."));
      })
      .finally(() => {
        if (!huy) setDangNap(false);
      });
    return () => {
      huy = true;
    };
  }, [id]);

  useEffect(() => {
    if (!thanhCong) return;
    const t = setTimeout(() => setThanhCong(""), 4000);
    return () => clearTimeout(t);
  }, [thanhCong]);

  // Muc luc o trang doc duoc dung tu chinh nhung dong nay. Hien ra day de
  // nguoi viet biet ngay dong nao da thanh de muc, thay vi dang xong moi phat
  // hien menu ben trai bai trong khong.
  const mucLuc = useMemo(
    () =>
      laHtml(noiDung)
        ? neoHoaTieuDe(noiDung).mucLuc
        : layMucLuc(phanTichNoiDung(noiDung)),
    [noiDung],
  );

  const luu = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoi("");
    setThanhCong("");

    if (!tieuDe.trim() || !moTa.trim() || !noiDung.trim()) {
      setLoi("Vui lòng nhập đầy đủ tiêu đề, mô tả ngắn và nội dung.");
      return;
    }

    const dl = {
      title: tieuDe.trim(),
      excerpt: moTa.trim(),
      content: noiDung.trim(),
      topic: chuDe,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
        .slice(0, 5),
      thumbnail: anh.trim(),
      isPublished: daDang,
    };

    setDangLuu(true);
    try {
      if (id) {
        const p = await postService.updatePost(id, dl);
        setSlug(p.slug);
        setThanhCong("Đã lưu thay đổi.");
      } else {
        const p = await postService.createPost(dl);
        setThanhCong(daDang ? "Đã đăng bài viết." : "Đã lưu bản nháp.");
        // Chuyen sang che do sua, neu khong bam luu lan nua se tao bai thu hai.
        router.replace(`/admin/post-create?id=${p._id}`);
      }
    } catch (err) {
      // Bai bi bo loc noi dung chan cung ve day - thong bao tu may chu noi ro
      // truong nao vi pham.
      setLoi(getErrorMessage(err, "Không lưu được bài viết."));
    } finally {
      setDangLuu(false);
    }
  };

  if (dangNap) {
    return (
      <div className={styles.card}>
        <Loader2 className={styles.spinner} size={32} />
        <p className={styles.text}>Đang mở bài viết...</p>
      </div>
    );
  }

  const oNhap = styles.input2;

  return (
    <form onSubmit={luu} className={styles.form}>
      {/* HEADER */}
      <div className={styles.row}>
        <div>
          <Link href="/admin/posts" className={styles.box}>
            <ArrowLeft size={15} />
            Về danh sách bài viết
          </Link>
          <h3 className={styles.subheading}>
            <PenLine className={styles.box2} size={26} />
            {laSua ? "Sửa bài viết" : "Viết bài mới"}
          </h3>
          <p className={styles.text2}>
            Bài đăng ở đây hiện trên trang Cẩm nang môn học (/blog) cho tất cả mọi người
            đọc.
          </p>
        </div>

        <div className={styles.row2}>
          {laSua && daDang && slug && (
            <Link href={`/blog/${slug}`} target="_blank" className={styles.box3}>
              <ExternalLink size={16} />
              Xem trang thật
            </Link>
          )}
          <button type="submit" disabled={dangLuu} className={styles.button}>
            {dangLuu ? (
              <Loader2 className={styles.spinner2} size={16} />
            ) : (
              <Save size={16} />
            )}
            {laSua ? "Lưu thay đổi" : daDang ? "Đăng bài" : "Lưu bản nháp"}
          </button>
        </div>
      </div>

      {thanhCong && (
        <div className={styles.card2}>
          <CheckCircle className={styles.box4} size={20} />
          <span className={styles.text}>{thanhCong}</span>
        </div>
      )}
      {loi && (
        <div className={styles.card3}>
          <AlertCircle className={styles.box5} size={20} />
          <span className={styles.text}>{loi}</span>
        </div>
      )}

      <div className={styles.grid}>
        {/* ============================ CỘT TRÁI ============================ */}
        <div className={styles.card4}>
          <div>
            <label htmlFor="tieu-de" className={styles.fieldLabel}>
              Tiêu đề <span className={styles.label}>*</span>
            </label>
            <input
              id="tieu-de"
              value={tieuDe}
              onChange={(e) => setTieuDe(e.target.value)}
              maxLength={MAX_TIEU_DE}
              placeholder="VD: React 19: Server Components, hooks mới và cách tối ưu app web"
              className={`${oNhap} ${styles.input}`}
            />
            <p className={styles.text3}>
              {tieuDe.length}/{MAX_TIEU_DE}
            </p>
          </div>

          <div>
            <label htmlFor="mo-ta" className={styles.fieldLabel}>
              Mô tả ngắn <span className={styles.label}>*</span>
            </label>
            <textarea
              id="mo-ta"
              value={moTa}
              onChange={(e) => setMoTa(e.target.value)}
              maxLength={MAX_MO_TA}
              rows={3}
              placeholder="Hai đến ba câu tóm tắt. Đoạn này hiện ở thẻ ngoài danh sách, nên đừng chép câu mở đầu của bài vào."
              className={`${oNhap} ${styles.textarea}`}
            />
            <p className={styles.text3}>
              {moTa.length}/{MAX_MO_TA}
            </p>
          </div>

          <div>
            <label htmlFor="noi-dung" className={styles.fieldLabel}>
              Nội dung bài <span className={styles.label}>*</span>
            </label>
            <TrinhSoanBai
              id="noi-dung"
              giaTri={noiDung}
              doiGiaTri={setNoiDung}
              toiDa={MAX_NOI_DUNG}
            />
            <p className={styles.text4}>
              <span>
                Gõ chữ thường vẫn chạy như cũ. Dán HTML vào thì máy chủ chỉ giữ lại thẻ
                bài viết — script và khung quảng cáo bị bỏ.
              </span>
              <span className={styles.label2}>
                {noiDung.length.toLocaleString("vi-VN")} ký tự
              </span>
            </p>
          </div>
        </div>

        {/* ============================ CỘT PHẢI ============================ */}
        <div className={styles.stack}>
          <div className={styles.card5}>
            <h4 className={styles.minorHeading}>Xuất bản</h4>

            <label htmlFor="trang-thai" className={styles.fieldLabel2}>
              Trạng thái
            </label>
            <select
              id="trang-thai"
              value={daDang ? "published" : "draft"}
              onChange={(e) => setDaDang(e.target.value === "published")}
              className={oNhap}
            >
              <option value="published">Đã đăng — mọi người đọc được</option>
              <option value="draft">Bản nháp — chỉ admin thấy</option>
            </select>

            {laSua && slug && (
              <p className={styles.text5}>
                Đường dẫn: <code className={styles.code}>/blog/{slug}</code>
                {daDang && (
                  <>
                    <br />
                    Bài đã đăng thì đổi tiêu đề không đổi đường dẫn, nên link đã chia sẻ
                    ra ngoài vẫn sống.
                  </>
                )}
              </p>
            )}
          </div>

          <div className={styles.card5}>
            <h4 className={styles.minorHeading}>Phân loại</h4>

            <label htmlFor="chu-de" className={styles.fieldLabel2}>
              Chủ đề
            </label>
            <select
              id="chu-de"
              value={chuDe}
              onChange={(e) => setChuDe(e.target.value)}
              className={oNhap}
            >
              {topics.length === 0 && <option value="others">Others</option>}
              {topics.map((t) => (
                <option key={t.slug} value={t.slug}>
                  {t.name}
                </option>
              ))}
            </select>

            <label htmlFor="tags" className={styles.fieldLabel3}>
              Tags <span className={styles.label3}>(cách nhau bằng dấu phẩy)</span>
            </label>
            <input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="React 19, hooks"
              className={oNhap}
            />
            <p className={styles.text6}>
              Tối đa 5 tag. Tag đầu tiên hiện trên thẻ ngoài danh sách.
            </p>
          </div>

          <div className={styles.card5}>
            <h4 className={styles.minorHeading}>Ảnh đại diện</h4>
            <input
              value={anh}
              onChange={(e) => setAnh(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              aria-label="Đường dẫn ảnh đại diện"
              className={oNhap}
            />
            <div className={styles.box6}>
              {anh.trim() ? (
                <SafeImage
                  src={anh.trim()}
                  alt="Xem trước ảnh đại diện"
                  fill
                  sizes="320px"
                  className={styles.box7}
                />
              ) : (
                <div className={styles.col}>
                  <ImageOff size={24} />
                  <span className={styles.label4}>Chưa có ảnh</span>
                </div>
              )}
            </div>
          </div>

          {/* Kiem tra muc luc */}
          <div className={styles.card5}>
            <h4 className={styles.minorHeading2}>
              <ListTree size={16} className={styles.box2} />
              Mục lục nhận ra được
              <span className={styles.label5}>{mucLuc.length}</span>
            </h4>
            <p className={styles.text7}>
              Đây đúng là menu bên trái mà người đọc sẽ thấy.
            </p>

            {mucLuc.length === 0 ? (
              <div className={styles.card6}>
                Chưa dòng nào thành đề mục. Bấm <b>Tiêu đề lớn</b> để bọc dòng đang chọn
                trong <code className={styles.code2}>&lt;h2&gt;</code>. Nếu gõ chữ thường
                thì mở đầu dòng bằng <code className={styles.code2}>Chương 1:</code>,{" "}
                <code className={styles.code2}>Mục 1.1</code> hoặc{" "}
                <code className={styles.code2}>## Tiêu đề</code>.
              </div>
            ) : (
              <ul className={styles.list}>
                {mucLuc.map((m, i) => (
                  <li
                    key={`${m.id}-${i}`}
                    className={styles.item}
                    style={{ paddingLeft: (m.level - 1) * 12 }}
                    title={m.text}
                  >
                    <span className={styles.label6}>
                      {m.level === 1 ? "●" : m.level === 2 ? "○" : "–"}
                    </span>
                    {m.text}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className={styles.card7}>
            <p className={styles.text8}>
              <Eye size={16} className={styles.box8} />
              Bài phải qua bộ lọc nội dung
            </p>
            <p className={styles.text9}>
              Cả tiêu đề, mô tả ngắn lẫn nội dung đều bị kiểm. Bài chửi thề, kỳ thị chủng
              tộc hoặc kích động sẽ bị máy chủ từ chối, kèm thông báo nói rõ trường nào vi
              phạm.
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}

// useSearchParams() phai nam trong Suspense thi Next moi prerender tinh duoc.
export default function AdminPostCreatePage() {
  return (
    <Suspense
      fallback={
        <div className={styles.row3}>
          <div className={styles.spinner3} />
        </div>
      }
    >
      <AdminPostEditor />
    </Suspense>
  );
}
