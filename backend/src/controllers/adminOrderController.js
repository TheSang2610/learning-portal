const Order = require('../models/Order');
const { taoGhiDanh } = require('../utils/enrollment');
const { phanTrang, timGan } = require('../utils/queryParams');
const { capNhatNeuHetHan } = require('./orderController');
const Course = require('../models/Course');
const User = require('../models/User');
const { guiMail } = require('../config/mail');
const { soanMailDonDaXacNhan } = require('../utils/orderMail');
const { guiThongBao } = require('./notificationController');
const { cacKhoaCuaDon } = require('../utils/orderCourses');

const TRANG_THAI_HOP_LE = new Set(['pending', 'paid', 'cancelled', 'expired']);

// @desc    Danh sach don hang cho quan tri
// @route   GET /api/admin/orders
// @access  admin
const getOrdersAdmin = async (req, res) => {
    try {
        const { trang, soDong, boQua } = phanTrang(req.query);

        const loc = {};
        if (TRANG_THAI_HOP_LE.has(req.query.status)) {
            loc.status = req.query.status;
        }
        // Tim theo ma don. timGan() thoat ky tu dac biet truoc khi dua vao
        // $regex - khong thoat thi mot dau "(" nguoi dung go vao la regex hong
        // va Mongo nem loi.
        if (req.query.search) {
            loc.code = timGan(String(req.query.search).toUpperCase());
        }

        const [ds, tong, dangCho, daBao] = await Promise.all([
            Order.find(loc)
                .populate('course', 'title slug price')
                .populate('courses', 'title slug price')
                .populate('student', 'name email avatar')
                .populate('confirmedBy', 'name')
                .sort({ createdAt: -1 })
                .skip(boQua)
                .limit(soDong)
                .lean(),
            Order.countDocuments(loc),
            Order.countDocuments({ status: 'pending' }),
            // Don co nguoi DANG NGOI CHO: ho da bam "toi da chuyen khoan" va
            // dang doi doi chieu. Dem rieng vi day moi la con so quan tri can
            // xu ly ngay, con 'pending' thi gom ca don vua mo ra chua lam gi.
            Order.countDocuments({
                status: { $in: ['pending', 'expired'] },
                daBaoChuyenKhoanLuc: { $ne: null }
            })
        ]);

        return res.status(200).json({
            orders: ds,
            page: trang,
            limit: soDong,
            total: tong,
            pendingCount: dangCho,
            daBaoCount: daBao
        });
    } catch (error) {
        console.error('getOrdersAdmin:', error.message);
        return res.status(500).json({ message: 'Không đọc được danh sách đơn' });
    }
};

/**
 * Danh dau don DA TRA va mo moi khoa trong don. Mot cua duy nhat cho ca quan tri
 * bam tay (confirmOrder) lan webhook ngan hang (bankWebhookController).
 *
 * KHOA DON TRUOC, mo khoa sau. Ban cu lam nguoc lai (ghi danh roi moi luu
 * 'paid') - khi chi co quan tri bam thi khong sao, nhung tu khi webhook cung
 * xac nhan duoc, quan tri bam dung luc bao co ve la ca hai cung chay het: hai
 * mail, hai thong bao. findOneAndUpdate co dieu kien trang thai chi cho DUNG MOT
 * ben qua cua.
 *
 * Tra ve { ok:false } khi don khong con o trang thai nhan tien (da tra, da huy,
 * hoac ben khac vua xu ly). Loi CSDL luc ghi danh thi tra don ve 'pending' roi
 * nem tiep: de don 'paid' ma khoa chua mo la hoc vien mat tien ma khong ai biet.
 */
const TRANG_THAI_NHAN_TIEN = ['pending', 'expired'];

const moKhoaChoDon = async (donId, { confirmedBy = null, note, tenNguoiXacNhan = '' } = {}) => {
    const $set = { status: 'paid', paidAt: new Date(), confirmedBy };
    if (typeof note === 'string') $set.note = note.slice(0, 500);

    const don = await Order.findOneAndUpdate(
        { _id: donId, status: { $in: TRANG_THAI_NHAN_TIEN } },
        { $set },
        { new: true }
    );
    if (!don) return { ok: false };

    // Mo MOI khoa trong don. Don gio hang ma chi doc don.course thi hoc vien
    // tra tien ba khoa nhung chi duoc mo mot - xem utils/orderCourses.js.
    const idKhoa = cacKhoaCuaDon(don);
    let moiTao = false;
    try {
        for (const id of idKhoa) {
            const kq = await taoGhiDanh(id, don.student);
            if (kq.moiTao) moiTao = true;
        }
    } catch (loi) {
        await Order.updateOne(
            { _id: don._id },
            { $set: { status: 'pending', paidAt: null, confirmedBy: null } }
        ).catch(() => {});
        throw loi;
    }

    // Bao mail SAU khi da luu xong. Mail hong thi guiMail tu nuot loi va ghi
    // console - khong duoc de mot loi gui mail lam hong viec da mo khoa.
    const [dsKhoa, hocVien] = await Promise.all([
        Course.find({ _id: { $in: idKhoa } }).select('title slug'),
        User.findById(don.student).select('name email')
    ]);
    // Don gio hang gop ten moi khoa, con duong dan thi tro ve khoa dau tien.
    const khoa = dsKhoa.length
        ? { title: dsKhoa.map((k) => k.title).join(', '), slug: dsKhoa[0].slug }
        : null;

    await guiMail(
        soanMailDonDaXacNhan({
            maDon: don.code,
            soTien: don.amount,
            tenHocVien: hocVien?.name || hocVien?.email || 'Không rõ',
            emailHocVien: hocVien?.email || '',
            tenKhoa: khoa?.title || 'Khóa học',
            xacNhanLuc: don.paidAt,
            nguoiXacNhan: tenNguoiXacNhan || 'Tự động theo báo có ngân hàng',
            daCoKhoaTuTruoc: !moiTao
        })
    );

    // Chuong thong bao song song voi mail: mail de vao thu rac, chuong thi hoc
    // vien thay ngay lan sau mo trang. guiThongBao() khong bao gio nem.
    await guiThongBao(don.student, 'don_duoc_duyet', {
        tenKhoa: khoa?.title,
        slugKhoa: khoa?.slug
    });

    return { ok: true, don, moiTao };
};

