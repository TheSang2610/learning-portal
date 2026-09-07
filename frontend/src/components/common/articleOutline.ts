// Tach noi dung tai lieu thanh cac khoi de dung mot ben la muc luc, mot ben
// la than bai.
//
// Nguoi dang go van ban thuong, khong co trinh soan thao. Nen phai doan dau la
// tieu de. Chi nhan nhung dang RO RANG, khong doan mo ho:
//
//   ## Tieu de              (kieu Markdown, 1-4 dau #)
//   Chương 1: ...           (tieng Viet, co so hoac so La Ma)
//   Phần II - ...
//   Bài 3. ...
//   Mục 2.1 ...
//   I. ...                  (so La Ma dung dau dong)
//
// CO Y KHONG nhan "1. ..." lam tieu de: dong do gan nhu luc nao cung la mot
// muc trong danh sach dem ("1. Danh sach lien ket", "2. Ngan xep"), nhan nham
// thi muc luc day nhung dong vun vat va than bai mat het danh sach.

export type Block =
  | { kind: "heading"; level: 1 | 2 | 3; text: string; id: string }
  | { kind: "para"; text: string }
  | { kind: "list"; ordered: boolean; items: string[] };

export interface OutlineItem {
  id: string;
  text: string;
  level: 1 | 2 | 3;
}

const RE_MARKDOWN = /^(#{1,4})\s+(.+?)\s*$/;
// "Chương 1:", "CHƯƠNG II -", "Phần 3", "Bài 2.", "Mục 1.2"
const RE_VN_CAP1 = /^(chương|phần)\s+([0-9]+|[ivxlcdm]+)\b.*$/i;
const RE_VN_CAP2 = /^(bài|mục|chuyên đề)\s+([0-9]+(?:\.[0-9]+)*|[ivxlcdm]+)\b.*$/i;
// "I.", "IV -", "VII:" dung dau dong.
//
// Ba rang buoc, moi cai vi mot loi da gap khi thu:
//   1. CHI chu HOA. De /i thi "Vi du: ..." thanh tieu de, vi v va i deu la
//      chu so La Ma.
//   2. CHI dung I, V, X (toi XXXIX) - du cho danh so muc. Cho them M, C, D thi
//      "MIX: ..." khop, vi MIX dung la so La Ma hop le (1009).
//   3. Phan so BAT BUOC khong rong. Neu cho rong thi dong "- Thêm đầu: O(1)"
//      khop luon: so rong + dau '-' + khoang trang -> bi nhan lam tieu de,
//      va ca danh sach gach dau dong bien mat khoi than bai.
const RE_ROMAN = /^(X{0,3}(?:IX|IV|V?I{0,3}))\s*[.\-:)]\s+\S.*$/;

const RE_BULLET = /^\s*[-*•+]\s+(.+)$/;
const RE_ORDERED = /^\s*(\d+)[.)]\s+(.+)$/;

/** Bo dau tieng Viet + ky tu la de lam id neo cho the <a href="#..."> */
export function slugHoa(s: string): string {
  return (
    s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "muc"
  );
}

function nhanDienTieuDe(line: string): { level: 1 | 2 | 3; text: string } | null {
  const md = line.match(RE_MARKDOWN);
  if (md) {
    const n = md[1].length;
    return { level: (n >= 3 ? 3 : n) as 1 | 2 | 3, text: md[2] };
  }
  const t = line.trim();
  if (!t) return null;

  // Tieu de thi ngan. Mot doan van dai 300 ky tu mo dau bang "Chương trình..."
  // khong phai tieu de - chan bang gioi han do dai.
  if (t.length > 120) return null;

  if (RE_VN_CAP1.test(t)) return { level: 1, text: t };
  if (RE_VN_CAP2.test(t)) return { level: 2, text: t };

  // Phai kiem do dai phan bat duoc: regex so La Ma khop duoc chuoi RONG.
  const roman = t.match(RE_ROMAN);
  if (roman && roman[1].length > 0) return { level: 2, text: t };

  return null;
}

/**
 * Doi van ban tho thanh danh sach khoi.
 * Id tieu de duoc lam duy nhat (them -2, -3...) de neo khong tro nham.
 */
export function phanTichNoiDung(raw: string): Block[] {
  const lines = String(raw || "")
    .replace(/\r\n/g, "\n")
    .split("\n");
  const blocks: Block[] = [];
  const daDung = new Map<string, number>();

  let doanDangGom: string[] = [];
  let danhSachDangGom: { ordered: boolean; items: string[] } | null = null;

  const chotDoan = () => {
    if (doanDangGom.length) {
      blocks.push({ kind: "para", text: doanDangGom.join(" ") });
      doanDangGom = [];
    }
  };
  const chotDanhSach = () => {
    if (danhSachDangGom?.items.length) blocks.push({ kind: "list", ...danhSachDangGom });
    danhSachDangGom = null;
  };
  const chotHet = () => {
    chotDoan();
    chotDanhSach();
  };

  for (const line of lines) {
    const t = line.trim();

    if (!t) {
      chotHet();
      continue;
    }

    const td = nhanDienTieuDe(t);
    if (td) {
      chotHet();
      const goc = slugHoa(td.text);
      const lan = (daDung.get(goc) ?? 0) + 1;
      daDung.set(goc, lan);
      blocks.push({
        kind: "heading",
        level: td.level,
        text: td.text,
        id: lan === 1 ? goc : `${goc}-${lan}`,
      });
      continue;
    }

    const bullet = t.match(RE_BULLET);
    if (bullet) {
      chotDoan();
      if (!danhSachDangGom || danhSachDangGom.ordered) {
        chotDanhSach();
        danhSachDangGom = { ordered: false, items: [] };
      }
      danhSachDangGom.items.push(bullet[1]);
      continue;
    }

    const ordered = t.match(RE_ORDERED);
    if (ordered) {
      chotDoan();
      if (!danhSachDangGom || !danhSachDangGom.ordered) {
        chotDanhSach();
        danhSachDangGom = { ordered: true, items: [] };
      }
      danhSachDangGom.items.push(ordered[2]);
      continue;
    }

    chotDanhSach();
    doanDangGom.push(t);
  }

  chotHet();
  return blocks;
}

/** Rut muc luc tu danh sach khoi */
export function layMucLuc(blocks: Block[]): OutlineItem[] {
  return blocks
    .filter((b): b is Extract<Block, { kind: "heading" }> => b.kind === "heading")
    .map(({ id, text, level }) => ({ id, text, level }));
}
