/**
 * Ma giam gia: kiem tra, dat cho luot dung, va quan tri.
 *
 * Phep tinh "giam bao nhieu" nam o utils/calcDiscount.js - ham thuan, co test.
 * File nay chi lo CSDL va thu tu cac buoc.
 *
 * BUOC QUAN TRONG NHAT LA reserveUsage(). Doc ghi chu tai ham do truoc khi
 * sua bat cu gi o day: no la cho duy nhat bao dam mot ma khong bi dung vuot so
 * luot, ke ca khi nhieu nguoi bam cung mot phan nghin giay.
 */

const mongoose = require('mongoose');

const Voucher = require('../models/Voucher');
const VoucherUsage = require('../models/VoucherUsage');
const Course = require('../models/Course');

const { checkVoucher, normalizeCode } = require('../utils/calcDiscount');

/**
 * Kiem mot ma cho mot khoa, KHONG dat cho gi ca.
 *
 * Dung cho o nhap ma o giao dien: nguoi dung go ma, thay ngay so tien duoc
 * giam, nhung chua ton luot nao. Luot chi bi tru luc that su dat don - xem
 * reserveUsage.
 */
const checkVoucherForCourse = async (rawCode, courseId, user) => {
    const code = normalizeCode(rawCode);
    if (!code) {
        return { ok: false, cau: 'Bạn chưa nhập mã giảm giá.', soTienGiam: 0 };
    }

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
        return { ok: false, cau: 'Mã khóa học không hợp lệ.', soTienGiam: 0 };
    }

    const [doc, course] = await Promise.all([
        Voucher.findOne({ ma: code }).lean(),
        Course.findById(courseId).select('price').lean(),
    ]);

    if (!course) {
        return { ok: false, cau: 'Không tìm thấy khóa học.', soTienGiam: 0 };
    }

    // Khoa mien phi thi khong co gi de giam. Khong chan o day thi nguoi dung
    // nhap ma vao khoa 0d va he thong bao "giam 0d" - dung ky thuat nhung vo
    // nghia voi nguoi doc.
    const originalPrice = course.price ?? 0;
    if (originalPrice <= 0) {
        return { ok: false, cau: 'Khóa học này miễn phí, không cần mã giảm giá.', soTienGiam: 0 };
    }

    // Chi hoi CSDL ve luot da dung khi ma that su co rang buoc do.
    let usedVoucher = false;
    if (doc?.moiNguoiMotLan && user?._id) {
        usedVoucher = !!(await VoucherUsage.exists({ ma: doc._id, user: user._id }));
    }

    const outcome = checkVoucher({
        ma: doc,
        giaGoc: originalPrice,
        courseId,
        usedVoucher,
        now: Date.now(),
    });

    return { ...outcome, ma: doc?.ma, giaGoc: originalPrice, _id: doc?._id };
};

// @desc    Kiem ma truoc khi thanh toan
// @route   POST /api/ma-giam-gia/kiem
// @access  da dang nhap
const verifyCode = async (req, res) => {
    try {
        const { ma: code, courseId } = req.body || {};
        const outcome = await checkVoucherForCourse(code, courseId, req.user);

        // Luon 200 ke ca khi ma khong dung duoc: "ma nay khong hop le" la mot
        // KET QUA hop le cua viec kiem tra, khong phai loi cua yeu cau. Tra 400
        // thi giao dien phai bat ngoai le de hien mot thong bao binh thuong.
        res.status(200).json({
            ok: outcome.ok,
            cau: outcome.cau,
            soTienGiam: outcome.soTienGiam,
            phaiTra: outcome.phaiTra,
            giaGoc: outcome.giaGoc,
        });
    } catch (error) {
        console.error('[ma-giam-gia]', error.message);
        res.status(500).json({ message: 'Không kiểm tra được mã giảm giá.' });
    }
};

/**
 * Dat cho MOT luot dung, nguyen tu.
 *
 * Goi ham nay NGAY TRUOC khi tru tien / tao don, va chi khi da chac chan se
 * thuc hien. Tra ve { ok, soTienGiam, voucherId } hoac { ok: false, cau }.
 *
 * VI SAO PHAI LAM HAI BUOC RIENG:
 *
 *   Buoc 1 - $inc co dieu kien `daDung < soLuotToiDa`. Doc roi ghi khong dung
 *     duoc o day: hai nguoi cung doc thay "con 1 luot", ca hai cung ghi, ma
 *     vuot tran. findOneAndUpdate voi dieu kien la mot thao tac nguyen tu duy
 *     nhat o phia CSDL nen khong co khe ho do.
 *
 *   Buoc 2 - ghi LuotDungMa. Index duy nhat { ma, user } chan mot nguoi dung
 *     hai lan, cung bang co che cua CSDL chu khong bang phep kiem o ma nguon.
 *
 *   Buoc 2 hong thi PHAI hoan lai buoc 1, neu khong thi ma bi tru mot luot ma
 *   khong ai duoc giam - va so luot cu hao dan moi lan co nguoi thu lai.
 */
