/**
 * Doi mot duong dan TRANG XEM video sang duong dan NHUNG vao iframe duoc.
 *
 * Trang hoc phat video bang the <video>, ma the do chi doc duoc tep media that
 * (mp4, webm, m3u8). Dan link YouTube vao thi <video src="...watch?v=..."> nhan
 * ve mot trang HTML chu khong phai video: trinh duyet bao loi dinh dang, nguoi
 * hoc chi thay o den si kem dong "Khong the phat video".
 *
 * O nhap trong trang them bai hoc ghi san "Dan link: YouTube, Vimeo..." nen loi
 * nay con lap lai dai dai neu khong doi. Nhung nha cung cap nay khong cho lay
 * thang tep video, chi cho nhung qua iframe - vi vay phai tach hai duong ve
 * ngay tu day thay vi co ep vao mot the <video>.
 *
 * Tra ve null nghia la "khong phai dang nhung" - cu de <video> xu ly nhu cu.
 */

// Ma video YouTube luon dai dung 11 ky tu. Kiem do dai de mot duong dan la
// (vi du /watch?v=) khong bi bien thanh iframe tro toi trang loi.
const MA_YOUTUBE = /^[A-Za-z0-9_-]{11}$/;

function nhungYouTube(ma: string): string {
  // Co y BO tham so list: nguoi dung thuong chep link tu giua mot playlist.
  // Giu list lai thi trinh phat tu chay sang video ke tiep cua playlist sau khi
  // het bai - tuc la bai hoc bi danh dau xong roi may chay tiep noi dung khac.
  return `https://www.youtube.com/embed/${ma}`;
}

export function layDuongDanNhung(url: string): string | null {
  let u: URL;
  try {
    u = new URL(url.trim());
  } catch {
    return null;
  }

  if (u.protocol !== "http:" && u.protocol !== "https:") return null;

  const host = u.hostname.replace(/^www\./, "").toLowerCase();

  if (host === "youtu.be") {
    const ma = u.pathname.split("/").filter(Boolean)[0] || "";
    return MA_YOUTUBE.test(ma) ? nhungYouTube(ma) : null;
  }

  if (
    host === "youtube.com" ||
    host === "m.youtube.com" ||
    host === "youtube-nocookie.com"
  ) {
    if (u.pathname === "/watch") {
      const ma = u.searchParams.get("v") || "";
      return MA_YOUTUBE.test(ma) ? nhungYouTube(ma) : null;
    }
    // /embed/, /shorts/, /live/ va /v/ deu mang ma ngay sau doan dau.
    const khop = u.pathname.match(/^\/(?:embed|shorts|live|v)\/([^/?#]+)/);
    return khop && MA_YOUTUBE.test(khop[1]) ? nhungYouTube(khop[1]) : null;
  }

  if (host === "vimeo.com") {
    const ma = u.pathname.split("/").filter(Boolean)[0] || "";
    return /^\d+$/.test(ma) ? `https://player.vimeo.com/video/${ma}` : null;
  }

  if (host === "player.vimeo.com") {
    return /^\/video\/\d+/.test(u.pathname) ? u.href : null;
  }

  return null;
}
