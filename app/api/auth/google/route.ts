import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function GET(_req: Request) {
  const origin = process.env.GOOGLE_ORIGIN;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${origin}/auth/callback`;
  const clientId = process.env.GOOGLE_CLIENT_ID;

  if (!clientId) {
    return NextResponse.json({ error: "Missing GOOGLE_CLIENT_ID" }, { status: 500 });
  }

  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", "openid email profile");
  authUrl.searchParams.set("access_type", "offline");
  authUrl.searchParams.set("prompt", "select_account");

  return NextResponse.redirect(authUrl);
}
