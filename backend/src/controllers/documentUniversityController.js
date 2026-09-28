/**
 * Truong dai hoc cua kho tai lieu (xem models/DocumentUniversity.js) va so lieu
 * tong quan cua kho cho trang /share-document. Doc cong khai, sua chi admin.
 */
const Document = require('../models/Document');
const DocumentSubject = require('../models/DocumentSubject');
const DocumentCategory = require('../models/DocumentCategory');
const DocumentUniversity = require('../models/DocumentUniversity');
const { chuanHoaMon } = require('../utils/rankDocuments');
const { khoaTenChinh, logoHopLe } = require('../utils/universityName');

// Cung dieu kien "dang hien" voi documentController.
const HIEN = { daAn: { $ne: true } };

const kiemTen = (tho) => {
    const ten = String(tho || '').replace(/\s+/g, ' ').trim();
    if (!ten) return { loi: 'Vui lòng nhập tên trường' };
    if (ten.length > 120) return { loi: 'Tên trường tối đa 120 ký tự' };
    const key = chuanHoaMon(ten);
    if (!key) return { loi: 'Tên trường phải có chữ hoặc số' };
    return { ten, key };
};

/**
 * Doi truong nguoi dung chon ra truong THAT trong danh sach. Dung chung cho
 * createDocument va updateDocument.
 *
 * Truong KHONG bat buoc: rong -> { ok: true, truong: '', truongKey: '' }.
 */
const kiemTraTruong = async (tho) => {
    const key = chuanHoaMon(typeof tho === 'string' ? tho : '');
    if (!key) return { ok: true, truong: '', truongKey: '' };
    const t = await DocumentUniversity.findOne({ key }).select('ten key').lean();
    if (!t) {
        return { ok: false, body: { message: 'Trường không có trong danh sách. Vui lòng chọn lại.', field: 'truong' } };
    }
    return { ok: true, truong: t.ten, truongKey: t.key };
};

