const Announcement = require('../models/Announcement');
const Notification = require('../models/Notification');
const User = require('../models/User');
const {
    buildAnnouncement,
    readChannel,
    recipientFilter,
    visibleFilter,
} = require('../utils/announcementContent');

// Dau trang chi hien vai dai. Nhieu hon thi day noi dung chinh xuong duoi man
// hinh dau tien, va nguoi dung bat dau lo di tat ca.
const MAX_VISIBLE = 3;

// Truong tra ve cho khach. KHONG tra nguoiTao: id tai khoan quan tri khong phai
// viec cua khach vang lai.
const PUBLIC_FIELDS = 'tieuDe noiDung duongDan mucDo createdAt';

// Ghi thong bao chuong theo lo, giong sendSystemNotification: 500 ban ghi mot lan
// cho khong cham gioi han kich thuoc lenh cua Mongo khi he thong dong nguoi.
const HAS_LEAK = 500;

// @desc    Thong bao cong khai dang hien
// @route   GET /api/thong-bao-chung
// @access  Cong khai (ca khach)
const getAnnouncements = async (req, res) => {
    try {
        const list = await Announcement.find(visibleFilter())
            .sort({ createdAt: -1 })
            .limit(MAX_VISIBLE)
            .select(PUBLIC_FIELDS)
            .lean();

        res.json({ danhSach: list });
    } catch (error) {
        console.error('[thong-bao-chung]', error.message);
        // Dai thong bao la phan phu: loi thi tra danh sach rong chu khong de
        // giao dien hien mot thong bao loi o dau moi trang.
        res.json({ danhSach: [] });
    }
};

// @desc    Moi dot thong bao da gui, cho trang quan tri
// @route   GET /api/thong-bao-chung/quan-tri
// @access  Admin
const getAllAdmin = async (req, res) => {
    try {
        const list = await Announcement.find({})
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();

        res.json({ danhSach: list });
    } catch (error) {
        console.error('[thong-bao-chung]', error.message);
        res.status(500).json({ message: 'Không tải được danh sách thông báo.' });
    }
};

// @desc    Gui mot dot thong bao: dai dau trang va/hoac chuong
// @route   POST /api/thong-bao-chung/quan-tri
// @access  Admin
const createAnnouncement = async (req, res) => {
    try {
        const contentText = buildAnnouncement(req.body);
        if (!contentText.ok) return res.status(400).json({ message: contentText.loi });

        const kenh = readChannel(req.body);
        if (!kenh.ok) return res.status(400).json({ message: kenh.loi });

        const notification = await Announcement.create({
            ...contentText.thongBao,
            dangHien: kenh.hienDauTrang,
            guiChuong: kenh.guiChuong,
            vaiTro: kenh.vaiTro,
            nguoiTao: req.user._id,
        });

        let sent = 0;
        if (kenh.guiChuong) {
            const recipient = await User.find(recipientFilter(kenh.vaiTro)).select('_id').lean();

            for (let i = 0; i < recipient.length; i += HAS_LEAK) {
                const lo = recipient.slice(i, i + HAS_LEAK).map((n) => ({
                    user: n._id,
                    loai: 'he_thong',
                    tieuDe: contentText.thongBao.tieuDe,
                    noiDung: contentText.thongBao.noiDung,
                    duongDan: contentText.thongBao.duongDan,
                    thongBaoGoc: notification._id,
                }));
                // ordered: false - mot ban ghi hong khong duoc lam dung ca lo.
                const write = await Notification.insertMany(lo, { ordered: false });
                sent += write.length;
            }

            notification.soNguoiNhan = sent;
            await notification.save();
        }

        res.status(201).json({ thongBao: notification, daGui: sent });
    } catch (error) {
        console.error('[thong-bao-chung]', error.message);
        res.status(500).json({ message: 'Không gửi được thông báo.' });
    }
};

// @desc    Sua noi dung mot dot thong bao - cap nhat ca dai dau trang lan chuong
// @route   PUT /api/thong-bao-chung/quan-tri/:id
// @access  Admin
const editAnnouncement = async (req, res) => {
    try {
        const notification = await Announcement.findById(req.params.id);
        if (!notification) {
            return res.status(404).json({ message: 'Không tìm thấy thông báo.' });
        }

        const contentText = buildAnnouncement(req.body);
        if (!contentText.ok) return res.status(400).json({ message: contentText.loi });

        Object.assign(notification, contentText.thongBao);
        // Bat / tat dai dau trang ngay trong luc sua. Chi nhan boolean that,
        // giong ly do o readChannel.
        if (typeof req.body?.hienDauTrang === 'boolean') {
            notification.dangHien = req.body.hienDauTrang;
        }
        await notification.save();

        // Sua luon trong chuong cua nhung nguoi da nhan, KHONG dong vao daDoc:
        // nguoi da doc thi van la da doc, chi chu ben trong doi.
        const update = await Notification.updateMany(
            { thongBaoGoc: notification._id },
            {
                tieuDe: contentText.thongBao.tieuDe,
                noiDung: contentText.thongBao.noiDung,
                duongDan: contentText.thongBao.duongDan,
            },
        );

        res.json({ thongBao: notification, daCapNhat: update.modifiedCount ?? 0 });
    } catch (error) {
        console.error('[thong-bao-chung]', error.message);
        res.status(500).json({ message: 'Không sửa được thông báo.' });
    }
};

// @desc    Xoa / thu hoi mot dot thong bao khoi ca dai dau trang lan chuong
// @route   DELETE /api/thong-bao-chung/quan-tri/:id
// @access  Admin
const deleteAnnouncement = async (req, res) => {
    try {
        const notification = await Announcement.findById(req.params.id).select('_id').lean();
        if (!notification) {
            return res.status(404).json({ message: 'Không tìm thấy thông báo.' });
        }

        // Rut khoi chuong TRUOC roi moi xoa ban ghi goc: neu buoc sau hong thi
        // ban ghi goc van con trong danh sach de quan tri bam xoa lai, chu khong
        // bo lai cac thong bao mo coi trong chuong ma khong con cach nao tim.
        const revoke = await Notification.deleteMany({ thongBaoGoc: notification._id });
        await Announcement.deleteOne({ _id: notification._id });

        res.json({ daThuHoi: revoke.deletedCount ?? 0 });
    } catch (error) {
        console.error('[thong-bao-chung]', error.message);
        res.status(500).json({ message: 'Không xóa được thông báo.' });
    }
};

module.exports = {
    getAnnouncements,
    getAllAdmin,
    createAnnouncement,
    editAnnouncement,
    deleteAnnouncement,
};