const reserveUsage = async ({ rawCode, courseId, nguoiDung: user, donHang: order = null }) => {
    const check = await checkVoucherForCourse(rawCode, courseId, user);
    if (!check.ok) return { ok: false, cau: check.cau };

    const conditions = { _id: check._id, hoatDong: true };

    const doc = await Voucher.findById(check._id).select('soLuotToiDa').lean();
    if (doc?.soLuotToiDa !== null && doc?.soLuotToiDa !== undefined) {
        conditions.daDung = { $lt: doc.soLuotToiDa };
    }

    const gifted = await Voucher.findOneAndUpdate(
        conditions,
        { $inc: { daDung: 1 } },
        { new: true },
    );

    if (!gifted) {
        return { ok: false, cau: 'Mã giảm giá đã hết lượt sử dụng.' };
    }

    try {
        await VoucherUsage.create({
            ma: check._id,
            user: user._id,
            course: courseId,
            soTienGiam: check.soTienGiam,
            donHang: order,
        });
    } catch (error) {
        // Tra lai luot vua tang. Khong tra thi so luot hao dan moi lan co nguoi
        // thu lai ma ho da dung.
        await Voucher.updateOne({ _id: check._id }, { $inc: { daDung: -1 } }).catch(() => {});

        // 11000 = trung khoa duy nhat -> nguoi nay da dung ma roi.
        if (error.code === 11000) {
            return { ok: false, cau: 'Bạn đã dùng mã này rồi.' };
        }

        console.error('[ma-giam-gia] khong ghi duoc luot dung:', error.message);
        return { ok: false, cau: 'Không áp dụng được mã giảm giá, bạn thử lại sau.' };
    }

    return { ok: true, soTienGiam: check.soTienGiam, voucherId: check._id, ma: check.ma };
};

/**
 * Hoan lai luot dung khi don bi huy hoac het han.
 *
 * Khong hoan thi ma bi tieu mot luot cho mot don chua bao gio duoc tra tien,
 * va nguoi dung do cung khong dung lai duoc ma nua (vuong moiNguoiMotLan).
 *
 * Khong bao gio nem: no duoc goi tu giua luong huy don, va mot loi o day khong
 * duoc phep lam that bai viec huy.
 */
const refundVoucherUsage = async (orderId) => {
    try {
        if (!orderId) return;

        const attempt = await VoucherUsage.findOneAndDelete({ donHang: orderId });
        if (!attempt) return;

        await Voucher.updateOne({ _id: attempt.ma }, { $inc: { daDung: -1 } });
    } catch (error) {
        console.error('[ma-giam-gia] khong hoan duoc luot:', error.message);
    }
};

/* ==========================================================================
   QUAN TRI
   ========================================================================== */

// @desc    Danh sach ma giam gia
// @route   GET /api/ma-giam-gia/quan-tri?trang=1
// @access  admin
const listVouchers = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.trang, 10) || 1, 1);
        const pageSize = 30;

        const [list, total] = await Promise.all([
            Voucher.find({})
                .sort({ createdAt: -1 })
                .skip((page - 1) * pageSize)
                .limit(pageSize)
                .populate('apDungKhoa', 'title')
                .lean(),
            Voucher.countDocuments({}),
        ]);

        res.status(200).json({ danhSach: list, trang: page, tong: total, conNua: page * pageSize < total });
    } catch (error) {
        console.error('[ma-giam-gia]', error.message);
        res.status(500).json({ message: 'Không đọc được danh sách mã.' });
    }
};

/** Doc va lam sach payload tu quan tri. Dung chung cho tao va sua. */
const readCodeBody = (body = {}) => {
    const loai = body.loai === 'soTien' ? 'soTien' : 'phanTram';

    // Phan tram bi keo ve 1-100 ngay o day. De Mongoose nhan 500% roi tinh o
    // tinhGiamGia moi chan la de mot con so vo nghia nam trong CSDL, va man
    // hinh quan tri se hien "giam 500%".
    const rawValue = Number(body.giaTri) || 0;
    const value =
        loai === 'phanTram'
            ? Math.min(Math.max(Math.round(rawValue), 1), 100)
            : Math.max(Math.floor(rawValue), 0);

    const validFieldCount = (tho) => {
        const count = Number(tho);
        return Number.isFinite(count) && count > 0 ? Math.floor(count) : null;
    };

    return {
        moTa: String(body.moTa || '').trim().slice(0, 300),
        loai,
        giaTri: value,
        donToiThieu: Math.max(Math.floor(Number(body.donToiThieu) || 0), 0),
        giamToiDa: loai === 'phanTram' ? validFieldCount(body.giamToiDa) : null,
        batDau: body.batDau ? new Date(body.batDau) : new Date(),
        ketThuc: new Date(body.ketThuc),
        soLuotToiDa: validFieldCount(body.soLuotToiDa),
        moiNguoiMotLan: body.moiNguoiMotLan !== false,
        apDungKhoa: Array.isArray(body.apDungKhoa)
            ? body.apDungKhoa.filter((id) => mongoose.Types.ObjectId.isValid(id))
            : [],
        hoatDong: body.hoatDong !== false,
    };
};

