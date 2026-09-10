require('dotenv').config();

const { daCauHinh, guiMail, MAIL_ADMIN } = require('../config/mail');
const { soanMailBaoChuyenKhoan } = require('./mailDonHang');

/**
 * Gui thu mot mail de kiem cau hinh Gmail.
 *
 *     npm run check:mail
 *
 * Co lenh nay de khong phai dat mot don hang that chi de xem mail co thong
 * khong - va de khi mail khong den, biet duoc la sai o buoc nao.
 *
 * KHONG in gia tri MAIL_APP_PASSWORD ra man hinh. Chi bao co hay khong.
 */
const chay = async () => {
    console.log('Kiem tra cau hinh mail');
    console.log('----------------------');
    console.log('MAIL_USER         :', process.env.MAIL_USER || '(chua dat)');
    console.log(
        'MAIL_APP_PASSWORD :',
        process.env.MAIL_APP_PASSWORD ? `(da dat, ${process.env.MAIL_APP_PASSWORD.length} ky tu)` : '(chua dat)'
    );
    console.log('MAIL_ADMIN        :', MAIL_ADMIN || '(chua dat, se gui ve MAIL_USER)');
    console.log('');

    if (!daCauHinh()) {
        console.error('THIEU CAU HINH. Dat MAIL_USER va MAIL_APP_PASSWORD trong .env roi chay lai.');
        console.error('');
        console.error('MAIL_APP_PASSWORD KHONG phai mat khau Gmail thuong. Gmail chan');
        console.error('dang nhap bang mat khau thuong tu 2022. Phai bat xac thuc hai buoc');
        console.error('roi tao "App password" 16 ky tu tai:');
        console.error('  https://myaccount.google.com/apppasswords');
        process.exit(1);
    }

    // Dung dung mau mail that de thu: neu mau co loi cu phap HTML hay thieu
    // truong thi lo ra ngay o day, chu khong doi toi luc co don hang that.
    const mau = soanMailBaoChuyenKhoan({
        maDon: 'THU0000',
        soTien: 799000,
        tenHocVien: 'Mail thu tu he thong',
        emailHocVien: 'khong-phai-don-that@example.com',
        tenKhoa: 'Đây chỉ là mail thử, không có đơn hàng nào',
        baoLuc: new Date(),
        daQuaHan: false,
        duongDanQuanTri: process.env.FRONTEND_URL
            ? `${process.env.FRONTEND_URL.replace(/\/+$/, '')}/admin/orders`
            : ''
    });

    console.log('Dang gui thu toi', MAIL_ADMIN, '...');
    const kq = await guiMail({
        tieuDe: `[aLMS] MAIL THU - ${mau.tieuDe}`,
        chuHtml: mau.chuHtml,
        chuThuong: mau.chuThuong
    });

    if (kq.daGui) {
        console.log('');
        console.log('GUI THANH CONG. Mo hop thu', MAIL_ADMIN, 'de xem.');
        console.log('Khong thay thi kiem ca thu muc Spam.');
        process.exit(0);
    }

    console.error('');
    console.error('GUI THAT BAI:', kq.lyDo);
    console.error('');
    console.error('Hay gap nhat:');
    console.error('  - "Invalid login" -> dung mat khau Gmail thuong thay vi App password');
    console.error('  - "Username and Password not accepted" -> App password sai hoac da bi thu hoi');
    console.error('  - Timeout -> mang chan cong 465/587 ra ngoai');
    process.exit(1);
};

chay().catch((loi) => {
    console.error('Loi khong doan truoc:', loi.message);
    process.exit(1);
});
