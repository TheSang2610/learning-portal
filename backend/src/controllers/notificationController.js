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
const { buildNotification } = require('../utils/notificationContent');

// So thong bao tra ve moi lan. Chuong chi hien duoc chung nay, lay nhieu hon la
// tai du lieu khong ai nhin.
const PAGE_SIZE = 20;
const MAX_PAGES = 50;

/**
 * Ghi mot thong bao cho mot nguoi dung.
 *
 * HAM NAY KHONG BAO GIO NEM NGOAI LE, va do la diem quan trong nhat cua no.
 *
 * No duoc goi tu giua cac luong nghiep vu that: duyet don hang, cap chung nhan,
 * tu mo khoa theo bao co ngan hang. Neu no nem thi mot loi vat vanh o khau thong bao se lam that bai
 * ca viec duyet don - tien da tru, khoa khong mo, va nguoi dung lanh du. Thong
 * bao la thu phu; hong thi ghi log roi di tiep.
 *
 * Vi cung ly do do, noi goi KHONG can await neu khong muon - nhung nen await de
 * loi hien ra trong log ngay lan chay do thay vi thanh mot loi bat dong bo troi
 * noi khong ai truy duoc.
 */
const sendNotification = async (userId, loai, data = {}) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            console.error('[thong-bao] userId khong hop le:', userId);
            return null;
        }

        const outcome = buildNotification(loai, data);
        if (!outcome.ok) {
            console.error('[thong-bao]', outcome.loi);
            return null;
        }

        return await Notification.create({ user: userId, ...outcome.thongBao });
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
const getNotifications = async (req, res) => {
    try {
        const page = Math.min(
            Math.max(parseInt(req.query.trang, 10) || 1, 1),
            MAX_PAGES,
        );

        const [list, total, unread] = await Promise.all([
            Notification.find({ user: req.user._id })
                .sort({ createdAt: -1 })
                .skip((page - 1) * PAGE_SIZE)
                .limit(PAGE_SIZE)
                .lean(),
            Notification.countDocuments({ user: req.user._id }),
            Notification.countDocuments({ user: req.user._id, daDoc: false }),
        ]);

        res.status(200).json({
            danhSach: list,
            chuaDoc: unread,
            trang: page,
            tong: total,
            conNua: page * PAGE_SIZE < total,
        });
    } catch (error) {
        console.error('[thong-bao]', error.message);
        res.status(500).json({ message: 'Không đọc được thông báo.' });
    }
};

/**
 * Chi dem so chua doc - cho cai cham do tren chuong.
 *
 * Tach rieng khoi getNotifications vi giao dien goi cai nay thuong xuyen hon nhieu
 * (moi lan doi trang), con danh sach day du thi chi khi nguoi dung bam chuong.
 * countDocuments dung thang index { user, daDoc } nen re hon han mot luot find.
 */
const countUnread = async (req, res) => {
    try {
        const unread = await Notification.countDocuments({
            user: req.user._id,
            daDoc: false,
        });

        res.status(200).json({ chuaDoc: unread });
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
const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Mã thông báo không hợp lệ.' });
        }

        const outcome = await Notification.findOneAndUpdate(
            { _id: id, user: req.user._id },
            { daDoc: true },
            { new: true },
        ).lean();

        if (!outcome) {
            return res.status(404).json({ message: 'Không tìm thấy thông báo.' });
        }

        res.status(200).json({ thongBao: outcome });
    } catch (error) {
        console.error('[thong-bao]', error.message);
        res.status(500).json({ message: 'Không cập nhật được thông báo.' });
    }
};

const markAllAsRead = async (req, res) => {
    try {
        const outcome = await Notification.updateMany(
            { user: req.user._id, daDoc: false },
            { daDoc: true },
        );

        res.status(200).json({ daDanhDau: outcome.modifiedCount ?? 0 });
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
const sendSystemNotification = async (req, res) => {
    try {
        const title = String(req.body?.tieuDe || '').trim();
        if (!title) {
            return res.status(400).json({ message: 'Bạn chưa nhập tiêu đề.' });
        }

        const outcome = buildNotification('he_thong', {
            tieuDe: title,
            noiDung: req.body?.noiDung,
            duongDan: req.body?.duongDan,
        });

        if (!outcome.ok) {
            return res.status(400).json({ message: outcome.loi });
        }

        // Loc theo vai tro. Rong = moi hoc vien va giang vien.
        const role = req.body?.vaiTro;
        const query = ['student', 'instructor'].includes(role)
            ? { role: role }
            : { role: { $ne: 'admin' } };

        const recipient = await User.find(query).select('_id').lean();

        if (recipient.length === 0) {
            return res.status(200).json({ daGui: 0 });
        }

        const HAS_LEAK = 500;
        let sent = 0;

        for (let i = 0; i < recipient.length; i += HAS_LEAK) {
            const lo = recipient.slice(i, i + HAS_LEAK).map((n) => ({
                user: n._id,
                ...outcome.thongBao,
            }));

            // ordered: false - mot ban ghi hong khong duoc lam dung ca lo.
            const write = await Notification.insertMany(lo, { ordered: false });
            sent += write.length;
        }

        res.status(201).json({ daGui: sent });
    } catch (error) {
        console.error('[thong-bao]', error.message);
        res.status(500).json({ message: 'Không gửi được thông báo.' });
    }
};

module.exports = {
    sendNotification,
    sendSystemNotification,
    getNotifications,
    countUnread,
    markAsRead,
    markAllAsRead,
    PAGE_SIZE,
};
