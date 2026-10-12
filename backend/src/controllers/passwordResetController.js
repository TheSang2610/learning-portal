// Quen mat khau: gui ma 6 chu so ve hom thu, nhap dung thi cho dat mat khau moi.
//
// ===========================================================================
// HAI NGUYEN TAC CHI PHOI CA FILE NAY
// ===========================================================================
//
// 1. KHONG DUONG NAO DUOC LO "DIA CHI NAY CO TAI KHOAN KHONG"
//
//    Duong quen mat khau la cho de lo nhat trong ca he thong: no nhan vao mot
//    email va ai cung goi duoc, khong can dang nhap. Neu no tra "khong tim
//    thay tai khoan" cho dia chi la va "da gui ma" cho dia chi that thi no
//    chinh la mot cai may tra loi cau hoi "ai la nguoi dung cua he thong nay"
//    - dung cai ma loginUser va registerUser da bo rat nhieu cong de bit lai
//    (doc ghi chu FAKE_HASH o userController.js).
//
//    Vi vay `requestCode` LUON tra ve cung mot cau, cung ma trang thai, trong
//    moi truong hop: email khong ton tai, tai khoan bi khoa, dang trong thoi
//    gian bi chan, hom thu chua cau hinh. Khac biet nam trong HOM THU - noi
//    ke do khong voi toi.
//
// 2. KHONG NOI CON BAO LAU NUA THI MO LAI
//
//    Day la yeu cau cua chu du an, va no CO LY: neu may chu tra ve
//    "thu lai sau 60 phut" thi ke do biet chinh xac luc nao quay lai, va co
//    the hen gio ban tiep - bien mot lan khoa thanh mot khoang nghi co lich.
//    Khong noi thi chi phi cua viec do tang han len.
//
//    Do la ly do duong nay KHONG dat header Retry-After va KHONG tra truong
//    retryAfter, khac han cac lop gioi han khac trong du an
//    (middlewares/rateLimit.js, loginRateLimit.js deu co tra). Dung tuong day
//    la sot ma "sua lai cho dong bo".
//
//    DANH DOI, ghi ra de nguoi doc sau can nhac lai duoc: nguoi dung THAT go
//    nham ba lan se khong hieu vi sao ma dung van bao sai. Bu lai bang mot la
//    thu gui ve hom thu ho - xem composeTooManyFailsMail trong
//    utils/passwordResetMail.js. Thu la duong bao tin duy nhat, va no chi den
//    duoc chu tai khoan that.
//
// ===========================================================================

const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { BCRYPT_ROUNDS } = require('../utils/password');
const { isValidEmail, newPasswordError } = require('../utils/validateInput');
const { normalizeIdentifier, accountFilter } = require('../utils/loginIdentifier');
const { daCauHinh: mailConfigured, sendMail } = require('../config/mail');
const {
    composeResetCodeMail,
    composeTooManyFailsMail,
    composePasswordChangedMail,
} = require('../utils/passwordResetMail');
const { hashToken } = require('../utils/verificationToken');
const { stillLocked, tang: increment, lockAccount, unlock } = require('../utils/rateLimitStore');
const {
    generateCode,
    isValidCode,
    hashCode,
    codeMatches,
    createTicket,
    timeFloor,
    CODE_TTL_MS,
    MAX_WRONG_ATTEMPTS,
    MAX_SENDS,
    LOCK_MS,
} = require('../utils/otpCode');

// Mot cau tra loi duy nhat cho MOI ket cuc cua buoc yeu cau ma. Doc nguyen
// tac 1 o dau file truoc khi doi cau nay.
const SENT_MESSAGE =
    'Nếu địa chỉ này có tài khoản, chúng tôi đã gửi một mã gồm 6 chữ số tới hộp thư của bạn. '
    + 'Mã có hiệu lực trong 10 phút.';

// Mot cau tra loi duy nhat cho MOI ket cuc cua buoc nhap ma: ma sai, ma het
// han, chua tung yeu cau ma, va CA truong hop dang bi khoa. Doc nguyen tac 2.
const WRONG_CODE_MESSAGE = 'Mã không đúng hoặc đã hết hạn.';

