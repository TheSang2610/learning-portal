// Loc noi dung truoc khi cho dang tai lieu.
//
// Chan 3 nhom: chui the, ky thi/phan biet chung toc, kich dong gay han.
//
// ---------------------------------------------------------------------------
// CAI BAY LON NHAT: KHONG duoc bo dau tieng Viet roi moi so khop.
//
// Bo dau thi "cac" trung voi ca mot tu chui rat pho bien LAN "cac" trong
// "cac ban", "cac mon hoc". Tuong tu "dm" nam gon trong "admin". Neu lam an
// theo kieu do thi nguoi dung viet "gui cac ban tai lieu" se bi chan.
//
// Cach lam o day:
//   - Tu tieng Viet  -> so khop tren van ban CON NGUYEN DAU
//   - Tu tieng Anh   -> so khop tren van ban da bo dau (de bat Ç, é...)
//   - Rieng vai tu bi viet lach kieu "d.m", "v c l" -> so khop tren ban da
//     noi lai cac chu cai don, nhung VAN can ranh gioi tu nen "admin" khong
//     bao gio dinh.
// Moi lan so khop deu doi ranh gioi tu, khong bao gio dung indexOf tran.
// ---------------------------------------------------------------------------

// Chui the / tuc tiu (tieng Viet, giu nguyen dau)
// Da BO khoi danh sach vi trung voi tu thong dung, thu nghiem that bi chan nham:
//   'vl'   -> "De thi VL chuong 3" (Vat Ly)
//   'cut'  -> "trung chim cut luoc"
//   'xeo'  -> "cat xeo goc 45 do"
// Dang day du ('vai lon', 'dm' co dau) van bat duoc, nen khong mat gi.
const VN_PROFANITY = [
  'địt', 'đụ', 'lồn', 'cặc', 'buồi', 'đéo', 'đm', 'đmm', 'đcm', 'đkm',
  'vãi lồn', 'vcl', 'vkl', 'cmm', 'clm', 'clgt',
  'thằng chó', 'con chó', 'đồ chó', 'chó má', 'khốn nạn', 'mất dạy',
  'súc vật', 'đồ khốn', 'con điếm', 'thằng điên', 'ngu như bò',
  'câm mồm', 'câm miệng', 'im mồm',
];

// Chui the tieng Anh (so khop tren ban da bo dau)
const EN_PROFANITY = [
  'fuck', 'fucking', 'fucker', 'motherfucker', 'shit', 'bullshit',
  'bitch', 'bastard', 'asshole', 'dickhead', 'cunt', 'slut', 'whore',
  'wtf', 'stfu', 'gtfo',
];

// Ky thi, phan biet chung toc / vung mien / ton giao / gioi tinh
const HATE = [
  'mọi đen', 'đồ mọi', 'thằng mọi', 'da đen bẩn', 'bọn da đen',
  'thằng tàu', 'bọn tàu khựa', 'tàu khựa', 'ba tàu', 'thằng khựa',
  'bọn hàn xẻng', 'hàn xẻng', 'nhật lùn', 'thằng lùn nhật',
  'bọn bắc kỳ', 'thằng bắc kỳ', 'bọn nam kỳ', 'thằng nam kỳ',
  'dân tộc thiểu số ngu', 'bọn mường', 'đồ mán',
  'bọn đồng tính', 'thằng bê đê', 'bê đê', 'pê đê', 'đồ ái nam',
  'bọn theo đạo',
  // KHONG chan 'diet chung', 'thanh trung sac toc': day la DE TAI lich su,
  // mot tieu luan viet ve nan diet chung o Campuchia phai duoc dang.
];

const HATE_EN = [
  'nigger', 'nigga', 'chink', 'gook', 'raghead', 'towelhead',
  'faggot', 'tranny',
  'white power', 'heil hitler',
  // KHONG chan 'retard(ed)': "retarded potential" la thuat ngu dien tu hoc.
  // KHONG chan 'fag' rieng le va 'gas the': qua ngan / qua chung chung.
];

