const Order = require('../models/Order');
const { createEnrollment } = require('../utils/enrollment');
const { phanTrang: paginate, fuzzyRegex } = require('../utils/queryParams');
const { expireIfDue } = require('./orderController');
const Course = require('../models/Course');
const User = require('../models/User');
const { sendMail } = require('../config/mail');
const { composeOrderConfirmedMail } = require('../utils/orderMail');
const { sendNotification } = require('./notificationController');
const { orderCourses } = require('../utils/orderCourses');

const VALID_STATUSES = new Set(['pending', 'paid', 'cancelled', 'expired']);

// @desc    Danh sach don hang cho quan tri
// @route   GET /api/admin/orders
// @access  admin
const getOrdersAdmin = async (req, res) => {
    try {
        const { trang: page, soDong: pageSize, skip } = paginate(req.query);

        const query = {};
        if (VALID_STATUSES.has(req.query.status)) {
            query.status = req.query.status;
        }
        // Tim theo ma don. fuzzyRegex() thoat ky tu dac biet truoc khi dua vao
        // $regex - khong thoat thi mot dau "(" nguoi dung go vao la regex hong
        // va Mongo nem loi.
        if (req.query.search) {
            query.code = fuzzyRegex(String(req.query.search).toUpperCase());
        }

        const [items, total, pending, reported] = await Promise.all([
            Order.find(query)
                .populate('course', 'title slug price')
                .populate('courses', 'title slug price')
                .populate('student', 'name email avatar')
                .populate('confirmedBy', 'name')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(pageSize)
                .lean(),
            Order.countDocuments(query),
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
            orders: items,
            page: page,
            limit: pageSize,
            total: total,
            pendingCount: pending,
            daBaoCount: reported
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
const PAYABLE_STATUSES = ['pending', 'expired'];

const unlockOrder = async (orderId, { confirmedBy = null, note, confirmerName = '' } = {}) => {
    const $set = { status: 'paid', paidAt: new Date(), confirmedBy };
    if (typeof note === 'string') $set.note = note.slice(0, 500);

    const order = await Order.findOneAndUpdate(
        { _id: orderId, status: { $in: PAYABLE_STATUSES } },
        { $set },
        { new: true }
    );
    if (!order) return { ok: false };

    // Mo MOI khoa trong don. Don gio hang ma chi doc don.course thi hoc vien
    // tra tien ba khoa nhung chi duoc mo mot - xem utils/orderCourses.js.
    const courseId = orderCourses(order);
    let created = false;
    // Khoa co phi: mo trong accessDays ngay (mac dinh 30) - utils/accessPeriod.js.
    const daysById = new Map(
        (await Course.find({ _id: { $in: courseId } }).select('accessDays').lean())
            .map((k) => [String(k._id), k.accessDays || 30])
    );
    try {
        for (const id of courseId) {
            const outcome = await createEnrollment(id, order.student, { accessDays: daysById.get(String(id)) || 30 });
            if (outcome.created) created = true;
        }
    } catch (err) {
        await Order.updateOne(
            { _id: order._id },
            { $set: { status: 'pending', paidAt: null, confirmedBy: null } }
        ).catch(() => {});
        throw err;
    }

    // Bao mail SAU khi da luu xong. Mail hong thi sendMail tu nuot loi va ghi
    // console - khong duoc de mot loi gui mail lam hong viec da mo khoa.
    const [courseList, student] = await Promise.all([
        Course.find({ _id: { $in: courseId } }).select('title slug'),
        User.findById(order.student).select('name email')
    ]);
    // Don gio hang gop ten moi khoa, con duong dan thi tro ve khoa dau tien.
    const course = courseList.length
        ? { title: courseList.map((k) => k.title).join(', '), slug: courseList[0].slug }
        : null;

    await sendMail(
        composeOrderConfirmedMail({
            orderCode: order.code,
            soTien: order.amount,
            studentName: student?.name || student?.email || 'Không rõ',
            studentEmail: student?.email || '',
            tenKhoa: course?.title || 'Khóa học',
            confirmedAt: order.paidAt,
            confirmedByName: confirmerName || 'Tự động theo báo có ngân hàng',
            alreadyOwned: !created
        })
    );

    // Chuong thong bao song song voi mail: mail de vao thu rac, chuong thi hoc
    // vien thay ngay lan sau mo trang. sendNotification() khong bao gio nem.
    await sendNotification(order.student, 'don_duoc_duyet', {
        tenKhoa: course?.title,
        courseSlug: course?.slug
    });

    return { ok: true, don: order, created };
};

// @desc    Xac nhan da nhan tien -> mo khoa hoc cho hoc vien
// @route   PUT /api/admin/orders/:code/confirm
// @access  admin
const confirmOrder = async (req, res) => {
    try {
        const code = String(req.params.code || '').toUpperCase().trim();
        const order = await Order.findOne({ code: code });

        if (!order) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        }

        if (order.status === 'paid') {
            return res.status(400).json({ message: 'Đơn này đã được xác nhận trước đó' });
        }

        // Don qua han VAN xac nhan duoc: tien da vao tai khoan roi thi khong
        // the tu choi chi vi nguoi ta chuyen cham vai phut. Han 15 phut la de
        // don thoi khong treo mai tren man hinh, khong phai de tu choi tien.
        if (order.status === 'cancelled') {
            return res.status(400).json({ message: 'Đơn này đã bị hủy' });
        }

        const outcome = await unlockOrder(order._id, {
            confirmedBy: req.user._id,
            note: typeof req.body?.note === 'string' ? req.body.note : undefined,
            confirmerName: req.user?.name || ''
        });

        // Ben khac (webhook ngan hang) vua xac nhan don nay truoc mot nhip.
        if (!outcome.ok) {
            return res.status(400).json({ message: 'Đơn này vừa được xác nhận (có thể tự động theo báo có ngân hàng)' });
        }

        return res.status(200).json({
            message: outcome.created
                ? 'Đã xác nhận thanh toán và mở khóa học cho học viên'
                : 'Đã xác nhận thanh toán. Học viên vốn đã có khóa học này.',
            order: outcome.don
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
        const code = String(req.params.code || '').toUpperCase().trim();
        const order = await Order.findOne({ code: code });

        if (!order) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        }

        if (order.status === 'paid') {
            return res.status(400).json({
                message: 'Đơn đã thanh toán thì không hủy ở đây được, phải xử lý hoàn tiền riêng'
            });
        }

        order.status = 'cancelled';
        order.confirmedBy = req.user._id;
        if (typeof req.body?.note === 'string') {
            order.note = req.body.note.slice(0, 500);
        }
        await order.save();

        // Bao cho hoc vien biet don khong duoc duyet. Khong bao thi ho ngoi cho
        // mot khoa hoc se khong bao gio mo.
        //
        // `note` la chu quan tri vien go tay nen dua nguyen van vao cho hoc vien
        // doc: day la ly do that, con mot cau chung chung thi khong giup ho biet
        // phai lam gi tiep. Do dai da bi cat con 500 o tren.
        await sendNotification(order.student, 'don_bi_tu_choi', { lyDo: order.note });

        return res.status(200).json({ message: 'Đã hủy đơn hàng', order: order });
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
        const code = String(req.params.code || '').toUpperCase().trim();
        const order = await Order.findOne({ code: code })
            .populate('course', 'title slug price thumbnail')
            .populate('student', 'name email avatar')
            .populate('confirmedBy', 'name');

        if (!order) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        }

        await expireIfDue(order);

        return res.status(200).json({ order: order });
    } catch (error) {
        console.error('getOrderAdmin:', error.message);
        return res.status(500).json({ message: 'Không đọc được đơn hàng' });
    }
};

module.exports = { getOrdersAdmin, getOrderAdmin, confirmOrder, rejectOrder, unlockOrder };
