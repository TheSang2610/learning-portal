const express = require('express');
const multer = require('multer');
const { setCache, noStore } = require('../middlewares/cacheControl');
const router = express.Router();
const { guardObjectIds } = require('../middlewares/validObjectId');

// Chan id sai dinh dang -> 404 thay vi 500. Xem middlewares/validObjectId.js
guardObjectIds(router);

const {
    getDocuments,
    getDocumentById,
    createDocument,
    incrementDownload,
    getDocumentFile,
    deleteDocument,
    logView,
    logSearch,
    getSubjects,
    getRecommendations,
    updateDocument,
    getMyDocuments,
    getMyHistory,
    clearMyHistory,
    getDocumentsAdmin,
    hideDocument,
    createSubject,
    updateSubject,
    deleteSubject,
    getComments,
    createComment,
    deleteComment,
    hideComment,
    uploadContentImage,
} = require('../controllers/documentController');
const {
    getFields,
    addField,
    editField,
    deleteField,
} = require('../controllers/documentCategoryController');
const {
    getSchools,
    getSchool,
    themTruong: addSchool,
    suaTruong: editSchool,
    xoaTruong: deleteSchool,
    getStats,
} = require('../controllers/documentUniversityController');

const { protect, admin, optionalUser } = require('../middlewares/authMiddleware');
const { limit } = require('../middlewares/rateLimit');

// Chong spam binh luan: 10 binh luan / phut / IP. Du cho mot nguoi dang tra
// loi qua lai that, chan duoc ai dan cung mot cau lien tuc.
const commentLimit = limit({
    ten: 'binh-luan-tai-lieu',
    hits: 10,
    windowMs: 60 * 1000,
    thongBao: 'Bạn bình luận hơi nhanh. Đợi một chút rồi thử lại nhé.',
});

// Chong bom luot xem: 60 lan / 10 phut / IP - du cho mot nguoi luot doc lien tuc.
const viewLimit = limit({
    ten: 'xem-tai-lieu',
    hits: 60,
    windowMs: 10 * 60 * 1000,
    thongBao: 'Bạn thao tác hơi nhanh. Đợi một lát rồi thử lại nhé.',
});

const MAX_MB = 20;
const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx'];
const { MAX_FILES } = require('../models/Document');

// Kieu MIME chuan cua PDF/Word. Mot so trinh duyet gui
// 'application/octet-stream' cho .doc/.docx nen phai chap nhan them,
// bu lai luon kiem tra duoi file - khong tin moi minh MIME.
const ALLOWED_MIMES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/octet-stream',
];

// Multer rieng cho tai lieu: co gioi han dung luong va loc dinh dang.
// Khong dung chung `uploadCloud` o utils vi cai do dung cho anh khoa hoc,
// banner, logo doi tac - them gioi han vao do se lam hong nhung cho khac.
const uploadDocument = multer({
    storage: multer.memoryStorage(),
    // Toi da MAX_FILES file, MOI file toi da MAX_MB.
    limits: { fileSize: MAX_MB * 1024 * 1024, files: MAX_FILES },
    fileFilter: (req, file, cb) => {
        const extension = String(file.originalname || '').split('.').pop().toLowerCase();
        if (!ALLOWED_EXTENSIONS.includes(extension)) {
            return cb(new Error('Chỉ chấp nhận file PDF, DOC hoặc DOCX'));
        }
        if (!ALLOWED_MIMES.includes(file.mimetype)) {
            return cb(new Error('Định dạng file không hợp lệ'));
        }
        cb(null, true);
    },
});

// Anh chen vao noi dung bai (anh chup man hinh cac buoc). Rieng voi file tai
// lieu: chi nhan anh, nhe hon (5MB), mot anh moi lan.
const IMAGE_MIMES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
const uploadImage = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024, files: 1 },
    fileFilter: (req, file, cb) => {
        if (!IMAGE_MIMES.includes(file.mimetype)) {
            return cb(new Error('Chỉ nhận ảnh PNG, JPG, WEBP hoặc GIF'));
        }
        cb(null, true);
    },
});
const imageUpload = (req, res, next) => {
    uploadImage.single('anh')(req, res, (err) => {
        if (!err) return next();
        if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ message: 'Ảnh tối đa 5MB' });
        return res.status(400).json({ message: err.message || 'Không đọc được ảnh tải lên' });
    });
};
// Chong spam kho anh: 40 anh / 10 phut / IP - du cho mot bai huong dan dai.
const imageLimit = limit({
    ten: 'anh-tai-lieu',
    hits: 40,
    windowMs: 10 * 60 * 1000,
    thongBao: 'Bạn tải ảnh hơi nhanh. Đợi một lát rồi thử lại nhé.',
});

// Multer nem loi ngoai luong try/catch cua controller, neu khong bat o day
// thi nguoi dung nhan 500 khong ro nguyen nhan thay vi "file qua nang".
const fileUpload = (req, res, next) => {
    uploadDocument.array('files', MAX_FILES)(req, res, (err) => {
        if (!err) return next();
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: `Mỗi file tối đa ${MAX_MB}MB` });
        }
        // Qua so file, hoac gui file o ten truong khac "files".
        if (err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({ message: `Tối đa ${MAX_FILES} file cho một tài liệu, gửi ở trường "files"` });
        }
        return res.status(400).json({ message: err.message || 'Không đọc được file tải lên' });
    });
};

