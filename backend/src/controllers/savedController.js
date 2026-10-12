/**
 * "Da luu" - bai viet va tai lieu ma nguoi dung bam nut luu, hien o trang ca
 * nhan. Toan bo la du lieu RIENG tung nguoi: moi truy van deu loc
 * `user: req.user._id`, route gan `protect` cho ca nhom.
 */

const SavedItem = require('../models/SavedItem');
const Post = require('../models/Post');
const Document = require('../models/Document');
const { parseLegacyPath, laObjectId } = require('../utils/savedItems');

// Chi luu / hien thu ai cung xem duoc: bai viet da dang, tai lieu chua bi an.
// Bai bi go xuong SAU khi luu thi van giu dong luu (hien lai la thay) nhung
// khong tra ra ngoai.
const VISIBLE_POST_FILTER = { isPublished: true };
const VISIBLE_DOCUMENT_FILTER = { daAn: { $ne: true } };

const findTarget = (loai, id) =>
    loai === 'baiViet'
        ? Post.exists({ _id: id, ...VISIBLE_POST_FILTER })
        : Document.exists({ _id: id, ...VISIBLE_DOCUMENT_FILTER });

const validateInput = (loai, id) => {
    if (!SavedItem.LOAI.includes(loai)) return 'Loại không hợp lệ';
    if (!laObjectId(id)) return 'Mã không hợp lệ';
    return null;
};

// @desc    Danh sach da luu cua toi - kem thong tin de hien (tieu de, duong dan)
// @route   GET /api/da-luu
const getSaved = async (req, res) => {
    try {
        const rows = await SavedItem.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .limit(300)
            .lean();

        const idTheoLoai = (loai) => rows.filter((d) => d.loai === loai).map((d) => d.doiTuong);
        const [lesson, document] = await Promise.all([
            Post.find({ _id: { $in: idTheoLoai('baiViet') }, ...VISIBLE_POST_FILTER })
                .select('title slug excerpt thumbnail author createdAt')
                .populate('author', 'name avatar')
                .lean(),
            Document.find({ _id: { $in: idTheoLoai('taiLieu') }, ...VISIBLE_DOCUMENT_FILTER })
                .select('title monHoc files.fileExt downloadCount uploader createdAt')
                .populate('uploader', 'name avatar')
                .lean(),
        ]);

        const theoId = new Map([
            ...lesson.map((b) => [`baiViet:${b._id}`, {
                tieuDe: b.title,
                duongDan: `/blog/${b.slug}`,
                moTa: b.excerpt,
                anh: b.thumbnail || null,
                tacGia: b.author?.name || null,
                ngayDang: b.createdAt,
            }]),
            ...document.map((t) => [`taiLieu:${t._id}`, {
                tieuDe: t.title,
                // Khop documentPath() ben frontend (src/components/document/duongDan.ts).
                duongDan: `/share-document/all-document/${t._id}`,
                // Mang mon - tai lieu cu chua chuyen du lieu thi la chuoi.
                monHoc: Array.isArray(t.monHoc) ? t.monHoc : t.monHoc ? [t.monHoc] : [],
                duoiFile: (t.files && t.files[0] && t.files[0].fileExt) || t.fileExt || '',
                // 0 = bai viet kieu blog, khong kem file. Tai lieu cu chua chuyen
                // du lieu (chi co fileExt le) tinh la 1 file.
                soFile: Array.isArray(t.files) ? t.files.length : t.fileExt ? 1 : 0,
                tacGia: t.uploader?.name || null,
                ngayDang: t.createdAt,
            }]),
        ]);

        const items = rows
            .map((d) => {
                const detail = theoId.get(`${d.loai}:${d.doiTuong}`);
                if (!detail) return null;
                return { loai: d.loai, id: String(d.doiTuong), luuLuc: d.createdAt, ...detail };
            })
            .filter(Boolean);

        res.json({ items });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Chi id cac muc da luu - de to mau nut luu tren danh sach
// @route   GET /api/da-luu/id
const getSavedIds = async (req, res) => {
    try {
        const rows = await SavedItem.find({ user: req.user._id }).select('loai doiTuong').lean();
        const outcome = { baiViet: [], taiLieu: [] };
        for (const d of rows) outcome[d.loai]?.push(String(d.doiTuong));
        res.json(outcome);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Luu mot bai viet / tai lieu
// @route   POST /api/da-luu   { loai, id }
const save = async (req, res) => {
    try {
        const { loai, id } = req.body || {};
        const err = validateInput(loai, id);
        if (err) return res.status(400).json({ message: err });

        if (!(await findTarget(loai, id))) {
            return res.status(404).json({ message: 'Không tìm thấy nội dung để lưu' });
        }

        // Upsert: luu lai thu da luu la khong lam gi, khong bao loi.
        try {
            await SavedItem.updateOne(
                { user: req.user._id, loai, doiTuong: id },
                { $setOnInsert: { user: req.user._id, loai, doiTuong: id } },
                { upsert: true },
            );
        } catch (e) {
            // Hai request cung luc cung upsert -> mot cai dung chi muc unique.
            // Ket qua van dung: da luu dung mot lan.
            if (e.code !== 11000) throw e;
        }
        res.status(201).json({ daLuu: true });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Bo luu
// @route   DELETE /api/da-luu/:loai/:id
const unsave = async (req, res) => {
    try {
        const { loai, id } = req.params;
        const err = validateInput(loai, id);
        if (err) return res.status(400).json({ message: err });

        await SavedItem.deleteOne({ user: req.user._id, loai, doiTuong: id });
        // Bo luu thu chua luu cung tra thanh cong: trang thai cuoi van dung.
        res.json({ daLuu: false });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Chuyen danh sach luu cu trong localStorage vao tai khoan (mot lan)
// @route   POST /api/da-luu/nhap   { duongDan: string[] }
const importFromBrowser = async (req, res) => {
    try {
        const item = parseLegacyPath(req.body && req.body.duongDan);
        const slugs = item.filter((m) => m.loai === 'baiViet').map((m) => m.slug);
        const ids = item.filter((m) => m.loai === 'taiLieu').map((m) => m.id);

        const [lesson, document] = await Promise.all([
            slugs.length ? Post.find({ slug: { $in: slugs }, ...VISIBLE_POST_FILTER }).select('_id').lean() : [],
            ids.length ? Document.find({ _id: { $in: ids }, ...VISIBLE_DOCUMENT_FILTER }).select('_id').lean() : [],
        ]);

        const write = [
            ...lesson.map((b) => ['baiViet', b._id]),
            ...document.map((t) => ['taiLieu', t._id]),
        ].map(([loai, target]) => ({
            updateOne: {
                filter: { user: req.user._id, loai, doiTuong: target },
                update: { $setOnInsert: { user: req.user._id, loai, doiTuong: target } },
                upsert: true,
            },
        }));

        if (write.length) {
            try {
                await SavedItem.bulkWrite(write, { ordered: false });
            } catch (e) {
                if (e.code !== 11000) throw e;
            }
        }
        res.json({ daNhap: write.length });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { layDaLuu: getSaved, getSavedIds, luu: save, boLuu: unsave, importFromBrowser };
