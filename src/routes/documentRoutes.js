const express = require('express');
const multer = require('multer');
const { datCache } = require('../middlewares/cacheControl');
const router = express.Router();
const { capIdHopLe } = require('../middlewares/idHopLe');

// Chan id sai dinh dang -> 404 thay vi 500. Xem middlewares/idHopLe.js
capIdHopLe(router);

const {
    getDocuments,
    getDocumentById,
    createDocument,
    incrementDownload,
    deleteDocument,
} = require('../controllers/documentController');

const { protect } = require('../middlewares/authMiddleware');

const MAX_MB = 20;
const DUOI_CHO_PHEP = ['pdf', 'doc', 'docx'];

// Kieu MIME chuan cua PDF/Word. Mot so trinh duyet gui
// 'application/octet-stream' cho .doc/.docx nen phai chap nhan them,
// bu lai luon kiem tra duoi file - khong tin moi minh MIME.
const MIME_CHO_PHEP = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/octet-stream',
];

// Multer rieng cho tai lieu: co gioi han dung luong va loc dinh dang.
// Khong dung chung `uploadCloud` o utils vi cai do dung cho anh khoa hoc,
// banner, logo doi tac - them gioi han vao do se lam hong nhung cho khac.
const uploadTaiLieu = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_MB * 1024 * 1024, files: 1 },
    fileFilter: (req, file, cb) => {
        const duoi = String(file.originalname || '').split('.').pop().toLowerCase();
        if (!DUOI_CHO_PHEP.includes(duoi)) {
            return cb(new Error('Chỉ chấp nhận file PDF, DOC hoặc DOCX'));
        }
        if (!MIME_CHO_PHEP.includes(file.mimetype)) {
            return cb(new Error('Định dạng file không hợp lệ'));
        }
        cb(null, true);
    },
});

// Multer nem loi ngoai luong try/catch cua controller, neu khong bat o day
// thi nguoi dung nhan 500 khong ro nguyen nhan thay vi "file qua nang".
const nhanFile = (req, res, next) => {
    uploadTaiLieu.single('file')(req, res, (err) => {
        if (!err) return next();
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: `File tối đa ${MAX_MB}MB` });
        }
        return res.status(400).json({ message: err.message || 'Không đọc được file tải lên' });
    });
};

// ---------------------------------------------------------------------------
// XEM: mo cho tat ca, khong can dang nhap.
// ---------------------------------------------------------------------------
router.get('/', datCache(60), getDocuments);
router.get('/:id', getDocumentById);
router.post('/:id/download', incrementDownload);

// ---------------------------------------------------------------------------
// DANG / XOA: bat buoc dang nhap.
//
// Mo cho ca nguoi chua dang nhap se lap lai dung lo hong da vá o bannerRoutes:
// bat ky ai cung day duoc file tuy y vao tai khoan Cloudinary, va bai vi pham
// thi khong truy ra ai dang. Da dang nhap thi con co nguoi chiu trach nhiem.
// ---------------------------------------------------------------------------
router.post('/', protect, nhanFile, createDocument);
router.delete('/:id', protect, deleteDocument);

module.exports = router;
