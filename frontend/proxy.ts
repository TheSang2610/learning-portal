import { NextResponse, type NextRequest } from "next/server";

// Trang chu hai che do, CUNG mot dia chi "/":
//
//   - Khach (chua dang nhap)  -> app/(portal)/page.tsx       (landing: banner, bang
//                                                              hoc phi, danh gia...)
//   - Da dang nhap            -> app/(portal)/home/page.tsx  (dashboard: hoc tiep,
//                                                              khoa cua toi, goi y)
//
// Lam o day chu khong o page.tsx: doc cookie trong page.tsx la ca trang chu
// thanh render dong, mat bo dem 60 giay. O day thi CA HAI trang van la trang
// dem san (ISR), proxy chi chon dua trang nao - va khong co canh "loe" trang
// kia mot cai roi moi doi nhu khi chon o trinh duyet.
//
// Chi kiem cookie CO hay KHONG, khong kiem chu ky: proxy chay o moi luot vao
// "/" nen khong duoc goi mang. Cookie het han / bi thu hoi thi dashboard tu
// hoi lai may chu va dua ve landing - xem HomeModeSync.
//
// Ten cookie trung COOKIE_NAME o backend/src/utils/cookieToken.js. Cookie nay
// chi thay duoc o day khi trinh duyet goi API qua rewrite /api cung mien (mac
// dinh). Bat NEXT_PUBLIC_GOI_THANG_BACKEND=1 thi cookie thuoc mien backend,
// proxy luon thay "khach" - landing van dung nho <GuestOnly> an phan ban hang.
const SESSION_COOKIE = "token";
const DASHBOARD_PATH = "/home";

export function proxy(req: NextRequest) {
  const loggedIn = req.cookies.has(SESSION_COOKIE);
  const { pathname } = req.nextUrl;

  // /home khong phai dia chi de go tay: dua ve "/" de moi nguoi chi co MOT dia
  // chi trang chu (dau trang, chia se link, SEO deu dung).
  if (pathname === DASHBOARD_PATH) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (pathname === "/" && loggedIn) {
    return NextResponse.rewrite(new URL(DASHBOARD_PATH, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/home"],
};