// @desc    Xac nhan da nhan tien -> mo khoa hoc cho hoc vien
// @route   PUT /api/admin/orders/:code/confirm
// @access  admin
const confirmOrder = async (req, res) => {
    try {
        const ma = String(req.params.code || '').toUpperCase().trim();
        const don = await Order.findOne({ code: ma });

        if (!don) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        }

        if (don.status === 'paid') {
            return res.status(400).json({ message: 'Đơn này đã được xác nhận trước đó' });
        }

        // Don qua han VAN xac nhan duoc: tien da vao tai khoan roi thi khong
        // the tu choi chi vi nguoi ta chuyen cham vai phut. Han 15 phut la de
        // don thoi khong treo mai tren man hinh, khong phai de tu choi tien.
        if (don.status === 'cancelled') {
            return res.status(400).json({ message: 'Đơn này đã bị hủy' });
        }

        const kq = await moKhoaChoDon(don._id, {
            confirmedBy: req.user._id,
            note: typeof req.body?.note === 'string' ? req.body.note : undefined,
            tenNguoiXacNhan: req.user?.name || ''
        });

        // Ben khac (webhook ngan hang) vua xac nhan don nay truoc mot nhip.
        if (!kq.ok) {
            return res.status(400).json({ message: 'Đơn này vừa được xác nhận (có thể tự động theo báo có ngân hàng)' });
        }

        return res.status(200).json({
            message: kq.moiTao
                ? 'Đã xác nhận thanh toán và mở khóa học cho học viên'
                : 'Đã xác nhận thanh toán. Học viên vốn đã có khóa học này.',
            order: kq.don
        });
    } catch (error) {
        console.error('confirmOrder:', error.message);
        return res.status(500).json({ message: 'Không xác nhận được đơn hàng' });
    }
};

// @desc    Tu choi / huy don
// @route   PUT /api/admin/orders/:code/reject
// @access  admin
const rejectOrder = async (req, res) => {
    try {
        const ma = String(req.params.code || '').toUpperCase().trim();
        const don = await Order.findOne({ code: ma });

        if (!don) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        }

        if (don.status === 'paid') {
            return res.status(400).json({
                message: 'Đơn đã thanh toán thì không hủy ở đây được, phải xử lý hoàn tiền riêng'
            });
        }

        don.status = 'cancelled';
        don.confirmedBy = req.user._id;
        if (typeof req.body?.note === 'string') {
            don.note = req.body.note.slice(0, 500);
        }
        await don.save();

        // Bao cho hoc vien biet don khong duoc duyet. Khong bao thi ho ngoi cho
        // mot khoa hoc se khong bao gio mo.
        //
        // `note` la chu quan tri vien go tay nen dua nguyen van vao cho hoc vien
        // doc: day la ly do that, con mot cau chung chung thi khong giup ho biet
        // phai lam gi tiep. Do dai da bi cat con 500 o tren.
        await guiThongBao(don.student, 'don_bi_tu_choi', { lyDo: don.note });

        return res.status(200).json({ message: 'Đã hủy đơn hàng', order: don });
    } catch (error) {
        console.error('rejectOrder:', error.message);
        return res.status(500).json({ message: 'Không hủy được đơn hàng' });
    }
};

// @desc    Xem chi tiet mot don
// @route   GET /api/admin/orders/:code
// @access  admin
const getOrderAdmin = async (req, res) => {
    try {
        const ma = String(req.params.code || '').toUpperCase().trim();
        const don = await Order.findOne({ code: ma })
            .populate('course', 'title slug price thumbnail')
            .populate('student', 'name email avatar')
            .populate('confirmedBy', 'name');

        if (!don) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        }

        await capNhatNeuHetHan(don);

        return res.status(200).json({ order: don });
    } catch (error) {
        console.error('getOrderAdmin:', error.message);
        return res.status(500).json({ message: 'Không đọc được đơn hàng' });
    }
};

module.exports = { getOrdersAdmin, getOrderAdmin, confirmOrder, rejectOrder, moKhoaChoDon };
