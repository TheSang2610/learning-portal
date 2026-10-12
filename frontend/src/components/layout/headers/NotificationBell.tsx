"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

import styles from "./NotificationBell.module.scss";
import {
  Award,
  Bell,
  BookOpen,
  CheckCheck,
  CircleCheck,
  CircleX,
  Coins,
  Info,
  Megaphone,
  MessageCircle,
} from "lucide-react";

import { getAnnouncements, type Announcement } from "@/src/services/announcement";

import {
  markAsRead,
  markAllAsRead,
  countUnread,
  getNotifications,
  type NotificationType,
  type Notification,
} from "@/src/services/notification";
import { gap } from "@/src/lib/time";

// Bieu tuong va mau theo tung loai.
//
// Mau o day la mau NGU NGHIA (tot / hong / trung tinh), khong phai mau nhan
// dien cua trang. Don bi tu choi phai do du nguoi dung co doc chu hay khong.
const KIEU: Record<NotificationType, { Icon: typeof Bell; mau: string }> = {
  don_duoc_duyet: { Icon: CircleCheck, mau: styles.approvedColor },
  don_bi_tu_choi: { Icon: CircleX, mau: styles.rejectColor },
  khoa_duoc_mo: { Icon: BookOpen, mau: styles.unlockColor },
  chung_nhan: { Icon: Award, mau: styles.certificateColor },
  tra_loi_hoi_dap: { Icon: MessageCircle, mau: styles.replyColor },
  // Thong bao cu tu thoi co vi coin - van con trong hop thu cua mot so nguoi.
  coin_duoc_cong: { Icon: Coins, mau: styles.coinColor },
  he_thong: { Icon: Info, mau: styles.systemColor },
};

