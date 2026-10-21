const express = require('express');
const multer = require('multer');
const router = express.Router();
const { guardObjectIds } = require('../middlewares/validObjectId');

// Chan id sai dinh dang -> 404 thay vi 500. Xem middlewares/validObjectId.js
guardObjectIds(router);

const {
    getPosts,
    getTopics,
    getPostBySlug,
    createPost,
    updatePost,
    deletePost,
    getAdminPosts,
    getAdminPostById,
    uploadPostImage,
} = require('../controllers/postController');

const { protect, admin } = require('../middlewares/authMiddleware');
const { setCache } = require('../middlewares/cacheControl');

// ---------------------------------------------------------------------------
// DOC: mo cho tat ca.
//
// '/topics' phai dat TRUOC '/:slug', neu khong Express se coi "topics" la mot
// slug bai viet va tra ve 404.
// ---------------------------------------------------------------------------
router.get('/', setCache(60), getPosts);
router.get('/topics', setCache(300), getTopics);

// ---------------------------------------------------------------------------
// KHU QUAN TRI: dat TRUOC '/:slug'.
//
// '/admin/all' phai dung truoc '/admin/:id', neu khong Express se coi "all"
// la mot ObjectId va Mongoose nem CastError.
// ---------------------------------------------------------------------------
router.get('/admin/all', protect, admin, getAdminPosts);
router.get('/admin/:id', protect, admin, getAdminPostById);

router.get('/:slug', getPostBySlug);

// ---------------------------------------------------------------------------
// VIET: chi Admin.
//
// Cam nang mon hoc la blog bien tap do Admin dang, khac han /api/documents la
// noi hoc vien tu dang len. Nguoi dung thuong gui POST vao day se nhan 403.
// ---------------------------------------------------------------------------
// Anh cho bai viet. Multer rieng 5MB chi nhan anh, khong dung `uploadCloud`
// (tran 100MB danh cho video bai hoc). Duong nay la POST nen khong dung do
// voi GET '/:slug'.
const MAX_IMAGE_MB = 5;
const IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const postImage = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_IMAGE_MB * 1024 * 1024, files: 1 },
    fileFilter: (req, file, cb) => {
        if (!IMAGE_MIMES.includes(file.mimetype)) {
            return cb(new Error('Chỉ nhận ảnh JPG, PNG, WEBP hoặc GIF'));
        }
        cb(null, true);
    },
});

// Loi multer nam ngoai try/catch cua controller - bat o day de tra 400 ro rang.
const imageUpload = (req, res, next) => {
    postImage.single('image')(req, res, (err) => {
        if (!err) return next();
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: `Ảnh tối đa ${MAX_IMAGE_MB}MB` });
        }
        return res.status(400).json({ message: err.message || 'Không đọc được ảnh tải lên' });
    });
};

router.post('/upload-image', protect, admin, imageUpload, uploadPostImage);
router.post('/', protect, admin, createPost);
router.put('/:id', protect, admin, updatePost);
router.delete('/:id', protect, deletePost);

module.exports = router;
