const mongoose = require('mongoose');

const Order = require('../models/Order');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const { activeFilter } = require('../utils/accessPeriod');
const { transferInfo } = require('../config/payment');
const { phanTrang: paginate } = require('../utils/queryParams');
const { sendMail, daCauHinh: mailConfigured } = require('../config/mail');
const { composeTransferReportMail } = require('../utils/orderMail');
const VoucherUsage = require('../models/VoucherUsage');
const { reserveUsage, refundVoucherUsage } = require('./voucherController');
const { orderCourses, filterCourseIds } = require('../utils/orderCourses');

const COURSE_FIELDS = 'title slug thumbnail price';

const courseSummary = (k) => ({
    _id: k._id,
    title: k.title,
    slug: k.slug,
    thumbnail: k.thumbnail || '',
    price: k.price
});

const { generateCode, ORDER_HOLD_MS } = Order;

// Sinh ma don, thu lai neu trung.
//
// Ma chi co 31^4 to hop nen trung la chuyen se xay ra, khong phai kha nang ly
// thuyet. Bat dung loi trung khoa cua Mongo (11000) roi thu ma khac, thay vi
// tu kiem tra truoc bang findOne - kiem tra truoc van dinh cuoc dua khi hai
// nguoi dat don cung mot phan nghin giay.
const MAX_RETRIES = 5;

const createOrderWithUniqueCode = async (data) => {
    for (let i = 0; i < MAX_RETRIES; i += 1) {
        try {
            return await Order.create({ ...data, code: generateCode() });
        } catch (err) {
            const codeTaken = err?.code === 11000 && err?.keyPattern?.code;
            if (!codeTaken) throw err;
        }
    }
    throw new Error('Không sinh được mã đơn, vui lòng thử lại');
};

/** Gom phan hoi cua mot don, dung chung cho moi noi tra don ve. */
const orderShape = (order, course) => ({
    code: order.code,
    status: order.status,
    amount: order.amount,
    // Ba truong nay de trang thanh toan hien duoc "500.000d -> 400.000d".
    // giaGoc rong (don cu, truoc khi co ma giam gia) thi lay luon amount, de
    // giao dien khong phai xu ly rieng truong hop null.
    giaGoc: order.giaGoc ?? order.amount,
    maGiamGia: order.maGiamGia || null,
    soTienGiam: order.soTienGiam || 0,
    expiresAt: order.expiresAt,
    // Giay con lai, tinh o may chu. De giao dien tu tru theo dong ho may nguoi
    // dung thi lech mui gio hay dong ho sai la dem sai.
    secondsLeft: Math.max(0, Math.floor((order.expiresAt.getTime() - Date.now()) / 1000)),
    paidAt: order.paidAt || null,
    daBaoChuyenKhoanLuc: order.daBaoChuyenKhoanLuc || null,
    createdAt: order.createdAt,
    course: course ? courseSummary(course) : null,
    // Don gio hang: du moi khoa de trang thanh toan liet ke. Don mua le de
    // rong, giao dien khi do chi hien `course`. Chi lay ban da populate - ban
    // con la ObjectId tran thi khong co ten de hien.
    courses: (order.courses || []).filter((k) => k && k.title).map(courseSummary),
    chuyenKhoan: order.status === 'pending'
        ? transferInfo({ soTien: order.amount, noiDung: order.code })
        : null
});

// Danh dau don qua han. Goi truoc khi tra don ve, thay vi chay mot tac vu nen:
// he thong nay chay tren serverless nen khong co tien trinh song lau de dat
// lich quet.
const expireIfDue = async (order) => {
    if (order.expired()) {
        order.status = 'expired';
        await order.save();

        // Tra lai luot ma giam gia. Don het han la don khong bao gio duoc tra
        // tien, nen giu luot lai la vua tieu mot luot cua chien dich vua khoa
        // luon nguoi dung do khong dung lai duoc ma (vuong moiNguoiMotLan).
        await refundVoucherUsage(order._id);
    }
    return order;
};

