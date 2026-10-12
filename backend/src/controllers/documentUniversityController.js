/**
 * Truong dai hoc cua kho tai lieu (xem models/DocumentUniversity.js) va so lieu
 * tong quan cua kho cho trang /share-document. Doc cong khai, sua chi admin.
 */
const Document = require('../models/Document');
const DocumentSubject = require('../models/DocumentSubject');
const DocumentCategory = require('../models/DocumentCategory');
const DocumentUniversity = require('../models/DocumentUniversity');
const { normalizeSubject } = require('../utils/rankDocuments');
const { mainNameKey, logoHopLe: isValidLogo } = require('../utils/universityName');

// Cung dieu kien "dang hien" voi documentController.
const VISIBLE = { daAn: { $ne: true } };

const validateName = (tho) => {
    const name = String(tho || '').replace(/\s+/g, ' ').trim();
    if (!name) return { loi: 'Vui lòng nhập tên trường' };
    if (name.length > 120) return { loi: 'Tên trường tối đa 120 ký tự' };
    const key = normalizeSubject(name);
    if (!key) return { loi: 'Tên trường phải có chữ hoặc số' };
    return { ten: name, key };
};

/**
 * Doi truong nguoi dung chon ra truong THAT trong danh sach. Dung chung cho
 * createDocument va updateDocument.
 *
 * Truong KHONG bat buoc: rong -> { ok: true, truong: '', truongKey: '' }.
 */
const validateSchool = async (tho) => {
    const key = normalizeSubject(typeof tho === 'string' ? tho : '');
    if (!key) return { ok: true, truong: '', truongKey: '' };
    const t = await DocumentUniversity.findOne({ key }).select('ten key').lean();
    if (!t) {
        return { ok: false, body: { message: 'Trường không có trong danh sách. Vui lòng chọn lại.', field: 'truong' } };
    }
    return { ok: true, truong: t.ten, truongKey: t.key };
};