// Tien to khoa trong kho dem dung chung (utils/rateLimitStore.js). Thieu tien to
// la hai bo dem khac nhau ghi de len nhau - bi chan o day se keo theo chan
// luon duong dang nhap.
const failKey = (email) => `quenmk:sai:${email}`;
const sendKey = (email) => `quenmk:gui:${email}`;

/**
 * Tim tai khoan tu thu nguoi dung go: dia chi day du HOAC ten tai khoan ngan.
 * Quy tac va cac cai bay o utils/loginIdentifier.js.
 */
const findAccount = async (identifier) => {
    const filter = accountFilter(identifier, isValidEmail);
    if (!filter) return null;
    // Trung tu hai tai khoan tro len -> coi nhu khong tim thay. Xem diem 1
    // trong utils/loginIdentifier.js.
    const khop = await User.find(filter).limit(2);
    return khop.length === 1 ? khop[0] : null;
};

/**
 * Khoa dem cho mot phien quen mat khau.
 *
 * LUON tinh tren dia chi THAT khi tim duoc tai khoan, khong phai tren chuoi
 * nguoi dung go. Neu khong thi "thesang" va "thesang@gmail.com" sinh ra hai
 * bo dem rieng, va ke do ma chi viec doi cach go la co gap doi so lan thu -
 * dung kieu di vong ma bo dem nay sinh ra de chan.
 *
 * Khong tim thay tai khoan thi dem theo chinh chuoi ho go: van phai co bo dem
 * o do, neu khong thi bat ky ai cung goi duong nay vo han bang dia chi bia.
 */
const keyOf = (user, identifier) => (user ? user.email : identifier);

