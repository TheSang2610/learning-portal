// Danh sach host anh duoc next/image toi uu.
//
// Dat o day vi CA HAI noi deu can dung chung mot danh sach:
//   - next.config.ts  -> dung de sinh images.remotePatterns
//   - SafeImage.tsx   -> dung de biet khi nao phai bo qua toi uu
// De hai noi tu khai bao rieng thi som muon cung lech nhau.
//
// Them host moi thi chi sua o day.
export const REMOTE_IMAGE_HOSTS = [
  "res.cloudinary.com", // anh nguoi dung tai len
  "picsum.photos", // anh mau cua du lieu khoi tao (courses, banners)
  "i.pravatar.cc", // anh dai dien mau
  "randomuser.me", // anh dai dien mau
  "placehold.co", // anh thay the khi thieu anh
  "images.unsplash.com",
  "www.svgrepo.com",
  "lh3.googleusercontent.com", // anh dai dien tai khoan Google
  "img.vietqr.io", // ma QR chuyen khoan, sinh theo tung don hang
] as const;

// Anh nay co the giao cho next/image toi uu khong?
//
// Tra ve false la SafeImage se bo qua toi uu - anh van hien, khong nem loi.
// Nen o day chi tra ve true khi CHAC CHAN next/image chap nhan duoc:
//   - duong dan noi bo bat dau bang mot dau "/"
//   - hoac URL https co host nam trong danh sach tren
// Luu y http:// khong tinh, vi remotePatterns o next.config.ts ghim protocol https.
export function isOptimizableImageHost(src: string): boolean {
  if (!src) return false;

  if (src.startsWith("/")) return !src.startsWith("//");

  try {
    const { hostname, protocol } = new URL(src);
    if (protocol !== "https:") return false; // loai http:, blob:, data:
    return (REMOTE_IMAGE_HOSTS as readonly string[]).includes(hostname);
  } catch {
    return false; // chuoi khong phai URL -> de trinh duyet tu xu ly
  }
}
