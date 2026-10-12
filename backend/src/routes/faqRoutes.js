const express = require('express');
const router = express.Router();
const { guardObjectIds } = require('../middlewares/validObjectId');

// Chan id sai dinh dang -> 404 thay vi 500. Xem middlewares/validObjectId.js
guardObjectIds(router);
const { setCache } = require('../middlewares/cacheControl');

// 🎯 SỬA TẠI ĐÂY: Thay authorize bằng instructor
const { protect, instructor } = require('../middlewares/authMiddleware');

const {
    getHomepageFaqs,
    getDocumentFaqs,
    getFaqsByCourse,
    createFaq,
    updateFaq,
    deleteFaq
} = require('../controllers/faqController');

// 🔓 API CÔNG KHAI (Học viên xem)
router.get('/homepage', setCache(300), getHomepageFaqs);
// FAQ khu Chia se tai lieu - giong nhau voi moi nguoi, cache nhu trang chu.
router.get('/tai-lieu', setCache(300), getDocumentFaqs);
router.get('/course/:courseId', getFaqsByCourse); 

// 🔒 API BẢO MẬT (Admin/Instructor quản lý)
// 🎯 SỬA TẠI ĐÂY: Thay thế authorize(...) bằng middleware 'instructor' của bạn
router.post('/', protect, instructor, createFaq);   // POST: /api/faqs
router.put('/:id', protect, instructor, updateFaq);  // PUT: /api/faqs/:id
router.delete('/:id', protect, instructor, deleteFaq); // DELETE: /api/faqs/:id

module.exports = router;