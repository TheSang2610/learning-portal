const mongoose = require('mongoose');

const Order = require('../models/Order');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const { thongTinChuyenKhoan } = require('../config/thanhToan');
const { phanTrang } = require('../utils/truyVan');
const { guiMail, daCauHinh: mailDaCauHinh } = require('../config/mail');
const { soanMailBaoChuyenKhoan } = require('../utils/mailDonHang');

const { sinhMa, HAN_GIU_DON_MS } = Order;

// Sinh ma don, thu lai neu trung.
//
// Ma chi co 31^4 to hop nen trung la chuyen se xay ra, khong phai kha nang ly
// thuyet. Bat dung loi trung khoa cua Mongo (11000) roi thu ma khac, thay vi
// tu kiem tra truoc bang findOne - kiem tra truoc van dinh cuoc dua khi hai
// nguoi dat don cung mot phan nghin giay.
const SO_LAN_THU = 5;

const taoDonVoiMaDuyNhat = async (duLieu) => {
    for (let i = 0; i < SO_LAN_THU; i += 1) {
        try {
            return await Order.create({ ...duLieu, code: sinhMa() });
        } catch (loi) {
            const trungMa = loi?.code === 11000 && loi?.keyPattern?.code;
            if (!trungMa) throw loi;
        }
    }
    throw new Error('Không sinh được mã đơn, vui lòng thử lại');
};

/** Gom phan hoi cua mot don, dung chung cho moi noi tra don ve. */
const dangDon = (don, khoaHoc) => ({
    code: don.code,
    status: don.status,
    amount: don.amount,
    expiresAt: don.expiresAt,
    // Giay con lai, tinh o may chu. De giao dien tu tru theo dong ho may nguoi
    // dung thi lech mui gio hay dong ho sai la dem sai.
    secondsLeft: Math.max(0, Math.floor((don.expiresAt.getTime() - Date.now()) / 1000)),
    paidAt: don.paidAt || null,
    daBaoChuyenKhoanLuc: don.daBaoChuyenKhoanLuc || null,
    createdAt: don.createdAt,
    course: khoaHoc
        ? {
            _id: khoaHoc._id,
            title: khoaHoc.title,
            slug: khoaHoc.slug,
            thumbnail: khoaHoc.thumbnail || '',
            price: khoaHoc.price
        }
        : null,
    chuyenKhoan: don.status === 'pending'
        ? thongTinChuyenKhoan({ soTien: don.amount, noiDung: don.code })
        : null
});

// Danh dau don qua han. Goi truoc khi tra don ve, thay vi chay mot tac vu nen:
// he thong nay chay tren serverless nen khong co tien trinh song lau de dat
// lich quet.
const capNhatNeuHetHan = async (don) => {
    if (don.daHetHan()) {
        don.status = 'expired';
        await don.save();
    }
    return don;
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

        const khoaHoc = await Course.findById(courseId).select('title slug thumbnail price');
        if (!khoaHoc) {
            return res.status(404).json({ message: 'Không tìm thấy khóa học' });
        }

        // Khoa mien phi khong di duong nay - ghi danh thang.
        if (!khoaHoc.price || khoaHoc.price <= 0) {
            return res.status(400).json({ message: 'Khóa học này miễn phí, bạn có thể học ngay' });
        }

        const daHoc = await Enrollment.findOne({
            course: courseId,
            student: req.user._id,
            status: { $ne: 'dropped' }
        });
        if (daHoc) {
            return res.status(400).json({ message: 'Bạn đã có khóa học này rồi' });
        }

        // Con don dang cho thi tra lai chinh no, khong tao don moi.
        //
        // Nguoi dung bam Mua hai lan (hoac tai lai trang thanh toan) rat de
        // xay ra. Tao don moi moi lan thi ho co hai ma khac nhau cho cung mot
        // khoa hoc, chuyen tien theo ma cu thi don moi vinh vien khong khop.
        const donCu = await Order.findOne({
            course: courseId,
            student: req.user._id,
            status: 'pending'
        });

        if (donCu) {
            await capNhatNeuHetHan(donCu);
            if (donCu.status === 'pending') {
                return res.status(200).json({ order: dangDon(donCu, khoaHoc) });
            }
        }

        const don = await taoDonVoiMaDuyNhat({
            course: courseId,
            student: req.user._id,
            amount: khoaHoc.price,
            expiresAt: new Date(Date.now() + HAN_GIU_DON_MS)
        });

        return res.status(201).json({ order: dangDon(don, khoaHoc) });
    } catch (error) {
        console.error('createOrder:', error.message);
        return res.status(500).json({ message: 'Không tạo được đơn hàng' });
    }
};

