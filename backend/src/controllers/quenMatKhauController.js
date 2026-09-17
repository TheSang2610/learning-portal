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
//    (doc ghi chu HASH_GIA o userController.js).
//
//    Vi vay `yeuCauMa` LUON tra ve cung mot cau, cung ma trang thai, trong
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
//    thu gui ve hom thu ho - xem soanMailSaiQuaNhieu trong
//    utils/mailQuenMatKhau.js. Thu la duong bao tin duy nhat, va no chi den
//    duoc chu tai khoan that.
//
// ===========================================================================

const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { BCRYPT_ROUNDS } = require('../utils/matKhau');
const { emailHopLe, loiMatKhauMoi } = require('../utils/xacThucDauVao');
const { chuanHoaDinhDanh, boLocTaiKhoan } = require('../utils/dinhDanhDangNhap');
const { daCauHinh: mailDaCauHinh, guiMail } = require('../config/mail');
const {
    soanMailMaDatLai,
    soanMailSaiQuaNhieu,
    soanMailDaDoiMatKhau,
} = require('../utils/mailQuenMatKhau');
const { bamToken } = require('../utils/tokenXacMinh');
const { conBiKhoa, tang, datKhoa, xoaKhoa } = require('../utils/khoGioiHan');
const {
    taoMa,
    maHopLe,
    bamMa,
    khopMa,
    taoPhieu,
    sanThoiGian,
    HAN_MA_MS,
    SO_LAN_SAI_TOI_DA,
    SO_LAN_GUI_TOI_DA,
    KHOA_MS,
} = require('../utils/maOtp');

// Mot cau tra loi duy nhat cho MOI ket cuc cua buoc yeu cau ma. Doc nguyen
// tac 1 o dau file truoc khi doi cau nay.
const CAU_DA_GUI =
    'Nếu địa chỉ này có tài khoản, chúng tôi đã gửi một mã gồm 6 chữ số tới hộp thư của bạn. '
    + 'Mã có hiệu lực trong 10 phút.';

// Mot cau tra loi duy nhat cho MOI ket cuc cua buoc nhap ma: ma sai, ma het
// han, chua tung yeu cau ma, va CA truong hop dang bi khoa. Doc nguyen tac 2.
const CAU_MA_SAI = 'Mã không đúng hoặc đã hết hạn.';

// Tien to khoa trong kho dem dung chung (utils/khoGioiHan.js). Thieu tien to
// la hai bo dem khac nhau ghi de len nhau - bi chan o day se keo theo chan
// luon duong dang nhap.
const khoaSai = (email) => `quenmk:sai:${email}`;
const khoaGui = (email) => `quenmk:gui:${email}`;

/**
 * Tim tai khoan tu thu nguoi dung go: dia chi day du HOAC ten tai khoan ngan.
 * Quy tac va cac cai bay o utils/dinhDanhDangNhap.js.
 */
