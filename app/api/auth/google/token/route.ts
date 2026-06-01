import { NextResponse } from "next/server";

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
  const redirectUri = process.env.GOOGLE_REDIRECT_URI ||
    `${process.env.GOOGLE_ORIGIN || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")}/auth/callback`;

  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: "Missing Google OAuth credentials" }, { status: 500 });
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
    return NextResponse.json({ error: "Token exchange failed", details: tokenData }, { status: 500 });
  }

  const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
    },
  });

  const userInfo = await userInfoResponse.json();

  // 🌟 SỬA ĐỔI 2: Khớp tên biến với file .env của bạn
  // Thay thế việc tìm process.env.BACKEND_URL thành biến đúng: process.env.NEXT_PUBLIC_BACKEND_URL
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
  const backendGoogleAuthPath = process.env.BACKEND_GOOGLE_AUTH_PATH || "/api/users/google";

  const googleUserPayload = {
    googleId: userInfo.sub,
    name: userInfo.name,
    email: userInfo.email,
    picture: userInfo.picture,
    provider: "google",
    role: "student",
  };

  let finalUser = userInfo;

   try {
    const backendResponse = await fetch(`${backendUrl}${backendGoogleAuthPath}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(googleUserPayload),
    });

    if (backendResponse.ok) {
      finalUser = await backendResponse.json();
    }
  } catch (error) {
    console.warn("Google backend request failed:", error);
  }

  const { token, ...userData } = finalUser;

  return NextResponse.json({
    user: userData,        
    token: token || null    
  });
}