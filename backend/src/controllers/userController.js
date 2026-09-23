const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { BCRYPT_ROUNDS, HAN_TOKEN } = require('../utils/password');
const { datCookieToken, xoaCookieToken } = require('../utils/cookieToken');
const jwt = require('jsonwebtoken');
const {
    recordLoginFailure,
    clearLoginAttempts,
    khoaTaiKhoan,
    MAX_FAILS_TAI_KHOAN,
    WINDOW_MS: CUA_SO_DANG_NHAP,
} = require('../middlewares/loginRateLimit');
const { conBiKhoa, ghiNhanSai, xoaKhoa } = require('../utils/rateLimitStore');
const {
    chuanHoaEmail,
    emailHopLe,
    matKhauNhanDuoc,
    loiMatKhauMoi,
    kiemTen,
    kiemPayloadGoogle,
} = require('../utils/validateInput');
const { chuanHoaDinhDanh, boLocTaiKhoan } = require('../utils/loginIdentifier');
const { chuanHoaSoDienThoai } = require('../utils/phoneNumber');
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

// Chuan hoa va kiem dau vao: xem utils/validateInput.js. Truoc day moi ham o
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
        // O dang nhap nhan BA cach go: so dien thoai, dia chi email, va ten
        // tai khoan ngan ("thesang" thay cho "thesang@gmail.com"). Quy tac tra
        // cuu, va cac cai bay cua no, ghi day du o utils/loginIdentifier.js.
        //
        // Truong van ten la `email` de khong pha cac ban giao dien cu dang
        // chay - chi y nghia cua no rong ra.
        const dinhDanh = chuanHoaDinhDanh(req.body?.email);
        const password = req.body?.password;

        // 1. Thieu tham so -> 400. Truoc day password thieu se lam bcrypt.compare
        //    nem loi va tra ve 500 kem thong bao noi bo cua thu vien.
        if (!dinhDanh || !matKhauNhanDuoc(password)) {
            return res.status(400).json({
                message: 'Vui lòng nhập số điện thoại (hoặc email) và mật khẩu'
            });
        }

        // 2. Sai hinh dang thi khong can truy van DB.
        //    Tran do dai cung chan luon duong bom phinh bo dem cua
        //    loginRateLimit - khoa cua no la `ip|email`.
        const boLoc = boLocTaiKhoan(dinhDanh, emailHopLe);
        if (!boLoc) {
            return res.status(400).json({
                message: 'Số điện thoại hoặc email không hợp lệ'
            });
        }

        // Lay toi HAI ban ghi chu khong phai mot.
        //
        // Tra cuu bang ten ngan co the khop nhieu tai khoan - "sang" ung voi
        // ca sang@gmail.com lan sang@yahoo.com. Chon dai mot cai la mot ngay
        // nao do co nguoi dang ky trung phan dau va chu tai khoan cu khong
        // vao duoc nua ma khong ai hieu vi sao. Trung tu hai tro len thi coi
        // nhu khong tim thay - ho van dang nhap duoc bang dia chi day du.
        //
        // Tra cuu bang dia chi day du thi `email` la khoa duy nhat, luon ra
        // toi da mot ban ghi, nen buoc nay khong doi gi.
        const khop = await User.find(boLoc).limit(2);
        const user = khop.length === 1 ? khop[0] : null;

        // 2b. Bo dem theo RIENG tai khoan, tinh tren dia chi THAT.
        //
        //     loginRateLimit chay truoc controller nen no chi thay chuoi
        //     nguoi dung go. Tu khi nhan ca ten ngan, "thesang" va
        //     "thesang@gmail.com" sinh ra hai bo dem rieng - ke do mat khau
        //     doi qua lai giua hai cach go la co gap doi han muc tren cung
        //     mot nan nhan. Den day moi biet dia chi that, nen kiem them mot
        //     lan tren khoa cua chinh no.
        //
        //     Chi lam khi hai chuoi khac nhau: go nguyen dia chi thi khoa nay
        //     TRUNG khoa middleware da kiem, doc lai la thua mot luot CSDL.
        //
        //     LAY email HOAC phone lam danh tinh that. Truoc day chi doc
        //     user.email, va tu khi co tai khoan CHI co so dien thoai thi do
        //     la mot loi that: user.email la undefined, nen moi tai khoan
        //     phone-only deu dung CHUNG mot khoa `ip|undefined` - mot nguoi
        //     go sai nam lan la khoa ca dam.
        const danhTinhThat = user ? (user.email || user.phone || '') : '';
        const khoaThatSu =
            danhTinhThat && danhTinhThat !== dinhDanh ? khoaTaiKhoan(danhTinhThat) : null;

        if (khoaThatSu) {
            const giayCon = await conBiKhoa([khoaThatSu]);
            if (giayCon > 0) {
                res.set('Retry-After', String(giayCon));
                return res.status(429).json({
                    message: `Bạn đã nhập sai quá nhiều lần. Vui lòng thử lại sau ${Math.ceil(giayCon / 60)} phút.`,
                    retryAfter: giayCon,
                });
            }
        }

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
            // Ghi vao ca khoa cua dia chi that (neu ho go ten ngan) - xem 2b.
            await Promise.all([
                recordLoginFailure(req.loginAttemptKey),
                khoaThatSu
                    ? ghiNhanSai(khoaThatSu, MAX_FAILS_TAI_KHOAN, CUA_SO_DANG_NHAP)
                    : Promise.resolve(),
            ]);
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

        // KHONG con buoc "tai khoan chua kich hoat" o day.
        //
        // Cho nay tung chan `user.emailVerified === false`. Bo cung luc voi
        // buoc mo hom thu o registerUser, va PHAI bo - khong phai don dep cho
        // gon.
        //
        // Trong CSDL that dang co nhung tai khoan o trang thai cho: nguoi ta
        // dang ky that, dat mat khau that, roi khong bam lien ket trong thu.
        // Bo buoc gui thu ma giu lai buoc chan nay thi ho khong con duong nao
        // kich hoat nua - khoa vinh vien. Sua hang loat tren CSDL that de don
        // ho qua cung khong phai lua chon.
        //
        // Bo chan o day la ho dang nhap duoc ngay bang mat khau ho da dat.

        // Xoa ca khoa cua dia chi that (neu ho go ten ngan) - xem 2b. An toan
        // vi muon toi day phai go dung mat khau cua chinh tai khoan do.
        await Promise.all([
            clearLoginAttempts(req.loginAttemptKey),
            khoaThatSu ? xoaKhoa(khoaThatSu) : Promise.resolve(),
        ]);

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

    // Kiem noi dung payload: xem kiemPayloadGoogle trong utils/validateInput.js.
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

      // Dang nhap Google thanh cong LA mot bang chung so huu dia chi email,
      // nen danh dau luon vao ban ghi.
      //
      // Khong con cho nao CHAN theo truong nay (buoc xac minh khi dang ky da
      // bo), nhung van ghi de cac ban ghi cu dan ve mot trang thai duy nhat
      // thay vi khi true khi false khi thieu han.
      if (user.emailVerified !== true) {
        user.emailVerified = true;
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

        if (password === undefined || req.body?.name === undefined) {
            return res.status(400).json({ message: 'Vui lòng cung cấp name, số điện thoại và password' });
        }

        // SO DIEN THOAI la thu bat buoc duy nhat de dinh danh.
        //
        // Luu dang chuan 0XXXXXXXXX - xem utils/phoneNumber.js. Khong chuan
        // hoa thi '+84901234567' va '0901234567' thanh hai ban ghi khac nhau
        // trong CSDL, va nguoi dang ky bang cach nay khong dang nhap duoc
        // bang cach kia.
        const phone = chuanHoaSoDienThoai(req.body?.phone);

        if (!phone) {
            return res.status(400).json({
                message: 'Số điện thoại không hợp lệ. Nhập số di động 10 chữ số, ví dụ 0901234567.',
            });
        }

        // EMAIL la tuy chon.
        //
        // Chuoi rong, thieu han, hay kieu du lieu sai deu ve undefined - va
        // phai la undefined chu KHONG phai chuoi rong hay null: chi muc
        // { unique, sparse } cua truong email chi bo qua ban ghi THIEU HAN
        // truong do. Luu '' vao thi tai khoan thu hai khong co email se dam
        // vao tai khoan thu nhat bang loi trung khoa.
        const emailTho = chuanHoaEmail(req.body?.email);
        const email = emailTho || undefined;

        if (email && !emailHopLe(email)) {
            return res.status(400).json({ message: 'Email không hợp lệ' });
        }

        // LO HONG DA VA: ban cu lam thang `password.length < 8` tren gia tri
        // nguoi goi gui len, khong kiem kieu. Voi than request
        // {"password":{"$ne":null}} thi `.length` la `undefined`, va
        // `undefined < 8` la FALSE - qua duoc buoc nay roi di thang toi
        // bcrypt.hash, noi no nem loi va thanh mot 500. loginUser da ep kieu
        // tu truoc, registerUser thi khong: dung kieu lech nhau ma khong ai
        // nhin thay. Nay ca hai dung chung utils/validateInput.js.
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

        // Tra cuu TRUOC roi moi bam.
        //
        // Ban truoc lam nguoc lai - bam trong MOI truong hop, ke ca khi biet
        // chac se khong dung den - de hai truong hop "email con trong" va
        // "email da co" ton thoi gian nhu nhau. Hoi do dang co nghia: ca hai
        // truong hop deu tra ve DUNG MOT cau, nen thoi gian phan hoi la manh
        // moi duy nhat con lai de do xem dia chi nao da dang ky.
        //
        // Gio buoc mo hom thu da bo, va phan hoi noi thang "Email da ton tai".
        // Can bang thoi gian de giau mot thu ma cau tra loi da noi ra thi chi
        // con la 245ms CPU dot khong cong gi - dat tien tren serverless. Xem
        // ghi chu ben duoi ve danh doi nay.
        //
        // loginUser thi VAN giu HASH_GIA: ben do phan hoi khong noi gi ca, nen
        // thoi gian van la manh moi that su.
        //
        // Hoi CA HAI truong trong MOT luot thay vi hai luot noi tiep - va chi
        // hoi email khi nguoi dung co nhap. Khong loc ra thi dieu kien thanh
        // { email: undefined }, ma Mongo hieu do la "email bang null" va se
        // khop bat ky tai khoan nao khong co email.
        const dieuKien = [{ phone }];
        if (email) dieuKien.push({ email });

        const daCo = await User.findOne({ $or: dieuKien }).select('phone email').lean();

        // -------------------------------------------------------------------
        // Dang ky xong la dung nhu tai khoan ngay, khong qua buoc mo hom thu.
        //
        // Truoc day duong nay gui mot la thu kich hoat va tra 202 khong kem
        // danh tinh nao. Muc dich la de duong dang ky thoi tra loi cau hoi
        // "dia chi nay da co tai khoan chua": ca ba nhanh (dia chi con trong /
        // dang cho / da co that) deu tra ve dung mot cau, khac biet nam trong
        // hom thu - noi ke do khong voi toi.
        //
        // DOI LAI DIEU DO, mo hom thu la mot buoc lam nguoi that bo cuoc, va
        // chu du an quyet dinh bo. Email gio chi con dung cho hai viec: doi
        // mat khau va quan tri gui thong bao.
        //
        // HE QUA PHAI BIET: duong dang ky nay lo lai chuyen so dien thoai hay
        // dia chi nao da co tai khoan - go vao la phan biet duoc "da tồn tại"
        // voi dang ky thanh cong. loginUser VAN bit kin phia no (xem HASH_GIA
        // va cac ghi chu o do), nen chi ro ri o day. Day la danh doi da can
        // nhac, khong phai sot.
        // -------------------------------------------------------------------
        if (daCo) {
            // Noi ro TRUONG NAO trung. Bao chung chung "tài khoản đã tồn tại"
            // thi nguoi dien ca hai o khong biet phai sua o nao, va se thu
            // lai bang cach doi dai mot trong hai.
            return res.status(400).json({
                message:
                    daCo.phone === phone
                        ? 'Số điện thoại này đã có tài khoản'
                        : 'Email này đã có tài khoản',
            });
        }

        const salt = await bcrypt.genSalt(BCRYPT_ROUNDS);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            phone,
            // undefined thi Mongoose bo han truong nay khoi ban ghi - dung
            // dieu kien ma chi muc sparse can. Xem ghi chu o tren.
            email,
            password: hashedPassword,
            role: 'student',
            // CHI danh dau khi that su co dia chi.
            //
            // Khong con cho nao CHAN theo truong nay (buoc xac minh da bo),
            // nhung dat true cho mot tai khoan KHONG co email la ghi vao CSDL
            // mot cau vo nghia: "dia chi khong ton tai nay da duoc xac minh".
            // Ai doc sau se tuong da co gi do chung minh.
            ...(email ? { emailVerified: true } : {}),
        });

        datCookieToken(res, generateToken(user._id));

        return res.status(201).json({
            _id: user._id,
            name: user.name,
            phone: user.phone,
            email: user.email,
            role: user.role,
        });
    } catch (error) {
        console.error('registerUser error:', error);

        // Luoi an toan cho truong hop hai nguoi dang ky cung mot so trong
        // cung mot khoanh khac: ca hai cung qua duoc buoc findOne o tren roi
        // moi den create, va chi muc duy nhat moi la thu chan that su.
        //
        // error.keyPattern cho biet chi muc nao bi dam, nen van noi dung
        // truong cho nguoi dung thay vi mot cau chung chung.
        if (error.code === 11000) {
            const truong = Object.keys(error.keyPattern || {})[0];
            return res.status(400).json({
                message:
                    truong === 'phone'
                        ? 'Số điện thoại này đã có tài khoản'
                        : 'Email này đã có tài khoản',
            });
        }

        res.status(500).json({ message: error.message });
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
        // THEM email cho tai khoan chua co - va CHI the, khong cho doi.
        //
        // Dang ky khong bat buoc email nua, nen co tai khoan chi co so dien
        // thoai. Voi ho, email la cach DUY NHAT tu lay lai mat khau (chua gan
        // duoc SMS), ma truoc day trang ca nhan de email o che do chi doc -
        // tuc la ho khong bao gio bat duoc kha nang do len. Day la cho bit lai
        // thieu sot do.
        //
        // VI SAO KHONG CHO DOI EMAIL DA CO: doi email la doi luon dia chi
        // nhan ma dat lai mat khau. Ai muon cuop mot tai khoan dang mo san
        // (may chung, quen dang xuat) chi can doi email sang cua minh roi bam
        // "quen mat khau" - chu that mat tai khoan ma khong can biet mat khau
        // cu. Muon mo duong doi email thi phai kem buoc nhap lai mat khau
        // hien tai VA xac minh dia chi moi, la mot viec rieng.
        if (has('email')) {
            const emailMoi = chuanHoaEmail(req.body.email);

            if (user.email) {
                return res.status(400).json({
                    message: 'Email đã đặt thì không tự đổi được. Vui lòng liên hệ quản trị viên.',
                });
            }

            if (!emailMoi || !emailHopLe(emailMoi)) {
                return res.status(400).json({ message: 'Email không hợp lệ' });
            }

            const emailExists = await User.findOne({
                email: emailMoi,
                _id: { $ne: req.user._id },
            });
            if (emailExists) {
                return res.status(400).json({ message: 'Email đã tồn tại' });
            }

            user.email = emailMoi;
            // Dia chi TU NHAP, chua ai chung minh gi ca. Danh dau false chu
            // khong phai true - khong con cho nao chan theo truong nay, nhung
            // ghi true la ghi vao CSDL mot cau khong dung.
            user.emailVerified = false;
        }

        if (has('phone')) {
            const tho = typeof req.body.phone === 'string' ? req.body.phone.trim() : '';

            if (!tho) {
                // KHONG cho xoa trang so dien thoai nua.
                //
                // Tu khi so dien thoai la thu bat buoc khi dang ky, no cung la
                // cach dang nhap chinh cua nguoi dung moi - va voi tai khoan
                // khong co email thi no la cach dang nhap DUY NHAT. Cho xoa
                // trang la cho nguoi dung tu khoa minh ra ngoai bang mot cu
                // bam nham, khong the tu sua lai.
                //
                // Tai khoan cu chua co so thi van de trong duoc: nhanh nay chi
                // chan viec XOA, khong bat ho phai dien.
                if (user.phone) {
                    return res.status(400).json({
                        message: 'Không thể xóa số điện thoại. Bạn có thể đổi sang số khác.',
                    });
                }
            } else {
                // Chuan hoa TRUOC khi kiem trung va truoc khi luu - xem
                // utils/phoneNumber.js. Ban cu chi kiem hinh dang bang
                // /^[0-9+\s.-]{8,15}$/, nen '+84901234567' va '0901234567'
                // luu thanh hai gia tri khac nhau: chi muc duy nhat khong
                // thay trung, va nguoi dung doi so o day xong thi khong dang
                // nhap duoc bang so nua vi dang luu khac dang tra cuu.
                const phone = chuanHoaSoDienThoai(tho);

                if (!phone) {
                    return res.status(400).json({
                        message: 'Số điện thoại không hợp lệ. Nhập số di động 10 chữ số, ví dụ 0901234567.',
                    });
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
            // sau) dung chung mot ham: xem utils/validateInput.js.
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
    loginUser,
    googleLogin,
    updateUserProfile,
    uploadAvatar,
    getInstructorsByProvider,
    updateUserRole,
    deleteUser
};

