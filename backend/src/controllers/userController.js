const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { BCRYPT_ROUNDS, HAN_TOKEN } = require('../utils/matKhau');
const { datCookieToken, xoaCookieToken } = require('../utils/cookieToken');
const jwt = require('jsonwebtoken');
const { recordLoginFailure, clearLoginAttempts } = require('../middlewares/loginRateLimit');
const { conBiKhoa, ghiNhanSai, xoaKhoa } = require('../utils/khoGioiHan');
const { daCauHinh: mailDaCauHinh, guiMail } = require('../config/mail');
const { soanMailXacMinh, soanMailDaCoTaiKhoan } = require('../utils/mailXacMinh');
const { taoToken, bamToken, HAN_MS: HAN_TOKEN_XAC_MINH } = require('../utils/tokenXacMinh');
const { lienKetXacMinh, lienKetDangNhap } = require('../utils/diaChiGiaoDien');
const {
    chuanHoaEmail,
    emailHopLe,
    matKhauNhanDuoc,
    loiMatKhauMoi,
    kiemTen,
    kiemPayloadGoogle,
} = require('../utils/xacThucDauVao');
const layCloudinary = require('../config/cloudinary');
const { uploadToCloudinary } = require('../utils/uploadCloud');

// google-auth-library nap mat ~144ms nhung chi mot duong duy nhat can den no
// (dang nhap bang Google). Nap luoi de moi cold start khac khong phai tra
// khoan do. Node co dem module san nen chi lan goi dau tien moi cham.
let googleClient = null;
const layGoogleClient = () => {
  if (!googleClient) {
    const { OAuth2Client } = require('google-auth-library');
    googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }
  return googleClient;
};

// Chuan hoa va kiem dau vao: xem utils/xacThucDauVao.js. Truoc day moi ham o
// file nay tu kiem lay va da lech nhau that - ly do ghi ro o dau file do.

// Hash gia de doi chieu khi KHONG co tai khoan nao khop.
//
// LO HONG DA VA - do thoi gian phan hoi de biet email nao co that:
//
// Ban cu, email khong ton tai thi tra ve ngay, khong cham toi bcrypt (~5ms).
// Email co that thi phai doi bcrypt 12 vong (~245ms). Chenh gan 50 lan - do
// bang dong ho treo tuong cung thay, khong can cong cu gi. Ke tan cong quet
// mot danh sach email la biet chinh xac ai la nguoi dung cua he thong, roi do
// mat khau vao dung nhung nguoi do. Bo dem sai o loginRateLimit khong chan
// duoc kieu nay: moi lan thu deu la mot email khac nhau.
//
// Chuoi duoi la hash bcrypt 12 vong cua mot chuoi ngau nhien 32 byte khong ai
// biet. Doi chieu voi no ton dung bang thoi gian doi chieu that, nen hai truong
// hop khong con phan biet duoc qua thoi gian nua.
const HASH_GIA = '$2b$12$nqNzZcPVRmshfJKx.9XA7.EEeUeY96tTd6ikBm/CddhQrPfG/XsD2';

// Tran cho viec do mat khau HIEN TAI o duong doi mat khau - xem ghi chu tai
// cho dung, trong updateUserProfile.
const MAX_SAI_MAT_KHAU_CU = 5;
const CUA_SO_DOI_MK = 15 * 60 * 1000;

// Tạo Token JWT (hàm tiện ích nội bộ)
//
// Ghim algorithm: khong ghim thi thuat toan nam trong header cua chinh cai
// token duoc gui len - tuc la do BEN GUI chon. Day la ho nha lo hong "alg:
// none" / doi HS-RS. jsonwebtoken v9 da tu chan phan lon, nhung ghim ro rang
// thi khong phu thuoc vao mac dinh cua mot ban thu vien nao ca.
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: HAN_TOKEN,
        algorithm: 'HS256',
    });
};