const timTaiKhoan = async (dinhDanh) => {
    const boLoc = boLocTaiKhoan(dinhDanh, emailHopLe);
    if (!boLoc) return null;
    // Trung tu hai tai khoan tro len -> coi nhu khong tim thay. Xem diem 1
    // trong utils/dinhDanhDangNhap.js.
    const khop = await User.find(boLoc).limit(2);
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
const khoaCua = (user, dinhDanh) => (user ? user.email : dinhDanh);

// ---------------------------------------------------------------------------
// Buoc 1: yeu cau ma
// POST /api/users/quen-mat-khau   { email }
// ---------------------------------------------------------------------------
const yeuCauMa = async (req, res) => {
    const batDau = Date.now();

    // Tra loi giong het nhau o moi nhanh, VA mat thoi gian giong nhau.
    //
    // Gom thanh mot ham de khong the lo tay viet khac di o mot nhanh nao do -
    // va de khong nhanh nao quen san thoi gian. Tra cau giong nhau ma tra o
    // hai toc do khac nhau thi van lo y het: xem sanThoiGian() trong
    // utils/maOtp.js.
    const traLoiChung = async () => {
        await sanThoiGian(batDau);
        return res.status(202).json({ message: CAU_DA_GUI });
    };

    try {
        // Nhan ca dia chi day du lan ten tai khoan ngan, giong duong dang
        // nhap - bat nguoi da quen mat khau phai nho chinh xac ca dia chi thi
        // vo ly.
        const dinhDanh = chuanHoaDinhDanh(req.body?.email);
        if (!dinhDanh) return await traLoiChung();

        // Hom thu chua cau hinh (thuong la may dev): khong the gui ma nao ca.
        // console.error chu khong phai warn - tren ban that day la mot su co
        // im lang dung nghia: nguoi dung bam "quen mat khau", nhan duoc cau
        // "da gui", va cho mai mot la thu khong bao gio den.
        if (!mailDaCauHinh()) {
            console.error(
                'quenMatKhau: chua dat MAIL_USER / MAIL_APP_PASSWORD nen khong gui duoc ma nao. '
                + 'Dat hai bien do tren ban deploy.',
            );
            return await traLoiChung();
        }

        const now = Date.now();

        // Tra cuu TRUOC khi kiem bo dem, vi bo dem phai khoa theo dia chi
        // THAT - xem khoaCua() o tren. Tra cuu them mot lan khi dang bi khoa
        // la cai gia phai tra, va no re.
        const user = await timTaiKhoan(dinhDanh);
        const khoa = khoaCua(user, dinhDanh);

        // Dang bi khoa vi nhap sai qua nhieu -> khong cap ma moi. Neu cap thi
        // cai khoa thanh vo nghia: cu nhap sai ba lan roi xin ma moi la lai co
        // ba lan nua.
        if (await conBiKhoa([khoaSai(khoa)], now)) return await traLoiChung();

        // Tran so lan GUI THU, tinh rieng voi tran so lan nhap sai.
        //
        // Khong co tran nay thi bat ky ai cung bien duong nay thanh mot cai
        // may bom thu vao hom thu nguoi khac: goi mot nghin lan la mot nghin
        // la thu. Va hom thu cua du an la mot tai khoan Gmail thuong, chi gui
        // duoc khoang 500 thu mot ngay - tran ca hom thu la MOI nguoi dung
        // khac mat luon thu xac minh dang ky.
        const demGui = await tang(khoaGui(khoa), KHOA_MS, now);
        if (demGui.count > SO_LAN_GUI_TOI_DA) {
            // Cham tran gui cung khoa luon duong nhap ma: den day thi phien
            // nay coi nhu khep lai.
            await datKhoa(khoaSai(khoa), now + KHOA_MS);
            return await traLoiChung();
        }

        // Tai khoan khong ton tai, hoac bi quan tri khoa -> khong gui gi, van
        // tra cau chung.
        //
        // Tai khoan CHUA XAC MINH email thi VAN cho dat lai: nhap dung ma la
        // da chung minh so huu hom thu roi, dung bang chung ma buoc xac minh
        // dang doi. Buoc dat lai se bat luon emailVerified = true - giong het
        // cach googleLogin xu ly (xem userController.js).
        if (!user || user.status === false) return await traLoiChung();

        const ma = taoMa();

        // Ghi ma vao CSDL TRUOC khi gui thu. Nguoc lai thi co cua so nguoi
        // dung cam ma trong tay ma may chu chua biet ma nao la dung.
        user.resetOtpHash = await bamMa(ma);
        user.resetOtpExp = new Date(now + HAN_MA_MS);
        // Cap ma moi thi phieu cu (neu co) phai chet: nguoc lai mot phieu con
        // song tu phien truoc van dat duoc mat khau.
        user.resetTicketHash = undefined;
        user.resetTicketExp = undefined;
        await user.save();

        // guiMail khong bao gio nem - xem config/mail.js. Mail hong thi nguoi
        // dung van nhan duoc cau tra loi binh thuong, chi la khong co thu.
        await guiMail({
            ...soanMailMaDatLai({
                ten: user.name,
                ma,
                soPhut: Math.round(HAN_MA_MS / 60000),
            }),
            nguoiNhan: user.email,
        });

        return await traLoiChung();
    } catch (error) {
        console.error('yeuCauMa error:', error.message);
        // Ngay ca loi may chu cung tra cau chung: mot cai 500 o dung nhung dia
        // chi co that cung la mot tin hieu phan biet duoc.
        return await traLoiChung();
    }
};

// ---------------------------------------------------------------------------
// Buoc 2: nhap ma -> doi lay phieu dat lai
// POST /api/users/quen-mat-khau/kiem-ma   { email, ma }
// ---------------------------------------------------------------------------
const kiemMa = async (req, res) => {
    const batDau = Date.now();

    // San thoi gian y nhu yeuCauMa. O day chenh lech den tu lan sai THU BA:
    // chi tai khoan CO THAT moi keo theo mot lan ghi CSDL va mot la thu bao,
    // nen neu khong san thi dung lan do lo ra dia chi nay co that.
    const traLoiSai = async () => {
        await sanThoiGian(batDau);
        return res.status(400).json({ message: CAU_MA_SAI });
    };

    try {
        const dinhDanh = chuanHoaDinhDanh(req.body?.email);
        const ma = req.body?.ma;

        if (!dinhDanh || !maHopLe(ma)) return await traLoiSai();

        const now = Date.now();

        // Tra cuu truoc de bo dem khoa theo dia chi THAT - xem khoaCua().
        const user = await timTaiKhoan(dinhDanh);
        const khoa = khoaCua(user, dinhDanh);

        // Dang bi khoa -> tra ve dung cau "ma khong dung", KHONG noi la bi
        // khoa va KHONG noi con bao lau. Doc nguyen tac 2 o dau file.
        //
        // Tra ve som truoc khi tang bo dem: khong thi moi lan go trong luc bi
        // khoa lai day count len, chang de lam gi.
        if (await conBiKhoa([khoaSai(khoa)], now)) return await traLoiSai();

        const dung = await khopMa(ma, user?.resetOtpHash);
        const conHan = user?.resetOtpExp instanceof Date && user.resetOtpExp.getTime() > now;

        if (!user || !dung || !conHan) {
            // Dem lan sai. Dem tren EMAIL chu khong phai IP: ke do co proxy
            // thi doi IP sau moi lan thu la thoat duoc bo dem theo IP, trong
            // khi van do dung mot nan nhan. Cung bai hoc voi khoa
            // `dangnhap:email:` trong middlewares/loginRateLimit.js.
            const rec = await tang(khoaSai(khoa), KHOA_MS, now);

            if (rec.count >= SO_LAN_SAI_TOI_DA) {
                await datKhoa(khoaSai(khoa), now + KHOA_MS);

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
                // `rec.count === SO_LAN_SAI_TOI_DA` chu khong phai `>=`: gui
                // DUNG MOT lan, tai dung nhip cham nguong. Neu khong thi moi
                // lan go tiep lai them mot la thu, va bien chinh cai thu canh
                // bao thanh cong cu bom thu.
                if (user && rec.count === SO_LAN_SAI_TOI_DA && mailDaCauHinh()) {
                    await guiMail({
                        ...soanMailSaiQuaNhieu({ ten: user.name }),
                        nguoiNhan: user.email,
                    });
                }
            }

            return await traLoiSai();
        }

        // Dung ma. TIEU MA NGAY va cap phieu.
        const { phieu, bam, hetHan } = taoPhieu(now);
        user.resetOtpHash = undefined;
        user.resetOtpExp = undefined;
        user.resetTicketHash = bam;
        user.resetTicketExp = hetHan;
        await user.save();

        // Da vao duoc den day thi phien nay coi nhu sach: xoa bo dem lan sai.
        // An toan vi muon toi day phai go dung ma da nhan qua hom thu.
        await Promise.all([xoaKhoa(khoaSai(khoa)), xoaKhoa(khoaGui(khoa))]);

        return res.status(200).json({
            message: 'Mã hợp lệ. Mời bạn đặt mật khẩu mới.',
            phieu,
        });
    } catch (error) {
        console.error('kiemMa error:', error.message);
        return await traLoiSai();
    }
};

// ---------------------------------------------------------------------------
// Buoc 3: dat mat khau moi
// POST /api/users/quen-mat-khau/dat-lai   { phieu, matKhauMoi, xacNhan }
// ---------------------------------------------------------------------------
const datLaiMatKhau = async (req, res) => {
    try {
        const phieu = req.body?.phieu;
        const matKhauMoi = req.body?.matKhauMoi;
        const xacNhan = req.body?.xacNhan;

        if (typeof phieu !== 'string' || !phieu) {
            return res.status(400).json({ message: 'Phiên đặt lại mật khẩu đã hết hạn. Vui lòng bắt đầu lại.' });
        }

        // Kiem mat khau moi TRUOC khi tra cuu phieu: khong co ly do gi de cham
        // CSDL khi mat khau go vao con chua dat yeu cau.
        const loiMk = loiMatKhauMoi(matKhauMoi);
        if (loiMk) return res.status(400).json({ message: loiMk });

        // Kiem o ca may chu chu khong chi o giao dien. Giao dien kiem de nguoi
        // dung biet ngay; may chu kiem vi giao dien khong phai duong duy nhat
        // goi toi day duoc.
        if (matKhauMoi !== xacNhan) {
            return res.status(400).json({ message: 'Hai lần nhập mật khẩu không giống nhau' });
        }

        const now = Date.now();

        // Tra cuu bang BAN BAM. Phieu goc khong bao gio nam trong CSDL.
        const user = await User.findOne({
            resetTicketHash: bamToken(phieu),
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
        user.password = await bcrypt.hash(matKhauMoi, salt);

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
        await Promise.all([xoaKhoa(khoaSai(user.email)), xoaKhoa(khoaGui(user.email))]);

        // Bao cho chu hom thu biet mat khau vua bi doi.
        //
        // Day KHONG phai thu lich su. Neu ke tan cong doc trom duoc ma trong
        // hom thu nan nhan thi ho vao duoc tai khoan ma nan nhan hoan toan
        // khong hay biet - cho toi lan sau dang nhap moi phat hien, luc do ke
        // kia da o trong do ca tuan. La thu nay la duong bao dong duy nhat, va
        // no phai bay DUNG luc viec do xay ra.
        //
        // guiMail khong bao gio nem (xem config/mail.js), va co that bai cung
        // khong duoc keo do phan hoi: mat khau DA doi roi, bao cho nguoi dung
        // la "khong doi duoc" thi ho se di doi lan nua bang mot mat khau khac
        // va tu khoa minh trong mo hong.
        if (mailDaCauHinh()) {
            await guiMail({
                ...soanMailDaDoiMatKhau({ ten: user.name, luc: user.passwordChangedAt }),
                nguoiNhan: user.email,
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

module.exports = { yeuCauMa, kiemMa, datLaiMatKhau };
