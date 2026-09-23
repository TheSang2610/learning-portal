const CoinTopUp = require('../models/CoinTopUp');
const User = require('../models/User');
const { congCoin } = require('../utils/coinWallet');
const { coinRaDong, kiemSoCoinNap } = require('../utils/coin');
const { thongTinChuyenKhoan } = require('../config/payment');
const { phanTrang } = require('../utils/queryParams');
const { guiMail, daCauHinh: mailDaCauHinh } = require('../config/mail');
const { soanMailBaoNapCoin } = require('../utils/coinTopUpMail');

/**
 * Nap coin cho hoc vien: dat yeu cau -> chuyen khoan -> ngan hang bao co ->
 * coin duoc cong ngay.
 *
 * Truoc day chi quan tri moi bo coin vao vi duoc, hoc vien khong co cho nao tu
 * nap. Luong o day lam giong het luong mua khoa hoc de nguoi dung khong phai
 * hoc them mot cach thao tac moi.
 *
 * Phan CONG COIN TU DONG nam o controllers/bankWebhookController.js. Cac
 * ham xac nhan/tu choi trong tep nay la duong tay, chi dung cho nhung khoan
 * webhook khong tu khop duoc.
 */

const { sinhMa, HAN_GIU_MS } = CoinTopUp;
const SO_LAN_THU = 5;

/**
 * Tao yeu cau, thu lai khi trung ma.
 *
 * Ma chi dai 4 ky tu nen dung tram yeu cau la bat dau co kha nang trung. Bat
 * dung loi 11000 cua MongoDB roi sinh ma khac, thay vi tra loi ve cho nguoi
 * dung - ho khong lam gi duoc voi thong bao "trung ma".
 */
const taoVoiMaDuyNhat = async (duLieu) => {
    for (let lan = 0; lan < SO_LAN_THU; lan += 1) {
        try {
            return await CoinTopUp.create({ ...duLieu, code: sinhMa() });
        } catch (loi) {
            const trungMa = loi?.code === 11000 && loi?.keyPattern?.code;
            if (!trungMa || lan === SO_LAN_THU - 1) throw loi;
        }
    }
    return null;
};

const dangYeuCau = (yc) => ({
    code: yc.code,
    status: yc.status,
    soCoin: yc.soCoin,
    amount: yc.amount,
    expiresAt: yc.expiresAt,
    secondsLeft: Math.max(
        0,
        Math.ceil((new Date(yc.expiresAt).getTime() - Date.now()) / 1000)
    ),
    paidAt: yc.paidAt,
    daBaoChuyenKhoanLuc: yc.daBaoChuyenKhoanLuc,
    createdAt: yc.createdAt,
    // Chi sinh QR khi con cho tien ve. Yeu cau da xong hoac da huy ma van hien
    // ma QR thi se co nguoi chuyen them mot lan nua.
    chuyenKhoan: yc.status === 'pending'
        ? thongTinChuyenKhoan({ soTien: yc.amount, noiDung: yc.code })
        : null
});

/** Qua han thi day sang 'expired' ngay luc doc, khong can tac vu nen. */
const capNhatNeuHetHan = async (yc) => {
    if (yc && yc.daHetHan()) {
        yc.status = 'expired';
        await yc.save();
    }
    return yc;
};

/**
 * POST /api/coin/nap - hoc vien dat yeu cau nap coin.
 */