// @desc    Auth user & get token (Login)
// @route   POST /api/users/login
const loginUser = async (req, res) => {
    try {
        const email = chuanHoaEmail(req.body?.email);
        const password = req.body?.password;

        // 1. Thieu tham so -> 400. Truoc day password thieu se lam bcrypt.compare
        //    nem loi va tra ve 500 kem thong bao noi bo cua thu vien.
        if (!email || !matKhauNhanDuoc(password)) {
            return res.status(400).json({
                message: 'Vui lòng nhập email và mật khẩu'
            });
        }

        // 2. Sai dinh dang hoac qua dai thi khong can truy van DB.
        //    Tran do dai email cung chan luon duong bom phinh bo dem cua
        //    loginRateLimit - khoa cua no la `ip|email`.
        if (!emailHopLe(email)) {
            return res.status(400).json({
                message: 'Email không hợp lệ'
            });
        }

        const user = await User.findOne({ email });

        // 3. LUON doi chieu bcrypt mot lan, ke ca khi khong tim thay tai khoan
        //    hoac tai khoan do dang nhap bang Google (password rong). Xem
        //    HASH_GIA o dau file: khong lam vay thi thoi gian phan hoi to cao
        //    email nao co that trong he thong.
        const isMatch = await bcrypt.compare(password, user?.password || HASH_GIA);

        // 4. Khong ro email, mat khau sai, hay tai khoan chi dang nhap bang
        //    Google - CUNG mot cau tra loi, va deu tinh la mot lan sai.
        //
        //    LO HONG DA VA: ban cu tra rieng "Vui lòng đăng nhập bằng Google"
        //    cho nhanh thu ba. Cau do la mot cai may tra loi cau hoi "email nay
        //    co trong he thong khong" - go bat ky dia chi nao vao la biet ngay,
        //    dung cai ma buoc 3 vua bo cong bit lai. Te hon: nhanh do KHONG goi
        //    recordLoginFailure, nen no khong bi gioi han so lan, do thoai mai.
        //
        //    Nguoi dung Google khong bi ket: nut "Tiếp tục với Google" nam ngay
        //    tren cung form, va giao dien nhac lai loi do sau moi lan sai.
        if (!user || !user.password || !isMatch) {
            await recordLoginFailure(req.loginAttemptKey);
            return res.status(401).json({
                message: 'Email hoặc mật khẩu không đúng'
            });
        }

        // 5. Tai khoan bi admin khoa thi khong duoc cap token.
        //    Kiem tra SAU khi doi chieu mat khau de nguoi la khong do duoc
        //    email nao dang bi khoa.
        if (user.status === false) {
            return res.status(403).json({
                message: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.'
            });
        }

        // 6. Tai khoan dang ky bang mat khau nhung chua bam lien ket trong thu.
        //
        //    So sanh voi `=== false` chu KHONG phai `!user.emailVerified`: moi
        //    tai khoan tao truoc khi co luong xac minh deu khong co truong nay
        //    (undefined), va phep phu dinh se khoa sach ho ra ngoai ngay trong
        //    lan deploy dau. Xem ghi chu tai truong emailVerified o model User.
        //
        //    Buoc nay dat SAU khi da doi chieu mat khau nen no khong lo them
        //    gi: muon nhin thay cau nay thi phai go dung mat khau da roi.
        if (user.emailVerified === false) {
            return res.status(403).json({
                message: 'Tài khoản chưa được kích hoạt. Vui lòng mở email đăng ký và bấm liên kết xác minh.',
                canXacMinh: true,
            });
        }

        await clearLoginAttempts(req.loginAttemptKey);

        // Token di bang cookie httpOnly, KHONG nam trong than phan hoi.
        // De no trong than thi JavaScript cua trang doc duoc, va the la mat
        // dung cai loi ich vua doi sang cookie de co.
        datCookieToken(res, generateToken(user._id));

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        });

    } catch (error) {
        console.error('loginUser error:', error);
        res.status(500).json({
            message: 'Đã có lỗi xảy ra, vui lòng thử lại'
        });
    }
};
const googleLogin = async (req, res) => {
  try {
    // KHONG log req.body o day. No chua req.body.credential - la id token cua
    // Google, dung duoc de mao danh nguoi dung cho toi khi het han. In ra log
    // la nem thang vao noi luu log cua nha cung cap, noi thuong duoc giu lau va
    // nhieu nguoi doc duoc hon la ta tuong.
    // CHI nhan id token cua Google va tu kiem chu ky. Khong co duong nao khac.
    //
    // Ban cu con mot nhanh thu hai: neu than request co `googleId` hoac
    // `email` thi tin luon, khong kiem gi. Do la mot cua hau mo toang - bat ky
    // ai cung chi can:
    //
    //     POST /api/users/google   {"email":"admin@gmail.com"}
    //
    // la nhan ve token admin hop le. Khong mat khau, khong Google, khong gi
    // ca. Moi lop bao ve khac - gioi han so lan dang nhap sai, bcrypt 12 vong,
    // passwordChangedAt, cookie httpOnly - deu bi di vong hoan toan.
    //
    // Nhanh do sinh ra de phuc vu luong doi code phia may chu (Next route
    // app/api/auth/google/token). Nay luong do tra id_token ve trinh duyet va
    // trinh duyet goi thang vao day, nen khong con ly do ton tai.
    if (!req.body.credential) {
      return res.status(400).json({ message: 'Thiếu Google credential' });
    }

    // Chu ky sai / het han / sai audience deu la "khong chung minh duoc danh
    // tinh" -> 401, khong phai 500. De nem thang ra thi khoi catch o duoi tra
    // 500, ma 500 nghia la "may chu hong" - sai han ban chat, va lam nhieu log
    // vi moi lan go token linh tinh deu thanh mot loi may chu.
    let payload;
    try {
      const ticket = await layGoogleClient().verifyIdToken({
        idToken: req.body.credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch {
      return res.status(401).json({ message: 'Google credential không hợp lệ' });
    }

    // Kiem noi dung payload: xem kiemPayloadGoogle trong utils/xacThucDauVao.js.
    //
    // LO HONG DA VA - THIEU email_verified: ban cu chi hoi "payload co email
    // khong" roi lay email do di tim tai khoan va cap token. Google KHONG bao
    // dam moi id_token deu mang email da xac minh - tai khoan Google Workspace
    // do quan tri vien tu tao co the mang email_verified = false. Ai dung duoc
    // mot mien Workspace la tao duoc tai khoan mang dia chi cua nguoi khac,
    // bam "Dang nhap bang Google", va roi thang vao tai khoan cua nan nhan o
    // day - khong can mat khau, khong cham vao bat ky lop bao ve nao khac.
    const kiem = kiemPayloadGoogle(payload);
    if (kiem.loi) {
      return res.status(401).json({ message: kiem.loi });
    }

    const { email, sub, ten: name, anh: picture } = kiem;

    const googleUserExists = await User.findOne({
        googleId: sub
    });

    if (
        googleUserExists &&
        googleUserExists.email !== email
    ) {
        return res.status(400).json({
            message: 'Google account already linked'
        });
    }

    // Find by email first
    let user = await User.findOne({ email });

    if (!user) {
      // Khong luu anh cua Google vao `avatar` - do la duong dan toi may chu cua
      // ho, khong phai anh cua minh.
      //
      // KHONG dat password: mac dinh cua model la chuoi rong, va chuoi rong la
      // dau hieu "tai khoan nay chua tung dat mat khau" ma loginUser va
      // updateUserProfile deu doc. Dat mot chuoi bat ky vao day la pha dau hieu do.
      //
      // googleId: `sub` chu khong phai `sub || ''`. Index cua truong nay la
      // { unique, sparse }, ma sparse CHI bo qua null/undefined - khong bo qua
      // chuoi rong. Voi `|| ''` thi tai khoan Google thu hai roi vao nhanh do se
      // dung khoa trung, va te hon, `User.findOne({ googleId: '' })` sau do se
      // khop nham dung nhung tai khoan do voi nhau. Nay kiemPayloadGoogle da bat
      // buoc co `sub` nen nhanh do khong con ton tai.
      user = await User.create({
        name,
        email,
        avatar: '',
        googleId: sub,
        role: 'student',
        // Google da tu kiem dia chi nay (kiemPayloadGoogle bat buoc
        // email_verified), nen khong phai gui them thu xac minh nao.
        emailVerified: true
      });
    } else {
      // if user exists but doesn't have googleId, attach it (but do not overwrite avatar)
      let phaiLuu = false;

      if ((!user.googleId || user.googleId === '') && sub) {
        user.googleId = sub;
        phaiLuu = true;
      }

      // Dang nhap Google thanh cong LA mot bang chung so huu dia chi email -
      // manh khong kem gi viec bam vao lien ket trong thu. Nen no cung go luon
      // trang thai "chua xac minh": ai dang ky bang mat khau roi khong nhan
      // duoc thu (Gmail bo vao Spam, go nham dia chi hien thi...) van con mot
      // duong vao thay vi ket cung.
      if (user.emailVerified !== true) {
        user.emailVerified = true;
        user.verifyTokenHash = undefined;
        user.verifyTokenExp = undefined;
        phaiLuu = true;
      }

      if (phaiLuu) await user.save();
    }

    // Tai khoan bi admin khoa thi khong cap token, ke ca dang nhap qua Google
    if (user.status === false) {
      return res.status(403).json({
        message: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.'
      });
    }

    // build response user object: include googlePicture in response, but NOT saved to DB
    const responseUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar || '',            // DB avatar (empty until upload)
      googlePicture: picture || '',         // temporary picture from Google (not persisted)
    };

    datCookieToken(res, generateToken(user._id));

    res.json(responseUser);

  } catch (error) {
    console.error('googleLogin error:', error);
    res.status(500).json({ message: error.message });
  }
};
// @desc    Dang xuat - xoa cookie token
// @route   POST /api/users/logout
//
// Phai co duong nay o phia may chu: cookie httpOnly thi JavaScript khong xoa
// duoc, nen truoc day chi can localStorage.removeItem la xong, gio thi khong.
//
// KHONG dat protect() o day: nguoi dung phai dang xuat duoc ca khi token da
// het han hoac da hong. Bat dang nhap moi cho dang xuat la vo ly, va se de lai
// cookie chet trong trinh duyet.
const logoutUser = (req, res) => {
    xoaCookieToken(res);
    res.json({ message: 'Đã đăng xuất' });
};

// @desc    Register a new user (Cập nhật từ hàm createUser của bạn)
// @route   POST /api/users
const registerUser = async (req, res) => {
    try {
        const password = req.body?.password;
        // Luu email dang chu thuong cho khop voi luc dang nhap
        const email = chuanHoaEmail(req.body?.email);

        if (!email || password === undefined || req.body?.name === undefined) {
            return res.status(400).json({ message: 'Vui lòng cung cấp name, email và password' });
        }

        if (!emailHopLe(email)) {
            return res.status(400).json({ message: 'Email không hợp lệ' });
        }

        // LO HONG DA VA: ban cu lam thang `password.length < 8` tren gia tri
        // nguoi goi gui len, khong kiem kieu. Voi than request
        // {"password":{"$ne":null}} thi `.length` la `undefined`, va
        // `undefined < 8` la FALSE - qua duoc buoc nay roi di thang toi
        // bcrypt.hash, noi no nem loi va thanh mot 500. loginUser da ep kieu
        // tu truoc, registerUser thi khong: dung kieu lech nhau ma khong ai
        // nhin thay. Nay ca hai dung chung utils/xacThucDauVao.js.
        const loiMk = loiMatKhauMoi(password);
        if (loiMk) {
            return res.status(400).json({ message: loiMk });
        }

        // Ten cung phai kiem kieu va do dai. Truoc day chi kiem "co gia tri
        // khong", nen mot doi tuong hay mot chuoi 1MB deu di thang vao CSDL -
        // trong khi updateUserProfile lai chan o 2..50 ky tu, tuc la dang ky
        // duoc cai ten ma sau do khong bao gio sua lai duoc.
        const kqTen = kiemTen(req.body.name);
        if (kqTen.loi) {
            return res.status(400).json({ message: kqTen.loi });
        }
        const name = kqTen.ten;

        // Bam mat khau TRUOC khi tra cuu, va bam trong MOI truong hop - ke ca
        // khi biet chac se khong dung den.
        //
        // Day la cung mot bai hoc voi HASH_GIA o loginUser: bcrypt 12 vong ton
        // ~245ms, con mot lan tra cuu email ton vai mili giay. Neu chi bam khi
        // email con trong thi hai truong hop lech nhau gan 50 lan ve thoi gian
        // phan hoi, va thoi gian do to cao dia chi nao da co tai khoan - dung
        // cai ma toan bo phan duoi day dang bo cong bit lai.
        const salt = await bcrypt.genSalt(BCRYPT_ROUNDS);
        const hashedPassword = await bcrypt.hash(password, salt);

        const userExists = await User.findOne({ email });

        // -------------------------------------------------------------------
        // Che do KHONG CO HOM THU (thuong la may dev): giu nguyen hanh vi cu.
        //
        // Khong co mail thi khong ai kich hoat duoc tai khoan, tuc la bat che
        // do xac minh o day se lam khong ai dang ky duoc nua. Doi lay dieu do
        // la duong dang ky lo lai chuyen "email nay da ton tai chua" - chap
        // nhan duoc tren may dev, KHONG chap nhan duoc tren ban that, nen ghi
        // console.error (khong phai warn) de no noi bat trong log production.
        // -------------------------------------------------------------------
        if (!mailDaCauHinh()) {
            console.error(
                'registerUser: chua dat MAIL_USER / MAIL_APP_PASSWORD nen phai bo qua buoc xac minh email. '
                + 'Tren ban chay that, dat hai bien nay de dong kenh do email.',
            );

            if (userExists) {
                return res.status(400).json({ message: 'User đã tồn tại' });
            }

            const user = await User.create({
                name,
                email,
                password: hashedPassword,
                role: 'student',
                emailVerified: true,
            });

            datCookieToken(res, generateToken(user._id));

            return res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            });
        }

        // -------------------------------------------------------------------
        // Che do co hom thu: BA nhanh, MOT cau tra loi.
        //
        // LO HONG DA VA - do xem dia chi nao da dang ky:
        //
        // Ban cu tra "User da ton tai" cho email da co va 201 kem cookie cho
        // email con trong. Go bat ky dia chi nao vao la biet ngay no co trong
        // he thong hay khong - dung cai may tra loi ma loginUser da bo cong
        // bit lai o tren.
        //
        // Va khong the vua tra loi kin vua dang nhap thang: chi can "im lang
        // bo qua khi email da ton tai" thoi la van do duoc, bang cach dang ky
        // roi thu dang nhap ngay bang chinh mat khau vua dat - vao duoc nghia
        // la dia chi con trong. Nen tai khoan moi BAT BUOC phai qua mot buoc
        // ma chi chu hom thu lam duoc.
        //
        // Ba nhanh duoi day khac nhau o viec lam gi, nhung deu ket thuc bang
        // mot la thu va DUNG MOT cau tra ve. Khac biet nam trong hom thu -
        // noi ke do khong voi toi.
        // -------------------------------------------------------------------
        const { token, bam, hetHan } = taoToken();
        let mail;

        if (!userExists) {
            // Nhanh 1: dia chi con trong -> tao tai khoan o trang thai cho.
            const user = await User.create({
                name,
                email,
                password: hashedPassword,
                role: 'student',
                emailVerified: false,
                verifyTokenHash: bam,
                verifyTokenExp: hetHan,
            });

            mail = soanMailXacMinh({
                ten: user.name,
                lienKet: lienKetXacMinh(token),
                soGio: Math.round(HAN_TOKEN_XAC_MINH / 3600000),
            });
        } else if (userExists.emailVerified === false) {
            // Nhanh 2: da co mot ban dang ky nhung CHUA AI kich hoat.
            //
            // Cho dat lai va gui lai lien ket. Nghe nhu de dai, nhung mot tai
            // khoan chua xac minh thi chua ai chung minh duoc no la cua minh,
            // nen khong co gi de bao ve. Nguoc lai, KHONG cho dang ky lai moi
            // la lo: ke tan cong chi can dang ky truoc bang dia chi cua nguoi
            // khac la chiem cho vinh vien, chu that khong bao gio vao duoc nua.
            userExists.name = name;
            userExists.password = hashedPassword;
            userExists.verifyTokenHash = bam;
            userExists.verifyTokenExp = hetHan;
            await userExists.save();

            mail = soanMailXacMinh({
                ten: userExists.name,
                lienKet: lienKetXacMinh(token),
                soGio: Math.round(HAN_TOKEN_XAC_MINH / 3600000),
            });
        } else {
            // Nhanh 3: dia chi DA co tai khoan that.
            //
            // Khong dung toi ban ghi, khong gui lien ket kich hoat nao - nguoi
            // gui yeu cau nay chua chac la chu tai khoan. Chi bao cho chu dia
            // chi biet co nguoi vua thu dang ky bang email cua ho.
            mail = soanMailDaCoTaiKhoan({ lienKetDangNhap: lienKetDangNhap() });
        }

        // Cho gui xong roi moi tra ve, o CA BA nhanh.
        //
        // Hai ly do. Mot: tren serverless, container co the bi dong bang ngay
        // sau khi phan hoi di - viec chua await xong la viec khong bao gio
        // chay. Hai: gui mail la phan ton thoi gian nhat cua ca ham, nen ba
        // nhanh cung cho no thi thoi gian phan hoi cua chung khong con phan
        // biet duoc.
        //
        // guiMail khong bao gio nem loi (xem config/mail.js). Gui hong thi
        // van tra ve cung cau do - bao "khong gui duoc" cung la mot cach tra
        // loi cau hoi dia chi nay co ton tai khong.
        await guiMail({ ...mail, nguoiNhan: email });

        return res.status(202).json({
            message: 'Chúng tôi đã gửi một email tới địa chỉ này. Vui lòng mở thư để hoàn tất đăng ký (nhớ xem cả mục Spam).',
            canXacMinh: true,
        });
    } catch (error) {
        console.error('registerUser error:', error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Email đã tồn tại' });
        }
        res.status(500).json({ message: error.message });
    }
};

