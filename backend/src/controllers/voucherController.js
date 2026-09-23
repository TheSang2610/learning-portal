/**
 * Ma giam gia: kiem tra, dat cho luot dung, va quan tri.
 *
 * Phep tinh "giam bao nhieu" nam o utils/calcDiscount.js - ham thuan, co test.
 * File nay chi lo CSDL va thu tu cac buoc.
 *
 * BUOC QUAN TRONG NHAT LA datChoLuotDung(). Doc ghi chu tai ham do truoc khi
 * sua bat cu gi o day: no la cho duy nhat bao dam mot ma khong bi dung vuot so
 * luot, ke ca khi nhieu nguoi bam cung mot phan nghin giay.
 */

const mongoose = require('mongoose');

const MaGiamGia = require('../models/Voucher');
const LuotDungMa = require('../models/VoucherUsage');
const Course = require('../models/Course');

const { kiemMaGiamGia, chuanMa } = require('../utils/calcDiscount');

/**
 * Kiem mot ma cho mot khoa, KHONG dat cho gi ca.
 *
 * Dung cho o nhap ma o giao dien: nguoi dung go ma, thay ngay so tien duoc
 * giam, nhung chua ton luot nao. Luot chi bi tru luc that su dat don hoac tru
 * coin - xem datChoLuotDung.
 */
const kiemMaChoKhoa = async (maTho, courseId, nguoiDung) => {
    const ma = chuanMa(maTho);
    if (!ma) {
        return { ok: false, cau: 'Bạn chưa nhập mã giảm giá.', soTienGiam: 0 };
    }

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
        return { ok: false, cau: 'Mã khóa học không hợp lệ.', soTienGiam: 0 };
    }

    const [doc, khoa] = await Promise.all([
        MaGiamGia.findOne({ ma }).lean(),
        Course.findById(courseId).select('price').lean(),
    ]);

    if (!khoa) {
        return { ok: false, cau: 'Không tìm thấy khóa học.', soTienGiam: 0 };
    }

    // Khoa mien phi thi khong co gi de giam. Khong chan o day thi nguoi dung
    // nhap ma vao khoa 0d va he thong bao "giam 0d" - dung ky thuat nhung vo
    // nghia voi nguoi doc.
    const giaGoc = khoa.price ?? 0;
    if (giaGoc <= 0) {
        return { ok: false, cau: 'Khóa học này miễn phí, không cần mã giảm giá.', soTienGiam: 0 };
    }

    // Chi hoi CSDL ve luot da dung khi ma that su co rang buoc do.
    let daDungMa = false;
    if (doc?.moiNguoiMotLan && nguoiDung?._id) {
        daDungMa = !!(await LuotDungMa.exists({ ma: doc._id, user: nguoiDung._id }));
    }

    const kq = kiemMaGiamGia({
        ma: doc,
        giaGoc,
        courseId,
        daDungMa,
        bayGio: Date.now(),
    });

    return { ...kq, ma: doc?.ma, giaGoc, _id: doc?._id };
};

