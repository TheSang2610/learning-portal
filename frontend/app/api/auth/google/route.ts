import { NextResponse } from "next/server";
import { TEN_COOKIE_STATE, taoState, tuyChonCookieState } from "./state";

export const dynamic = "force-dynamic";

export async function GET(_req: Request) {
  const origin = process.env.GOOGLE_ORIGIN;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${origin}/auth/callback`;
  const clientId = process.env.GOOGLE_CLIENT_ID;

  if (!clientId) {
    return NextResponse.json({ error: "Missing GOOGLE_CLIENT_ID" }, { status: 500 });
  }

  // Tham so `state` - chan CSRF dang nhap.
  //
  // LO HONG DA VA: truoc day duong nay khong gui `state`, va trang callback
  // nhan BAT KY `code` nao co trong dia chi. Nghia la ke tan cong bam dang
  // nhap Google bang tai khoan CUA HO, chan lai o buoc callback de lay `code`
  // chua dung, roi du nan nhan mo
  //
  //     https://trang-cua-ban/auth/callback?code=<code cua ke tan cong>
  //
  // (mot the img, mot duong dan rut gon, mot tin nhan - deu duoc). Trinh duyet
  // nan nhan doi ma do lay id_token cua KE TAN CONG, va tu do tro di nan nhan
  // dang dung mot phien mang danh tinh cua ke kia ma khong he biet: moi thu ho
  // lam - ghi danh, tai tai lieu, dien thong tin - deu roi vao tai khoan cua
  // ke tan cong, noi ke do doc duoc het.
  //
  // Cach chan: sinh mot chuoi ngau nhien, gui kem toi Google VA cat mot ban
  // trong cookie httpOnly. Google tra `state` do nguyen ven ve theo callback.
  // Hai ban phai khop thi moi doi ma. `code` cua ke tan cong khong bao gio di
  // kem cookie cua nan nhan, nen no khong con dung duoc nua.
  const state = taoState();

  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", "openid email profile");
  authUrl.searchParams.set("access_type", "offline");
  authUrl.searchParams.set("prompt", "select_account");
  authUrl.searchParams.set("state", state);

  const res = NextResponse.redirect(authUrl);
  res.cookies.set(TEN_COOKIE_STATE, state, tuyChonCookieState());
  return res;
}
