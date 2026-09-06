const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const GiaoDichCoin = require('../models/GiaoDichCoin');
const { congCoin, truCoin } = require('../utils/viCoin');
const { giaRaCoin, kiemSoCoinNap, coinRaDong } = require('../utils/coin');
const { taoGhiDanh } = require('../utils/ghiDanh');

/* ==========================================================================
   QUAN TRI
   ========================================================================== */

/**
 * POST /api/coin/quan-tri/:id  - nap hoac thu hoi coin cua mot hoc vien.
 *
 * So am la thu hoi. Dung chung mot duong thay vi tach "nap" va "tru" thanh hai
 * endpoint: cung mot phep toan, tach ra chi de hai ban logic co co hoi troi
 * khac nhau.
 */
const napCoinChoHocVien = async (req, res) => {
    try {
        const kiem = kiemSoCoinNap(req.body?.soCoin);
        if (!kiem.hopLe) {
            return res.status(400).json({ message: kiem.loi });
        }

        const hocVien = await User.findById(req.params.id).select('name email role soDuCoin');
        if (!hocVien) {
            return res.status(404).json({ message: 'Không tìm thấy học viên' });
        }

        const ghiChu = String(req.body?.ghiChu || '').trim().slice(0, 300);

        const ketQua = kiem.so > 0
            ? await congCoin(hocVien._id, kiem.so, {
                loai: 'nap',
                ghiChu,
                nguoiTao: req.user._id
            })
            : await truCoin(hocVien._id, -kiem.so, {
                loai: 'thuHoi',
                ghiChu,
                nguoiTao: req.user._id
            });

        if (!ketQua.thanhCong) {
            // Thu hoi nhieu hon so dang co -> 400 chu khong 500: day la loi cua
            // nguoi go, khong phai su co he thong.
            return res.status(400).json({ message: ketQua.loi });
        }

        return res.json({
            message: kiem.so > 0
                ? `Đã nạp ${kiem.so} coin cho ${hocVien.name}`
                : `Đã thu hồi ${-kiem.so} coin của ${hocVien.name}`,
            soDuCoin: ketQua.soDuSau
        });
    } catch (error) {
        console.error('napCoinChoHocVien:', error.message);
        return res.status(500).json({ message: 'Không nạp được coin' });
    }
};

/**
 * POST /api/coin/quan-tri/:id/tang-khoa  - tang thang mot khoa hoc.
 *
 * KHONG dinh gi den vi coin: day la mo khoa mien phi cho mot nguoi, khong phai
 * cho tien roi bat ho tu mua. Van ghi mot dong vao so nhat ky (soCoin = 0) de
 * hoc vien mo trang vi ra hieu vi sao minh bong nhien co khoa nay.
 */
const tangKhoaChoHocVien = async (req, res) => {
    try {
        const { courseId, ghiChu } = req.body || {};
        if (!courseId) {
            return res.status(400).json({ message: 'Thiếu mã khóa học' });
        }

        const [hocVien, khoa] = await Promise.all([
            User.findById(req.params.id).select('name soDuCoin'),
            Course.findById(courseId).select('title price')
        ]);

        if (!hocVien) return res.status(404).json({ message: 'Không tìm thấy học viên' });
        if (!khoa) return res.status(404).json({ message: 'Không tìm thấy khóa học' });

        const { moiTao } = await taoGhiDanh(khoa._id, hocVien._id);

        if (!moiTao) {
            return res.status(400).json({ message: `${hocVien.name} đã có khóa học này rồi` });
        }

        await GiaoDichCoin.create({
            hocVien: hocVien._id,
            loai: 'tangKhoa',
            soCoin: 0,
            soDuSau: hocVien.soDuCoin ?? 0,
            khoa: khoa._id,
            ghiChu: String(ghiChu || '').trim().slice(0, 300),
            nguoiTao: req.user._id
        });

        return res.json({
            message: `Đã tặng khóa "${khoa.title}" cho ${hocVien.name}`
        });
    } catch (error) {
        console.error('tangKhoaChoHocVien:', error.message);
        return res.status(500).json({ message: 'Không tặng được khóa học' });
    }
};

/** GET /api/coin/quan-tri/:id - so du + so nhat ky cua mot hoc vien. */
const xemViHocVien = async (req, res) => {
    try {
        const hocVien = await User.findById(req.params.id)
            .select('name email avatar soDuCoin')
            .lean();

        if (!hocVien) {
            return res.status(404).json({ message: 'Không tìm thấy học viên' });
        }

        return res.json(await dungTraLoiVi(hocVien));
    } catch (error) {
        console.error('xemViHocVien:', error.message);
        return res.status(500).json({ message: 'Không đọc được ví' });
    }
};

/* ==========================================================================
   HOC VIEN
   ========================================================================== */