// ---------------------------------------------------------------------------
// XEM: mo cho tat ca, khong can dang nhap.
// ---------------------------------------------------------------------------
router.get('/', setCache(60), getDocuments);

// ---------------------------------------------------------------------------
// CAC DUONG CO TEN RIENG - PHAI KHAI BAO TRUOC '/:id'.
//
// Express khop theo thu tu: dat sau thi '/goi-y', '/mon-hoc', '/lich-su'...
// roi vao '/:id', guardObjectIds thay chu do khong phai ObjectId va tra 404.
// ---------------------------------------------------------------------------

// Danh sach mon: giong nhau voi moi nguoi, khong tac dung phu -> cache duoc.
router.get('/mon-hoc', setCache(60), getSubjects);
// Anh cho noi dung bai - bat buoc dang nhap. Dat TRUOC '/:id'.
router.post('/anh', imageLimit, protect, imageUpload, uploadContentImage);
// Linh vuc (nhom lon cua mon) - trang /share-document. Doc cong khai, giong
// nhau voi moi nguoi nen cache duoc; sua chi admin.
router.get('/linh-vuc', setCache(60), getFields);
router.post('/linh-vuc', protect, admin, addField);
router.put('/linh-vuc/:id', protect, admin, editField);
router.delete('/linh-vuc/:id', protect, admin, deleteField);
// Truong dai hoc - doc cong khai, sua chi admin. Trang danh sach truong o
// frontend: /share-document/institution.
router.get('/truong', setCache(60), getSchools);
// Mot truong (mon hoc cua truong + truong khac) - trang /share-document/institution/<khoa>.
router.get('/truong/:khoa', setCache(60), getSchool);
router.post('/truong', protect, admin, addSchool);
router.put('/truong/:id', protect, admin, editSchool);
router.delete('/truong/:id', protect, admin, deleteSchool);
// So lieu tong quan cua kho - giong nhau voi moi nguoi nen cache duoc.
router.get('/thong-ke', setCache(60), getStats);
router.post('/mon-hoc', protect, admin, createSubject);
router.put('/mon-hoc/:id', protect, admin, updateSubject);
router.delete('/mon-hoc/:id', protect, admin, deleteSubject);

// Danh sach cho quan tri, GOM tai lieu da an -> bat buoc admin va CAM cache.
// Xem getDocumentsAdmin ve vi sao khong gop vao GET '/'.
router.get('/quan-tri', noStore, protect, admin, getDocumentsAdmin);

// goi-y: RIENG tung nguoi (doc lich su cua req.user) -> CAM cache. Gan
// setCache vao day la CDN phat goi y cua nguoi nay cho nguoi khac.
router.get('/goi-y', noStore, optionalUser, getRecommendations);
// Khach goi van tra 204 va khong ghi gi - xem logSearch.
router.post('/tim-kiem', optionalUser, logSearch);
// Bai cua chinh minh (trang ca nhan) - gom ca bai bi an, nen KHONG duoc gan setCache.
router.get('/cua-toi', noStore, protect, getMyDocuments);
// Lich su cua CHINH minh: bat buoc dang nhap, va cam cache vi rieng tung nguoi.
router.get('/lich-su', noStore, protect, getMyHistory);
router.delete('/lich-su', protect, clearMyHistory);

// Binh luan theo id binh luan (khong theo id tai lieu).
router.delete('/binh-luan/:id', protect, deleteComment);
router.patch('/binh-luan/:id/an', protect, admin, hideComment);

// ---------------------------------------------------------------------------
// THEO ID TAI LIEU
// ---------------------------------------------------------------------------
router.get('/:id', getDocumentById);
// optionalUser chu khong phai protect: khach VAN tai duoc nhu truoc, chi
// la khong de lai lich su.
router.post('/:id/download', optionalUser, incrementDownload);
router.post('/:id/xem', viewLimit, optionalUser, logView);

// Duong lay file that. KHONG dat setCache o day: controller tu dat
// Cache-Control 'private' - file co the bi go xuong vi vi pham, khong duoc de
// mot CDN chung giu ban sao va tiep tuc phat sau khi da go.
// optionalUser: tai lieu da an thi chi admin con mo duoc file.
router.get('/:id/file', optionalUser, getDocumentFile);

// Binh luan: ai cung doc duoc; viet thi phai dang nhap. Doc thi cam cache vi
// admin thay them binh luan da an - ket qua doi theo nguoi goi.
router.get('/:id/binh-luan', noStore, optionalUser, getComments);
router.post('/:id/binh-luan', commentLimit, protect, createComment);

// ---------------------------------------------------------------------------
// DANG / SUA / AN / XOA: bat buoc dang nhap.
//
// Mo cho ca nguoi chua dang nhap se lap lai dung lo hong da vá o bannerRoutes:
// bat ky ai cung day duoc file tuy y vao tai khoan Cloudinary, va bai vi pham
// thi khong truy ra ai dang. Da dang nhap thi con co nguoi chiu trach nhiem.
// ---------------------------------------------------------------------------
router.post('/', protect, fileUpload, createDocument);
router.patch('/:id/an', protect, admin, hideDocument);
router.patch('/:id', protect, updateDocument);
router.delete('/:id', protect, deleteDocument);

module.exports = router;
