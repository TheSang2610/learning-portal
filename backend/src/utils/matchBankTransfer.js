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
 * Chuan hoa mot bao co ve dang dung chung, du webhook den tu nha nao.
 *
 * Hien co hai dinh dang pho bien o Viet Nam:
 *
 *   SePay  - mot object phang: { id, transferAmount, content, gateway, ... }
 *   Casso  - boc trong mang:   { error, data: [ { tid, amount, description } ] }
 *
 * Doc ca hai o day thay vi bat nguoi dung phai dung dung mot nha: doi nha
 * cung cap ve sau chi phai them vai ten truong vao danh sach ben duoi, khong
 * phai sua controller.
 *
 * Tra ve null khi khong doc ra noi ma giao dich - khong co ma thi khong chong
 * trung duoc, va khong chong trung thi mot bao co phat lai hai lan se bi xu
 * ly hai lan.
 */
const parseBankCredit = (item) => {
    if (!item || typeof item !== 'object') return null;

    const transactionId = item.id ?? item.tid ?? item.transactionId ?? item.reference;
    if (transactionId === undefined || transactionId === null || transactionId === '') return null;

    const amount = Number(
        item.transferAmount ?? item.amount ?? item.creditAmount ?? item.amountIn ?? 0
    );

    // 'transferType' cua SePay: 'in' la tien vao, 'out' la tien ra. Casso thi
    // bao so am cho tien ra. Chi coi la tien VAO khi thoa ca hai kieu - bo sot
    // mot kieu thi mot lenh chuyen DI cung thanh mot lan tra tien don.
    const loai = String(item.transferType || '').toLowerCase();
    const incoming = loai === 'out' ? false : amount > 0;

    return {
        maGiaoDich: String(transactionId),
        soTien: Math.abs(amount),
        incoming,
        noiDung: String(item.content ?? item.description ?? ''),
        nganHang: String(item.gateway ?? item.bank_name ?? item.bankName ?? ''),
        soTaiKhoan: String(item.accountNumber ?? item.account_number ?? ''),
        thoiGian: item.transactionDate ?? item.when ?? item.transaction_date ?? null
    };
};

/**
 * Lay danh sach bao co tu than request, du no la object don hay mang.
 */
const parseBankCredits = (body) => {
    if (!body || typeof body !== 'object') return [];

    const tho = Array.isArray(body) ? body
        : Array.isArray(body.data) ? body.data
        : [body];

    return tho.map(parseBankCredit).filter(Boolean);
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