// Kich dong gay han, keu goi tan cong nguoi khac ("kick war")
const INCITEMENT = [
  'kick war', 'khịa nhau', 'gây war', 'châm ngòi',
  'anh em vào chửi', 'vào chửi nó', 'vào phá', 'vào spam',
  'kêu gọi tẩy chay', 'kêu gọi đánh', 'đánh chết', 'đánh cho chết',
  'giết chết nó', 'giết hết', 'xử nó', 'cho nó chết',
  'bóc phốt', 'đe dọa giết',
  'lùa gà', 'dìm hàng', 'ném đá hội đồng', 'tấn công cá nhân',
  // KHONG chan 'khung bo', 'pha hoai': deu la DE TAI hoc thuat/ky thuat
  // ("chu nghia khung bo", "ma doc pha hoai du lieu").
];

// ---------------------------------------------------------------------------
// Cum tu so khop tren van ban DA BO DAU.
//
// Rat nhieu nguoi go tieng Viet khong dau, nen chi so khop ban co dau la lot
// het: "thang cho", "vao chui no di" deu qua duoc.
//
// Nhung bo dau lam nhieu tu chui trung voi tu thong dung:
//     con  -> "con"    (con/còn/cồn)        lon -> "lon"  ("lon hon" = lon hon)
//     cac  -> "cac"    ("cac ban")           du  -> "du"   ("du lieu", "day du")
//     buoi -> "buoi"   ("buoi hoc")          deo -> "deo"  ("deo kinh")
// Nen o day CHI dat CUM TU nhieu chu, du dai de khong the trung voi cau binh
// thuong. Tu don mo ho thi de o VN_PROFANITY (so khop ban con dau).
//
// Da thu va LOAI 'thang cho' vi "thang cho diem" (thang cho diem bai thi) la
// cum tu hop le trong moi truong hoc.
// ---------------------------------------------------------------------------
// Tach theo dung ba nhom, khong gop chung: thong bao loi noi thang cho nguoi
// dung ho pham quy dinh nao, nen gan sai nhan la noi sai.
const VN_STRIPPED_PROFANITY = [
  'thang cho nay', 'thang cho do', 'thang cho kia',
  'con cho nay', 'do khon nan', 'do suc vat', 'thang mat day',
  'cam mom', 'cam cai mom', 'im cai mom', 'ngu nhu bo', 'ngu nhu cho',
];

const VN_STRIPPED_HATE = [
  'bon tau khua', 'tau khua', 'thang tau khua',
  'bon bac ky', 'thang bac ky', 'bon nam ky', 'thang nam ky',
  'bon han xeng', 'han xeng', 'nhat lun',
  'thang be de', 'bon be de',
  'bon da den', 'da den ban', 'do moi den', 'thang moi den',
];

const VN_STRIPPED_INCITEMENT = [
  'vao chui no', 'vao chui thang', 'anh em vao chui', 'vao spam',
  'danh chet no', 'danh cho chet', 'giet chet no', 'cho no chet',
  'gay war', 'kick war', 'khia nhau', 'nem da hoi dong',
];

// Nhung tu hay bi viet lach bang dau cham/khoang trang: "d.m.m", "v c l".
// Chi dua vao day tu KHONG the la mot phan cua tu binh thuong nao.
// Da BO 'dm' (de-xi-met) va 'vl' (Vat Ly) - hai cai nay chan nham tai lieu that.
const EVASION_PRONE = ['dmm', 'dcm', 'dkm', 'vcl', 'vkl', 'cmm', 'clm'];

const DIACRITICS = {
  a: 'áàảãạăắằẳẵặâấầẩẫậ', e: 'éèẻẽẹêếềểễệ', i: 'íìỉĩị',
  o: 'óòỏõọôốồổỗộơớờởỡợ', u: 'úùủũụưứừửữự', y: 'ýỳỷỹỵ', d: 'đ',
};