// @desc    Danh sach truong kem so tai lieu DANG HIEN
// @route   GET /api/documents/truong
const getSchools = async (req, res) => {
    try {
        const [items, tally] = await Promise.all([
            DocumentUniversity.find().sort({ thuTu: 1, ten: 1 }).lean(),
            Document.aggregate([
                { $match: { ...VISIBLE, truongKey: { $gt: '' } } },
                { $group: { _id: '$truongKey', so: { $sum: 1 } } },
            ]),
        ]);
        const countByKey = new Map(tally.map((d) => [d._id, d.so]));
        res.json(items.map((t) => ({
            _id: t._id,
            key: t.key,
            ten: t.ten,
            logo: t.logo || '',
            thuTu: t.thuTu,
            soTaiLieu: countByKey.get(t.key) || 0,
        })));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// So truong khac hien o cuoi trang mot truong.
const OTHER_SCHOOLS_COUNT = 12;
// Tran danh muc mon mot truong - chan request gui mang khong lo.
const MAX_SCHOOL_SUBJECTS = 1000;

/**
 * Danh muc mon admin gui len -> mang KHOA mon co that, khong trung, giu thu tu.
 * Tra { loi } neu sai dinh dang.
 */
const readSubjectCatalog = async (tho) => {
    if (!Array.isArray(tho) || tho.some((x) => typeof x !== 'string')) {
        return { loi: 'Danh mục môn phải là mảng khóa môn' };
    }
    if (tho.length > MAX_SCHOOL_SUBJECTS) {
        return { loi: `Tối đa ${MAX_SCHOOL_SUBJECTS} môn cho một trường` };
    }
    const course = [...new Set(tho.map(normalizeSubject).filter(Boolean))];
    const exists = new Set(await DocumentSubject.distinct('key', { key: { $in: course } }));
    return { monHoc: course.filter((k) => exists.has(k)) };
};

// @desc    Mot truong: cac mon co tai lieu DANG HIEN cua truong (kem so tai
//          lieu) va vai truong khac - trang /share-document/institution/<khoa>
// @route   GET /api/documents/truong/:khoa   (khoa dang "hoc-vien-..." hay "hoc vien ...")
const getSchool = async (req, res) => {
    try {
        const key = normalizeSubject(req.params.khoa);
        const t = key ? await DocumentUniversity.findOne({ key }).lean() : null;
        if (!t) return res.status(404).json({ message: 'Không tìm thấy trường' });

        const [schoolDocuments, all, tally, fieldList] = await Promise.all([
            // Chi can khoa + ten mon cua tung bai; mot truong vai tram bai la cung.
            Document.find({ ...VISIBLE, truongKey: key }).select('monHoc monHocKey').lean(),
            DocumentUniversity.find({ _id: { $ne: t._id } }).select('key ten logo thuTu').lean(),
            Document.aggregate([
                { $match: { ...VISIBLE, truongKey: { $gt: '' } } },
                { $group: { _id: '$truongKey', so: { $sum: 1 } } },
            ]),
            DocumentCategory.find().sort({ thuTu: 1, ten: 1 }).lean(),
        ]);
        const countByKey = new Map(tally.map((d) => [d._id, d.so]));

        // Mon cua truong = danh muc admin dat + moi mon da co bai cua truong.
        // Ten: lay tu danh sach mon hien tai; mon da bi xoa thi lay ten ghi
        // trong bai.
        const countBySubject = new Map();
        const nameInPost = new Map();
        for (const lesson of schoolDocuments) {
            (lesson.monHocKey || []).forEach((k, i) => {
                countBySubject.set(k, (countBySubject.get(k) || 0) + 1);
                if (!nameInPost.has(k)) nameInPost.set(k, (lesson.monHoc || [])[i] || k);
            });
        }
        const subjectSlugKey = [...new Set([...(t.monHoc || []), ...countBySubject.keys()])];
        const realSubjects = new Map(
            (await DocumentSubject.find({ key: { $in: subjectSlugKey } }).select('ten key nhom').lean())
                .map((m) => [m.key, m]),
        );
        const subject = subjectSlugKey
            // Mon trong danh muc da bi xoa va khong con bai nao - bo.
            .filter((k) => realSubjects.has(k) || countBySubject.has(k))
            .map((k) => ({
                key: k,
                ten: realSubjects.get(k)?.ten || nameInPost.get(k) || k,
                soTaiLieu: countBySubject.get(k) || 0,
                nhom: realSubjects.get(k)?.nhom ? String(realSubjects.get(k).nhom) : null,
            }))
            .sort((a, b) => b.soTaiLieu - a.soTaiLieu || a.ten.localeCompare(b.ten, 'vi'));

        // Linh vuc cua truong: linh vuc co it nhat mot mon cua truong. So tai
        // lieu dem theo BAI (bai hai mon cung linh vuc chi tinh mot lan).
        const subjectsByGroup = new Map();
        for (const m of subject) {
            if (!m.nhom) continue;
            if (!subjectsByGroup.has(m.nhom)) subjectsByGroup.set(m.nhom, new Set());
            subjectsByGroup.get(m.nhom).add(m.key);
        }
        const field = fieldList
            .filter((n) => subjectsByGroup.has(String(n._id)))
            .map((n) => {
                const course = subjectsByGroup.get(String(n._id));
                return {
                    _id: n._id,
                    key: n.key,
                    ten: n.ten,
                    bieuTuong: n.bieuTuong,
                    soMon: course.size,
                    soTaiLieu: schoolDocuments.filter((lesson) => (lesson.monHocKey || []).some((k) => course.has(k))).length,
                };
            })
            .sort((a, b) => b.soTaiLieu - a.soTaiLieu || b.soMon - a.soMon);

        const otherSchools = all
            .map((x) => ({ _id: x._id, key: x.key, ten: x.ten, logo: x.logo || '', thuTu: x.thuTu, soTaiLieu: countByKey.get(x.key) || 0 }))
            // Nhieu tai lieu truoc, roi thu tu admin dat, roi ten.
            .sort((a, b) => b.soTaiLieu - a.soTaiLieu || a.thuTu - b.thuTu || a.ten.localeCompare(b.ten, 'vi'))
            .slice(0, OTHER_SCHOOLS_COUNT);

        res.json({
            truong: { _id: t._id, key: t.key, ten: t.ten, logo: t.logo || '', thuTu: t.thuTu, soTaiLieu: countByKey.get(t.key) || 0 },
            monHoc: subject,
            linhVuc: field,
            truongKhac: otherSchools,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Them truong (admin)
// @route   POST /api/documents/truong   { ten }
const addSchool = async (req, res) => {
    try {
        const k = validateName(req.body && req.body.ten);
        if (k.loi) return res.status(400).json({ message: k.loi });
        if (await DocumentUniversity.exists({ key: k.key })) {
            return res.status(409).json({ message: 'Đã có trường trùng tên này' });
        }
        // Cung truong, khac cach viet ("Đại học X" / "Trường Đại học X").
        const all = await DocumentUniversity.find().select('ten').lean();
        const trung = all.find((x) => mainNameKey(x.ten) === mainNameKey(k.ten));
        if (trung) {
            return res.status(409).json({ message: `Trường này đã có với tên "${trung.ten}"` });
        }
        const logo = String((req.body && req.body.logo) || '').trim();
        if (!isValidLogo(logo)) return res.status(400).json({ message: 'Logo phải là /images/institution/<tên-file> hoặc link https' });
        const t = await DocumentUniversity.create({ ten: k.ten, key: k.key, logo });
        res.status(201).json({ ...t.toObject(), soTaiLieu: 0 });
    } catch (error) {
        if (error && error.code === 11000) return res.status(409).json({ message: 'Đã có trường trùng tên này' });
        res.status(500).json({ message: error.message });
    }
};

// @desc    Doi ten / logo truong (admin) - doi ten thi cap nhat luon cac tai lieu
// @route   PUT /api/documents/truong/:id   { ten?, logo? }
const editSchool = async (req, res) => {
    try {
        const t = await DocumentUniversity.findById(req.params.id);
        if (!t) return res.status(404).json({ message: 'Không tìm thấy trường' });
        const body = req.body || {};

        if (body.monHoc !== undefined) {
            const dm = await readSubjectCatalog(body.monHoc);
            if (dm.loi) return res.status(400).json({ message: dm.loi });
            t.monHoc = dm.monHoc;
        }

        if (body.logo !== undefined) {
            const logo = String(body.logo || '').trim();
            if (!isValidLogo(logo)) {
                return res.status(400).json({ message: 'Logo phải là /images/institution/<tên-file> hoặc link https' });
            }
            t.logo = logo;
        }
        // Chi doi logo / danh muc mon: luu roi tra luon.
        if (body.ten === undefined) {
            await t.save();
            return res.json({ ...t.toObject(), soTaiLieuDaCapNhat: 0 });
        }

        const k = validateName(body.ten);
        if (k.loi) return res.status(400).json({ message: k.loi });
        const oldKey = t.key;
        if (k.key !== oldKey && (await DocumentUniversity.exists({ key: k.key }))) {
            return res.status(409).json({ message: 'Đã có trường trùng tên này' });
        }
        t.ten = k.ten;
        t.key = k.key;
        await t.save();
        const { modifiedCount } = await Document.updateMany(
            { truongKey: oldKey },
            { truong: k.ten, truongKey: k.key },
        );
        res.json({ ...t.toObject(), soTaiLieuDaCapNhat: modifiedCount });
    } catch (error) {
        if (error && error.code === 11000) return res.status(409).json({ message: 'Đã có trường trùng tên này' });
        res.status(500).json({ message: error.message });
    }
};

// @desc    Xoa truong (admin). Tai lieu dang gan truong nay KHONG bi xoa - chi bo truong.
// @route   DELETE /api/documents/truong/:id
const deleteSchool = async (req, res) => {
    try {
        const t = await DocumentUniversity.findById(req.params.id);
        if (!t) return res.status(404).json({ message: 'Không tìm thấy trường' });
        const { modifiedCount } = await Document.updateMany(
            { truongKey: t.key },
            { truong: '', truongKey: '' },
        );
        await t.deleteOne();
        res.json({ message: 'Đã xóa trường', soTaiLieuDaGo: modifiedCount });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    So lieu tong quan cua kho - section so lieu o trang /share-document
// @route   GET /api/documents/thong-ke
const getStats = async (req, res) => {
    try {
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const [documentCount, newThisWeek, subjectCount, fieldCount, schoolCount, person, download] = await Promise.all([
            Document.countDocuments(VISIBLE),
            Document.countDocuments({ ...VISIBLE, createdAt: { $gte: oneWeekAgo } }),
            DocumentSubject.countDocuments(),
            DocumentCategory.countDocuments(),
            DocumentUniversity.countDocuments(),
            Document.distinct('uploader', VISIBLE),
            Document.aggregate([{ $match: VISIBLE }, { $group: { _id: null, tong: { $sum: '$downloadCount' } } }]),
        ]);
        res.json({
            soTaiLieu: documentCount,
            moiTuanNay: newThisWeek,
            soMon: subjectCount,
            soLinhVuc: fieldCount,
            soTruong: schoolCount,
            soNguoiChiaSe: person.length,
            tongLuotTai: (download[0] && download[0].tong) || 0,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getSchools, getSchool, themTruong: addSchool, suaTruong: editSchool, xoaTruong: deleteSchool, getStats, validateSchool };