const taoYeuCauNap = async (req, res) => {
    try {
        const kiem = kiemSoCoinNap(req.body?.soCoin);
        if (!kiem.hopLe) {
            return res.status(400).json({ message: kiem.loi });
        }
        // kiemSoCoinNap cho phep so am vi quan tri con dung no de THU HOI coin.
        // Hoc vien tu nap thi khong the nap so am - khong chan o day thi nap
        // "-500" se sinh ra mot yeu cau am va lam hong so du khi xac nhan.
        if (kiem.so <= 0) {
            return res.status(400).json({ message: 'Số coin nạp phải lớn hơn 0' });
        }

        // Moi lan bam "Tao yeu cau" la mot ma MOI. Truoc day cho nay tra lai
        // dung yeu cau dang cho, nen reload hay bam back xong van thay ma cu -
        // chu du an muon nguoc lai: roi khoi trang la mat ma, phai tao lai.
        //
        // Nhung yeu cau cu KHONG bi huy, chi danh dau 'abandoned' va van song
        // toi het han 15 phut. Ly do: nguoi ta chuyen khoan xong roi moi lo tay
        // F5 la chuyen cuc ky thuong gap. Huy thang thi tien ve toi noi, webhook
        // khong tim thay yeu cau nao con nhan tien, va khoan do treo lai cho
        // quan tri go tay. Bo roi thi webhook van cong dung nguoi.
        //
        // Cung phai lam vay de qua duoc khoa duy nhat {student, status:pending}:
        // con mot ban ghi pending thi khong tao them duoc ban ghi pending nao.
        const cu = await CoinTopUp.findOne({ student: req.user._id, status: 'pending' });
        if (cu) {
            await CoinTopUp.updateOne(
                { _id: cu._id, status: 'pending' },
                { $set: { status: 'abandoned', note: 'Học viên rời trang, đã cấp mã mới' } }
            );
        }

        const yc = await taoVoiMaDuyNhat({
            student: req.user._id,
            soCoin: kiem.so,
            amount: coinRaDong(kiem.so),
            expiresAt: new Date(Date.now() + HAN_GIU_MS)
        });

        return res.status(201).json({ yeuCau: dangYeuCau(yc) });
    } catch (error) {
        console.error('taoYeuCauNap:', error.message);
        return res.status(500).json({ message: 'Không tạo được yêu cầu nạp coin' });
    }
};

// Truoc day co them GET /api/coin/nap/dang-cho tra ve yeu cau dang cho cua
// chinh minh. Da bo cung luc voi viec doi hanh vi reload: trang nap khong khoi
// phuc ma cu nua, nen khong con ai goi duong do. Muon tra cuu mot yeu cau cu
// thi dung GET /api/coin/nap/:code.

/**
 * GET /api/coin/nap/:code - doc mot yeu cau cua chinh minh.
 */
const layYeuCauTheoMa = async (req, res) => {
    try {
        const ma = String(req.params.code || '').toUpperCase().trim();
        const yc = await CoinTopUp.findOne({ code: ma, student: req.user._id });
        if (!yc) {
            return res.status(404).json({ message: 'Không tìm thấy yêu cầu nạp' });
        }
        await capNhatNeuHetHan(yc);
        return res.status(200).json({ yeuCau: dangYeuCau(yc) });
    } catch (error) {
        console.error('layYeuCauTheoMa:', error.message);
        return res.status(500).json({ message: 'Không đọc được yêu cầu nạp' });
    }
};

/**
 * PUT /api/coin/nap/:code/huy - hoc vien huy yeu cau dang cho.
 */
const huyYeuCauNap = async (req, res) => {
    try {
        const ma = String(req.params.code || '').toUpperCase().trim();
        const yc = await CoinTopUp.findOne({ code: ma, student: req.user._id });
        if (!yc) {
            return res.status(404).json({ message: 'Không tìm thấy yêu cầu nạp' });
        }
        if (yc.status !== 'pending') {
            return res.status(400).json({ message: 'Yêu cầu này không còn ở trạng thái chờ' });
        }
        yc.status = 'cancelled';
        await yc.save();
        return res.status(200).json({ message: 'Đã hủy yêu cầu nạp coin' });
    } catch (error) {
        console.error('huyYeuCauNap:', error.message);
        return res.status(500).json({ message: 'Không hủy được yêu cầu nạp' });
    }
};

/**
 * PUT /api/coin/nap/:code/da-chuyen - hoc vien bao da chuyen khoan.
 *
 * KHONG cong coin o day. Day chi la loi khai cua nguoi nap; cong coin ngay thi
 * ai cung bam duoc nut nay de co coin mien phi.
 */
