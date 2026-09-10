import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { TEN_COOKIE_STATE, tuyChonCookieState } from "../state";

export const dynamic = "force-dynamic";

// So sanh hai chuoi trong thoi gian khong phu thuoc vao noi chung bat dau khac
// nhau. O day gia tri dung nam trong cookie httpOnly cua chinh nguoi dung nen
// khong co oracle nao de do, nhung mot ham so sanh bi mat viet dung thi khong
// bao gio thua - va nguoi doc sau khong phai dung lai tu hoi vi sao cho nay
// dung ===.
const bangNhau = (a: string, b: string) => {
  if (a.length !== b.length) return false;
  let khac = 0;
  for (let i = 0; i < a.length; i += 1) khac |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return khac === 0;
};

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (!code) {
    return NextResponse.json({ error: "Missing authorization code" }, { status: 400 });
  }

  // Doi chieu `state` TRUOC khi doi ma.
  //
  // LO HONG DA VA - CSRF dang nhap: truoc day duong nay doi bat ky `code` nao
  // duoc dua vao dia chi. Ke tan cong bam dang nhap Google bang tai khoan cua
  // ho, giu lai `code` chua dung, roi du nan nhan mo dia chi callback mang ma
  // do. Nan nhan bi dang nhap vao tai khoan CUA KE TAN CONG ma khong biet, va
  // moi thu ho lam sau do - ghi danh, tai tai lieu, dien thong tin ca nhan -
  // deu roi vao tai khoan ke kia doc duoc.
  //
  // Ban ngau nhien nam trong cookie httpOnly do chinh may chu nay dat luc bat
  // dau luong (xem ../route.ts). `code` cua ke tan cong khong bao gio di kem
  // cookie cua nan nhan, nen buoc nay chan dung kieu tan cong do.
  const kho = await cookies();
  const stateLuu = kho.get(TEN_COOKIE_STATE)?.value;

  if (!state || !stateLuu || !bangNhau(state, stateLuu)) {
    return NextResponse.json(
      { error: "Phiên đăng nhập Google không hợp lệ hoặc đã hết hạn. Vui lòng thử lại." },
      { status: 400 },
    );
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  // 🌟 SỬA ĐỔI 1: Ưu tiên lấy GOOGLE_REDIRECT_URI từ file .env
  // Nếu deploy lên Vercel không điền biến này, nó sẽ tự động lấy domain hiện tại của Vercel làm phương án dự phòng (fallback)
  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI ||
    `${process.env.GOOGLE_ORIGIN || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")}/auth/callback`;

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: "Missing Google OAuth credentials" },
      { status: 500 },
    );
  }

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  const tokenData = await tokenResponse.json();

  // State la dung mot lan. Xoa ngay sau khi da doi chieu, du buoc doi ma co
  // thanh cong hay khong: de lai thi mot `code` khac van con cho de dung ban
  // state do lan nua, tuc la buoc kiem tren chi con la hinh thuc.
  const xoaState = (res: NextResponse) => {
    res.cookies.set(TEN_COOKIE_STATE, "", { ...tuyChonCookieState(), maxAge: 0 });
    return res;
  };

  if (!tokenResponse.ok) {
    // KHONG tra `tokenData` ve trinh duyet. Phan hoi loi cua Google co the kem
    // ca client_id va manh moi ve cau hinh phia may chu - nhung thu chi nguoi
    // van hanh can biet, con nguoi dung thi khong lam gi duoc voi chung.
    console.error("Google token exchange failed:", tokenData);
    return xoaState(
      NextResponse.json({ error: "Token exchange failed" }, { status: 500 }),
    );
  }

  // id_token la mot khang dinh CO CHU KY cua Google ve danh tinh nguoi dung.
  // Day la thu duy nhat can chuyen tiep: backend tu kiem chu ky va tu doc
  // email tu do.
  if (!tokenData.id_token) {
    return xoaState(
      NextResponse.json({ error: "Google khong tra ve id_token" }, { status: 500 }),
    );
  }

  // KHONG goi backend tu day.
  //
  // Truoc day buoc doi ma chay o may chu Next, roi may chu Next goi tiep sang
  // backend. Hai van de:
  //
  //   1. Backend dat cookie dang nhap trong phan hoi, nhung phan hoi do ve
  //      may chu Next chu khong ve trinh duyet - nen trinh duyet khong bao gio
  //      nhan duoc cookie.
  //   2. De may chu Next goi thay, backend phai chap nhan mot than request
  //      kieu {googleId, email} khong kem chung cu gi. Nhanh do la mot cua hau:
  //      ai cung POST duoc {"email":"admin@gmail.com"} de lay token admin.
  //      Nhanh do da bi xoa khoi backend.
  //
  // Nay chi tra id_token ve trinh duyet, trinh duyet tu goi backend. Backend
  // kiem chu ky Google roi dat cookie thang cho trinh duyet - dung mot duong
  // voi nut "Dang nhap bang Google" o trang chu.
  return xoaState(NextResponse.json({ idToken: tokenData.id_token }));
}