// @desc    Tao don hang cho mot khoa hoc co phi
// @route   POST /api/orders
// @access  Dang nhap
const createOrder = async (req, res) => {
    try {
        const { courseId } = req.body || {};

        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            return res.status(400).json({ message: 'Thiếu hoặc sai mã khóa học' });
        }

        const course = await Course.findById(courseId).select('title slug thumbnail price');
        if (!course) {
            return res.status(404).json({ message: 'Không tìm thấy khóa học' });
        }

        // Khoa mien phi khong di duong nay - ghi danh thang.
        if (!course.price || course.price <= 0) {
            return res.status(400).json({ message: 'Khóa học này miễn phí, bạn có thể học ngay' });
        }

        const learned = await Enrollment.findOne({
            course: courseId,
            student: req.user._id,
            status: { $ne: 'dropped' },
            // Het han hoc thi duoc mua lai de gia han (utils/accessPeriod.js).
            ...activeFilter()
        });
        if (learned) {
            return res.status(400).json({ message: 'Bạn đã có khóa học này rồi' });
        }

        // Con don dang cho thi tra lai chinh no, khong tao don moi.
        //
        // Nguoi dung bam Mua hai lan (hoac tai lai trang thanh toan) rat de
        // xay ra. Tao don moi moi lan thi ho co hai ma khac nhau cho cung mot
        // khoa hoc, chuyen tien theo ma cu thi don moi vinh vien khong khop.
        const oldOrder = await Order.findOne({
            course: courseId,
            student: req.user._id,
            status: 'pending'
        });

        if (oldOrder) {
            await expireIfDue(oldOrder);
            if (oldOrder.status === 'pending') {
                return res.status(200).json({ order: orderShape(oldOrder, course) });
            }
        }

        // Ap ma giam gia neu co.
        //
        // reserveUsage() TRU LUOT NGAY o day chu khong doi toi luc xac nhan
        // don, va do la co chu dich: neu doi, thi mot ma con dung mot luot se
        // duoc mười nguoi dat don cung luc, ca mười deu thay gia da giam, roi
        // chin nguoi bi tu choi luc quan tri xac nhan - tuc la sau khi ho da
        // chuyen tien.
        //
        // Doi lai, luot bi tru phai duoc HOAN khi don huy hoac het han. Xem
        // refundVoucherUsage va noi goi no o cancelOrder / expireIfDue.
        let discountAmount = 0;
        let usedVoucher = null;

        if (req.body?.maGiamGia) {
            const place = await reserveUsage({
                rawCode: req.body.maGiamGia,
                courseId,
                nguoiDung: req.user
            });

            if (!place.ok) {
                return res.status(400).json({ message: place.cau });
            }

            discountAmount = place.soTienGiam;
            usedVoucher = place.ma;
        }

        // Gia da giam la gia THAT phai chuyen khoan: ma QR sinh theo `amount`,
        // nen ghi gia goc vao day la nguoi dung chuyen thua tien.
        const amountDue = Math.max(0, course.price - discountAmount);

        const order = await createOrderWithUniqueCode({
            course: courseId,
            student: req.user._id,
            amount: amountDue,
            giaGoc: course.price,
            maGiamGia: usedVoucher,
            soTienGiam: discountAmount,
            expiresAt: new Date(Date.now() + ORDER_HOLD_MS)
        });

        // Gan don vao luot dung de con hoan lai khi don bi huy.
        if (usedVoucher) {
            await VoucherUsage.updateOne(
                { user: req.user._id, course: courseId, donHang: null },
                { $set: { donHang: order._id } }
            ).catch(() => {});
        }

        return res.status(201).json({ order: orderShape(order, course) });
    } catch (error) {
        console.error('createOrder:', error.message);
        return res.status(500).json({ message: 'Không tạo được đơn hàng' });
    }
};

