"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Eye,
  FileText,
  ImageOff,
  Loader2,
  Newspaper,
  PenLine,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import SafeImage from "@/src/components/ui/SafeImage";
import { getErrorMessage } from "@/src/services/apiHelper";
import { postService, type BlogPost, type Topic } from "@/src/services/post";

import styles from "./page.module.scss";
type TrangThai = "" | "published" | "draft";

const MOI_TRANG = 20;

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [tong, setTong] = useState(0);
  const [trang, setTrang] = useState(1);
  const [tongTrang, setTongTrang] = useState(1);
  const [topics, setTopics] = useState<Topic[]>([]);

  const [dangTai, setDangTai] = useState(true);
  const [loi, setLoi] = useState("");

  const [trangThai, setTrangThai] = useState<TrangThai>("");
  const [chuDe, setChuDe] = useState("");
  const [tuKhoa, setTuKhoa] = useState("");
  const [tuKhoaDangDung, setTuKhoaDangDung] = useState("");

  const tai = async (p: number, tt: TrangThai, cd: string, q: string) => {
    setDangTai(true);
    setLoi("");
    try {
      const res = await postService.getAdminPosts({
        page: p,
        limit: MOI_TRANG,
        status: tt || undefined,
        topic: cd || undefined,
        q,
      });
      setPosts(res.posts);
      setTong(res.total);
      setTrang(res.page);
      setTongTrang(res.totalPages);
    } catch (err) {
      setLoi(getErrorMessage(err, "Không tải được danh sách bài viết."));
    } finally {
      setDangTai(false);
    }
  };

  // Lan tai dau tien. Khong goi tai() o day vi ham do dat setDangTai(true)
  // ngay lap tuc - dat state thang trong than effect gay them mot vong ve lai.
  // dangTai da la true san tu dau nen chi can dat lai state trong callback.
  useEffect(() => {
    let huy = false;

    postService
      .getTopics()
      .then((t) => {
        if (!huy) setTopics(t);
      })
      .catch(() => {
        if (!huy) setTopics([]);
      });

    postService
      .getAdminPosts({ page: 1, limit: MOI_TRANG })
      .then((res) => {
        if (huy) return;
        setPosts(res.posts);
        setTong(res.total);
        setTrang(res.page);
        setTongTrang(res.totalPages);
      })
      .catch((err) => {
        if (!huy) setLoi(getErrorMessage(err, "Không tải được danh sách bài viết."));
      })
      .finally(() => {
        if (!huy) setDangTai(false);
      });

    return () => {
      huy = true;
    };
  }, []);

  // Doi bo loc thi luon ve trang 1: giu nguyen trang 3 khi bo loc chi con mot
  // trang se ra danh sach rong ma khong ro tai sao.
  const doiTrangThai = (v: TrangThai) => {
    setTrangThai(v);
    tai(1, v, chuDe, tuKhoaDangDung);
  };

  const doiChuDe = (v: string) => {
    setChuDe(v);
    tai(1, trangThai, v, tuKhoaDangDung);
  };

  const timKiem = (e: React.FormEvent) => {
    e.preventDefault();
    setTuKhoaDangDung(tuKhoa);
    tai(1, trangThai, chuDe, tuKhoa);
  };

  const xoa = async (p: BlogPost) => {
    if (!window.confirm(`Xóa bài "${p.title}"? Thao tác này không hoàn tác được.`))
      return;
    try {
      await postService.deletePost(p._id);
      // Xoa bai cuoi cung cua trang -> lui ve trang truoc, khong de trang rong.
      const conLai = posts.length - 1;
      tai(
        conLai === 0 && trang > 1 ? trang - 1 : trang,
        trangThai,
        chuDe,
        tuKhoaDangDung,
      );
    } catch (err) {
      alert(getErrorMessage(err, "Xóa thất bại."));
    }
  };

  const tenChuDe = (slug: string) => topics.find((t) => t.slug === slug)?.name ?? slug;

  const oLoc = styles.card8;

  return (
    <div className={styles.stack}>
      {/* HEADER */}
      <div className={styles.row}>
        <div>
          <h3 className={styles.subheading}>
            <Newspaper className={styles.box} size={26} />
            Cẩm nang môn học
          </h3>
          <p className={styles.text}>
            Bài viết do Admin biên tập, hiện ở trang <code>/blog</code>. Tài liệu học viên
            tự đăng nằm ở mục khác.
          </p>
        </div>
        <Link href="/admin/post-create" className={styles.card}>
          <Plus size={18} />
          Viết bài mới
        </Link>
      </div>

      {/* BỘ LỌC */}
      <div className={styles.card2}>
        <form onSubmit={timKiem} className={styles.form}>
          <div className={styles.box2}>
            <Search size={16} className={styles.floating} />
            <input
              value={tuKhoa}
              onChange={(e) => setTuKhoa(e.target.value)}
              placeholder="Tìm theo tiêu đề"
              aria-label="Tìm bài viết"
              className={`${oLoc} ${styles.input}`}
            />
          </div>
          <button type="submit" className={styles.button}>
            Tìm
          </button>
        </form>

        <select
          value={trangThai}
          onChange={(e) => doiTrangThai(e.target.value as TrangThai)}
          aria-label="Lọc theo trạng thái"
          className={oLoc}
        >
          <option value="">Mọi trạng thái</option>
          <option value="published">Đã đăng</option>
          <option value="draft">Bản nháp</option>
        </select>

        <select
          value={chuDe}
          onChange={(e) => doiChuDe(e.target.value)}
          aria-label="Lọc theo chủ đề"
          className={oLoc}
        >
          <option value="">Mọi chủ đề</option>
          {topics.map((t) => (
            <option key={t.slug} value={t.slug}>
              {t.name}
            </option>
          ))}
        </select>

        <span className={styles.label}>
          {tong} bài{tuKhoaDangDung && ` khớp "${tuKhoaDangDung}"`}
        </span>
      </div>

      {/* DANH SÁCH */}
      {dangTai ? (
        <div className={styles.card3}>
          <Loader2 className={styles.spinner} size={32} />
          <p className={styles.text2}>Đang tải bài viết...</p>
        </div>
      ) : loi ? (
        <div className={styles.card4}>
          <AlertCircle size={32} />
          <p className={styles.text3}>Đã xảy ra lỗi dữ liệu</p>
          <p className={styles.text4}>{loi}</p>
        </div>
      ) : posts.length === 0 ? (
        <div className={styles.card5}>
          <FileText className={styles.box3} size={48} />
          <p className={styles.text5}>
            {tuKhoaDangDung || trangThai || chuDe
              ? "Không có bài nào khớp bộ lọc"
              : "Chưa có bài viết nào"}
          </p>
          <p className={styles.text6}>
            Bấm &quot;Viết bài mới&quot; ở góc trên để bắt đầu.
          </p>
        </div>
      ) : (
        <div className={styles.stack2}>
          {posts.map((p) => (
            <div key={p._id} className={styles.card6}>
              <div className={styles.box4}>
                {p.thumbnail ? (
                  <SafeImage
                    src={p.thumbnail}
                    alt=""
                    fill
                    sizes="120px"
                    className={styles.box5}
                  />
                ) : (
                  <div className={styles.row2}>
                    <ImageOff size={20} />
                  </div>
                )}
              </div>

              <div className={styles.box6}>
                <div className={styles.row3}>
                  <span
                    className={`${styles.label7} ${
                      p.isPublished === false ? styles.label2 : styles.label3
                    }`}
                  >
                    {p.isPublished === false ? "Bản nháp" : "Đã đăng"}
                  </span>
                  <span className={styles.label4}>{tenChuDe(p.topic)}</span>
                </div>

                <h4 className={styles.minorHeading}>{p.title}</h4>
                <p className={styles.text7}>{p.excerpt}</p>

                <div className={styles.row4}>
                  <span>{p.author?.name || "Ẩn danh"}</span>
                  <span>
                    {new Date(p.createdAt).toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </span>
                  <span className={styles.label5}>
                    <Eye size={13} />
                    {p.views} lượt xem
                  </span>
                </div>
              </div>

              <div className={styles.row5}>
                {p.isPublished !== false && (
                  <Link
                    href={`/blog/${p.slug}`}
                    target="_blank"
                    title="Xem trang thật"
                    className={styles.box7}
                  >
                    <Eye size={18} />
                  </Link>
                )}
                <Link
                  href={`/admin/post-create?id=${p._id}`}
                  title="Sửa bài viết"
                  className={styles.box8}
                >
                  <PenLine size={18} />
                </Link>
                <button
                  type="button"
                  onClick={() => xoa(p)}
                  title="Xóa bài viết"
                  className={styles.button2}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tongTrang > 1 && (
        <div className={styles.row6}>
          <button
            type="button"
            disabled={trang <= 1 || dangTai}
            onClick={() => tai(trang - 1, trangThai, chuDe, tuKhoaDangDung)}
            className={styles.card7}
          >
            Trước
          </button>
          <span className={styles.label6}>
            Trang {trang}/{tongTrang}
          </span>
          <button
            type="button"
            disabled={trang >= tongTrang || dangTai}
            onClick={() => tai(trang + 1, trangThai, chuDe, tuKhoaDangDung)}
            className={styles.card7}
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
}