// @desc    Kiem ma truoc khi thanh toan
// @route   POST /api/ma-giam-gia/kiem
// @access  da dang nhap
const kiemMa = async (req, res) => {
    try {
        const { ma, courseId } = req.body || {};
        const kq = await kiemMaChoKhoa(ma, courseId, req.user);

        // Luon 200 ke ca khi ma khong dung duoc: "ma nay khong hop le" la mot
        // KET QUA hop le cua viec kiem tra, khong phai loi cua yeu cau. Tra 400
        // thi giao dien phai bat ngoai le de hien mot thong bao binh thuong.
        res.status(200).json({
            ok: kq.ok,
            cau: kq.cau,
            soTienGiam: kq.soTienGiam,
            phaiTra: kq.phaiTra,
            giaGoc: kq.giaGoc,
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
 * thuc hien. Tra ve { ok, soTienGiam, maId } hoac { ok: false, cau }.
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
const datChoLuotDung = async ({ maTho, courseId, nguoiDung, donHang = null }) => {
    const kiem = await kiemMaChoKhoa(maTho, courseId, nguoiDung);
    if (!kiem.ok) return { ok: false, cau: kiem.cau };

    const dieuKien = { _id: kiem._id, hoatDong: true };

    const doc = await MaGiamGia.findById(kiem._id).select('soLuotToiDa').lean();
    if (doc?.soLuotToiDa !== null && doc?.soLuotToiDa !== undefined) {
        dieuKien.daDung = { $lt: doc.soLuotToiDa };
    }

    const daTang = await MaGiamGia.findOneAndUpdate(
        dieuKien,
        { $inc: { daDung: 1 } },
        { new: true },
    );

    if (!daTang) {
        return { ok: false, cau: 'Mã giảm giá đã hết lượt sử dụng.' };
    }

    try {
        await LuotDungMa.create({
            ma: kiem._id,
            user: nguoiDung._id,
            course: courseId,
            soTienGiam: kiem.soTienGiam,
            donHang,
        });
    } catch (error) {
        // Tra lai luot vua tang. Khong tra thi so luot hao dan moi lan co nguoi
        // thu lai ma ho da dung.
        await MaGiamGia.updateOne({ _id: kiem._id }, { $inc: { daDung: -1 } }).catch(() => {});

        // 11000 = trung khoa duy nhat -> nguoi nay da dung ma roi.
        if (error.code === 11000) {
            return { ok: false, cau: 'Bạn đã dùng mã này rồi.' };
        }

        console.error('[ma-giam-gia] khong ghi duoc luot dung:', error.message);
        return { ok: false, cau: 'Không áp dụng được mã giảm giá, bạn thử lại sau.' };
    }

    return { ok: true, soTienGiam: kiem.soTienGiam, maId: kiem._id, ma: kiem.ma };
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
const hoanLuotDungMa = async (donHangId) => {
    try {
        if (!donHangId) return;

        const luot = await LuotDungMa.findOneAndDelete({ donHang: donHangId });
        if (!luot) return;

        await MaGiamGia.updateOne({ _id: luot.ma }, { $inc: { daDung: -1 } });
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
const danhSachMa = async (req, res) => {
    try {
        const trang = Math.max(parseInt(req.query.trang, 10) || 1, 1);
        const soDong = 30;

        const [danhSach, tong] = await Promise.all([
            MaGiamGia.find({})
                .sort({ createdAt: -1 })
                .skip((trang - 1) * soDong)
                .limit(soDong)
                .populate('apDungKhoa', 'title')
                .lean(),
            MaGiamGia.countDocuments({}),
        ]);

        res.status(200).json({ danhSach, trang, tong, conNua: trang * soDong < tong });
    } catch (error) {
        console.error('[ma-giam-gia]', error.message);
        res.status(500).json({ message: 'Không đọc được danh sách mã.' });
    }
};

/** Doc va lam sach payload tu quan tri. Dung chung cho tao va sua. */
const docThanMa = (body = {}) => {
    const loai = body.loai === 'soTien' ? 'soTien' : 'phanTram';

    // Phan tram bi keo ve 1-100 ngay o day. De Mongoose nhan 500% roi tinh o
    // tinhGiamGia moi chan la de mot con so vo nghia nam trong CSDL, va man
    // hinh quan tri se hien "giam 500%".
    const giaTriTho = Number(body.giaTri) || 0;
    const giaTri =
        loai === 'phanTram'
            ? Math.min(Math.max(Math.round(giaTriTho), 1), 100)
            : Math.max(Math.floor(giaTriTho), 0);

    const soTruongHopLe = (tho) => {
        const so = Number(tho);
        return Number.isFinite(so) && so > 0 ? Math.floor(so) : null;
    };

    return {
        moTa: String(body.moTa || '').trim().slice(0, 300),
        loai,
        giaTri,
        donToiThieu: Math.max(Math.floor(Number(body.donToiThieu) || 0), 0),
        giamToiDa: loai === 'phanTram' ? soTruongHopLe(body.giamToiDa) : null,
        batDau: body.batDau ? new Date(body.batDau) : new Date(),
        ketThuc: new Date(body.ketThuc),
        soLuotToiDa: soTruongHopLe(body.soLuotToiDa),
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
const taoMa = async (req, res) => {
    try {
        const ma = chuanMa(req.body?.ma);
        if (ma.length < 3) {
            return res.status(400).json({ message: 'Mã phải có ít nhất 3 ký tự.' });
        }

        const than = docThanMa(req.body);

        if (!than.ketThuc || Number.isNaN(than.ketThuc.getTime())) {
            return res.status(400).json({ message: 'Ngày kết thúc không hợp lệ.' });
        }
        if (than.ketThuc.getTime() <= than.batDau.getTime()) {
            return res
                .status(400)
                .json({ message: 'Ngày kết thúc phải sau ngày bắt đầu.' });
        }

        const moi = await MaGiamGia.create({ ...than, ma, nguoiTao: req.user._id });

        res.status(201).json({ ma: moi.toObject() });
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
const suaMa = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Mã không hợp lệ.' });
        }

        const than = docThanMa(req.body);

        if (!than.ketThuc || Number.isNaN(than.ketThuc.getTime())) {
            return res.status(400).json({ message: 'Ngày kết thúc không hợp lệ.' });
        }

        // KHONG cho sua `ma` va KHONG cho sua `daDung`.
        //
        // Doi chuoi ma sau khi da phat cho nguoi dung la lam hong moi cho da
        // chia se ma do. Con `daDung` la so dem cua he thong - cho sua tay la
        // mo duong cho viec "lam moi" mot ma da het luot.
        const kq = await MaGiamGia.findByIdAndUpdate(id, than, {
            new: true,
            runValidators: true,
        }).lean();

        if (!kq) {
            return res.status(404).json({ message: 'Không tìm thấy mã giảm giá.' });
        }

        res.status(200).json({ ma: kq });
    } catch (error) {
        console.error('[ma-giam-gia]', error.message);
        res.status(500).json({ message: 'Không sửa được mã giảm giá.' });
    }
};

// @desc    Bat / tat mot ma
// @route   PUT /api/ma-giam-gia/quan-tri/:id/bat-tat
// @access  admin
const batTatMa = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Mã không hợp lệ.' });
        }

        const doc = await MaGiamGia.findById(id);
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
const luotDungCuaMa = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Mã không hợp lệ.' });
        }

        const danhSach = await LuotDungMa.find({ ma: id })
            .sort({ createdAt: -1 })
            .limit(200)
            .populate('user', 'name email')
            .populate('course', 'title')
            .lean();

        const tongGiam = danhSach.reduce((t, l) => t + (l.soTienGiam || 0), 0);

        res.status(200).json({ danhSach, tongGiam });
    } catch (error) {
        console.error('[ma-giam-gia]', error.message);
        res.status(500).json({ message: 'Không đọc được lượt dùng.' });
    }
};

module.exports = {
    kiemMa,
    kiemMaChoKhoa,
    datChoLuotDung,
    hoanLuotDungMa,
    danhSachMa,
    taoMa,
    suaMa,
    batTatMa,
    luotDungCuaMa,
};
