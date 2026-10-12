"use client";

import Link from "next/link";
import { clearSession } from "@/src/services/apiHelper";
import { ChevronDown, User, Settings, LogOut, BookOpen } from "lucide-react";
import Avatar from "@/src/components/ui/Avatar";
import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useStoredUser, useUserLoading } from "@/src/hooks/userStore";
import { loginUrl } from "@/src/components/features/portal/auth/loginUrl";
import NotificationBell from "@/src/components/layout/headers/NotificationBell";
import CartButton from "@/src/components/layout/headers/CartButton";

import styles from "./HeaderUserMenu.module.scss";
// Tach rieng khoi IndividualsHeader de moi header trang deu co menu tai khoan.
// Neu de nguyen trong IndividualsHeader thi cac trang dung header rieng se mat
// duong vao ho so, cai dat va nut dang xuat.

export default function HeaderUserMenu({
  hasCart = true,
}: {
  /** false: an nut gio hang - vd. khu tai lieu, noi khong ban gi. */
  hasCart?: boolean;
} = {}) {
  // Truoc day component nay tu doc localStorage.userInfo va tu nghe ba su
  // kien (storage / userInfoChanged / pageshow). Gio danh tinh nam trong kho
  // chung o RAM, <UserBootstrap /> lo viec nap va dong bo - xem
  // src/hooks/userStore.ts.
  const user = useStoredUser();
  const loading = useUserLoading();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Mo hop dang nhap NGAY TREN trang dang xem, giu nguyen moi tham so.
  //
  // Truoc day hai nut nay tro cung vao "/?auth=login". Khach dang doc mot khoa
  // hoc ma bam Dang nhap la bi nem ve trang chu, dang nhap xong dung o do va
  // phai tu tim lai khoa hoc luc nay. Hop dang nhap gio nam o layout cua ca
  // khu hoc vien nen ?auth co tac dung o moi trang - xem AuthModalGate.
  const path = usePathname();
  const params = useSearchParams();
  const loginHref = loginUrl(path, params, undefined, "login");
  const registerUrl = loginUrl(path, params, undefined, "register");

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const logout = async () => {
    // PHAI await: clearSession() cho may chu tra ve header xoa cookie. Dieu huong
    // ngay se huy request va cookie con nguyen - xem ghi chu o apiHelper.
    // Giao dien da chuyen sang trang thai dang xuat truoc do roi nen khong ai
    // thay do tre nay.
    await clearSession();
    window.location.href = "/";
  };

  // Chua biet minh la ai thi ve o trong dung kich thuoc.
  //
  // Bo buoc nay la nguoi DANG dang nhap cung thay nut "Dang nhap" loe len mot
  // cai roi bien mat, vi luot goi /users/profile chua ve kip. Giu nguyen cho de
  // header khong giat.
  //
  // 248px la be rong DO DUOC cua cum "Dang nhap" + "Dang ky mien phi" (75 + 20
  // khoang cach + 153). Truoc day o day ghi 120px - hut mat 128px so voi noi
  // dung that, nen cai o giu cho nay khong giu duoc gi: tai xong la ca dam ben
  // trai no nhay mot phat. Sai san tu ban tieng Anh (cum do da rong ~175px).
  // Doi chu tren hai nut thi phai do lai con so nay.
  if (loading) {
    return <div className={styles.box} aria-hidden="true" />;
  }

  if (!user) {
    return (
      // shrink-0 + whitespace-nowrap o ca hai nut: thieu chung thi tren man
      // hinh 390px flex bop hai nut lai cho vua, "Dang nhap" xuong thanh hai
      // dong chong len logo va "Dang ky mien phi" cao gap doi.
      //
      // Chu "mien phi" chi hien tu sm tro len. Tren dien thoai no la ba tu
      // nua trong mot thanh vua du cho hai nut - bo di thi ca hang vua van,
      // ma nguoi dung khong mat thong tin nao dang ke.
      <div className={styles.row}>
        {/* Khach cung xem duoc gio hang: ho them khoa vao gio roi moi dang nhap
            de thanh toan, khong phai nguoc lai. Gio nam o localStorage nen
            khong mat khi dang nhap. */}
        {hasCart && <CartButton />}

        <Link href={loginHref} className={styles.box2}>
          Đăng nhập
        </Link>
        <Link href={registerUrl} className={styles.box3}>
          Đăng ký<span className={styles.label}> miễn phí</span>
        </Link>
      </div>
    );
  }

  const src = user.avatar || user.picture || user.googlePicture;

  // Ten hien thi co duong lui.
  //
  // Co tai khoan trong CSDL khong co `name` (tao qua trang quan tri, hoac dang
  // nhap Google khong tra ve ten). Truoc day cho nay van ra khoang trong,
  // nhung dong chu vai tro ben duoi che lap di nen khong ai de y; bo dong do
  // voi hoc sinh la lo han ra mot o trong canh anh dai dien chu "?".
  //
  // Lay phan truoc @ cua email lam ten: do la thu nguoi dung nhan ra duoc, con
  // "Tài khoản" chi la buoc cuoi cho truong hop khong con gi de bam vao.
  const displayName = user.name?.trim() || user.email?.split("@")[0] || "Tài khoản";

  return (
    // Chuong nam NGOAI cai ref cua menu tai khoan. Gop chung mot ref thi cu
    // bam chuong se bi tinh la "bam ben trong menu" nen menu tai khoan dang mo
    // se khong dong - hai bang chong len nhau.
    <div className={styles.row2}>
      {hasCart && <CartButton />}
      <NotificationBell />

      <div className={styles.box4} ref={ref}>
        <button onClick={() => setOpen(!open)} className={styles.button}>
          <Avatar src={src} ten={displayName} size={40} letterBackground={styles.box8} />

          {/* Vai tro chi hien voi admin va giang vien, la hai nhom that su can
            biet minh dang o quyen nao. "student" thi nguoi dung da biet. */}
          <div className={styles.box5}>
            <span className={styles.label2}>{displayName}</span>
            <span className={styles.row3}>
              {user.role !== "student" && (
                <span className={styles.label3}>{user.role}</span>
              )}
            </span>
          </div>
          <ChevronDown size={16} />
        </button>

        {open && (
          <div className={styles.floating}>
            <div className={styles.box6}>
              <div className={styles.row4}>
                <Avatar
                  src={src}
                  ten={displayName}
                  size={48}
                  letterBackground={styles.box9}
                />
                <div className={styles.box7}>
                  <p className={styles.text}>{displayName}</p>
                  <p className={styles.text2}>{user.email}</p>
                </div>
              </div>
            </div>

            {/* Dat TREN Profile: day la thu hoc vien mo nhieu nhat, con ho so
                thi ca thang moi vao mot lan. Truoc day danh sach khoa dang hoc
                chi nam trong trang Cai dat - nguoi dung phai vao Settings de
                tim khoa cua minh, va gan nhu khong ai nghi ra viec do. */}
            <Link
              href="/user/my-courses"
              onClick={() => setOpen(false)}
              className={styles.row5}
            >
              <BookOpen size={18} /> <span>Khóa học của tôi</span>
            </Link>

            <Link
              href="/user/profile"
              onClick={() => setOpen(false)}
              className={styles.row5}
            >
              <User size={18} /> <span>Profile</span>
            </Link>

            <Link
              href="/user/settings"
              onClick={() => setOpen(false)}
              className={styles.row5}
            >
              <Settings size={18} /> <span>Settings</span>
            </Link>

            {user.role === "admin" && (
              <Link
                href="/admin/dashboard"
                onClick={() => setOpen(false)}
                className={styles.row5}
              >
                <User size={18} /> <span>Admin Dashboard</span>
              </Link>
            )}

            {user.role === "instructor" && (
              <Link
                href="/instructor/courses"
                onClick={() => setOpen(false)}
                className={styles.row5}
              >
                <User size={18} /> <span>Instructor Dashboard</span>
              </Link>
            )}

            <button onClick={logout} className={styles.button2}>
              <LogOut size={18} /> <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
