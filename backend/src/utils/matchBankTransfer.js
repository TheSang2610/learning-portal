/**
 * Doc mot bao co tu ngan hang va quyet dinh no tra cho don hang nao.
 *
 * Tach rieng khoi controller vi day la phan DE SAI NHAT va cung la phan duy
 * nhat kiem thu duoc ma khong can CSDL: moi ham duoi day la ham thuan, nhan
 * chuoi tra ve chuoi. Controller chi con viec goi chung roi ghi CSDL.
 */

// Ma don co dang DH + 4 ky tu, lay tu bang chu cua model Order (da bo 0/O va
// 1/I/L). Bat dung bang chu do chu khong phai [A-Z0-9] chung chung: noi dung
// chuyen khoan that thuong bi ngan hang chen them chu, ma long leo se bat nham
// mot cum khac trong cau.
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

/**
 * Chuan hoa noi dung chuyen khoan truoc khi do mau.
 *
 * Ngan hang moi noi viet mot kieu: co noi in hoa het, co noi chen dau cach
 * giua tung cum, co noi bo dau tieng Viet thanh khong dau roi noi lien. Dua
 * het ve chu in hoa va bo moi ky tu khong phai chu/so thi "nap  n a p" khong
 * khop nhung "DH7K3M-CK" hay "CT DEN:DH7K3M" deu khop.
 */
const normalizeContent = (content) =>
    String(content || '')
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '');

/**
 * So tien ve co du de coi la da tra cho don nay khong?
 *
 * Cho phep THIEU mot chut chu khong doi bang tuyet doi: mot so ngan hang tru
 * phi chuyen khoan vao chinh so tien, va nguoi dung go tay cung hay lam tron.
 * Nguong 2% hoac 2.000d - lay cai nao lon hon - de khoan nho khong bi chan
 * boi ty le qua chat.
 *
 * Tra THUA thi van tinh la du. Phan chenh lech de quan tri nhin nhat ky ma
 * xu ly (hoan lai neu can).
 */
const TOLERANCE_RATE = 0.02;
const MIN_TOLERANCE = 2000;

const isPaidEnough = (amountReceived, amountDue) => {
    const received = Number(amountReceived);
    const can = Number(amountDue);
    if (!Number.isFinite(received) || !Number.isFinite(can) || can <= 0) return false;

    const tolerance = Math.max(MIN_TOLERANCE, can * TOLERANCE_RATE);
    return received >= can - tolerance;
};

/**
 * Chuan hoa mot giao dich Casso ve dang dung chung cua nhat ky bao co.
 *
 * Casso co hai ban webhook va ten truong hoi khac nhau:
 *   cu  : { id, tid, amount, description, when, subAccId, bankName }
 *   moi : { id, reference, amount, description, transactionDateTime, accountNumber }
 * Doc ca hai, giong infinity-store (payment.controller.ts).
 *
 * Ma giao dich lay `reference` / `tid` (ma cua ngan hang) truoc `id` (so dem
 * cua Casso): Casso gui lai cung giao dich thi ma ngan hang khong doi.
 *
 * Tra ve null khi khong doc ra ma giao dich - khong co ma thi khong chong trung
 * duoc, va khong chong trung thi mot bao co phat lai hai lan se bi xu ly hai lan.
 *
 * Truoc 22/10/2026 ham nay con doc dinh dang phang cua SePay - da bo, chi dung Casso.
 */
const parseBankCredit = (item) => {
    if (!item || typeof item !== 'object') return null;

    const transactionId = item.reference ?? item.tid ?? item.id;
    if (transactionId === undefined || transactionId === null || transactionId === '') return null;

    // Casso bao so AM cho tien ra. Bo sot cho nay thi mot lenh chuyen DI cung
    // thanh mot lan tra tien don.
    const amount = Number(item.amount ?? 0);

    return {
        maGiaoDich: String(transactionId),
        soTien: Math.abs(amount),
        incoming: amount > 0,
        noiDung: String(item.description ?? ''),
        nganHang: String(item.bankName ?? item.bankAbbreviation ?? ''),
        soTaiKhoan: String(item.accountNumber ?? item.subAccId ?? item.bank_sub_acc_id ?? ''),
        thoiGian: item.transactionDateTime ?? item.when ?? null
    };
};

/**
 * Lay danh sach giao dich tu than webhook Casso: { error, data }.
 *
 * `data` la MANG o ban cu, MOT object o ban moi. `error` khac 0 nghia la Casso
 * bao loi phia ho - khong co giao dich nao dang tin.
 */
const parseBankCredits = (body) => {
    if (!body || typeof body !== 'object' || Array.isArray(body)) return [];
    if (!body.data || typeof body.data !== 'object') return [];
    if (body.error !== undefined && ![0, '0'].includes(body.error)) return [];

    return [].concat(body.data).map(parseBankCredit).filter(Boolean);
};

/**
 * Rut ma DON HANG (vi du "DH7K3M", xem Order.generateCode) ra khoi noi dung chuyen
 * khoan.
 *
 * Thay hai ma khac nhau thi tra null, khong doan bua: do la truong hop that -
 * nguoi dung copy nham ca doan chu cu lan chu moi. Chon bua mot trong hai la
 * co the mo khoa nham cho don cua nguoi khac, de quan tri xu ly tay an toan hon.
 *
 * Tien to "DH" ngan nen de trung voi chu thuong (ten "...DHANH..." dinh lien
 * sau khi bo dau cach). Khong sao: ma rut ra con phai la mot don CO THAT, dang
 * cho, va so tien ve phai du - ba dieu kien cung trung la gan nhu khong the.
 */
const ORDER_CODE_PATTERN = new RegExp(`DH[${ALPHABET}]{4}`, 'g');

const extractOrderCode = (content) => {
    const thay = normalizeContent(content).match(ORDER_CODE_PATTERN);
    if (!thay || thay.length === 0) return null;

    const secret = [...new Set(thay)];
    return secret.length === 1 ? secret[0] : null;
};

module.exports = {
    normalizeContent,
    extractOrderCode,
    isPaidEnough,
    parseBankCredit,
    parseBankCredits,
    TOLERANCE_RATE,
    MIN_TOLERANCE
};