// @desc    Tao ma moi
// @route   POST /api/ma-giam-gia/quan-tri
// @access  admin
const generateCode = async (req, res) => {
    try {
        const code = normalizeCode(req.body?.ma);
        if (code.length < 3) {
            return res.status(400).json({ message: 'Mã phải có ít nhất 3 ký tự.' });
        }

        const payloadBody = readCodeBody(req.body);

        if (!payloadBody.ketThuc || Number.isNaN(payloadBody.ketThuc.getTime())) {
            return res.status(400).json({ message: 'Ngày kết thúc không hợp lệ.' });
        }
        if (payloadBody.ketThuc.getTime() <= payloadBody.batDau.getTime()) {
            return res
                .status(400)
                .json({ message: 'Ngày kết thúc phải sau ngày bắt đầu.' });
        }

        const recent = await Voucher.create({ ...payloadBody, ma: code, nguoiTao: req.user._id });

        res.status(201).json({ ma: recent.toObject() });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Mã này đã tồn tại.' });
        }
        console.error('[ma-giam-gia]', error.message);
        res.status(500).json({ message: 'Không tạo được mã giảm giá.' });
    }
};

// @desc    Sua ma
// @route   PUT /api/ma-giam-gia/quan-tri/:id
// @access  admin
const editVoucher = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Mã không hợp lệ.' });
        }

        const payloadBody = readCodeBody(req.body);

        if (!payloadBody.ketThuc || Number.isNaN(payloadBody.ketThuc.getTime())) {
            return res.status(400).json({ message: 'Ngày kết thúc không hợp lệ.' });
        }

        // KHONG cho sua `ma` va KHONG cho sua `daDung`.
        //
        // Doi chuoi ma sau khi da phat cho nguoi dung la lam hong moi cho da
        // chia se ma do. Con `daDung` la so dem cua he thong - cho sua tay la
        // mo duong cho viec "lam moi" mot ma da het luot.
        const outcome = await Voucher.findByIdAndUpdate(id, payloadBody, {
            new: true,
            runValidators: true,
        }).lean();

        if (!outcome) {
            return res.status(404).json({ message: 'Không tìm thấy mã giảm giá.' });
        }

        res.status(200).json({ ma: outcome });
    } catch (error) {
        console.error('[ma-giam-gia]', error.message);
        res.status(500).json({ message: 'Không sửa được mã giảm giá.' });
    }
};

// @desc    Bat / tat mot ma
// @route   PUT /api/ma-giam-gia/quan-tri/:id/bat-tat
// @access  admin
const toggleVoucher = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Mã không hợp lệ.' });
        }

        const doc = await Voucher.findById(id);
        if (!doc) {
            return res.status(404).json({ message: 'Không tìm thấy mã giảm giá.' });
        }

        doc.hoatDong = !doc.hoatDong;
        await doc.save();

        res.status(200).json({ ma: doc.toObject() });
    } catch (error) {
        console.error('[ma-giam-gia]', error.message);
        res.status(500).json({ message: 'Không đổi được trạng thái mã.' });
    }
};

// @desc    Ai da dung mot ma
// @route   GET /api/ma-giam-gia/quan-tri/:id/luot-dung
// @access  admin
const voucherUsage = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Mã không hợp lệ.' });
        }

        const list = await VoucherUsage.find({ ma: id })
            .sort({ createdAt: -1 })
            .limit(200)
            .populate('user', 'name email')
            .populate('course', 'title')
            .lean();

        const totalDiscount = list.reduce((t, l) => t + (l.soTienGiam || 0), 0);

        res.status(200).json({ danhSach: list, tongGiam: totalDiscount });
    } catch (error) {
        console.error('[ma-giam-gia]', error.message);
        res.status(500).json({ message: 'Không đọc được lượt dùng.' });
    }
};

module.exports = {
    verifyCode,
    checkVoucherForCourse,
    reserveUsage,
    refundVoucherUsage,
    listVouchers,
    generateCode,
    editVoucher,
    toggleVoucher,
    voucherUsage,
};
