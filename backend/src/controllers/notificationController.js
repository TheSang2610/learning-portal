/**
 * Thong bao trong ung dung.
 *
 * Noi dung tung loai nam o utils/notificationContent.js (ham thuan, co test). File
 * nay chi lo viec ghi/doc CSDL va kiem quyen.
 *
 * MOI TRUY VAN O DAY DEU PHAI LOC THEO req.user._id. Thong bao chua ten khoa
 * hoc da mua va tien do hoc cua tung nguoi - lo mot duong khong loc la lo ca
 * lich su mua hang cua nguoi khac. Xem ghi chu o tung ham.
 */

const mongoose = require('mongoose');

const Notification = require('../models/Notification');
const User = require('../models/User');
const { dungThongBao } = require('../utils/notificationContent');

// So thong bao tra ve moi lan. Chuong chi hien duoc chung nay, lay nhieu hon la
// tai du lieu khong ai nhin.
const SO_MOI_TRANG = 20;
const SO_TRANG_TOI_DA = 50;

/**
 * Ghi mot thong bao cho mot nguoi dung.
 *
 * HAM NAY KHONG BAO GIO NEM NGOAI LE, va do la diem quan trong nhat cua no.
 *
 * No duoc goi tu giua cac luong nghiep vu that: duyet don hang, cap chung nhan,
 * cong coin. Neu no nem thi mot loi vat vanh o khau thong bao se lam that bai
 * ca viec duyet don - tien da tru, khoa khong mo, va nguoi dung lanh du. Thong
 * bao la thu phu; hong thi ghi log roi di tiep.
 *
 * Vi cung ly do do, noi goi KHONG can await neu khong muon - nhung nen await de
 * loi hien ra trong log ngay lan chay do thay vi thanh mot loi bat dong bo troi
 * noi khong ai truy duoc.
 */
const guiThongBao = async (userId, loai, duLieu = {}) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            console.error('[thong-bao] userId khong hop le:', userId);
            return null;
        }

        const kq = dungThongBao(loai, duLieu);
        if (!kq.ok) {
            console.error('[thong-bao]', kq.loi);
            return null;
        }

        return await Notification.create({ user: userId, ...kq.thongBao });
    } catch (error) {
        console.error('[thong-bao] khong ghi duoc:', error.message);
        return null;
    }
};

/**
 * Danh sach thong bao cua CHINH nguoi dang dang nhap.
 *
 * Loc theo req.user._id chu khong nhan userId tu tham so: nhan tu tham so thi
 * doi mot con so tren dia chi la doc duoc thong bao cua nguoi khac.
 */
const layThongBao = async (req, res) => {
    try {
        const trang = Math.min(
            Math.max(parseInt(req.query.trang, 10) || 1, 1),
            SO_TRANG_TOI_DA,
        );

        const [danhSach, tong, chuaDoc] = await Promise.all([
            Notification.find({ user: req.user._id })
                .sort({ createdAt: -1 })
                .skip((trang - 1) * SO_MOI_TRANG)
                .limit(SO_MOI_TRANG)
                .lean(),
            Notification.countDocuments({ user: req.user._id }),
            Notification.countDocuments({ user: req.user._id, daDoc: false }),
        ]);

        res.status(200).json({
            danhSach,
            chuaDoc,
            trang,
            tong,
            conNua: trang * SO_MOI_TRANG < tong,
        });
    } catch (error) {
        console.error('[thong-bao]', error.message);
        res.status(500).json({ message: 'Không đọc được thông báo.' });
    }
};

/**
 * Chi dem so chua doc - cho cai cham do tren chuong.
 *
 * Tach rieng khoi layThongBao vi giao dien goi cai nay thuong xuyen hon nhieu
 * (moi lan doi trang), con danh sach day du thi chi khi nguoi dung bam chuong.
 * countDocuments dung thang index { user, daDoc } nen re hon han mot luot find.
 */
const demChuaDoc = async (req, res) => {
    try {
        const chuaDoc = await Notification.countDocuments({
            user: req.user._id,
            daDoc: false,
        });

        res.status(200).json({ chuaDoc });
    } catch (error) {
        console.error('[thong-bao]', error.message);
        res.status(500).json({ message: 'Không đếm được thông báo.' });
    }
};

