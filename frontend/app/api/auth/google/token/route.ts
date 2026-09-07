import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Missing authorization code" }, { status: 400 });
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

  if (!tokenResponse.ok) {
    return NextResponse.json(
      { error: "Token exchange failed", details: tokenData },
      { status: 500 },
    );
  }

  // id_token la mot khang dinh CO CHU KY cua Google ve danh tinh nguoi dung.
  // Day la thu duy nhat can chuyen tiep: backend tu kiem chu ky va tu doc
  // email tu do.
  if (!tokenData.id_token) {
    return NextResponse.json({ error: "Google khong tra ve id_token" }, { status: 500 });
  }

  // KHONG goi backend tu day nua.
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
  return NextResponse.json({ idToken: tokenData.id_token });
}