// ---------------------------------------------------------------------------
// Buoc 1: yeu cau ma
// POST /api/users/quen-mat-khau   { email }
// ---------------------------------------------------------------------------
const requestCode = async (req, res) => {
    const start = Date.now();

    // Tra loi giong het nhau o moi nhanh, VA mat thoi gian giong nhau.
    //
    // Gom thanh mot ham de khong the lo tay viet khac di o mot nhanh nao do -
    // va de khong nhanh nao quen san thoi gian. Tra cau giong nhau ma tra o
    // hai toc do khac nhau thi van lo y het: xem timeFloor() trong
    // utils/otpCode.js.
    const commonReply = async () => {
        await timeFloor(start);
        return res.status(202).json({ message: SENT_MESSAGE });
    };

    try {
        // Nhan ca dia chi day du lan ten tai khoan ngan, giong duong dang
        // nhap - bat nguoi da quen mat khau phai nho chinh xac ca dia chi thi
        // vo ly.
        const identifier = normalizeIdentifier(req.body?.email);
        if (!identifier) return await commonReply();

        // Hom thu chua cau hinh (thuong la may dev): khong the gui ma nao ca.
        // console.error chu khong phai warn - tren ban that day la mot su co
        // im lang dung nghia: nguoi dung bam "quen mat khau", nhan duoc cau
        // "da gui", va cho mai mot la thu khong bao gio den.
        if (!mailConfigured()) {
            console.error(
                'quenMatKhau: chua dat MAIL_USER / MAIL_APP_PASSWORD nen khong gui duoc ma nao. '
                + 'Dat hai bien do tren ban deploy.',
            );
            return await commonReply();
        }

        const now = Date.now();

        // Tra cuu TRUOC khi kiem bo dem, vi bo dem phai khoa theo dia chi
        // THAT - xem keyOf() o tren. Tra cuu them mot lan khi dang bi khoa
        // la cai gia phai tra, va no re.
        const user = await findAccount(identifier);
        const course = keyOf(user, identifier);

        // Dang bi khoa vi nhap sai qua nhieu -> khong cap ma moi. Neu cap thi
        // cai khoa thanh vo nghia: cu nhap sai ba lan roi xin ma moi la lai co
        // ba lan nua.
        if (await stillLocked([failKey(course)], now)) return await commonReply();

        // Tran so lan GUI THU, tinh rieng voi tran so lan nhap sai.
        //
        // Khong co tran nay thi bat ky ai cung bien duong nay thanh mot cai
        // may bom thu vao hom thu nguoi khac: goi mot nghin lan la mot nghin
        // la thu. Va hom thu cua du an la mot tai khoan Gmail thuong, chi gui
        // duoc khoang 500 thu mot ngay - tran ca hom thu la MOI nguoi dung
        // khac mat luon thu xac minh dang ky.
        const sendCount = await increment(sendKey(course), LOCK_MS, now);
        if (sendCount.count > MAX_SENDS) {
            // Cham tran gui cung khoa luon duong nhap ma: den day thi phien
            // nay coi nhu khep lai.
            await lockAccount(failKey(course), now + LOCK_MS);
            return await commonReply();
        }

        // Tai khoan khong ton tai, hoac bi quan tri khoa -> khong gui gi, van
        // tra cau chung.
        //
        // Tai khoan CHUA XAC MINH email thi VAN cho dat lai: nhap dung ma la
        // da chung minh so huu hom thu roi, dung bang chung ma buoc xac minh
        // dang doi. Buoc dat lai se bat luon emailVerified = true - giong het
        // cach googleLogin xu ly (xem userController.js).
        //
        // TAI KHOAN KHONG CO EMAIL cung roi vao day, va do la mot han che
        // that chu khong phai loi: dang ky gio chi bat buoc so dien thoai, ma
        // du an CHUA gan nha cung cap SMS nao - khong co cho nao de gui ma.
        //
        // Van tra cau chung nhu moi nhanh khac, khong noi rieng "tai khoan
        // nay khong co email": noi ra la bien duong nay thanh may tra loi cau
        // hoi ai co email ai khong. Giao dien da bao truoc o ngay form rang
        // muon lay lai mat khau thi phai co email trong tai khoan.
        //
        // Khi nao gan duoc SMS thi thay dieu kien nay bang: co email -> gui
        // thu, khong co email nhung co phone -> gui tin nhan.
        if (!user || user.status === false || !user.email) return await commonReply();

        const code = generateCode();

        // Ghi ma vao CSDL TRUOC khi gui thu. Nguoc lai thi co cua so nguoi
        // dung cam ma trong tay ma may chu chua biet ma nao la dung.
        user.resetOtpHash = await hashCode(code);
        user.resetOtpExp = new Date(now + CODE_TTL_MS);
        // Cap ma moi thi phieu cu (neu co) phai chet: nguoc lai mot phieu con
        // song tu phien truoc van dat duoc mat khau.
        user.resetTicketHash = undefined;
        user.resetTicketExp = undefined;
        await user.save();

        // sendMail khong bao gio nem - xem config/mail.js. Mail hong thi nguoi
        // dung van nhan duoc cau tra loi binh thuong, chi la khong co thu.
        await sendMail({
            ...composeResetCodeMail({
                ten: user.name,
                ma: code,
                minutes: Math.round(CODE_TTL_MS / 60000),
            }),
            recipient: user.email,
        });

        return await commonReply();
    } catch (error) {
        console.error('yeuCauMa error:', error.message);
        // Ngay ca loi may chu cung tra cau chung: mot cai 500 o dung nhung dia
        // chi co that cung la mot tin hieu phan biet duoc.
        return await commonReply();
    }
};