// @desc    Kich hoat tai khoan bang token trong email
// @route   POST /api/users/verify-email
//
// Token la 32 byte ngau nhien nen khong do duoc; trong CSDL chi co ban bam cua
// no. Xem utils/tokenXacMinh.js.
const verifyEmail = async (req, res) => {
    try {
        const token = String(req.body?.token || '').trim();
        if (!token) {
            return res.status(400).json({ message: 'Thiếu mã xác minh' });
        }

        // Tra cuu theo ban bam, va bat buoc con han ngay trong cau truy van -
        // de quen dieu kien thoi han o day la mot lien ket cu van dung mai.
        const user = await User.findOne({
            verifyTokenHash: bamToken(token),
            verifyTokenExp: { $gt: new Date() },
        });

        if (!user) {
            return res.status(400).json({
                message: 'Liên kết xác minh không hợp lệ hoặc đã hết hạn. Hãy đăng ký lại để nhận liên kết mới.',
            });
        }

        // Tai khoan bi admin khoa thi khong cap token, y het loginUser.
        if (user.status === false) {
            return res.status(403).json({
                message: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.',
            });
        }

        user.emailVerified = true;
        // Xoa token: mot lien ket chi dung duoc dung mot lan. Con de lai thi
        // ai doc duoc la thu do sau nay - hom thu bi chiem, may dung chung -
        // van vao duoc tai khoan.
        user.verifyTokenHash = undefined;
        user.verifyTokenExp = undefined;
        await user.save();

        // Bam vao lien ket la da chung minh so huu hom thu, nen dang nhap luon
        // cho nguoi dung do phai go lai mat khau.
        datCookieToken(res, generateToken(user._id));

        return res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        });
    } catch (error) {
        console.error('verifyEmail error:', error);
        res.status(500).json({ message: 'Đã có lỗi xảy ra, vui lòng thử lại' });
    }
};

