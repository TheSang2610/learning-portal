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
            auth: { user: MAIL_USER, pass: MAIL_APP_PASSWORD },

            // Ba moc thoi gian nay quan trong tu khi duong DANG KY phai cho
            // gui mail xong moi tra loi.
            //
            // Mac dinh cua nodemailer la cho rat lau. Tren Vercel, ham co han
            // chay cua no - goi Hobby la 10 giay: neu SMTP treo, Vercel cat ham
            // GIUA CHUNG va nguoi dung khong nhan duoc phan hoi nao ca, trang
            // dang ky dung im. Dat tran ngan hon han do thi truong hop xau nhat
            // tro thanh "guiMail tra ve that bai" - va guiMail nuot loi, nen
            // nguoi dung van nhan duoc cau tra loi binh thuong, chi la khong co
            // thu.
            //
            // Vi sao dung 5-6 giay chu khong phai 8: ca luot dang ky con phai
            // cong bcrypt 12 vong (~0,25s) va vai luot di CSDL. Tong truong hop
            // xau nhat khoang 6,5 giay - van nam gon trong 10 giay, con cho
            // Vercel mot khoang du de tra phan hoi ve.
            //
            // Muon noi rong thi phai nang maxDuration cua ham tren Vercel; o
            // vercel.json hien tai dung cu phap "builds" doi cu, ma cu phap do
            // khong di chung voi khoa "functions" - doi la phai viet lai ca file.
            connectionTimeout: 5000,
            greetingTimeout: 5000,
            socketTimeout: 6000
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
 * `nguoiNhan` de trong thi gui ve hom thu quan tri - do la moi cach dung cu cua
 * ham nay (bao don hang, bao chuyen khoan). Truyen dia chi vao thi gui thang
 * cho NGUOI DUNG: duong xac minh email can dieu do.
 *
 * CAN BIET khi gui cho nguoi dung: hom thu gui la mot tai khoan Gmail thuong
 * dung "app password", nen co tran khoang 500 thu mot ngay va thu de roi vao
 * muc Spam hon la mot dich vu gui mail chuyen dung. Dung duoc cho quy mo hien
 * tai; dong nguoi hon thi phai doi sang dich vu co xac thuc ten mien (SPF /
 * DKIM / DMARC).
 *
 * Tra ve { daGui, lyDo } de noi goi bao lai cho quan tri biet ma con duong lui.
 */
const guiMail = async ({ tieuDe, chuHtml, chuThuong, nguoiNhan }) => {
    if (!daCauHinh()) {
        console.warn('guiMail: chua dat MAIL_USER / MAIL_APP_PASSWORD, bo qua:', tieuDe);
        return { daGui: false, lyDo: 'chua_cau_hinh' };
    }

    try {
        await layHopThu().sendMail({
            from: `"aLMS" <${MAIL_USER}>`,
            to: nguoiNhan || MAIL_ADMIN,
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