// ---------------------------------------------------------------------------
// Buoc 2: nhap ma -> doi lay phieu dat lai
// POST /api/users/quen-mat-khau/kiem-ma   { email, ma }
// ---------------------------------------------------------------------------
const verifyCode = async (req, res) => {
    const start = Date.now();

    // San thoi gian y nhu requestCode. O day chenh lech den tu lan sai THU BA:
    // chi tai khoan CO THAT moi keo theo mot lan ghi CSDL va mot la thu bao,
    // nen neu khong san thi dung lan do lo ra dia chi nay co that.
    const wrongReply = async () => {
        await timeFloor(start);
        return res.status(400).json({ message: WRONG_CODE_MESSAGE });
    };

    try {
        const identifier = normalizeIdentifier(req.body?.email);
        const code = req.body?.ma;

        if (!identifier || !isValidCode(code)) return await wrongReply();

        const now = Date.now();

        // Tra cuu truoc de bo dem khoa theo dia chi THAT - xem keyOf().
        const user = await findAccount(identifier);
        const course = keyOf(user, identifier);

        // Dang bi khoa -> tra ve dung cau "ma khong dung", KHONG noi la bi
        // khoa va KHONG noi con bao lau. Doc nguyen tac 2 o dau file.
        //
        // Tra ve som truoc khi tang bo dem: khong thi moi lan go trong luc bi
        // khoa lai day count len, chang de lam gi.
        if (await stillLocked([failKey(course)], now)) return await wrongReply();

        const correct = await codeMatches(code, user?.resetOtpHash);
        const notExpired = user?.resetOtpExp instanceof Date && user.resetOtpExp.getTime() > now;

        if (!user || !correct || !notExpired) {
            // Dem lan sai. Dem tren EMAIL chu khong phai IP: ke do co proxy
            // thi doi IP sau moi lan thu la thoat duoc bo dem theo IP, trong
            // khi van do dung mot nan nhan. Cung bai hoc voi khoa
            // `dangnhap:email:` trong middlewares/loginRateLimit.js.
            const rec = await increment(failKey(course), LOCK_MS, now);

            if (rec.count >= MAX_WRONG_ATTEMPTS) {
                await lockAccount(failKey(course), now + LOCK_MS);

                // Xoa ma dang cho. Da khoa thi ma cu khong con duong nao dung
                // toi nua; de lai chi la keo dai thoi gian song cua no vo ich.
                if (user) {
                    user.resetOtpHash = undefined;
                    user.resetOtpExp = undefined;
                    await user.save();
                }

                // Gui thu bao - duong duy nhat noi cho chu tai khoan biet vi
                // sao ma dung van bao sai.
                //
                // `rec.count === MAX_WRONG_ATTEMPTS` chu khong phai `>=`: gui
                // DUNG MOT lan, tai dung nhip cham nguong. Neu khong thi moi
                // lan go tiep lai them mot la thu, va bien chinh cai thu canh
                // bao thanh cong cu bom thu.
                if (user && rec.count === MAX_WRONG_ATTEMPTS && mailConfigured()) {
                    await sendMail({
                        ...composeTooManyFailsMail({ ten: user.name }),
                        recipient: user.email,
                    });
                }
            }

            return await wrongReply();
        }

        // Dung ma. TIEU MA NGAY va cap phieu.
        const { phieu: ticket, hash, hetHan: expiresAt } = createTicket(now);
        user.resetOtpHash = undefined;
        user.resetOtpExp = undefined;
        user.resetTicketHash = hash;
        user.resetTicketExp = expiresAt;
        await user.save();

        // Da vao duoc den day thi phien nay coi nhu sach: xoa bo dem lan sai.
        // An toan vi muon toi day phai go dung ma da nhan qua hom thu.
        await Promise.all([unlock(failKey(course)), unlock(sendKey(course))]);

        return res.status(200).json({
            message: 'Mã hợp lệ. Mời bạn đặt mật khẩu mới.',
            phieu: ticket,
        });
    } catch (error) {
        console.error('kiemMa error:', error.message);
        return await wrongReply();
    }
};

