// Chuan hoa va kiem so dien thoai Viet Nam.
//
// ===========================================================================
// VI SAO PHAI CHUAN HOA CHU KHONG CHI KIEM HINH DANG
// ===========================================================================
//
// Truoc day cho nay chi co mot bieu thuc trong updateUserProfile:
//
//     /^[0-9+\s.-]{8,15}$/
//
// No tra loi duoc cau "chuoi nay trong co giong so dien thoai khong", nhung
// KHONG tra loi duoc cau quan trong hon: "hai chuoi nay co phai cung mot so
// khong". Voi bieu thuc do thi
//
//     0901234567    +84 901 234 567    84901234567    090.123.4567
//
// la BON gia tri khac nhau trong CSDL, deu hop le, deu luu duoc. Chi muc
// { phone: 1, unique: true } khong ngan duoc gi ca - no so sanh chuoi tho.
//
// Hau qua khi so dien thoai tro thanh thu de DANG NHAP: nguoi dung dang ky
// bang "+84901234567" roi hom sau go "0901234567" se duoc bao sai mat khau,
// vi khong tim thay ban ghi nao. Va te hon, hai nguoi co the cung dang ky mot
// so that bang hai cach go khac nhau.
//
// Nen moi loi vao deu quy ve MOT dang duy nhat truoc khi luu va truoc khi tra
// cuu: 10 chu so bat dau bang 0.
//
// ===========================================================================
// DANG CHUAN: 0XXXXXXXXX
// ===========================================================================
//
// Chon dang noi dia (bat dau bang 0) chu khong phai dang quoc te (+84) vi do
// la dang nguoi Viet doc va go hang ngay. Doi sang +84 khi nao can gui SMS -
// do la viec cua tang gui tin, khong phai cua tang luu tru.

// Dau so di dong Viet Nam, tinh theo chu so DAU TIEN sau so 0.
//
// 03 (Viettel)  05 (Vietnamobile/Gmobile)  07 (Mobifone)
// 08 (Vinaphone)  09 (ca ba nha mang, day so cu)
//
// KHONG nhan so may ban (024, 028...): day la truong dung de nhan OTP, ma
// tong dai co dinh thi khong nhan duoc tin nhan.
const PREFIXES = new Set(['3', '5', '7', '8', '9']);

// Phan sau ma vung: dung 9 chu so.
const DIGIT_COUNT = 9;

/**
 * Dua moi cach go ve dang chuan 0XXXXXXXXX.
 *
 * Tra ve '' khi khong doc duoc - noi goi tu quyet dinh bao loi thet nao.
 *
 * CHI nhan chuoi. Khong dung String(v): no bien {"$ne":null} thanh
 * '[object Object]' va nuot im lang moi kieu du lieu sai. Cung ly do voi
 * normalizeEmail trong validateInput.js.
 */
const normalizePhone = (v) => {
    if (typeof v !== 'string') return '';

    // Bo moi thu khong phai chu so: khoang trang, dau cham, gach ngang, ngoac
    // don, va ca dau + o dau. Sau buoc nay chi con chu so, nen cac nhanh duoi
    // chi phai nhin vao do dai va tien to.
    const count = v.replace(/\D/g, '');
    if (!count) return '';

    let part;

    if (count.startsWith('84') && count.length === 2 + DIGIT_COUNT) {
        // Dang quoc te: 84 + 9 chu so. Go kem dau + hay khong deu ve day, vi
        // dau + da bi boc o tren.
        //
        // Do dai la thu phan biet duy nhat: '0845123456' cung bat dau bang
        // '84' sau khi bo so 0 dau, nhung no di qua nhanh duoi chu khong vao
        // nhanh nay - va do la ly do phai kiem DO DAI chu khong chi tien to.
        part = count.slice(2);
    } else if (count.startsWith('0') && count.length === 1 + DIGIT_COUNT) {
        // Dang noi dia quen thuoc: 0 + 9 chu so.
        part = count.slice(1);
    } else if (count.length === DIGIT_COUNT) {
        // Go thieu so 0 o dau - hay gap khi chep tu mot bang tinh, noi cot so
        // bi hieu la so hoc va so 0 dau bi cat mat.
        part = count;
    } else {
        return '';
    }

    if (!PREFIXES.has(part[0])) return '';

    return `0${part}`;
};

/** Doc duoc thanh mot so di dong Viet Nam hop le khong. */
const isValidPhone = (v) => normalizePhone(v) !== '';

/**
 * Che bot so de hien ra man hinh hoac ghi log: 0901234567 -> 090****567.
 *
 * Dung o cho bao "da gui ma toi so ...", de nguoi dung nhan ra so cua minh ma
 * nguoi ngoi canh doc man hinh thi khong chep lai duoc ca so.
 */
const maskPhone = (v) => {
    const count = normalizePhone(v);
    if (!count) return '';
    return `${count.slice(0, 3)}****${count.slice(7)}`;
};

module.exports = {
    normalizePhone,
    isValidPhone,
    maskPhone,
    PREFIXES,
    DIGIT_COUNT,
};
