const Order = require('../models/Order');
const { taoGhiDanh } = require('../utils/ghiDanh');
const { phanTrang, timGan } = require('../utils/truyVan');
const { capNhatNeuHetHan } = require('./orderController');

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

        const [ds, tong, dangCho] = await Promise.all([
            Order.find(loc)
                .populate('course', 'title slug price')
                .populate('student', 'name email avatar')
                .populate('confirmedBy', 'name')
                .sort({ createdAt: -1 })
                .skip(boQua)
                .limit(soDong)
                .lean(),
            Order.countDocuments(loc),
            Order.countDocuments({ status: 'pending' })
        ]);

        return res.status(200).json({
            orders: ds,
            page: trang,
            limit: soDong,
            total: tong,
            pendingCount: dangCho
        });
    } catch (error) {
        console.error('getOrdersAdmin:', error.message);
        return res.status(500).json({ message: 'Không đọc được danh sách đơn' });
    }
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

        const { moiTao } = await taoGhiDanh(don.course, don.student);

        don.status = 'paid';
        don.paidAt = new Date();
        don.confirmedBy = req.user._id;
        if (typeof req.body?.note === 'string') {
            don.note = req.body.note.slice(0, 500);
        }
        await don.save();

        return res.status(200).json({
            message: moiTao
                ? 'Đã xác nhận thanh toán và mở khóa học cho học viên'
                : 'Đã xác nhận thanh toán. Học viên vốn đã có khóa học này.',
            order: don
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

module.exports = { getOrdersAdmin, getOrderAdmin, confirmOrder, rejectOrder };
