/** Chu cua trang /auth/callback (Google tra ve sau khi dang nhap). */
export const AUTH_CALLBACK = {
  title: "Google sign-in",
  loading: "Loading Google authentication...",
  signingIn: "Signing you in with Google...",
  finishing: "Finishing Google sign-in...",
  failed: "Google login failed. Please try again.",
  noCode: "No Google authorization code received.",
  successClosing: "Login successful! Closing...",
  successRedirecting: "Login successful! Redirecting...",
  /** Ms cho truoc khi dong cua so bat len / chuyen trang. */
  closeDelayMs: 600,
  redirectDelayMs: 1000,
  redirectHref: "/",
  tokenUrl: (code: string, state: string) =>
    `/api/auth/google/token?code=${encodeURIComponent(code)}` +
    `&state=${encodeURIComponent(state)}`,
  messageType: "google-auth-success",
} as const;