const baoDaChuyenNap = async (req, res) => {
    try {
        const ma = String(req.params.code || '').toUpperCase().trim();
        const yc = await CoinTopUp.findOne({ code: ma, student: req.user._id });
        if (!yc) {
            return res.status(404).json({ message: 'Không tìm thấy yêu cầu nạp' });
        }
        if (yc.status === 'paid') {
            return res.status(400).json({ message: 'Yêu cầu này đã được xác nhận rồi' });
        }
        if (yc.status === 'cancelled') {
            return res.status(400).json({ message: 'Yêu cầu này đã bị hủy, hãy tạo yêu cầu mới' });
        }

        // Qua han van nhan bao: co the nguoi ta vua chuyen xong o phut thu 16.
        // Tu choi luc nay la tien da di ma khong ai biet de doi chieu.
        await capNhatNeuHetHan(yc);

        // Bam nhieu lan thi giu moc DAU TIEN - do la "nguoi nay cho tu luc nao",
        // day len moi lan bam thi ai bam nhieu lai duoc xep sau cung.
        const laLanDau = !yc.daBaoChuyenKhoanLuc;
        if (laLanDau) {
            yc.daBaoChuyenKhoanLuc = new Date();
            await yc.save();
        }

        // Chi gui mail o LAN BAM DAU TIEN. Hoc vien sot ruot bam lai nam lan thi
        // quan tri nhan nam cai mail giong het nhau va bat dau bo qua ca hom thu.
        let mail = { daGui: false };
        if (laLanDau) {
            mail = await guiMail(
                soanMailBaoNapCoin({
                    maNap: yc.code,
                    soTien: yc.amount,
                    soCoin: yc.soCoin,
                    tenHocVien: req.user.name || req.user.email,
                    emailHocVien: req.user.email,
                    baoLuc: yc.daBaoChuyenKhoanLuc,
                    daQuaHan: yc.status === 'expired',
                    duongDanQuanTri: process.env.FRONTEND_URL
                        ? `${process.env.FRONTEND_URL.replace(/\/+$/, '')}/admin/coin-topups`
                        : ''
                })
            );
        }

        return res.status(200).json({
            message: 'Đã báo cho ban quản trị, bạn chờ đối chiếu nhé.',
            // Bao ro cho giao dien biet mail co di duoc khong: chua cau hinh mail
            // thi hoc vien can duoc nhac lien he quan tri bang duong khac, chu
            // khong ngoi cho mot cai mail khong bao gio den.
            daGuiMail: mail.daGui,
            mailDaCauHinh: mailDaCauHinh()
        });
    } catch (error) {
        console.error('baoDaChuyenNap:', error.message);
        return res.status(500).json({ message: 'Không gửi được thông báo' });
    }
};

/* ==========================================================================
   QUAN TRI
   ========================================================================== */

/**
 * GET /api/coin/quan-tri/nap - danh sach yeu cau nap.
 */
const danhSachYeuCauNap = async (req, res) => {
    try {
        const loc = {};
        if (req.query.status) loc.status = req.query.status;

        const { trang, soDong, boQua } = phanTrang(req.query);

        const [ds, tong] = await Promise.all([
            CoinTopUp.find(loc)
                .populate('student', 'name email avatar')
                .populate('confirmedBy', 'name')
                .sort({ createdAt: -1 })
                .skip(boQua)
                .limit(soDong),
            CoinTopUp.countDocuments(loc)
        ]);

        return res.status(200).json({
            yeuCau: ds,
            total: tong,
            page: trang,
            pages: Math.max(1, Math.ceil(tong / soDong))
        });
    } catch (error) {
        console.error('danhSachYeuCauNap:', error.message);
        return res.status(500).json({ message: 'Không đọc được danh sách yêu cầu nạp' });
    }
};

/**
 * PUT /api/coin/quan-tri/nap/:code/confirm - xac nhan da nhan tien, cong coin.
 */
