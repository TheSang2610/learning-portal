const express = require('express');
const multer = require('multer');
const { datCache, khongLuuCache } = require('../middlewares/cacheControl');
const router = express.Router();
const { capIdHopLe } = require('../middlewares/validObjectId');

// Chan id sai dinh dang -> 404 thay vi 500. Xem middlewares/validObjectId.js
capIdHopLe(router);

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
    anTaiLieu,
    createSubject,
    updateSubject,
    deleteSubject,
    getComments,
    createComment,
    deleteComment,
    anBinhLuan,
    taiAnhNoiDung,
} = require('../controllers/documentController');
const {
    layLinhVuc,
    themLinhVuc,
    suaLinhVuc,
    xoaLinhVuc,
} = require('../controllers/documentCategoryController');
const {
    layTruong,
    layMotTruong,
    themTruong,
    suaTruong,
    xoaTruong,
    layThongKe,
} = require('../controllers/documentUniversityController');

const { protect, admin, docNguoiDungNeuCo } = require('../middlewares/authMiddleware');
const { gioiHan } = require('../middlewares/rateLimit');

// Chong spam binh luan: 10 binh luan / phut / IP. Du cho mot nguoi dang tra
// loi qua lai that, chan duoc ai dan cung mot cau lien tuc.
const gioiHanBinhLuan = gioiHan({
    ten: 'binh-luan-tai-lieu',
    soLan: 10,
    cuaSoMs: 60 * 1000,
    thongBao: 'Bạn bình luận hơi nhanh. Đợi một chút rồi thử lại nhé.',
});

// Chong bom luot xem: 60 lan / 10 phut / IP - du cho mot nguoi luot doc lien tuc.
const gioiHanXem = gioiHan({
    ten: 'xem-tai-lieu',
    soLan: 60,
    cuaSoMs: 10 * 60 * 1000,
    thongBao: 'Bạn thao tác hơi nhanh. Đợi một lát rồi thử lại nhé.',
});

const MAX_MB = 20;
const DUOI_CHO_PHEP = ['pdf', 'doc', 'docx'];
const { SO_FILE_TOI_DA } = require('../models/Document');

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
    // Toi da SO_FILE_TOI_DA file, MOI file toi da MAX_MB.
    limits: { fileSize: MAX_MB * 1024 * 1024, files: SO_FILE_TOI_DA },
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

// Anh chen vao noi dung bai (anh chup man hinh cac buoc). Rieng voi file tai
// lieu: chi nhan anh, nhe hon (5MB), mot anh moi lan.
const MIME_ANH = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
const uploadAnh = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024, files: 1 },
    fileFilter: (req, file, cb) => {
        if (!MIME_ANH.includes(file.mimetype)) {
            return cb(new Error('Chỉ nhận ảnh PNG, JPG, WEBP hoặc GIF'));
        }
        cb(null, true);
    },
});
const nhanAnh = (req, res, next) => {
    uploadAnh.single('anh')(req, res, (err) => {
        if (!err) return next();
        if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ message: 'Ảnh tối đa 5MB' });
        return res.status(400).json({ message: err.message || 'Không đọc được ảnh tải lên' });
    });
};
// Chong spam kho anh: 40 anh / 10 phut / IP - du cho mot bai huong dan dai.
const gioiHanAnh = gioiHan({
    ten: 'anh-tai-lieu',
    soLan: 40,
    cuaSoMs: 10 * 60 * 1000,
    thongBao: 'Bạn tải ảnh hơi nhanh. Đợi một lát rồi thử lại nhé.',
});

// Multer nem loi ngoai luong try/catch cua controller, neu khong bat o day
// thi nguoi dung nhan 500 khong ro nguyen nhan thay vi "file qua nang".
const nhanFile = (req, res, next) => {
    uploadTaiLieu.array('files', SO_FILE_TOI_DA)(req, res, (err) => {
        if (!err) return next();
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: `Mỗi file tối đa ${MAX_MB}MB` });
        }
        // Qua so file, hoac gui file o ten truong khac "files".
        if (err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({ message: `Tối đa ${SO_FILE_TOI_DA} file cho một tài liệu, gửi ở trường "files"` });
        }
        return res.status(400).json({ message: err.message || 'Không đọc được file tải lên' });
    });
};

// ---------------------------------------------------------------------------
// XEM: mo cho tat ca, khong can dang nhap.
// ---------------------------------------------------------------------------
router.get('/', datCache(60), getDocuments);

// ---------------------------------------------------------------------------
// CAC DUONG CO TEN RIENG - PHAI KHAI BAO TRUOC '/:id'.
//
// Express khop theo thu tu: dat sau thi '/goi-y', '/mon-hoc', '/lich-su'...
// roi vao '/:id', capIdHopLe thay chu do khong phai ObjectId va tra 404.
// ---------------------------------------------------------------------------