function stripDiacritics(s) {
  let out = s;
  for (const [plain, marked] of Object.entries(DIACRITICS)) {
    out = out.replace(new RegExp('[' + marked + ']', 'g'), plain);
  }
  return out;
}

// Chuan hoa muc nhe: chi ha chu thuong va gom khoang trang.
// KHONG bo dau o buoc nay - xem ghi chu dau file.
function normalize(s) {
  return String(s || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

// Doi chu so/ky tu thay the ve chu cai: "sh1t" -> "shit", "@ss" -> "ass"
function undoLeet(s) {
  return s
    .replace(/[0]/g, 'o').replace(/[1!|]/g, 'i').replace(/[3]/g, 'e')
    .replace(/[4@]/g, 'a').replace(/[5$]/g, 's').replace(/[7]/g, 't');
}

// Noi lai cac chu cai don bi tach ra: "v c l" -> "vcl", "d.m" -> "dm".
// Chi gop nhung cum toan chu cai DON, nen "admin" hay "an toan" khong bi dung toi.
function joinSpacedLetters(s) {
  return s.replace(/(?<![\p{L}\p{N}])((?:\p{L}[\s._*\-]+){1,6}\p{L})(?![\p{L}\p{N}])/gu,
    (m) => m.replace(/[\s._*\-]+/g, ''));
}

// Ranh gioi tu chuan Unicode - \b khong dung duoc voi chu co dau.
function hasTerm(text, term) {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(
    '(?<![\\p{L}\\p{N}])' + escaped + '(?![\\p{L}\\p{N}])', 'u',
  ).test(text);
}

const NHAN = {
  profanity: 'chửi thề, ngôn từ tục tĩu',
  hate: 'kỳ thị, phân biệt chủng tộc',
  incitement: 'kích động, gây hấn',
};

/**
 * Kiem tra mot doan van ban.
 * @returns {{ok: boolean, category?: string, label?: string, matched?: string}}
 */
function checkText(input) {
  const base = normalize(input);
  if (!base) return { ok: true };

  const noDia = stripDiacritics(base);
  const leet = undoLeet(noDia);
  const joined = joinSpacedLetters(leet);

  const passes = [
    // [danh sach tu, van ban de so khop, nhom]
    [VN_PROFANITY, base, 'profanity'],
    [EN_PROFANITY, leet, 'profanity'],
    [HATE, base, 'hate'],
    [HATE_EN, leet, 'hate'],
    [INCITEMENT, base, 'incitement'],
    [EVASION_PRONE, joined, 'profanity'],
    // Cum khong dau: chay tren van ban da bo dau, bat nguoi go khong dau.
    [VN_STRIPPED_PROFANITY, noDia, 'profanity'],
    [VN_STRIPPED_HATE, noDia, 'hate'],
    [VN_STRIPPED_INCITEMENT, noDia, 'incitement'],
  ];

  for (const [list, text, category] of passes) {
    for (const term of list) {
      if (hasTerm(text, term)) {
        return { ok: false, category, label: NHAN[category], matched: term };
      }
    }
  }

  return { ok: true };
}

/**
 * Kiem tra ca tieu de lan noi dung. Tra ve loi dau tien tim thay.
 */
function checkDocument({ title, description }) {
  for (const [field, value, ten] of [
    ['title', title, 'Tiêu đề'],
    ['description', description, 'Nội dung'],
  ]) {
    const r = checkText(value);
    if (!r.ok) {
      return {
        ok: false,
        field,
        category: r.category,
        message:
          `${ten} vi phạm quy định (${r.label}). ` +
          `Vui lòng sửa lại rồi đăng.`,
      };
    }
  }
  return { ok: true };
}

module.exports = { checkText, checkDocument, stripDiacritics, joinSpacedLetters };