// Nhip do lai so chua doc khi tab dang mo.
//
// 60 giay chu khong ngan hon: thong bao o day khong phai tin nhan tuc thi, va
// moi luot goi la mot luot cham CSDL nhan voi so nguoi dang mo trang. Bo dem
// GET trong apiHelper song 30 giay nen cung khong the ban hon muc nay.
const POLL_INTERVAL_MS = 60_000;

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [list, setList] = useState<Notification[]>([]);
  // Thong bao chung (dai dau trang) cung ghim o day, de nguoi da dong dai tren
  // trang hoac quan tri - von khong nhan thong bao chuong - van xem lai duoc.
  const [common, setCommon] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const boc = useRef<HTMLDivElement>(null);

  const refreshUnreadCount = useCallback(async () => {
    try {
      const outcome = await countUnread();
      setUnread(outcome.chuaDoc);
    } catch {
      // Im lang. Dem hong thi cung lam cai cham do khong hien - khong dang de
      // nem mot thong bao loi che len man hinh vi mot con so phu.
    }
  }, []);

  useEffect(() => {
    // Lan do dau tien day sang microtask thay vi goi thang trong than effect.
    //
    // Goi thang la mot vong ve lai noi tiep ngay sau lan ve dau (react-hooks/
    // set-state-in-effect chan dung cho nay). Day sang microtask thi lan ve dau
    // hoan tat truoc, roi con so moi toi - nguoi dung khong thay khac gi vi day
    // la mot luot goi mang, luon cham hon mot khung hinh.
    queueMicrotask(refreshUnreadCount);

    const interval = setInterval(() => {
      // Tab bi an thi khong do: nguoi dung khong nhin thay cai cham do, ma may
      // chu van phai tra loi. Trinh duyet cung tu bop nhip setInterval o tab
      // nen, nhung khong bo han - phai tu chan.
      if (!document.hidden) refreshUnreadCount();
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [refreshUnreadCount]);

  useEffect(() => {
    const clickOutside = (e: MouseEvent) => {
      if (boc.current && !boc.current.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", clickOutside);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", clickOutside);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  // Chi tai danh sach KHI MO, khong tai san luc dung trang.
  //
  // Phan lon nguoi dung khong bam chuong trong mot luot xem. Tai san la moi
  // trang deu keo ve hai chuc ban ghi khong ai doc.
  const openPanel = async () => {
    const opening = !open;
    setOpen(opening);
    if (!opening) return;

    setLoading(true);
    setErr("");

    // Thong bao chung tai rieng va khong duoc lam hong ca bang: loi thi coi
    // nhu khong co, danh sach ca nhan van hien.
    getAnnouncements()
      .then((outcome) => setCommon(outcome?.danhSach ?? []))
      .catch(() => setCommon([]));

    try {
      const outcome = await getNotifications(1);
      setList(outcome.danhSach);
      setUnread(outcome.chuaDoc);
    } catch {
      setErr("Không tải được thông báo. Thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  // Danh dau da doc NGAY tren giao dien roi moi goi may chu.
  //
  // Nguoi dung bam vao thong bao la dieu huong di luon; cho may chu tra loi
  // xong moi doi mau thi ho da roi khoi trang truoc khi thay gi. Hong thi cung
  // khong sao: lan sau mo lai no van con dau chua doc, dung trang thai that.
  const markReadStyle = (tb: Notification) => {
    if (tb.daDoc) return;

    setList((old) => old.map((m) => (m._id === tb._id ? { ...m, daDoc: true } : m)));
    setUnread((n) => Math.max(0, n - 1));

    markAsRead(tb._id).catch(() => {});
  };

  const markAllRead = async () => {
    setList((old) => old.map((m) => ({ ...m, daDoc: true })));
    setUnread(0);

    try {
      await markAllAsRead();
    } catch {
      // Hong thi do lai tu may chu de con so tren man hinh khong noi sai.
      refreshUnreadCount();
    }
  };

  // Dot nao vua hien dau trang vua gui vao chuong thi da co trong danh sach ca
  // nhan (tro ve qua thongBaoGoc) - bo ban ghim di cho khong hien hai lan.
  const alreadyInBell = new Set(list.map((tb) => tb.thongBaoGoc).filter(Boolean));
  const scope = common.filter((tb) => !alreadyInBell.has(tb._id));

  return (
    <div className={styles.box} ref={boc}>
      <button
        type="button"
        onClick={openPanel}
        aria-label={unread > 0 ? `Thông báo, ${unread} chưa đọc` : "Thông báo"}
        aria-expanded={open}
        // h-11 w-11: nguong cham toi thieu 44px. Cai chuong nho hon thi tren
        // dien thoai bam truot sang avatar ben canh.
        className={styles.button}
      >
        <Bell size={20} />

        {unread > 0 && (
          <span className={styles.floating}>{unread > 99 ? "99+" : unread}</span>
        )}
      </button>

      {open && (
        // w-[min(...)]: tren man hinh 390px mot bang rong co dinh 22rem se troi
        // ra ngoai le phai. Lay be nao nho hon.
        <div className={styles.floating2}>
          <div className={styles.row}>
            <p className={styles.text}>Thông báo</p>

            {unread > 0 && (
              <button type="button" onClick={markAllRead} className={styles.button2}>
                <CheckCheck size={14} /> Đọc hết
              </button>
            )}
          </div>

          {/* max-h + overflow: danh sach 20 muc se dai hon man hinh dien thoai.
              Cuon trong chinh cai bang chu khong day ca trang di. */}
          <div className={styles.scroller}>
            {loading && <p className={styles.text2}>Đang tải…</p>}

            {!loading && err && <p className={styles.text3}>{err}</p>}

            {!loading &&
              scope.map((tb) => {
                const ben = (
                  <>
                    <Megaphone
                      size={18}
                      className={`${styles.box5} ${
                        tb.mucDo === "quan_trong"
                          ? styles.rejectColor
                          : styles.systemColor
                      }`}
                    />
                    <div className={styles.box4}>
                      <p className={`${styles.text8} ${styles.text}`}>{tb.tieuDe}</p>
                      {tb.noiDung && <p className={styles.text6}>{tb.noiDung}</p>}
                      <p className={styles.text7}>
                        Thông báo chung · {gap(tb.createdAt)}
                      </p>
                    </div>
                  </>
                );
                return tb.duongDan ? (
                  <Link
                    key={`chung-${tb._id}`}
                    href={tb.duongDan}
                    onClick={() => setOpen(false)}
                    className={styles.rows}
                  >
                    {ben}
                  </Link>
                ) : (
                  <div key={`chung-${tb._id}`} className={styles.rows}>
                    {ben}
                  </div>
                );
              })}

            {!loading && !err && list.length === 0 && scope.length === 0 && (
              <div className={styles.box2}>
                <Bell size={28} className={styles.box3} />
                <p className={styles.text4}>Chưa có thông báo nào.</p>
              </div>
            )}

            {!loading &&
              !err &&
              list.map((tb) => {
                const { Icon, mau } = KIEU[tb.loai] ?? KIEU.he_thong;

                const ben = (
                  <>
                    <Icon size={18} className={`${styles.box5} ${mau}`} />
                    <div className={styles.box4}>
                      <p
                        className={`${styles.text8} ${
                          tb.daDoc ? styles.text5 : styles.text
                        }`}
                      >
                        {tb.tieuDe}
                      </p>
                      {tb.noiDung && <p className={styles.text6}>{tb.noiDung}</p>}
                      <p className={styles.text7}>{gap(tb.createdAt)}</p>
                    </div>
                    {!tb.daDoc && <span className={styles.label} />}
                  </>
                );

                const className = `${styles.rows} ${tb.daDoc ? "" : styles.chuaDoc}`;

                // Co duong dan thi la mot lien ket that (mo tab moi duoc, bam
                // giua duoc). Khong co thi dung <button> — mot the <a> khong co
                // href khong bam duoc bang ban phim.
                return tb.duongDan ? (
                  <Link
                    key={tb._id}
                    href={tb.duongDan}
                    onClick={() => {
                      markReadStyle(tb);
                      setOpen(false);
                    }}
                    className={className}
                  >
                    {ben}
                  </Link>
                ) : (
                  <button
                    key={tb._id}
                    type="button"
                    onClick={() => markReadStyle(tb)}
                    className={className}
                  >
                    {ben}
                  </button>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