// @desc    Xem mot don theo ma (trang thanh toan)
// @route   GET /api/orders/:code
// @access  Dang nhap, va phai la chu don
const getOrderByCode = async (req, res) => {
    try {
        const ma = String(req.params.code || '').toUpperCase().trim();

        const don = await Order.findOne({ code: ma }).populate('course', 'title slug thumbnail price');
        if (!don) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        }

        // Khong lo don cua nguoi khac. Tra 404 chu khong phai 403: 403 xac nhan
        // ma don nay co that, du de mo doan ma nguoi khac.
        const laChuDon = String(don.student) === String(req.user._id);
        if (!laChuDon && req.user.role !== 'admin') {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        }

        await capNhatNeuHetHan(don);

        return res.status(200).json({ order: dangDon(don, don.course) });
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
        const { trang, soDong, boQua } = phanTrang(req.query);

        const loc = { student: req.user._id };
        if (req.query.status) loc.status = req.query.status;

        const [ds, tong] = await Promise.all([
            Order.find(loc)
                .populate('course', 'title slug thumbnail price')
                .sort({ createdAt: -1 })
                .skip(boQua)
                .limit(soDong),
            Order.countDocuments(loc)
        ]);

        return res.status(200).json({
            orders: ds.map((d) => dangDon(d, d.course)),
            page: trang,
            limit: soDong,
            total: tong
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
        const ma = String(req.params.code || '').toUpperCase().trim();
        const don = await Order.findOne({ code: ma });

        if (!don || String(don.student) !== String(req.user._id)) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        }

        if (don.status !== 'pending') {
            return res.status(400).json({ message: 'Đơn này không còn ở trạng thái chờ thanh toán' });
        }

        don.status = 'cancelled';
        await don.save();

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
const baoDaChuyenKhoan = async (req, res) => {
    try {
        const ma = String(req.params.code || '').toUpperCase().trim();

        const don = await Order.findOne({ code: ma, student: req.user._id });
        if (!don) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        }
        if (don.status === 'paid') {
            return res.status(400).json({ message: 'Đơn này đã được xác nhận rồi' });
        }
        if (don.status === 'cancelled') {
            return res.status(400).json({ message: 'Đơn này đã bị hủy, vui lòng đặt đơn mới' });
        }

        // Da qua han thi don chuyen sang 'expired' - nhung VAN nhan bao va van
        // gui mail. Nguoi ta co the vua chuyen khoan xong o phut thu 16; tu
        // choi luc nay la tien da di ma khong ai biet de doi chieu.
        const daQuaHan = don.daHetHan();
        await capNhatNeuHetHan(don);

        // Bam nhieu lan thi giu moc DAU TIEN, khong day moc len moi lan bam.
        // Moc do la "nguoi nay cho tu luc nao" - day len thi don cho lau nhat
        // lai trong nhu don moi nhat, va bi xu ly sau cung.
        const laLanDau = !don.daBaoChuyenKhoanLuc;
        if (laLanDau) {
            don.daBaoChuyenKhoanLuc = new Date();
            await don.save();
        }

        let mail = { daGui: false, lyDo: 'chua_cau_hinh' };
        if (laLanDau) {
            const khoa = await Course.findById(don.course).select('title');
            mail = await guiMail(
                soanMailBaoChuyenKhoan({
                    maDon: don.code,
                    soTien: don.amount,
                    tenHocVien: req.user.name || req.user.email,
                    emailHocVien: req.user.email,
                    tenKhoa: khoa?.title || 'Khóa học',
                    baoLuc: don.daBaoChuyenKhoanLuc,
                    daQuaHan,
                    duongDanQuanTri: process.env.FRONTEND_URL
                        ? `${process.env.FRONTEND_URL.replace(/\/+$/, '')}/admin/orders`
                        : ''
                })
            );
        }

        return res.json({
            message: daQuaHan
                ? 'Đã ghi nhận. Mã này đã quá hạn giữ đơn nên ban quản trị sẽ đối chiếu kỹ hơn, có thể lâu hơn bình thường.'
                : 'Đã báo cho ban quản trị. Bạn chờ đối chiếu sao kê giúp nhé.',
            daBaoChuyenKhoanLuc: don.daBaoChuyenKhoanLuc,
            daQuaHan,
            // Bao ro cho giao dien biet mail co di duoc khong: chua cau hinh mail
            // thi hoc vien can duoc nhac lien he quan tri bang duong khac, chu
            // khong ngoi cho mot cai mail khong bao gio den.
            daGuiMail: mail.daGui,
            mailDaCauHinh: mailDaCauHinh()
        });
    } catch (error) {
        console.error('baoDaChuyenKhoan:', error.message);
        return res.status(500).json({ message: 'Không gửi được thông báo' });
    }
};

module.exports = { createOrder, baoDaChuyenKhoan, getOrderByCode, getMyOrders, cancelOrder, dangDon, capNhatNeuHetHan };