// @desc    Tao MOT don cho ca gio hang, tra bang mot ma QR
// @route   POST /api/orders/gio-hang
// @access  Dang nhap
//
// Truoc 04/10/2026 gio hang chi tra duoc bang coin, vi ma QR khop tien theo
// TUNG don: chuyen mot lan cho ba khoa thi khong doi chieu duoc voi ba don.
// Gom ca gio vao mot don (mot ma, mot so tien) la giai dung cho do - quan tri
// van doi chieu dung mot dong sao ke voi mot ma don nhu don mua le.
const createCartOrder = async (req, res) => {
    try {
        const query = filterCourseIds(req.body?.courseIds, (x) => mongoose.Types.ObjectId.isValid(x));
        if (query.loi) {
            return res.status(400).json({ message: query.loi });
        }
        const ids = query.ds;

        const courseList = await Course.find({ _id: { $in: ids } }).select(COURSE_FIELDS);
        const theoId = new Map(courseList.map((k) => [String(k._id), k]));
        if (theoId.size !== ids.length) {
            return res.status(404).json({ message: 'Có khóa học trong giỏ không còn tồn tại, bạn bỏ nó ra rồi thử lại' });
        }
        const coursesInOrder = ids.map((id) => theoId.get(id));

        // Tu choi ca don thay vi lang lang bo khoa loi ra: nguoi dung thay tong
        // tien o gio va so tien tren QR khac nhau la nghi ngay - va ho dung.
        const isFree = coursesInOrder.find((k) => !k.price || k.price <= 0);
        if (isFree) {
            return res.status(400).json({ message: `"${isFree.title}" miễn phí, bạn bỏ khỏi giỏ và vào học ngay` });
        }

        const learned = await Enrollment.findOne({
            course: { $in: ids },
            student: req.user._id,
            status: { $ne: 'dropped' },
            ...activeFilter()
        }).select('course');
        if (learned) {
            const name = theoId.get(String(learned.course))?.title || 'một khóa trong giỏ';
            return res.status(400).json({ message: `Bạn đã có khóa "${name}", hãy bỏ khỏi giỏ rồi thanh toán` });
        }

        // Cung mot gio dang cho thi tra lai don cu - cung ly do nhu createOrder:
        // bam hai lan ra hai ma, chuyen theo ma cu thi don moi khong bao gio khop.
        const oldOrder = await Order.findOne({
            student: req.user._id,
            status: 'pending',
            courses: { $size: ids.length, $all: ids }
        });
        if (oldOrder) {
            await expireIfDue(oldOrder);
            if (oldOrder.status === 'pending') {
                await oldOrder.populate('courses', COURSE_FIELDS);
                return res.status(200).json({ order: orderShape(oldOrder, coursesInOrder[0]) });
            }
        }

        // Ma giam gia an vao DUNG MOT khoa trong gio, giong o nhap ma tren
        // trang gio hang. Tru luot ngay luc dat don - xem ghi chu o createOrder.
        let discountAmount = 0;
        let usedVoucher = null;
        let discountedCourse = null;

        if (req.body?.maGiamGia) {
            discountedCourse = String(req.body.courseIdGiam || '');
            if (!ids.includes(discountedCourse)) {
                return res.status(400).json({ message: 'Mã giảm giá phải áp vào một khóa có trong giỏ' });
            }

            const place = await reserveUsage({
                rawCode: req.body.maGiamGia,
                courseId: discountedCourse,
                nguoiDung: req.user
            });
            if (!place.ok) {
                return res.status(400).json({ message: place.cau });
            }

            discountAmount = place.soTienGiam;
            usedVoucher = place.ma;
        }

        const originalTotal = coursesInOrder.reduce((t, k) => t + k.price, 0);

        const order = await createOrderWithUniqueCode({
            course: ids[0],
            courses: ids,
            student: req.user._id,
            amount: Math.max(0, originalTotal - discountAmount),
            giaGoc: originalTotal,
            maGiamGia: usedVoucher,
            soTienGiam: discountAmount,
            expiresAt: new Date(Date.now() + ORDER_HOLD_MS)
        });

        if (usedVoucher) {
            await VoucherUsage.updateOne(
                { user: req.user._id, course: discountedCourse, donHang: null },
                { $set: { donHang: order._id } }
            ).catch(() => {});
        }

        await order.populate('courses', COURSE_FIELDS);
        return res.status(201).json({ order: orderShape(order, coursesInOrder[0]) });
    } catch (error) {
        console.error('createCartOrder:', error.message);
        return res.status(500).json({ message: 'Không tạo được đơn hàng cho giỏ' });
    }
};

// @desc    Xem mot don theo ma (trang thanh toan)
// @route   GET /api/orders/:code
// @access  Dang nhap, va phai la chu don
const getOrderByCode = async (req, res) => {
    try {
        const code = String(req.params.code || '').toUpperCase().trim();

        const order = await Order.findOne({ code: code })
            .populate('course', COURSE_FIELDS)
            .populate('courses', COURSE_FIELDS);
        if (!order) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        }

        // Khong lo don cua nguoi khac. Tra 404 chu khong phai 403: 403 xac nhan
        // ma don nay co that, du de mo doan ma nguoi khac.
        const isOrderOwner = String(order.student) === String(req.user._id);
        if (!isOrderOwner && req.user.role !== 'admin') {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        }

        await expireIfDue(order);

        return res.status(200).json({ order: orderShape(order, order.course) });
    } catch (error) {
        console.error('getOrderByCode:', error.message);
        return res.status(500).json({ message: 'Không đọc được đơn hàng' });
    }
};

// @desc    Danh sach don cua chinh minh
// @route   GET /api/orders/my
// @access  Dang nhap
const getMyOrders = async (req, res) => {
    try {
        const { trang: page, soDong: pageSize, skip } = paginate(req.query);

        const query = { student: req.user._id };
        if (req.query.status) query.status = req.query.status;

        const [items, total] = await Promise.all([
            Order.find(query)
                .populate('course', COURSE_FIELDS)
                .populate('courses', COURSE_FIELDS)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(pageSize),
            Order.countDocuments(query)
        ]);

        return res.status(200).json({
            orders: items.map((d) => orderShape(d, d.course)),
            page: page,
            limit: pageSize,
            total: total
        });
    } catch (error) {
        console.error('getMyOrders:', error.message);
        return res.status(500).json({ message: 'Không đọc được danh sách đơn' });
    }
};

