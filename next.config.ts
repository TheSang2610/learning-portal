import type { NextConfig } from "next";
import { REMOTE_IMAGE_HOSTS } from "./image-hosts";
import { GOC_API } from "./src/services/diaChiApi";

const nextConfig: NextConfig = {
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
  // NEXT_PUBLIC_GOI_THANG_BACKEND=1 (xem services/diaChiApi.ts) va chap nhan
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
    ];
  },
};

export default nextConfig;
