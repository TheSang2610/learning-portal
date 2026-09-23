import path from "node:path";

import type { NextConfig } from "next";
import { REMOTE_IMAGE_HOSTS } from "./image-hosts";
import { GOC_API } from "./src/services/apiBase";

const nextConfig: NextConfig = {
  // Tach thu muc dau ra cua `next dev` khoi `next build`.
  //
  // VI SAO: mac dinh ca hai cung ghi vao .next. Khi may chu dev dang mo (rat
  // hay gap: mo suot ngay trong terminal cua VS Code) ma chay `npm run build`,
  // hai ben giam chan nhau tren cung mot dong file. Hau qua khong deu - lan
  // duoc lan khong - va khi do thi bao:
  //
  //     Module not found: Can't resolve '@vercel/turbopack-next/internal/font/google/font'
  //     next/font/google queries have exactly one entry
  //
  // Doc loi thi tuong hong phan nap font, nhung font khong he sai: xoa .next
  // roi build lai la xanh ngay. Da mat thoi gian dao vao layout.tsx va
  // next/font vi cai loi nay chi mat tam huong.
  //
  // NODE_ENV do chinh Next dat truoc khi doc file cau hinh: "development" cho
  // `next dev`, "production" cho `next build` va `next start` - nen build va
  // start van dung chung .next nhu cu, khong anh huong Vercel.
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",

  // Cho phep moi file .module.scss viet `@use "styles/breakpoints"` thay vi dem
  // nguoc bao nhieu cap "../".
  //
  // VI SAO CAN: cac trang nam sau tu 2 den 4 cap thu muc, lai con di qua nhom
  // duong dan nhu (portal) - dem tay la sai, va sai thi bao loi luc build chu
  // khong phai luc go. Mot goc chung thi moi file viet giong nhau, chuyen thu
  // muc cung khong phai sua lai dong @use.
  //
  // Chi dat `loadPaths`. Khoa `includePaths` (ten cu cua Sass) tung duoc dat
  // kem o day nhung Turbopack khong doc no - de lai chi khien nguoi sau tuong
  // hai khoa deu co tac dung va sua nham cho khi duong dan hong.
  sassOptions: {
    loadPaths: [path.join(process.cwd(), "app")],
  },

  // Danh sach host nam trong image-hosts.ts, dung chung voi SafeImage.
  // Anh tu host ngoai danh sach khong lam sap trang nua - xem SafeImage.tsx.
  images: {
    remotePatterns: REMOTE_IMAGE_HOSTS.map((hostname) => ({
      protocol: "https" as const,
      hostname,
    })),
  },

  skipTrailingSlashRedirect: true,
  skipProxyUrlNormalize: true,

  // Chuyen tiep moi loi goi API cua trinh duyet sang backend.
  //
  // MUC DICH LA COOKIE, khong phai tien loi. Token dang nhap nam trong cookie
  // httpOnly. Neu trinh duyet goi thang sang mien cua backend trong khi trang
  // dang o mien cua frontend thi cookie do la cookie BEN THU BA: Safari chan
  // san, Chrome dang bo dan, va dang nhap se hong ma khong bao gi. Di qua day
  // thi trinh duyet chi thay MOT mien, cookie la ben thu nhat, chay o dau cung
  // duoc.
  //
  // Dung "afterFiles" chu khong phai "beforeFiles": afterFiles chay SAU cac
  // route that cua Next, nen app/api/auth/google/* van thang. Doi lai, mot
  // route Next moi dat trung duong voi backend se AM THAM che mat backend -
  // hien khong co cho nao trung (backend khong mount gi o /api/auth).
  //
  // LUU Y KHI DEPLOY: file tai len cung di qua day. Anh dai dien 5MB va tai
  // lieu 20MB thi khong sao, nhung video bai hoc cho toi 100MB co the vuot han
  // muc kich thuoc than request cua nen tang. Gap thi dat
  // NEXT_PUBLIC_GOI_THANG_BACKEND=1 (xem services/apiBase.ts) va chap nhan
  // rang luc do cookie tro lai la ben thu ba.
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [{ source: "/api/:path*", destination: `${GOC_API}/api/:path*` }],
      fallback: [],
    };
  },

  // Cac path "cha" chi co layout, khong co page rieng -> redirect thay vi 404.
  // Lam o tang config nen la redirect HTTP that (khong can doi JS, khong nhay man hinh).
  async redirects() {
    return [
      { source: "/admin", destination: "/admin/dashboard", permanent: false },
      { source: "/user", destination: "/user/profile", permanent: false },

      // Ba duong dan doi tu tieng Viet sang tieng Anh. Giu chuyen huong vi
      // nhan su quan tri va giang vien da luu dau trang theo duong cu - bo han
      // thi ho gap 404 ma khong hieu vi sao. permanent: false de con go duoc
      // sau nay; permanent: true bi trinh duyet nho vinh vien, go ra van con.
      //
      // VE `source` PHAI LA TEN CU. Da tung hong dung cho nay: bo doi ten hang
      // loat quet ca file config va thay luon chuoi o ve source, thanh ra
      // source trung y het destination. Next van nhan luat do, nen
      // /admin/vouchers tra 307 ve chinh no - vong lap vo tan, trinh duyet bao
      // ERR_TOO_MANY_REDIRECTS va ba trang chet hoan toan. Build van xanh,
      // typecheck van xanh, khong co gi bao ra.
      { source: "/admin/ma-giam-gia", destination: "/admin/vouchers", permanent: false },
      {
        source: "/admin/thong-bao",
        destination: "/admin/notifications",
        permanent: false,
      },
      {
        source: "/instructor/hoi-dap",
        destination: "/instructor/questions",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
