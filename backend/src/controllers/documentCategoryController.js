/**
 * Linh vuc cua kho tai lieu (Luat, Kinh doanh, He thong thong tin...) - xem
 * models/DocumentCategory.js. Doc cong khai, sua chi admin.
 */
const Document = require('../models/Document');
const DocumentSubject = require('../models/DocumentSubject');
const DocumentCategory = require('../models/DocumentCategory');
const { chuanHoaMon } = require('../utils/rankDocuments');

// Cung dieu kien "dang hien" voi documentController.
const HIEN = { daAn: { $ne: true } };

const kiemDauVao = (body, { batBuocTen }) => {
    const ra = {};
    if (body.ten !== undefined || batBuocTen) {
        const ten = String(body.ten || '').replace(/\s+/g, ' ').trim();
        if (!ten) return { loi: 'Vui lòng nhập tên lĩnh vực' };
        if (ten.length > 60) return { loi: 'Tên lĩnh vực tối đa 60 ký tự' };
        const key = chuanHoaMon(ten);
        if (!key) return { loi: 'Tên lĩnh vực phải có chữ hoặc số' };
        ra.ten = ten;
        ra.key = key;
    }
    if (body.bieuTuong !== undefined) {
        if (!DocumentCategory.BIEU_TUONG.includes(body.bieuTuong)) return { loi: 'Biểu tượng không hợp lệ' };
        ra.bieuTuong = body.bieuTuong;
    }
    if (body.thuTu !== undefined) {
        const n = Number(body.thuTu);
        if (!Number.isInteger(n) || n < 0 || n > 999) return { loi: 'Thứ tự phải là số nguyên 0-999' };
        ra.thuTu = n;
    }
    return { ra };
};

// @desc    Cac linh vuc kem so mon va so tai lieu DANG HIEN
// @route   GET /api/documents/linh-vuc
//
// soTaiLieu dem tai lieu KHAC NHAU: mot tai lieu gan hai mon cung linh vuc chi
// tinh mot lan (countDocuments voi $in, khong cong so cua tung mon).
const layLinhVuc = async (req, res) => {
    try {
        const [dsNhom, dsMon] = await Promise.all([
            DocumentCategory.find().sort({ thuTu: 1, ten: 1 }).lean(),
            DocumentSubject.find({ nhom: { $ne: null } }).select('ten key nhom').sort({ ten: 1 }).lean(),
        ]);
        const monTheoNhom = new Map();
        for (const m of dsMon) {
            const k = String(m.nhom);
            if (!monTheoNhom.has(k)) monTheoNhom.set(k, []);
            monTheoNhom.get(k).push(m);
        }
        // Mot truy van dem moi linh vuc, chay song song - so linh vuc chi vai chuc.
        const ketQua = await Promise.all(
            dsNhom.map(async (n) => {
                const mon = monTheoNhom.get(String(n._id)) || [];
                const soTaiLieu = mon.length
                    ? await Document.countDocuments({ ...HIEN, monHocKey: { $in: mon.map((m) => m.key) } })
                    : 0;
                return {
                    _id: n._id,
                    key: n.key,
                    ten: n.ten,
                    bieuTuong: n.bieuTuong,
                    thuTu: n.thuTu,
                    soMon: mon.length,
                    soTaiLieu,
                    // Vai ten mon de hien duoi o linh vuc - khong can tra ca danh sach.
                    monTieuBieu: mon.slice(0, 4).map((m) => ({ key: m.key, ten: m.ten })),
                };
            }),
        );
        res.json(ketQua);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Them linh vuc (admin)
// @route   POST /api/documents/linh-vuc   { ten, bieuTuong?, thuTu? }
const themLinhVuc = async (req, res) => {
    try {
        const { loi, ra } = kiemDauVao(req.body || {}, { batBuocTen: true });
        if (loi) return res.status(400).json({ message: loi });
        if (await DocumentCategory.exists({ key: ra.key })) {
            return res.status(409).json({ message: 'Đã có lĩnh vực trùng tên này' });
        }
        const n = await DocumentCategory.create(ra);
        res.status(201).json({ ...n.toObject(), soMon: 0, soTaiLieu: 0, monTieuBieu: [] });
    } catch (error) {
        if (error && error.code === 11000) return res.status(409).json({ message: 'Đã có lĩnh vực trùng tên này' });
        res.status(500).json({ message: error.message });
    }
};

// @desc    Sua linh vuc (admin)
// @route   PUT /api/documents/linh-vuc/:id   { ten?, bieuTuong?, thuTu? }
const suaLinhVuc = async (req, res) => {
    try {
        const n = await DocumentCategory.findById(req.params.id);
        if (!n) return res.status(404).json({ message: 'Không tìm thấy lĩnh vực' });
        const { loi, ra } = kiemDauVao(req.body || {}, { batBuocTen: false });
        if (loi) return res.status(400).json({ message: loi });
        if (!Object.keys(ra).length) return res.status(400).json({ message: 'Không có gì để cập nhật' });
        if (ra.key && ra.key !== n.key && (await DocumentCategory.exists({ key: ra.key }))) {
            return res.status(409).json({ message: 'Đã có lĩnh vực trùng tên này' });
        }
        Object.assign(n, ra);
        await n.save();
        res.json(n);
    } catch (error) {
        if (error && error.code === 11000) return res.status(409).json({ message: 'Đã có lĩnh vực trùng tên này' });
        res.status(500).json({ message: error.message });
    }
};

// @desc    Xoa linh vuc (admin). Cac mon trong do KHONG bi xoa - chi thanh "chua co linh vuc".
// @route   DELETE /api/documents/linh-vuc/:id
const xoaLinhVuc = async (req, res) => {
    try {
        const n = await DocumentCategory.findById(req.params.id);
        if (!n) return res.status(404).json({ message: 'Không tìm thấy lĩnh vực' });
        const { modifiedCount } = await DocumentSubject.updateMany({ nhom: n._id }, { nhom: null });
        await n.deleteOne();
        res.json({ message: 'Đã xóa lĩnh vực', soMonDaGo: modifiedCount });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { layLinhVuc, themLinhVuc, suaLinhVuc, xoaLinhVuc };