/** GET /api/coin/cua-toi - vi cua chinh minh. */
const xemViCuaToi = async (req, res) => {
    try {
        const toi = await User.findById(req.user._id)
            .select('name email avatar soDuCoin')
            .lean();

        if (!toi) return res.status(404).json({ message: 'Không tìm thấy tài khoản' });

        return res.json(await dungTraLoiVi(toi));
    } catch (error) {
        console.error('xemViCuaToi:', error.message);
        return res.status(500).json({ message: 'Không đọc được ví' });
    }
};

/**
 * POST /api/coin/mua/:courseId - mua khoa hoc bang coin.
 *
 * Thu tu co chu dich: TRU COIN TRUOC roi moi ghi danh, va hoan lai neu ghi
 * danh hong. Neu lam nguoc lai - ghi danh truoc, tru coin sau - thi khi buoc
 * tru that bai, hoc vien da co khoa hoc mien phi va he thong khong the doi lai.
 * Sai theo huong nay thi cung lam la tru nham roi tra lai ngay.
 */
const muaBangCoin = async (req, res) => {
    try {
        const khoa = await Course.findById(req.params.courseId).select('title price isPublished');
        if (!khoa) {
            return res.status(404).json({ message: 'Không tìm thấy khóa học' });
        }

        const daCo = await Enrollment.findOne({ course: khoa._id, student: req.user._id });
        if (daCo && daCo.status !== 'dropped') {
            return res.status(400).json({ message: 'Bạn đã có khóa học này rồi' });
        }

        const gia = giaRaCoin(khoa.price);

        // Khoa mien phi khong di duong nay - da co duong ghi danh thong thuong,
        // va tru 0 coin la mot giao dich rong lam ban so nhat ky.
        if (gia <= 0) {
            return res.status(400).json({
                message: 'Khóa học này miễn phí, bạn đăng ký trực tiếp được'
            });
        }

        const tru = await truCoin(req.user._id, gia, {
            loai: 'mua',
            khoa: khoa._id,
            ghiChu: khoa.title
        });

        if (!tru.thanhCong) {
            return res.status(400).json({
                message: tru.loi,
                thieuCoin: tru.loi === 'Số dư coin không đủ',
                giaCoin: gia
            });
        }

        try {
            await taoGhiDanh(khoa._id, req.user._id);
        } catch (loiGhiDanh) {
            // Tra lai dung so vua tru. Ghi chu noi ro ly do de doi chieu ve sau.
            await congCoin(req.user._id, gia, {
                loai: 'nap',
                khoa: khoa._id,
                ghiChu: `Hoàn coin: ghi danh thất bại (${khoa.title})`
            });
            console.error('muaBangCoin - ghi danh that bai, da hoan coin:', loiGhiDanh.message);
            return res.status(500).json({ message: 'Không mở được khóa học, coin đã được hoàn lại' });
        }

        return res.json({
            message: `Đã mở khóa "${khoa.title}"`,
            daTru: gia,
            soDuCoin: tru.soDuSau
        });
    } catch (error) {
        console.error('muaBangCoin:', error.message);
        return res.status(500).json({ message: 'Không mua được khóa học' });
    }
};

/* ==========================================================================
   Dung chung
   ========================================================================== */

/**
 * Gom so du, tong da nap va so nhat ky thanh mot phan hoi.
 *
 * "Tong da nap" chi cong cac dong loai 'nap' - khong tru phan da tieu. Do la
 * con so hoc vien muon thay ("tui da bo vao bao nhieu"), khac han so du.
 */
const dungTraLoiVi = async (nguoiDung) => {
    const [nhatKy, tong, congDon] = await Promise.all([
        GiaoDichCoin.find({ hocVien: nguoiDung._id })
            .sort({ createdAt: -1 })
            .limit(50)
            .populate('khoa', 'title slug')
            .populate('nguoiTao', 'name')
            .lean(),
        GiaoDichCoin.countDocuments({ hocVien: nguoiDung._id }),
        GiaoDichCoin.aggregate([
            { $match: { hocVien: nguoiDung._id, loai: 'nap' } },
            { $group: { _id: null, tong: { $sum: '$soCoin' } } }
        ])
    ]);

    return {
        hocVien: {
            _id: nguoiDung._id,
            name: nguoiDung.name,
            email: nguoiDung.email,
            avatar: nguoiDung.avatar
        },
        soDuCoin: nguoiDung.soDuCoin ?? 0,
        soDuQuyDoi: coinRaDong(nguoiDung.soDuCoin ?? 0),
        tongDaNap: congDon[0]?.tong ?? 0,
        soGiaoDich: tong,
        nhatKy
    };
};

module.exports = {
    napCoinChoHocVien,
    tangKhoaChoHocVien,
    xemViHocVien,
    xemViCuaToi,
    muaBangCoin
};
