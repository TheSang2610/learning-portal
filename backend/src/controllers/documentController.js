const Document = require('../models/Document');
const layCloudinary = require('../config/cloudinary');
const { phanTrang } = require('../utils/truyVan');
const { uploadToCloudinary } = require('../utils/uploadCloud');
const { checkDocument } = require('../utils/contentFilter');
const { chuanHoaNoiDung, boThe } = require('../utils/htmlBaiViet');
const { taoSlug } = require('../utils/vanBan');

const LOAI_CHO_PHEP = ['pdf', 'doc', 'docx'];

// Cloudinary chua cau hinh thi upload se nem loi kho hieu tan sau.
// Kiem o day de tra ve dung nguyen nhan.
const cloudinaryReady = () => {
    const c = layCloudinary().config();
    return Boolean(c.cloud_name && c.api_key && c.api_secret);
};

const duoiFile = (name = '') => String(name).split('.').pop().toLowerCase();

// Bo dau + thay ky tu la, de lam public_id tren Cloudinary.
// @desc    Danh sach tai lieu (cong khai)
// @route   GET /api/documents?page=1&limit=12&q=tu-khoa
const getDocuments = async (req, res) => {
    try {
        const { trang: page, soDong: limit, boQua: skip } = phanTrang(req.query, {
            macDinh: 12,
            toiDa: 50,
        });
        const q = (req.query.q || '').trim();

        const filter = q ? { $text: { $search: q } } : {};

        // Dem va lay du lieu chay song song - hai truy van doc lap nhau.
        const [documents, total] = await Promise.all([
            Document.find(filter)
                // Khong tra ve filePublicId: do la chi tiet noi bo cua Cloudinary,
                // nguoi xem khong can va cang khong nen biet.
                .select('title description fileUrl fileName fileExt fileSize uploader downloadCount createdAt')
                .populate('uploader', 'name avatar')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Document.countDocuments(filter),
        ]);

        res.json({
            documents,
            total,
            page,
            totalPages: Math.ceil(total / limit) || 1,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Chi tiet mot tai lieu (cong khai)
// @route   GET /api/documents/:id
const getDocumentById = async (req, res) => {
    try {
        const doc = await Document.findById(req.params.id)
            .select('title description fileUrl fileName fileExt fileSize uploader downloadCount createdAt')
            .populate('uploader', 'name avatar');

        if (!doc) return res.status(404).json({ message: 'Không tìm thấy tài liệu' });
        res.json(doc);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Dang tai lieu moi
// @route   POST /api/documents
const createDocument = async (req, res) => {
    try {
        const title = (req.body.title || '').trim();

        // PHAI loc HTML o day. Truoc day cho nay chi .trim() roi luu thang, va
        // giao dien thi do mo ta ra bang dangerouslySetInnerHTML (xem
        // frontend ArticleWithOutline, no tu doan chuoi nao giong HTML thi ve
        // nguyen). Ai dang duoc tai lieu la nhet duoc <script> chay trong
        // trinh duyet cua MOI nguoi mo tai lieu do - XSS luu tru.
        //
        // postController da di qua chuanHoaNoiDung tu lau; duong nay bi bo sot.
        // Them duong ghi mo ta moi thi cung phai goi ham nay.
        const description = chuanHoaNoiDung(req.body.description);

        if (!title || !description) {
            return res.status(400).json({ message: 'Vui lòng nhập đầy đủ tiêu đề và nội dung' });
        }
        if (title.length > 200) {
            return res.status(400).json({ message: 'Tiêu đề tối đa 200 ký tự' });
        }
        // Do dai dem SAU khi loc: bo loc cat bot nen ban tho dai hon nguong ma
        // phan giu lai van vua thi khong co ly do tu choi.
        if (description.length > 5000) {
            return res.status(400).json({ message: 'Nội dung tối đa 5000 ký tự' });
        }

        // Loc noi dung TRUOC khi day file len Cloudinary, de bai vi pham
        // khong kip chiem dung luong.
        //
        // boThe() de bo loc tu ngu doc CHU chu khong doc the: de nguyen HTML
        // thi ten the va ten thuoc tinh lot vao phep dem tu, vua bao dong nham
        // vua che mat tu that nam giua hai the.
        const kiemDuyet = checkDocument({ title, description: boThe(description) });
        if (!kiemDuyet.ok) {
            return res.status(400).json({
                message: kiemDuyet.message,
                field: kiemDuyet.field,
                category: kiemDuyet.category,
            });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'Vui lòng chọn file PDF hoặc Word để tải lên' });
        }

        const ext = duoiFile(req.file.originalname);
        if (!LOAI_CHO_PHEP.includes(ext)) {
            return res.status(400).json({ message: 'Chỉ chấp nhận file PDF, DOC hoặc DOCX' });
        }

        if (!cloudinaryReady()) {
            return res.status(503).json({
                message:
                    'Máy chủ chưa cấu hình nơi lưu trữ file. Cần đặt CLOUDINARY_CLOUD_NAME, ' +
                    'CLOUDINARY_API_KEY và CLOUDINARY_API_SECRET trong file .env của backend.',
            });
        }

        // resource_type 'raw' cho file khong phai anh. Duoi file phai nam trong
        // public_id thi link tai ve moi dung dinh dang.
        const publicId = `${taoSlug(title, { dai: 60, macDinh: 'tai-lieu' })}-${Date.now()}.${ext}`;
        const uploaded = await uploadToCloudinary(req.file.buffer, 'raw', {
            folder: 'learning-portal/documents',
            public_id: publicId,
            use_filename: false,
            unique_filename: false,
        });

        const doc = await Document.create({
            title,
            description,
            fileUrl: uploaded.secure_url,
            filePublicId: uploaded.public_id,
            fileName: req.file.originalname,
            fileExt: ext,
            fileSize: req.file.size,
            uploader: req.user._id,
        });

        const daLuu = await Document.findById(doc._id)
            .select('title description fileUrl fileName fileExt fileSize uploader downloadCount createdAt')
            .populate('uploader', 'name avatar');

        res.status(201).json(daLuu);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Tang so luot tai
// @route   POST /api/documents/:id/download
const incrementDownload = async (req, res) => {
    try {
        const doc = await Document.findByIdAndUpdate(
            req.params.id,
            { $inc: { downloadCount: 1 } },
            { new: true, select: 'downloadCount' },
        );
        if (!doc) return res.status(404).json({ message: 'Không tìm thấy tài liệu' });
        res.json({ downloadCount: doc.downloadCount });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Xoa tai lieu (chu bai hoac admin)
// @route   DELETE /api/documents/:id
const deleteDocument = async (req, res) => {
    try {
        const doc = await Document.findById(req.params.id);
        if (!doc) return res.status(404).json({ message: 'Không tìm thấy tài liệu' });

        const laChuBai = String(doc.uploader) === String(req.user._id);
        if (!laChuBai && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Bạn chỉ có thể xóa tài liệu do mình đăng' });
        }

        // Xoa file tren Cloudinary truoc. Neu buoc nay hong thi van xoa ban ghi,
        // vi de lai ban ghi tro toi file da mat con te hon la thua mot file.
        if (doc.filePublicId && cloudinaryReady()) {
            try {
                // invalidate: true de xoa luon ban CDN dang nho. Khong co no thi file da xoa
                // van tai ve duoc hang gio qua duong dan cu - da do duoc: xoa xong goi lai
                // URL van tra 200. Voi bai vi pham bi go thi do la lo hong that.
                await layCloudinary().uploader.destroy(doc.filePublicId, {
                    resource_type: 'raw',
                    invalidate: true,
                });
            } catch (err) {
                console.error('Không xóa được file trên Cloudinary:', err.message);
            }
        }

        await doc.deleteOne();
        res.json({ message: 'Đã xóa tài liệu' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getDocuments,
    getDocumentById,
    createDocument,
    incrementDownload,
    deleteDocument,
};