// Danh sach mon: giong nhau voi moi nguoi, khong tac dung phu -> cache duoc.
router.get('/mon-hoc', datCache(60), getSubjects);
// Anh cho noi dung bai - bat buoc dang nhap. Dat TRUOC '/:id'.
router.post('/anh', gioiHanAnh, protect, nhanAnh, taiAnhNoiDung);
// Linh vuc (nhom lon cua mon) - trang /share-document. Doc cong khai, giong
// nhau voi moi nguoi nen cache duoc; sua chi admin.
router.get('/linh-vuc', datCache(60), layLinhVuc);
router.post('/linh-vuc', protect, admin, themLinhVuc);
router.put('/linh-vuc/:id', protect, admin, suaLinhVuc);
router.delete('/linh-vuc/:id', protect, admin, xoaLinhVuc);
// Truong dai hoc - doc cong khai, sua chi admin. Trang danh sach truong o
// frontend: /share-document/institution.
router.get('/truong', datCache(60), layTruong);
// Mot truong (mon hoc cua truong + truong khac) - trang /share-document/institution/<khoa>.
router.get('/truong/:khoa', datCache(60), layMotTruong);
router.post('/truong', protect, admin, themTruong);
router.put('/truong/:id', protect, admin, suaTruong);
router.delete('/truong/:id', protect, admin, xoaTruong);
// So lieu tong quan cua kho - giong nhau voi moi nguoi nen cache duoc.
router.get('/thong-ke', datCache(60), layThongKe);
router.post('/mon-hoc', protect, admin, createSubject);
router.put('/mon-hoc/:id', protect, admin, updateSubject);
router.delete('/mon-hoc/:id', protect, admin, deleteSubject);

// Danh sach cho quan tri, GOM tai lieu da an -> bat buoc admin va CAM cache.
// Xem getDocumentsAdmin ve vi sao khong gop vao GET '/'.
router.get('/quan-tri', khongLuuCache, protect, admin, getDocumentsAdmin);

// goi-y: RIENG tung nguoi (doc lich su cua req.user) -> CAM cache. Gan
// datCache vao day la CDN phat goi y cua nguoi nay cho nguoi khac.
router.get('/goi-y', khongLuuCache, docNguoiDungNeuCo, getRecommendations);
// Khach goi van tra 204 va khong ghi gi - xem logSearch.
router.post('/tim-kiem', docNguoiDungNeuCo, logSearch);
// Bai cua chinh minh (trang ca nhan) - gom ca bai bi an, nen KHONG duoc gan datCache.
router.get('/cua-toi', khongLuuCache, protect, getMyDocuments);
// Lich su cua CHINH minh: bat buoc dang nhap, va cam cache vi rieng tung nguoi.
router.get('/lich-su', khongLuuCache, protect, getMyHistory);
router.delete('/lich-su', protect, clearMyHistory);

// Binh luan theo id binh luan (khong theo id tai lieu).
router.delete('/binh-luan/:id', protect, deleteComment);
router.patch('/binh-luan/:id/an', protect, admin, anBinhLuan);

// ---------------------------------------------------------------------------
// THEO ID TAI LIEU
// ---------------------------------------------------------------------------
router.get('/:id', getDocumentById);
// docNguoiDungNeuCo chu khong phai protect: khach VAN tai duoc nhu truoc, chi
// la khong de lai lich su.
router.post('/:id/download', docNguoiDungNeuCo, incrementDownload);
router.post('/:id/xem', gioiHanXem, docNguoiDungNeuCo, logView);

// Duong lay file that. KHONG dat datCache o day: controller tu dat
// Cache-Control 'private' - file co the bi go xuong vi vi pham, khong duoc de
// mot CDN chung giu ban sao va tiep tuc phat sau khi da go.
// docNguoiDungNeuCo: tai lieu da an thi chi admin con mo duoc file.
router.get('/:id/file', docNguoiDungNeuCo, getDocumentFile);

// Binh luan: ai cung doc duoc; viet thi phai dang nhap. Doc thi cam cache vi
// admin thay them binh luan da an - ket qua doi theo nguoi goi.
router.get('/:id/binh-luan', khongLuuCache, docNguoiDungNeuCo, getComments);
router.post('/:id/binh-luan', gioiHanBinhLuan, protect, createComment);

// ---------------------------------------------------------------------------
// DANG / SUA / AN / XOA: bat buoc dang nhap.
//
// Mo cho ca nguoi chua dang nhap se lap lai dung lo hong da vá o bannerRoutes:
// bat ky ai cung day duoc file tuy y vao tai khoan Cloudinary, va bai vi pham
// thi khong truy ra ai dang. Da dang nhap thi con co nguoi chiu trach nhiem.
// ---------------------------------------------------------------------------
router.post('/', protect, nhanFile, createDocument);
router.patch('/:id/an', protect, admin, anTaiLieu);
router.patch('/:id', protect, updateDocument);
router.delete('/:id', protect, deleteDocument);

module.exports = router;
