// Dia chi goc cua giao dien, de dung lien ket gui trong email.
//
// Backend khong tu biet minh dang phuc vu ten mien nao. Ghep lien ket tu
// req.headers.host hay req.headers.origin la DUNG DAU VAO CUA NGUOI GOI de
// dung mot lien ket roi gui vao hom thu nguoi khac - ke tan cong chi viec dat
// Host: trang-cua-toi.com la la thu xac minh cua nan nhan tro thang ve may
// ho, va bam vao la ho nop token cho ke do. Day la lo hong "host header
// injection" kinh dien cua cac luong dat lai mat khau.
//
// Vi vay dia chi CHI duoc lay tu bien moi truong - thu ma nguoi goi khong voi
// toi duoc:
//   FRONTEND_URL      neu co, dung thang.
//   FRONTEND_ORIGINS  danh sach origin duoc phep goi API (xem index.js). Lay
//                     cai dau tien - theo quy uoc do la ten mien chinh.
//
// Ca hai deu trong thi lui ve localhost, de chay dev khong phai dat them bien.

const MAC_DINH = 'http://localhost:3000';

const boGachCuoi = (s) => String(s || '').trim().replace(/\/+$/, '');

// Chi keu mot lan cho moi tien trinh: neu khong, moi luot dang ky lai sinh
// them mot dong y het nhau trong log.
let daKeu = false;

/**
 * @param {object} [env] cho phep truyen vao de kiem thu, mac dinh la process.env
 */
const gocGiaoDien = (env = process.env) => {
    const rieng = boGachCuoi(env.FRONTEND_URL);
    if (rieng) return rieng;

    const dauTien = boGachCuoi(String(env.FRONTEND_ORIGINS || '').split(',')[0]);
    if (dauTien) return dauTien;

    // Lui ve localhost la dung khi chay dev, nhung tren ban that thi day la
    // mot su co IM LANG dung nghia: dang ky van tra 202, thu van gui di, chi
    // co dieu lien ket ben trong tro toi http://localhost:3000 nen khong mot
    // ai kich hoat duoc tai khoan. Ke ra day de no thanh mot dong log doc
    // duoc, thay vi mot bi an "sao khong ai dang ky duoc".
    if (env.NODE_ENV === 'production' && !daKeu) {
        daKeu = true;
        console.error(
            'diaChiGiaoDien: chay production ma KHONG co FRONTEND_URL lan FRONTEND_ORIGINS. '
            + `Moi lien ket xac minh email se tro toi ${MAC_DINH} va khong dung duoc. `
            + 'Dat mot trong hai bien do tren ban deploy.',
        );
    }

    return MAC_DINH;
};

/** Lien ket nguoi dung bam de kich hoat tai khoan. */
const lienKetXacMinh = (token, env = process.env) =>
    `${gocGiaoDien(env)}/verify-email?token=${encodeURIComponent(token)}`;

/** Lien ket toi trang dang nhap. */
const lienKetDangNhap = (env = process.env) => `${gocGiaoDien(env)}/?auth=login`;

module.exports = { gocGiaoDien, lienKetXacMinh, lienKetDangNhap, MAC_DINH };