// @desc    Update user role (admin only)
// @route   PUT /api/users/:id/role
const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        const validRoles = ['student', 'instructor'];

        if (!role || !validRoles.includes(role)) {
            return res.status(400).json({ message: 'Vai trò không hợp lệ' });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User không tìm thấy' });
        }

        user.role = role;
        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
const updateUserProfile = async (req, res) => {
    try {
        // protect() da bo password khoi req.user, nen phai lay lai ban ghi day du
        // thi moi so sanh duoc mat khau cu.
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User không tìm thấy' });
        }

        const has = (k) => Object.prototype.hasOwnProperty.call(req.body, k);

        // --- Ten hien thi ---
        if (has('name')) {
            const name = String(req.body.name || '').trim();
            if (name.length < 2) {
                return res.status(400).json({ message: 'Tên hiển thị phải có ít nhất 2 ký tự' });
            }
            if (name.length > 50) {
                return res.status(400).json({ message: 'Tên hiển thị tối đa 50 ký tự' });
            }
            user.name = name;
        }

        // --- So dien thoai ---
        // Index cua truong phone la { unique, sparse }. Sparse chi bo qua null/undefined,
        // KHONG bo qua chuoi rong: neu de '' thi nguoi thu hai xoa so se dinh loi trung khoa.
        // Vi vay xoa so = undefined chu khong phai ''.
        if (has('phone')) {
            const phone = String(req.body.phone || '').trim();

            if (!phone) {
                user.phone = undefined;
            } else {
                if (!/^[0-9+\s.-]{8,15}$/.test(phone)) {
                    return res.status(400).json({ message: 'Số điện thoại không hợp lệ' });
                }
                const phoneExists = await User.findOne({
                    phone,
                    _id: { $ne: req.user._id }
                });
                if (phoneExists) {
                    return res.status(400).json({ message: 'Số điện thoại đã tồn tại' });
                }
                user.phone = phone;
            }
        }

        // --- Cac truong van ban tu do ---
        // Dung hasOwnProperty chu khong dung (a || b): voi (a || b) thi gui chuoi rong
        // se roi vao nhanh "giu gia tri cu" -> khong bao gio xoa duoc bio/fullname.
        if (has('fullname')) user.fullname = String(req.body.fullname || '').trim().slice(0, 100);
        if (has('bio')) user.bio = String(req.body.bio || '').trim().slice(0, 500);
        // --- Anh dai dien dat bang duong dan ---
        if (has('avatar')) {
            const moi = String(req.body.avatar || '').trim();
            // Bo anh cu da tai len de khong de lai file rac tren Cloudinary.
            // Xoa hong thi ke, khong duoc chan viec luu ho so cua nguoi dung.
            if (user.avatarPublicId && moi !== user.avatar) {
                await xoaAnhCu(user.avatarPublicId);
                user.avatarPublicId = '';
            }
            user.avatar = moi;
        }

        if (has('birthday')) {
            if (!req.body.birthday) {
                user.birthday = undefined;
            } else {
                const d = new Date(req.body.birthday);
                if (Number.isNaN(d.getTime())) {
                    return res.status(400).json({ message: 'Ngày sinh không hợp lệ' });
                }
                if (d > new Date()) {
                    return res.status(400).json({ message: 'Ngày sinh không thể ở tương lai' });
                }
                user.birthday = d;
            }
        }

        // 🎯 ĐẶC BIỆT: Nếu là Instructor, cho phép tự cập nhật/chọn Trường/Doanh nghiệp chủ quản
        if (user.role === 'instructor' && has('provider')) {
            user.provider = req.body.provider || null;
        }

        // --- Doi mat khau ---
        if (req.body.password) {
            const newPassword = req.body.password;

            // Truoc day cho nay chan o 6 ky tu nhung cau bao loi lai chen
            // DAI_MAT_KHAU_TOI_THIEU (8) vao: mat khau 6-7 ky tu duoc nhan, con
            // nguoi doc code thi tin la 8. Dang ky chan 8, doi mat khau chan 6 -
            // tuc la duong doi mat khau la mot cach hop le de ha do manh cua mat
            // khau xuong duoi nguong cua chinh he thong nay.
            //
            // Nay ca ba duong (dang ky, doi mat khau, va bat cu duong nao them
            // sau) dung chung mot ham: xem utils/xacThucDauVao.js.
            const loiMk = loiMatKhauMoi(newPassword);
            if (loiMk) {
                return res.status(400).json({ message: loiMk.replace('Mật khẩu', 'Mật khẩu mới') });
            }

            // Tai khoan dang nhap bang Google chua tung dat mat khau -> cho dat lan dau
            // ma khong can mat khau cu. Con lai BAT BUOC xac minh mat khau hien tai:
            // khong co buoc nay thi bat ky ai muon duoc token (may dung chung, XSS,
            // token chua het han) deu doi duoc mat khau va chiem han tai khoan.
            if (user.password) {
                const currentPassword = req.body.currentPassword;
                if (!matKhauNhanDuoc(currentPassword)) {
                    return res.status(400).json({ message: 'Vui lòng nhập mật khẩu hiện tại' });
                }

                // Do mat khau cu o day cung phai bi dem, y het duong dang nhap.
                //
                // LO HONG DA VA: duong nay chi co protect() chan, khong co lop
                // dem nao - ai cam duoc mot phien hop le (may dung chung, may
                // khong khoa man hinh, token muon duoc) la do `currentPassword`
                // khong gioi han so lan. Khac biet quan trong: doi duoc mat khau
                // la chiem VINH VIEN, vi buoc luu ben duoi day passwordChangedAt
                // len va da chu that mat quyen vao; con muon mot phien thi chi
                // dung duoc toi luc token het han.
                //
                // Dem theo _id chu khong theo IP: nan nhan la mot tai khoan cu
                // the, va ke tan cong o ngay tren may cua ho thi IP trung nhau
                // khong noi len dieu gi.
                const khoaDoiMk = `doimk:${user._id}`;
                const giayCon = await conBiKhoa([khoaDoiMk]);
                if (giayCon > 0) {
                    res.set('Retry-After', String(giayCon));
                    return res.status(429).json({
                        message: `Bạn đã nhập sai mật khẩu hiện tại quá nhiều lần. Vui lòng thử lại sau ${Math.ceil(giayCon / 60)} phút.`,
                        retryAfter: giayCon,
                    });
                }

                const ok = await bcrypt.compare(currentPassword, user.password);
                if (!ok) {
                    await ghiNhanSai(khoaDoiMk, MAX_SAI_MAT_KHAU_CU, CUA_SO_DOI_MK);
                    return res.status(401).json({ message: 'Mật khẩu hiện tại không đúng' });
                }

                // Nhap dung thi xoa bo dem: nguoi that go nham vai lan roi nho
                // ra khong bi keo theo han muc cu.
                await xoaKhoa(khoaDoiMk);

                if (await bcrypt.compare(newPassword, user.password)) {
                    return res.status(400).json({ message: 'Mật khẩu mới phải khác mật khẩu hiện tại' });
                }
            }

            const salt = await bcrypt.genSalt(BCRYPT_ROUNDS);
            user.password = await bcrypt.hash(newPassword, salt);

            // Vo hieu hoa moi token da cap truoc thoi diem nay - xem ghi chu o
            // model User va o protect(). Lui lai 1 giay vi truong iat cua JWT
            // chi tinh den giay: khong lui thi chinh token vua cap trong cung
            // giay do cung co the bi tu choi.
            user.passwordChangedAt = new Date(Date.now() - 1000);
        }

        await user.save();

        // Tra ve ban ghi day du (tru password). Ban cu chi tra 7 truong nen frontend
        // gop ket qua vao localStorage se lam mat avatar / bio / phone.
        const fresh = await User.findById(user._id)
            .populate('provider', 'name logo');

        const out = fresh.toObject();
        out.hasPassword = Boolean(out.password);
        delete out.password;

        res.json(out);
    } catch (error) {
        console.error('updateUserProfile error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Nguoi dung tu vo hieu hoa tai khoan cua minh
// @route   PUT /api/users/deactivate
const deactivateMyAccount = async (req, res) => {
    try {
        // Khoa admin cuoi cung lai thi khong con ai mo khoa duoc cho ai nua.
        if (req.user.role === 'admin') {
            return res.status(400).json({
                message: 'Tài khoản admin không thể tự vô hiệu hóa'
            });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User không tìm thấy' });
        }

        // Yeu cau nhap lai mat khau: nut nay lam nguoi dung mat quyen truy cap
        // va chi admin moi mo lai duoc, nen phai chac chan la chinh chu.
        if (user.password) {
            if (!matKhauNhanDuoc(req.body.password)) {
                return res.status(400).json({ message: 'Vui lòng nhập mật khẩu để xác nhận' });
            }
            const ok = await bcrypt.compare(req.body.password, user.password);
            if (!ok) {
                return res.status(401).json({ message: 'Mật khẩu không đúng' });
            }
        }

        user.status = false;
        await user.save();

        res.json({ message: 'Tài khoản đã được vô hiệu hóa' });
    } catch (error) {
        console.error('deactivateMyAccount error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get instructors filtered by Provider (Phục vụ Admin khi tạo khóa học)
// @route   GET /api/users/instructors
const getInstructorsByProvider = async (req, res) => {
    try {
        const { providerId } = req.query;
        let filter = { role: 'instructor' };
        
        if (providerId) {
            filter.provider = providerId;
        }

        const instructors = await User.find(filter).select('name email fullname provider');
        res.json(instructors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            await user.deleteOne();
            res.json({ message: 'User đã bị xóa' });
        } else {
            res.status(404).json({ message: 'User không tìm thấy' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all users
// @route   GET /api/users
const getUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ---------------------------------------------------------------------------
// Anh dai dien tai tu may len
// ---------------------------------------------------------------------------

// Xoa mot anh da tai len. Khong bao gio nem loi ra ngoai: xoa anh cu that bai
// khong phai ly do de tu choi luu anh moi cua nguoi dung.
const xoaAnhCu = async (publicId) => {
    if (!publicId) return;
    try {
        await layCloudinary().uploader.destroy(publicId, { invalidate: true });
    } catch (e) {
        console.error('Khong xoa duoc anh dai dien cu:', publicId, e.message);
    }
};

// Cloudinary chua cau hinh thi upload nem loi kho hieu tan sau. Kiem o day de
// tra ve dung nguyen nhan, giong cach lam o documentController.
const cloudinaryReady = () => {
    const c = layCloudinary().config();
    return Boolean(c.cloud_name && c.api_key && c.api_secret);
};

// @desc    Tai anh dai dien tu may len
// @route   POST /api/users/profile/avatar
const uploadAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Vui lòng chọn một tấm ảnh' });
        }

        if (!cloudinaryReady()) {
            return res.status(503).json({
                message:
                    'Máy chủ chưa cấu hình Cloudinary nên chưa nhận được ảnh tải lên. ' +
                    'Cần đặt CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY và ' +
                    'CLOUDINARY_API_SECRET trong backend/.env. ' +
                    'Trong lúc chờ, bạn vẫn dán được đường dẫn ảnh.',
            });
        }

        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User không tìm thấy' });

        const anhCu = user.avatarPublicId;

        // Cat vuong quanh khuon mat va ep ve 400x400 ngay tren Cloudinary.
        // Lam o day chu khong phai o trinh duyet: anh 4000px chup bang dien
        // thoai ma de nguyen thi moi lan hien avatar 28px deu tai ve vai MB.
        const ketQua = await uploadToCloudinary(req.file.buffer, 'image', {
            folder: 'learning-portal/avatars',
            public_id: `avatar-${user._id}-${Date.now()}`,
            use_filename: false,
            unique_filename: false,
            transformation: [
                { width: 400, height: 400, crop: 'fill', gravity: 'face' },
                { quality: 'auto', fetch_format: 'auto' },
            ],
        });

        user.avatar = ketQua.secure_url;
        user.avatarPublicId = ketQua.public_id;
        await user.save();

        // Anh cu xoa SAU khi da luu anh moi: doi lai thi upload hong se lam
        // nguoi dung mat luon anh dang co.
        await xoaAnhCu(anhCu);

        const fresh = await User.findById(user._id).populate('provider', 'name logo');
        const out = fresh.toObject();
        out.hasPassword = Boolean(out.password);
        delete out.password;

        res.json(out);
    } catch (error) {
        console.error('uploadAvatar error:', error);
        res.status(500).json({ message: error.message || 'Không tải được ảnh lên' });
    }
};

module.exports = {
    deactivateMyAccount,
    logoutUser,
    getUsers,
    registerUser,
    verifyEmail,
    loginUser,
    googleLogin,
    updateUserProfile,
    uploadAvatar,
    getInstructorsByProvider,
    updateUserRole,
    deleteUser
};

