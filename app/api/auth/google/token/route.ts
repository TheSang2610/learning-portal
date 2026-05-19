import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Missing authorization code" }, { status: 400 });
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${process.env.GOOGLE_ORIGIN || "http://localhost:3000"}/auth/callback`;

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

  const backendUrl = process.env.BACKEND_URL || "http://localhost:5000";
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
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(googleUserPayload),
    });

    if (backendResponse.ok) {
      finalUser = await backendResponse.json();
    } else {
      const backendError = await backendResponse.text();
      console.warn("Google backend sync failed:", backendError);
    }
  } catch (error) {
    console.warn("Google backend request failed:", error);
  }

  return NextResponse.json({ user: finalUser, token: tokenData });
}