// @desc    Danh sach truong kem so tai lieu DANG HIEN
// @route   GET /api/documents/truong
const layTruong = async (req, res) => {
    try {
        const [ds, dem] = await Promise.all([
            DocumentUniversity.find().sort({ thuTu: 1, ten: 1 }).lean(),
            Document.aggregate([
                { $match: { ...HIEN, truongKey: { $gt: '' } } },
                { $group: { _id: '$truongKey', so: { $sum: 1 } } },
            ]),
        ]);
        const soTheoKhoa = new Map(dem.map((d) => [d._id, d.so]));
        res.json(ds.map((t) => ({
            _id: t._id,
            key: t.key,
            ten: t.ten,
            logo: t.logo || '',
            thuTu: t.thuTu,
            soTaiLieu: soTheoKhoa.get(t.key) || 0,
        })));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// So truong khac hien o cuoi trang mot truong.
const SO_TRUONG_KHAC = 12;
// Tran danh muc mon mot truong - chan request gui mang khong lo.
const SO_MON_TOI_DA_TRUONG = 1000;

/**
 * Danh muc mon admin gui len -> mang KHOA mon co that, khong trung, giu thu tu.
 * Tra { loi } neu sai dinh dang.
 */
const docDanhMucMon = async (tho) => {
    if (!Array.isArray(tho) || tho.some((x) => typeof x !== 'string')) {
        return { loi: 'Danh mục môn phải là mảng khóa môn' };
    }
    if (tho.length > SO_MON_TOI_DA_TRUONG) {
        return { loi: `Tối đa ${SO_MON_TOI_DA_TRUONG} môn cho một trường` };
    }
    const khoa = [...new Set(tho.map(chuanHoaMon).filter(Boolean))];
    const coThat = new Set(await DocumentSubject.distinct('key', { key: { $in: khoa } }));
    return { monHoc: khoa.filter((k) => coThat.has(k)) };
};

// @desc    Mot truong: cac mon co tai lieu DANG HIEN cua truong (kem so tai
//          lieu) va vai truong khac - trang /share-document/institution/<khoa>
// @route   GET /api/documents/truong/:khoa   (khoa dang "hoc-vien-..." hay "hoc vien ...")
const layMotTruong = async (req, res) => {
    try {
        const key = chuanHoaMon(req.params.khoa);
        const t = key ? await DocumentUniversity.findOne({ key }).lean() : null;
        if (!t) return res.status(404).json({ message: 'Không tìm thấy trường' });

        const [baiCuaTruong, tatCa, dem, dsLinhVuc] = await Promise.all([
            // Chi can khoa + ten mon cua tung bai; mot truong vai tram bai la cung.
            Document.find({ ...HIEN, truongKey: key }).select('monHoc monHocKey').lean(),
            DocumentUniversity.find({ _id: { $ne: t._id } }).select('key ten logo thuTu').lean(),
            Document.aggregate([
                { $match: { ...HIEN, truongKey: { $gt: '' } } },
                { $group: { _id: '$truongKey', so: { $sum: 1 } } },
            ]),
            DocumentCategory.find().sort({ thuTu: 1, ten: 1 }).lean(),
        ]);
        const soTheoKhoa = new Map(dem.map((d) => [d._id, d.so]));

        // Mon cua truong = danh muc admin dat + moi mon da co bai cua truong.
        // Ten: lay tu danh sach mon hien tai; mon da bi xoa thi lay ten ghi
        // trong bai.
        const soBaiTheoMon = new Map();
        const tenTrongBai = new Map();
        for (const bai of baiCuaTruong) {
            (bai.monHocKey || []).forEach((k, i) => {
                soBaiTheoMon.set(k, (soBaiTheoMon.get(k) || 0) + 1);
                if (!tenTrongBai.has(k)) tenTrongBai.set(k, (bai.monHoc || [])[i] || k);
            });
        }
        const khoaMon = [...new Set([...(t.monHoc || []), ...soBaiTheoMon.keys()])];
        const monThat = new Map(
            (await DocumentSubject.find({ key: { $in: khoaMon } }).select('ten key nhom').lean())
                .map((m) => [m.key, m]),
        );
        const monHoc = khoaMon
            // Mon trong danh muc da bi xoa va khong con bai nao - bo.
            .filter((k) => monThat.has(k) || soBaiTheoMon.has(k))
            .map((k) => ({
                key: k,
                ten: monThat.get(k)?.ten || tenTrongBai.get(k) || k,
                soTaiLieu: soBaiTheoMon.get(k) || 0,
                nhom: monThat.get(k)?.nhom ? String(monThat.get(k).nhom) : null,
            }))
            .sort((a, b) => b.soTaiLieu - a.soTaiLieu || a.ten.localeCompare(b.ten, 'vi'));

        // Linh vuc cua truong: linh vuc co it nhat mot mon cua truong. So tai
        // lieu dem theo BAI (bai hai mon cung linh vuc chi tinh mot lan).
        const monTheoNhom = new Map();
        for (const m of monHoc) {
            if (!m.nhom) continue;
            if (!monTheoNhom.has(m.nhom)) monTheoNhom.set(m.nhom, new Set());
            monTheoNhom.get(m.nhom).add(m.key);
        }
        const linhVuc = dsLinhVuc
            .filter((n) => monTheoNhom.has(String(n._id)))
            .map((n) => {
                const khoa = monTheoNhom.get(String(n._id));
                return {
                    _id: n._id,
                    key: n.key,
                    ten: n.ten,
                    bieuTuong: n.bieuTuong,
                    soMon: khoa.size,
                    soTaiLieu: baiCuaTruong.filter((bai) => (bai.monHocKey || []).some((k) => khoa.has(k))).length,
                };
            })
            .sort((a, b) => b.soTaiLieu - a.soTaiLieu || b.soMon - a.soMon);

        const truongKhac = tatCa
            .map((x) => ({ _id: x._id, key: x.key, ten: x.ten, logo: x.logo || '', thuTu: x.thuTu, soTaiLieu: soTheoKhoa.get(x.key) || 0 }))
            // Nhieu tai lieu truoc, roi thu tu admin dat, roi ten.
            .sort((a, b) => b.soTaiLieu - a.soTaiLieu || a.thuTu - b.thuTu || a.ten.localeCompare(b.ten, 'vi'))
            .slice(0, SO_TRUONG_KHAC);

        res.json({
            truong: { _id: t._id, key: t.key, ten: t.ten, logo: t.logo || '', thuTu: t.thuTu, soTaiLieu: soTheoKhoa.get(t.key) || 0 },
            monHoc,
            linhVuc,
            truongKhac,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Them truong (admin)
// @route   POST /api/documents/truong   { ten }
const themTruong = async (req, res) => {
    try {
        const k = kiemTen(req.body && req.body.ten);
        if (k.loi) return res.status(400).json({ message: k.loi });
        if (await DocumentUniversity.exists({ key: k.key })) {
            return res.status(409).json({ message: 'Đã có trường trùng tên này' });
        }
        // Cung truong, khac cach viet ("Đại học X" / "Trường Đại học X").
        const tatCa = await DocumentUniversity.find().select('ten').lean();
        const trung = tatCa.find((x) => khoaTenChinh(x.ten) === khoaTenChinh(k.ten));
        if (trung) {
            return res.status(409).json({ message: `Trường này đã có với tên "${trung.ten}"` });
        }
        const logo = String((req.body && req.body.logo) || '').trim();
        if (!logoHopLe(logo)) return res.status(400).json({ message: 'Logo phải là /images/institution/<tên-file> hoặc link https' });
        const t = await DocumentUniversity.create({ ten: k.ten, key: k.key, logo });
        res.status(201).json({ ...t.toObject(), soTaiLieu: 0 });
    } catch (error) {
        if (error && error.code === 11000) return res.status(409).json({ message: 'Đã có trường trùng tên này' });
        res.status(500).json({ message: error.message });
    }
};

// @desc    Doi ten / logo truong (admin) - doi ten thi cap nhat luon cac tai lieu
// @route   PUT /api/documents/truong/:id   { ten?, logo? }
const suaTruong = async (req, res) => {
    try {
        const t = await DocumentUniversity.findById(req.params.id);
        if (!t) return res.status(404).json({ message: 'Không tìm thấy trường' });
        const body = req.body || {};

        if (body.monHoc !== undefined) {
            const dm = await docDanhMucMon(body.monHoc);
            if (dm.loi) return res.status(400).json({ message: dm.loi });
            t.monHoc = dm.monHoc;
        }

        if (body.logo !== undefined) {
            const logo = String(body.logo || '').trim();
            if (!logoHopLe(logo)) {
                return res.status(400).json({ message: 'Logo phải là /images/institution/<tên-file> hoặc link https' });
            }
            t.logo = logo;
        }
        // Chi doi logo / danh muc mon: luu roi tra luon.
        if (body.ten === undefined) {
            await t.save();
            return res.json({ ...t.toObject(), soTaiLieuDaCapNhat: 0 });
        }

        const k = kiemTen(body.ten);
        if (k.loi) return res.status(400).json({ message: k.loi });
        const khoaCu = t.key;
        if (k.key !== khoaCu && (await DocumentUniversity.exists({ key: k.key }))) {
            return res.status(409).json({ message: 'Đã có trường trùng tên này' });
        }
        t.ten = k.ten;
        t.key = k.key;
        await t.save();
        const { modifiedCount } = await Document.updateMany(
            { truongKey: khoaCu },
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
const xoaTruong = async (req, res) => {
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
const layThongKe = async (req, res) => {
    try {
        const motTuanTruoc = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const [soTaiLieu, moiTuanNay, soMon, soLinhVuc, soTruong, nguoi, tai] = await Promise.all([
            Document.countDocuments(HIEN),
            Document.countDocuments({ ...HIEN, createdAt: { $gte: motTuanTruoc } }),
            DocumentSubject.countDocuments(),
            DocumentCategory.countDocuments(),
            DocumentUniversity.countDocuments(),
            Document.distinct('uploader', HIEN),
            Document.aggregate([{ $match: HIEN }, { $group: { _id: null, tong: { $sum: '$downloadCount' } } }]),
        ]);
        res.json({
            soTaiLieu,
            moiTuanNay,
            soMon,
            soLinhVuc,
            soTruong,
            soNguoiChiaSe: nguoi.length,
            tongLuotTai: (tai[0] && tai[0].tong) || 0,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { layTruong, layMotTruong, themTruong, suaTruong, xoaTruong, layThongKe, kiemTraTruong };
