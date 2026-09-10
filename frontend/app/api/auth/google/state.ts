/**
 * Tham so `state` cua luong OAuth Google.
 *
 * Dat rieng ra vi hai route handler phai dung CHINH XAC cung mot ten cookie va
 * cung mot bo tuy chon: mot ben dat, mot ben doc roi xoa. Lech mot thuoc tinh
 * (path chang han) la trinh duyet coi do la hai cookie khac nhau - luc do buoc
 * doi chieu am tham that bai va moi lan dang nhap Google deu bi tu choi, ma
 * nhin vao code thi ca hai ben trong deu dung.
 *
 * Vi sao can `state`: xem ghi chu dai trong route.ts.
 */

export const TEN_COOKIE_STATE = "g_oauth_state";

/** Chuoi ngau nhien 256 bit, dang hex. */
export const taoState = () => {
  const b = new Uint8Array(32);
  crypto.getRandomValues(b);
  return Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
};

/**
 * sameSite 'lax' chu khong phai 'strict': Google dieu huong nguoi dung TU
 * accounts.google.com ve /auth/callback, tuc la mot dieu huong tu site khac.
 * Voi 'strict' thi trinh duyet KHONG gui cookie kem lan tai trang do, va buoc
 * doi chieu se hong voi ca nguoi dung that.
 *
 * 'lax' van du: no chan cookie di kem cac request POST/fetch tu site khac, ma
 * ke tan cong thi khong co cach nao lam nan nhan tai trang callback voi cookie
 * cua CHINH ke do.
 *
 * maxAge 10 phut: dung bang thoi gian mot nguoi can de bam qua man hinh chon
 * tai khoan cua Google. Song lau hon thi chi la mot chuoi con hieu luc nam lai
 * trong trinh duyet ma khong ai dung toi.
 */
export const tuyChonCookieState = () =>
  ({
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 10 * 60,
  }) as const;
