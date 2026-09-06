const nodemailer = require('nodemailer');

/**
 * Gui mail bao cho quan tri.
 *
 * KHONG ghi cung tai khoan mail vao ma nguon: day la thong tin dang nhap that
 * su - lo ra la nguoi khac gui mail duoi ten ban. Khac han so tai khoan ngan
 * hang o thanhToan.js (thu von phai dua ra moi nhan duoc tien).
 *
 * Ba bien can dat:
 *   MAIL_USER          dia chi Gmail dung de GUI
 *   MAIL_APP_PASSWORD  "mat khau ung dung" 16 ky tu, KHONG phai mat khau Gmail
 *   MAIL_ADMIN         dia chi NHAN thong bao (bo trong thi gui ve chinh
 *                      MAIL_USER)
 *
 * Gmail chan dang nhap bang mat khau thuong tu 2022. Phai bat xac thuc hai buoc
 * roi tao "App password" o https://myaccount.google.com/apppasswords.
 */

const MAIL_USER = process.env.MAIL_USER || '';
const MAIL_APP_PASSWORD = process.env.MAIL_APP_PASSWORD || '';
const MAIL_ADMIN = process.env.MAIL_ADMIN || MAIL_USER;

const daCauHinh = () => Boolean(MAIL_USER && MAIL_APP_PASSWORD);

// Tao mot lan roi dung lai. Tao moi lan gui thi moi mail phai bat tay TLS lai
// tu dau voi Gmail - cham va de bi chan vi mo qua nhieu ket noi.
let hopThu = null;
const layHopThu = () => {
    if (!daCauHinh()) return null;
    if (!hopThu) {
        hopThu = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: MAIL_USER, pass: MAIL_APP_PASSWORD }
        });
    }
    return hopThu;
};

/**
 * Gui mot mail. KHONG BAO GIO nem loi ra ngoai.
 *
 * Noi goi la nhung viec nghiep vu that (hoc vien bao da chuyen khoan). Neu mail
 * hong ma keo do ca yeu cau xuong thi hoc vien nhan bao loi trong khi don da
 * duoc danh dau dung - ho se chuyen khoan lai lan nua. Mat tien that vi mot
 * loi gui mail la doi khong dang.
 *
 * Tra ve { daGui, lyDo } de noi goi bao lai cho quan tri biet ma con duong lui.
 */
const guiMail = async ({ tieuDe, chuHtml, chuThuong }) => {
    if (!daCauHinh()) {
        console.warn('guiMail: chua dat MAIL_USER / MAIL_APP_PASSWORD, bo qua:', tieuDe);
        return { daGui: false, lyDo: 'chua_cau_hinh' };
    }

    try {
        await layHopThu().sendMail({
            from: `"aLMS" <${MAIL_USER}>`,
            to: MAIL_ADMIN,
            subject: tieuDe,
            text: chuThuong,
            html: chuHtml
        });
        return { daGui: true, lyDo: '' };
    } catch (loi) {
        console.error('guiMail that bai:', loi.message);
        return { daGui: false, lyDo: loi.message };
    }
};

module.exports = { daCauHinh, guiMail, MAIL_ADMIN };
