/**
 * Doc mot bao co tu ngan hang va quyet dinh no thuoc yeu cau nap nao.
 *
 * Tach rieng khoi controller vi day la phan DE SAI NHAT va cung la phan duy
 * nhat kiem thu duoc ma khong can CSDL: moi ham duoi day la ham thuan, nhan
 * chuoi tra ve chuoi. Controller chi con viec goi chung roi ghi CSDL.
 */

// Ma nap co dang NAP + 4 ky tu, lay tu bang chu cua model CoinTopUp (da bo
// 0/O va 1/I/L). Bat dung bang chu do chu khong phai [A-Z0-9] chung chung:
// noi dung chuyen khoan that thuong bi ngan hang chen them chu, ma long leo
// se bat nham mot cum khac trong cau.
const BANG_CHU = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const MAU_MA = new RegExp(`NAP[${BANG_CHU}]{4}`, 'g');

/**
 * Chuan hoa noi dung chuyen khoan truoc khi do mau.
 *
 * Ngan hang moi noi viet mot kieu: co noi in hoa het, co noi chen dau cach
 * giua tung cum, co noi bo dau tieng Viet thanh khong dau roi noi lien. Dua
 * het ve chu in hoa va bo moi ky tu khong phai chu/so thi "nap  n a p" khong
 * khop nhung "NAP7K3M-CK" hay "CT DEN:NAP7K3M" deu khop.
 */
const chuanHoaNoiDung = (noiDung) =>
    String(noiDung || '')
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '');

/**
 * Rut ma nap ra khoi noi dung chuyen khoan.
 *
 * Tra ve null khi khong thay, va tra ve null khi thay NHIEU HON MOT ma khac
 * nhau. Truong hop hai ma la truong hop that: nguoi dung copy nham ca doan
 * chu cu lan chu moi. Doan bua mot trong hai thi co 50% cong nham vi nguoi
 * khac - de quan tri xu ly tay an toan hon nhieu.
 */
const rutMaNap = (noiDung) => {
    const sach = chuanHoaNoiDung(noiDung);
    const thay = sach.match(MAU_MA);
    if (!thay || thay.length === 0) return null;

    const rieng = [...new Set(thay)];
    return rieng.length === 1 ? rieng[0] : null;
};

/**
 * So tien ve co du de coi la da tra cho yeu cau nay khong?
 *
 * Cho phep THIEU mot chut chu khong doi bang tuyet doi: mot so ngan hang tru
 * phi chuyen khoan vao chinh so tien, va nguoi dung go tay cung hay lam tron.
 * Nguong 2% hoac 2.000d - lay cai nao lon hon - de khoan nho khong bi chan
 * boi ty le qua chat.
 *
 * Tra THUA thi van tinh la du. Phan thua khong tu dong thanh coin: hoc vien
 * nhan dung so coin da dat, con chenh lech de quan tri nhin nhat ky ma xu ly.
 */
const DUNG_SAI_TY_LE = 0.02;
const DUNG_SAI_TOI_THIEU = 2000;

const duTien = (soTienVe, soTienCan) => {
    const ve = Number(soTienVe);
    const can = Number(soTienCan);
    if (!Number.isFinite(ve) || !Number.isFinite(can) || can <= 0) return false;

    const dungSai = Math.max(DUNG_SAI_TOI_THIEU, can * DUNG_SAI_TY_LE);
    return ve >= can - dungSai;
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
 * trung duoc, va khong chong trung thi mot bao co phat lai hai lan se cong
 * coin hai lan.
 */
const docMotBaoCo = (item) => {
    if (!item || typeof item !== 'object') return null;

    const maGiaoDich = item.id ?? item.tid ?? item.transactionId ?? item.reference;
    if (maGiaoDich === undefined || maGiaoDich === null || maGiaoDich === '') return null;

    const soTien = Number(
        item.transferAmount ?? item.amount ?? item.creditAmount ?? item.amountIn ?? 0
    );

    // 'transferType' cua SePay: 'in' la tien vao, 'out' la tien ra. Casso thi
    // bao so am cho tien ra. Chi coi la tien VAO khi thoa ca hai kieu - bo sot
    // mot kieu thi mot lenh chuyen DI cung thanh mot lan nap coin.
    const loai = String(item.transferType || '').toLowerCase();
    const tienVao = loai === 'out' ? false : soTien > 0;

    return {
        maGiaoDich: String(maGiaoDich),
        soTien: Math.abs(soTien),
        tienVao,
        noiDung: String(item.content ?? item.description ?? ''),
        nganHang: String(item.gateway ?? item.bank_name ?? item.bankName ?? ''),
        soTaiKhoan: String(item.accountNumber ?? item.account_number ?? ''),
        thoiGian: item.transactionDate ?? item.when ?? item.transaction_date ?? null
    };
};

/**
 * Lay danh sach bao co tu than request, du no la object don hay mang.
 */
const docBaoCo = (than) => {
    if (!than || typeof than !== 'object') return [];

    const tho = Array.isArray(than) ? than
        : Array.isArray(than.data) ? than.data
        : [than];

    return tho.map(docMotBaoCo).filter(Boolean);
};

module.exports = {
    chuanHoaNoiDung,
    rutMaNap,
    duTien,
    docMotBaoCo,
    docBaoCo,
    DUNG_SAI_TY_LE,
    DUNG_SAI_TOI_THIEU
};
