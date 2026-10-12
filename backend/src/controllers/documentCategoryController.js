/**
 * Linh vuc cua kho tai lieu (Luat, Kinh doanh, He thong thong tin...) - xem
 * models/DocumentCategory.js. Doc cong khai, sua chi admin.
 */
const Document = require('../models/Document');
const DocumentSubject = require('../models/DocumentSubject');
const DocumentCategory = require('../models/DocumentCategory');
const { normalizeSubject } = require('../utils/rankDocuments');

// Cung dieu kien "dang hien" voi documentController.
const VISIBLE = { daAn: { $ne: true } };

const validateInput = (body, { requireName }) => {
    const out = {};
    if (body.ten !== undefined || requireName) {
        const name = String(body.ten || '').replace(/\s+/g, ' ').trim();
        if (!name) return { loi: 'Vui lòng nhập tên lĩnh vực' };
        if (name.length > 60) return { loi: 'Tên lĩnh vực tối đa 60 ký tự' };
        const key = normalizeSubject(name);
        if (!key) return { loi: 'Tên lĩnh vực phải có chữ hoặc số' };
        out.ten = name;
        out.key = key;
    }
    if (body.bieuTuong !== undefined) {
        if (!DocumentCategory.ICONS.includes(body.bieuTuong)) return { loi: 'Biểu tượng không hợp lệ' };
        out.bieuTuong = body.bieuTuong;
    }
    if (body.thuTu !== undefined) {
        const n = Number(body.thuTu);
        if (!Number.isInteger(n) || n < 0 || n > 999) return { loi: 'Thứ tự phải là số nguyên 0-999' };
        out.thuTu = n;
    }
    return { ra: out };
};

// @desc    Cac linh vuc kem so mon va so tai lieu DANG HIEN
// @route   GET /api/documents/linh-vuc
//
// soTaiLieu dem tai lieu KHAC NHAU: mot tai lieu gan hai mon cung linh vuc chi
// tinh mot lan (countDocuments voi $in, khong cong so cua tung mon).
const getFields = async (req, res) => {
    try {
        const [groupList, subjectList] = await Promise.all([
            DocumentCategory.find().sort({ thuTu: 1, ten: 1 }).lean(),
            DocumentSubject.find({ nhom: { $ne: null } }).select('ten key nhom').sort({ ten: 1 }).lean(),
        ]);
        const subjectsByGroup = new Map();
        for (const m of subjectList) {
            const k = String(m.nhom);
            if (!subjectsByGroup.has(k)) subjectsByGroup.set(k, []);
            subjectsByGroup.get(k).push(m);
        }
        // Mot truy van dem moi linh vuc, chay song song - so linh vuc chi vai chuc.
        const result = await Promise.all(
            groupList.map(async (n) => {
                const subjectItem = subjectsByGroup.get(String(n._id)) || [];
                const documentCount = subjectItem.length
                    ? await Document.countDocuments({ ...VISIBLE, monHocKey: { $in: subjectItem.map((m) => m.key) } })
                    : 0;
                return {
                    _id: n._id,
                    key: n.key,
                    ten: n.ten,
                    bieuTuong: n.bieuTuong,
                    thuTu: n.thuTu,
                    soMon: subjectItem.length,
                    soTaiLieu: documentCount,
                    // Vai ten mon de hien duoi o linh vuc - khong can tra ca danh sach.
                    monTieuBieu: subjectItem.slice(0, 4).map((m) => ({ key: m.key, ten: m.ten })),
                };
            }),
        );
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Them linh vuc (admin)
// @route   POST /api/documents/linh-vuc   { ten, bieuTuong?, thuTu? }
const addField = async (req, res) => {
    try {
        const { loi: err, ra: out } = validateInput(req.body || {}, { requireName: true });
        if (err) return res.status(400).json({ message: err });
        if (await DocumentCategory.exists({ key: out.key })) {
            return res.status(409).json({ message: 'Đã có lĩnh vực trùng tên này' });
        }
        const n = await DocumentCategory.create(out);
        res.status(201).json({ ...n.toObject(), soMon: 0, soTaiLieu: 0, monTieuBieu: [] });
    } catch (error) {
        if (error && error.code === 11000) return res.status(409).json({ message: 'Đã có lĩnh vực trùng tên này' });
        res.status(500).json({ message: error.message });
    }
};

// @desc    Sua linh vuc (admin)
// @route   PUT /api/documents/linh-vuc/:id   { ten?, bieuTuong?, thuTu? }
const editField = async (req, res) => {
    try {
        const n = await DocumentCategory.findById(req.params.id);
        if (!n) return res.status(404).json({ message: 'Không tìm thấy lĩnh vực' });
        const { loi: err, ra: out } = validateInput(req.body || {}, { requireName: false });
        if (err) return res.status(400).json({ message: err });
        if (!Object.keys(out).length) return res.status(400).json({ message: 'Không có gì để cập nhật' });
        if (out.key && out.key !== n.key && (await DocumentCategory.exists({ key: out.key }))) {
            return res.status(409).json({ message: 'Đã có lĩnh vực trùng tên này' });
        }
        Object.assign(n, out);
        await n.save();
        res.json(n);
    } catch (error) {
        if (error && error.code === 11000) return res.status(409).json({ message: 'Đã có lĩnh vực trùng tên này' });
        res.status(500).json({ message: error.message });
    }
};

// @desc    Xoa linh vuc (admin). Cac mon trong do KHONG bi xoa - chi thanh "chua co linh vuc".
// @route   DELETE /api/documents/linh-vuc/:id
const deleteField = async (req, res) => {
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

module.exports = { getFields, addField, editField, deleteField };