// @desc    Huy don cua chinh minh
// @route   PUT /api/orders/:code/cancel
// @access  Dang nhap, va phai la chu don
const cancelOrder = async (req, res) => {
    try {
        const code = String(req.params.code || '').toUpperCase().trim();
        const order = await Order.findOne({ code: code });

        if (!order || String(order.student) !== String(req.user._id)) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        }

        if (order.status !== 'pending') {
            return res.status(400).json({ message: 'Đơn này không còn ở trạng thái chờ thanh toán' });
        }

        order.status = 'cancelled';
        await order.save();

        // Tra lai luot ma giam gia - xem ghi chu o expireIfDue.
        await refundVoucherUsage(order._id);

        return res.status(200).json({ message: 'Đã hủy đơn hàng' });
    } catch (error) {
        console.error('cancelOrder:', error.message);
        return res.status(500).json({ message: 'Không hủy được đơn hàng' });
    }
};


/**
 * PUT /api/orders/:code/da-chuyen
 *
 * Hoc vien bam "Toi da chuyen khoan roi". Danh dau don va bao mail cho quan
 * tri de ho mo sao ke doi chieu.
 *
 * KHONG doi trang thai don sang 'paid'. Day chi la loi khai cua nguoi mua -
 * chi quan tri nhin thay tien vao tai khoan moi duoc xac nhan. Neu tin loi khai
 * ma mo khoa luon thi ai cung bam duoc nut nay de hoc mien phi.
 */
const reportTransfer = async (req, res) => {
    try {
        const code = String(req.params.code || '').toUpperCase().trim();

        const order = await Order.findOne({ code: code, student: req.user._id });
        if (!order) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        }
        if (order.status === 'paid') {
            return res.status(400).json({ message: 'Đơn này đã được xác nhận rồi' });
        }
        if (order.status === 'cancelled') {
            return res.status(400).json({ message: 'Đơn này đã bị hủy, vui lòng đặt đơn mới' });
        }

        // Da qua han thi don chuyen sang 'expired' - nhung VAN nhan bao va van
        // gui mail. Nguoi ta co the vua chuyen khoan xong o phut thu 16; tu
        // choi luc nay la tien da di ma khong ai biet de doi chieu.
        const overdue = order.expired();
        await expireIfDue(order);

        // Bam nhieu lan thi giu moc DAU TIEN, khong day moc len moi lan bam.
        // Moc do la "nguoi nay cho tu luc nao" - day len thi don cho lau nhat
        // lai trong nhu don moi nhat, va bi xu ly sau cung.
        const isFirstTime = !order.daBaoChuyenKhoanLuc;
        if (isFirstTime) {
            order.daBaoChuyenKhoanLuc = new Date();
            await order.save();
        }

        let mail = { daGui: false, lyDo: 'chua_cau_hinh' };
        if (isFirstTime) {
            // Don gio hang: liet ke du ten de quan tri biet mot lan chuyen nay
            // tra cho nhung khoa nao.
            const courseList = await Course.find({ _id: { $in: orderCourses(order) } }).select('title');
            mail = await sendMail(
                composeTransferReportMail({
                    orderCode: order.code,
                    soTien: order.amount,
                    studentName: req.user.name || req.user.email,
                    studentEmail: req.user.email,
                    tenKhoa: courseList.map((k) => k.title).join(', ') || 'Khóa học',
                    reportedAt: order.daBaoChuyenKhoanLuc,
                    daQuaHan: overdue,
                    adminUrl: process.env.FRONTEND_URL
                        ? `${process.env.FRONTEND_URL.replace(/\/+$/, '')}/admin/orders`
                        : ''
                })
            );
        }

        return res.json({
            message: overdue
                ? 'Đã ghi nhận. Mã này đã quá hạn giữ đơn nên ban quản trị sẽ đối chiếu kỹ hơn, có thể lâu hơn bình thường.'
                : 'Đã báo cho ban quản trị. Bạn chờ đối chiếu sao kê giúp nhé.',
            daBaoChuyenKhoanLuc: order.daBaoChuyenKhoanLuc,
            daQuaHan: overdue,
            // Bao ro cho giao dien biet mail co di duoc khong: chua cau hinh mail
            // thi hoc vien can duoc nhac lien he quan tri bang duong khac, chu
            // khong ngoi cho mot cai mail khong bao gio den.
            daGuiMail: mail.daGui,
            mailDaCauHinh: mailConfigured()
        });
    } catch (error) {
        console.error('baoDaChuyenKhoan:', error.message);
        return res.status(500).json({ message: 'Không gửi được thông báo' });
    }
};

module.exports = { createOrder, createCartOrder, reportTransfer, getOrderByCode, getMyOrders, cancelOrder, orderShape, expireIfDue };