/**
 * Danh dau MOT thong bao da doc.
 *
 * Dieu kien loc co ca `user`: thieu no thi bat ky ai doan dung id cung danh dau
 * duoc thong bao cua nguoi khac. Khong lo ro ri du lieu nhung la mot duong
 * pha hoai, va cung la cach do xem mot id co ton tai hay khong.
 */
const danhDauDaDoc = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Mã thông báo không hợp lệ.' });
        }

        const kq = await Notification.findOneAndUpdate(
            { _id: id, user: req.user._id },
            { daDoc: true },
            { new: true },
        ).lean();

        if (!kq) {
            return res.status(404).json({ message: 'Không tìm thấy thông báo.' });
        }

        res.status(200).json({ thongBao: kq });
    } catch (error) {
        console.error('[thong-bao]', error.message);
        res.status(500).json({ message: 'Không cập nhật được thông báo.' });
    }
};

const danhDauTatCa = async (req, res) => {
    try {
        const kq = await Notification.updateMany(
            { user: req.user._id, daDoc: false },
            { daDoc: true },
        );

        res.status(200).json({ daDanhDau: kq.modifiedCount ?? 0 });
    } catch (error) {
        console.error('[thong-bao]', error.message);
        res.status(500).json({ message: 'Không cập nhật được thông báo.' });
    }
};

/**
 * Gui mot thong bao he thong cho NHIEU nguoi cung luc.
 *
 * @route   POST /api/thong-bao/quan-tri/gui
 * @access  admin
 *
 * VIET THEO LO chu khong mot lenh insertMany duy nhat: he thong vai nghin
 * nguoi thi mot lenh chen vai nghin tai lieu se giu ket noi rat lau va an het
 * bo nho cua ham serverless. Chia lo thi moi lenh nho, va hong giua chung thi
 * nhung lo truoc VAN da gui - nguoi dung nhan duoc thong bao, chi la thieu mot
 * phan, con hon khong ai nhan duoc gi.
 *
 * KHONG gui cho admin: thong bao he thong la thu quan tri viet ra, gui nguoc
 * lai cho chinh ho chi lam day chuong cua ho moi lan thong bao.
 */
const guiThongBaoHeThong = async (req, res) => {
    try {
        const tieuDe = String(req.body?.tieuDe || '').trim();
        if (!tieuDe) {
            return res.status(400).json({ message: 'Bạn chưa nhập tiêu đề.' });
        }

        const kq = dungThongBao('he_thong', {
            tieuDe,
            noiDung: req.body?.noiDung,
            duongDan: req.body?.duongDan,
        });

        if (!kq.ok) {
            return res.status(400).json({ message: kq.loi });
        }

        // Loc theo vai tro. Rong = moi hoc vien va giang vien.
        const vaiTro = req.body?.vaiTro;
        const loc = ['student', 'instructor'].includes(vaiTro)
            ? { role: vaiTro }
            : { role: { $ne: 'admin' } };

        const nguoiNhan = await User.find(loc).select('_id').lean();

        if (nguoiNhan.length === 0) {
            return res.status(200).json({ daGui: 0 });
        }

        const CO_LO = 500;
        let daGui = 0;

        for (let i = 0; i < nguoiNhan.length; i += CO_LO) {
            const lo = nguoiNhan.slice(i, i + CO_LO).map((n) => ({
                user: n._id,
                ...kq.thongBao,
            }));

            // ordered: false - mot ban ghi hong khong duoc lam dung ca lo.
            const ghi = await Notification.insertMany(lo, { ordered: false });
            daGui += ghi.length;
        }

        res.status(201).json({ daGui });
    } catch (error) {
        console.error('[thong-bao]', error.message);
        res.status(500).json({ message: 'Không gửi được thông báo.' });
    }
};

module.exports = {
    guiThongBao,
    guiThongBaoHeThong,
    layThongBao,
    demChuaDoc,
    danhDauDaDoc,
    danhDauTatCa,
    SO_MOI_TRANG,
};
