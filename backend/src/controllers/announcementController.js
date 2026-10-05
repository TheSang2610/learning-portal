const Announcement = require('../models/Announcement');
const Notification = require('../models/Notification');
const User = require('../models/User');
const {
    dungThongBaoChung,
    docKenh,
    locNguoiNhan,
    locDangHien,
} = require('../utils/announcementContent');

// Dau trang chi hien vai dai. Nhieu hon thi day noi dung chinh xuong duoi man
// hinh dau tien, va nguoi dung bat dau lo di tat ca.
const SO_HIEN_TOI_DA = 3;

// Truong tra ve cho khach. KHONG tra nguoiTao: id tai khoan quan tri khong phai
// viec cua khach vang lai.
const TRUONG_CONG_KHAI = 'tieuDe noiDung duongDan mucDo createdAt';

// Ghi thong bao chuong theo lo, giong guiThongBaoHeThong: 500 ban ghi mot lan
// cho khong cham gioi han kich thuoc lenh cua Mongo khi he thong dong nguoi.
const CO_LO = 500;

// @desc    Thong bao cong khai dang hien
// @route   GET /api/thong-bao-chung
// @access  Cong khai (ca khach)
const layThongBaoChung = async (req, res) => {
    try {
        const danhSach = await Announcement.find(locDangHien())
            .sort({ createdAt: -1 })
            .limit(SO_HIEN_TOI_DA)
            .select(TRUONG_CONG_KHAI)
            .lean();

        res.json({ danhSach });
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
const layTatCaQuanTri = async (req, res) => {
    try {
        const danhSach = await Announcement.find({})
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();

        res.json({ danhSach });
    } catch (error) {
        console.error('[thong-bao-chung]', error.message);
        res.status(500).json({ message: 'Không tải được danh sách thông báo.' });
    }
};

// @desc    Gui mot dot thong bao: dai dau trang va/hoac chuong
// @route   POST /api/thong-bao-chung/quan-tri
// @access  Admin
const taoThongBaoChung = async (req, res) => {
    try {
        const nd = dungThongBaoChung(req.body);
        if (!nd.ok) return res.status(400).json({ message: nd.loi });

        const kenh = docKenh(req.body);
        if (!kenh.ok) return res.status(400).json({ message: kenh.loi });

        const thongBao = await Announcement.create({
            ...nd.thongBao,
            dangHien: kenh.hienDauTrang,
            guiChuong: kenh.guiChuong,
            vaiTro: kenh.vaiTro,
            nguoiTao: req.user._id,
        });

        let daGui = 0;
        if (kenh.guiChuong) {
            const nguoiNhan = await User.find(locNguoiNhan(kenh.vaiTro)).select('_id').lean();

            for (let i = 0; i < nguoiNhan.length; i += CO_LO) {
                const lo = nguoiNhan.slice(i, i + CO_LO).map((n) => ({
                    user: n._id,
                    loai: 'he_thong',
                    tieuDe: nd.thongBao.tieuDe,
                    noiDung: nd.thongBao.noiDung,
                    duongDan: nd.thongBao.duongDan,
                    thongBaoGoc: thongBao._id,
                }));
                // ordered: false - mot ban ghi hong khong duoc lam dung ca lo.
                const ghi = await Notification.insertMany(lo, { ordered: false });
                daGui += ghi.length;
            }

            thongBao.soNguoiNhan = daGui;
            await thongBao.save();
        }

        res.status(201).json({ thongBao, daGui });
    } catch (error) {
        console.error('[thong-bao-chung]', error.message);
        res.status(500).json({ message: 'Không gửi được thông báo.' });
    }
};

// @desc    Sua noi dung mot dot thong bao - cap nhat ca dai dau trang lan chuong
// @route   PUT /api/thong-bao-chung/quan-tri/:id
// @access  Admin
const suaThongBaoChung = async (req, res) => {
    try {
        const thongBao = await Announcement.findById(req.params.id);
        if (!thongBao) {
            return res.status(404).json({ message: 'Không tìm thấy thông báo.' });
        }

        const nd = dungThongBaoChung(req.body);
        if (!nd.ok) return res.status(400).json({ message: nd.loi });

        Object.assign(thongBao, nd.thongBao);
        // Bat / tat dai dau trang ngay trong luc sua. Chi nhan boolean that,
        // giong ly do o docKenh.
        if (typeof req.body?.hienDauTrang === 'boolean') {
            thongBao.dangHien = req.body.hienDauTrang;
        }
        await thongBao.save();

        // Sua luon trong chuong cua nhung nguoi da nhan, KHONG dong vao daDoc:
        // nguoi da doc thi van la da doc, chi chu ben trong doi.
        const capNhat = await Notification.updateMany(
            { thongBaoGoc: thongBao._id },
            {
                tieuDe: nd.thongBao.tieuDe,
                noiDung: nd.thongBao.noiDung,
                duongDan: nd.thongBao.duongDan,
            },
        );

        res.json({ thongBao, daCapNhat: capNhat.modifiedCount ?? 0 });
    } catch (error) {
        console.error('[thong-bao-chung]', error.message);
        res.status(500).json({ message: 'Không sửa được thông báo.' });
    }
};

// @desc    Xoa / thu hoi mot dot thong bao khoi ca dai dau trang lan chuong
// @route   DELETE /api/thong-bao-chung/quan-tri/:id
// @access  Admin
const xoaThongBaoChung = async (req, res) => {
    try {
        const thongBao = await Announcement.findById(req.params.id).select('_id').lean();
        if (!thongBao) {
            return res.status(404).json({ message: 'Không tìm thấy thông báo.' });
        }

        // Rut khoi chuong TRUOC roi moi xoa ban ghi goc: neu buoc sau hong thi
        // ban ghi goc van con trong danh sach de quan tri bam xoa lai, chu khong
        // bo lai cac thong bao mo coi trong chuong ma khong con cach nao tim.
        const thuHoi = await Notification.deleteMany({ thongBaoGoc: thongBao._id });
        await Announcement.deleteOne({ _id: thongBao._id });

        res.json({ daThuHoi: thuHoi.deletedCount ?? 0 });
    } catch (error) {
        console.error('[thong-bao-chung]', error.message);
        res.status(500).json({ message: 'Không xóa được thông báo.' });
    }
};

module.exports = {
    layThongBaoChung,
    layTatCaQuanTri,
    taoThongBaoChung,
    suaThongBaoChung,
    xoaThongBaoChung,
};