// ---------------------------------------------------------------------------
// Buoc 3: dat mat khau moi
// POST /api/users/quen-mat-khau/dat-lai   { phieu, matKhauMoi, xacNhan }
// ---------------------------------------------------------------------------
const resetPassword = async (req, res) => {
    try {
        const ticket = req.body?.phieu;
        const newPassword = req.body?.matKhauMoi;
        const confirm = req.body?.xacNhan;

        if (typeof ticket !== 'string' || !ticket) {
            return res.status(400).json({ message: 'Phiên đặt lại mật khẩu đã hết hạn. Vui lòng bắt đầu lại.' });
        }

        // Kiem mat khau moi TRUOC khi tra cuu phieu: khong co ly do gi de cham
        // CSDL khi mat khau go vao con chua dat yeu cau.
        const passwordError = newPasswordError(newPassword);
        if (passwordError) return res.status(400).json({ message: passwordError });

        // Kiem o ca may chu chu khong chi o giao dien. Giao dien kiem de nguoi
        // dung biet ngay; may chu kiem vi giao dien khong phai duong duy nhat
        // goi toi day duoc.
        if (newPassword !== confirm) {
            return res.status(400).json({ message: 'Hai lần nhập mật khẩu không giống nhau' });
        }

        const now = Date.now();

        // Tra cuu bang BAN BAM. Phieu goc khong bao gio nam trong CSDL.
        const user = await User.findOne({
            resetTicketHash: hashToken(ticket),
            resetTicketExp: { $gt: new Date(now) },
        });

        if (!user) {
            return res.status(400).json({ message: 'Phiên đặt lại mật khẩu đã hết hạn. Vui lòng bắt đầu lại.' });
        }

        // Kiem lai trang thai tai khoan ngay truoc khi ghi: giua luc cap phieu
        // va luc dat lai, quan tri co the vua khoa tai khoan nay.
        if (user.status === false) {
            return res.status(403).json({
                message: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.',
            });
        }

        const salt = await bcrypt.genSalt(BCRYPT_ROUNDS);
        user.password = await bcrypt.hash(newPassword, salt);

        // CAT MOI PHIEN CU. JWT khong thu hoi duoc giua chung, nen neu khong
        // co dong nay thi ke da chiem duoc tai khoan van giu token hop le den
        // khi no tu het han - va nguoi dung that vua doi mat khau xong lai tin
        // rang minh da duoi duoc ho ra. protect() so moc nay voi thoi diem cap
        // token. Xem truong passwordChangedAt trong models/User.js.
        user.passwordChangedAt = new Date();

        // Tieu phieu.
        user.resetTicketHash = undefined;
        user.resetTicketExp = undefined;
        user.resetOtpHash = undefined;
        user.resetOtpExp = undefined;

        // Nhap dung ma gui toi hom thu LA bang chung so huu dia chi email -
        // manh khong kem gi viec bam vao lien ket xac minh. Nen no go luon
        // trang thai "chua xac minh", giong het cach googleLogin xu ly. Neu
        // khong thi nguoi dung dat lai mat khau xong van khong dang nhap
        // duoc, va khong hieu tai sao.
        if (user.emailVerified === false) {
            user.emailVerified = true;
            user.verifyTokenHash = undefined;
            user.verifyTokenExp = undefined;
        }

        await user.save();

        // Xoa sach bo dem cua ca hai duong: dat lai mat khau xong thi khong
        // con ly do gi giu lai lan sai cu.
        await Promise.all([unlock(failKey(user.email)), unlock(sendKey(user.email))]);

        // Bao cho chu hom thu biet mat khau vua bi doi.
        //
        // Day KHONG phai thu lich su. Neu ke tan cong doc trom duoc ma trong
        // hom thu nan nhan thi ho vao duoc tai khoan ma nan nhan hoan toan
        // khong hay biet - cho toi lan sau dang nhap moi phat hien, luc do ke
        // kia da o trong do ca tuan. La thu nay la duong bao dong duy nhat, va
        // no phai bay DUNG luc viec do xay ra.
        //
        // sendMail khong bao gio nem (xem config/mail.js), va co that bai cung
        // khong duoc keo do phan hoi: mat khau DA doi roi, bao cho nguoi dung
        // la "khong doi duoc" thi ho se di doi lan nua bang mot mat khau khac
        // va tu khoa minh trong mo hong.
        if (mailConfigured()) {
            await sendMail({
                ...composePasswordChangedMail({ ten: user.name, at: user.passwordChangedAt }),
                recipient: user.email,
            });
        }

        // KHONG dang nhap luon o day. Bat nguoi dung go lai mat khau vua dat
        // mot lan nua tren man hinh dang nhap la cach re nhat de ho nho no,
        // va de ho phat hien ngay neu vua go nham.
        return res.status(200).json({
            message: 'Đổi mật khẩu thành công. Mời bạn đăng nhập bằng mật khẩu mới.',
        });
    } catch (error) {
        console.error('datLaiMatKhau error:', error.message);
        return res.status(500).json({ message: 'Đã có lỗi xảy ra, vui lòng thử lại' });
    }
};

module.exports = { requestCode, verifyCode, resetPassword };