const xacNhanYeuCauNap = async (req, res) => {
    try {
        const ma = String(req.params.code || '').toUpperCase().trim();
        const yc = await CoinTopUp.findOne({ code: ma });

        if (!yc) {
            return res.status(404).json({ message: 'Không tìm thấy yêu cầu nạp' });
        }
        if (yc.status === 'paid') {
            return res.status(400).json({ message: 'Yêu cầu này đã được xác nhận trước đó' });
        }
        if (yc.status === 'cancelled') {
            return res.status(400).json({ message: 'Yêu cầu này đã bị hủy' });
        }

        // Danh dau 'paid' TRUOC khi cong coin, va chi cong khi buoc danh dau
        // that su doi duoc mot ban ghi dang cho. Hai quan tri bam cung luc thi
        // chi mot nguoi qua duoc cua nay - cong truoc roi danh dau sau thi ca
        // hai deu cong va hoc vien nhan doi coin.
        // 'abandoned' cung nam trong danh sach: hoc vien reload mat ma nhung da
        // chuyen theo ma cu, webhook khong khop duoc vi so tien lech - quan tri
        // van phai xac nhan tay duoc.
        const daKhoa = await CoinTopUp.findOneAndUpdate(
            { _id: yc._id, status: { $in: ['pending', 'expired', 'abandoned'] } },
            {
                $set: {
                    status: 'paid',
                    paidAt: new Date(),
                    confirmedBy: req.user._id,
                    ...(typeof req.body?.note === 'string'
                        ? { note: req.body.note.slice(0, 500) }
                        : {})
                }
            },
            { new: true }
        );

        if (!daKhoa) {
            return res.status(400).json({ message: 'Yêu cầu này vừa được xử lý bởi người khác' });
        }

        const cong = await congCoin(daKhoa.student, daKhoa.soCoin, {
            loai: 'nap',
            ghiChu: `Nạp coin theo yêu cầu ${daKhoa.code}`,
            nguoiTao: req.user._id
        });

        if (!cong.thanhCong) {
            // Cong hong thi tra yeu cau ve trang thai cho, khong de no dung
            // 'paid' ma vi thi khong duoc cong dong nao.
            daKhoa.status = 'pending';
            daKhoa.paidAt = null;
            daKhoa.confirmedBy = null;
            await daKhoa.save();
            return res.status(400).json({ message: cong.loi || 'Không cộng được coin' });
        }

        const hocVien = await User.findById(daKhoa.student).select('name email');

        return res.status(200).json({
            message: `Đã cộng ${daKhoa.soCoin.toLocaleString('vi-VN')} coin cho ${hocVien?.name || 'học viên'}`,
            soDuCoin: cong.soDuSau
        });
    } catch (error) {
        console.error('xacNhanYeuCauNap:', error.message);
        return res.status(500).json({ message: 'Không xác nhận được yêu cầu nạp' });
    }
};

/**
 * PUT /api/coin/quan-tri/nap/:code/huy - quan tri tu choi mot yeu cau.
 */
const tuChoiYeuCauNap = async (req, res) => {
    try {
        const ma = String(req.params.code || '').toUpperCase().trim();
        const yc = await CoinTopUp.findOne({ code: ma });

        if (!yc) {
            return res.status(404).json({ message: 'Không tìm thấy yêu cầu nạp' });
        }
        if (yc.status === 'paid') {
            return res.status(400).json({ message: 'Yêu cầu này đã cộng coin, không hủy được' });
        }

        yc.status = 'cancelled';
        if (typeof req.body?.note === 'string') {
            yc.note = req.body.note.slice(0, 500);
        }
        await yc.save();

        return res.status(200).json({ message: 'Đã hủy yêu cầu nạp' });
    } catch (error) {
        console.error('tuChoiYeuCauNap:', error.message);
        return res.status(500).json({ message: 'Không hủy được yêu cầu nạp' });
    }
};

module.exports = {
    taoYeuCauNap,
    layYeuCauTheoMa,
    huyYeuCauNap,
    baoDaChuyenNap,
    danhSachYeuCauNap,
    xacNhanYeuCauNap,
    tuChoiYeuCauNap
};
