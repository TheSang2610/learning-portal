// Chuan hoa van ban do nguoi dung nhap.
//
// Tach ra khoi controller vi hai ly do:
//   1. slugHoa truoc day bi CHEP o ca postController lan documentController,
//      khac nhau dung hai cho: do dai toi da va chuoi du phong. Sua mot ban ma
//      quen ban kia la hai duong dan sinh ra khac nhau cho cung mot tieu de.
//   2. Nam trong controller thi khong test duoc: nap file do keo theo model,
//      ma model keo theo mongoose va mot ket noi CSDL.

// Bo dau tieng Viet de lam duong dan.
//
// Dai ̀-ͯ la cac dau thanh va dau mu, chung tach thanh ky tu rieng
// sau khi normalize('NFD'). Viet bang ma escape chu khong go thang, vi go thang
// thi chung vo hinh trong trinh soan thao.
const taoSlug = (chuoi, { dai = 80, macDinh = 'bai-viet' } = {}) =>
    // `?? ''` chu khong phai tham so mac dinh: tham so mac dinh chi chay khi
    // dau vao la undefined, con null thi lot qua. Ban cu viet (s = '') roi goi
    // s.normalize() nen nem TypeError voi null; neu chi doi sang String(s) thi
    // lai ra dung chuoi "null" lam duong dan.
    String(chuoi ?? '')
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, dai)
        // Cat theo do dai co the de lai dau '-' o cuoi: "abc-def" cat 4 -> "abc-"
        .replace(/-+$/, '') || macDinh;

// Tach tags tu mang hoac tu chuoi dang "a, b, c". Toi da 5 the.
const tachTags = (v) =>
    (Array.isArray(v) ? v : String(v || '').split(','))
        .map((t) => String(t).trim())
        .filter(Boolean)
        .slice(0, 5);

module.exports = { taoSlug, tachTags };
