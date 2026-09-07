const express = require('express');
const router = express.Router();
const { capIdHopLe } = require('../middlewares/idHopLe');

// Chan id sai dinh dang -> 404 thay vi 500. Xem middlewares/idHopLe.js
capIdHopLe(router);

const {
    getPosts,
    getTopics,
    getPostBySlug,
    createPost,
    updatePost,
    deletePost,
    getAdminPosts,
    getAdminPostById,
} = require('../controllers/postController');

const { protect, admin } = require('../middlewares/authMiddleware');
const { datCache } = require('../middlewares/cacheControl');

// ---------------------------------------------------------------------------
// DOC: mo cho tat ca.
//
// '/topics' phai dat TRUOC '/:slug', neu khong Express se coi "topics" la mot
// slug bai viet va tra ve 404.
// ---------------------------------------------------------------------------
router.get('/', datCache(60), getPosts);
router.get('/topics', datCache(300), getTopics);

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
router.post('/', protect, admin, createPost);
router.put('/:id', protect, admin, updatePost);
router.delete('/:id', protect, deletePost);

module.exports = router;
