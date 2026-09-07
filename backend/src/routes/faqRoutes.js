const express = require('express');
const router = express.Router();
const { capIdHopLe } = require('../middlewares/idHopLe');

// Chan id sai dinh dang -> 404 thay vi 500. Xem middlewares/idHopLe.js
capIdHopLe(router);
const { datCache } = require('../middlewares/cacheControl');

// 🎯 SỬA TẠI ĐÂY: Thay authorize bằng instructor
const { protect, instructor } = require('../middlewares/authMiddleware');

const {
    getHomepageFaqs,
    getFaqsByCourse,
    createFaq,
    updateFaq,
    deleteFaq
} = require('../controllers/faqController');

// 🔓 API CÔNG KHAI (Học viên xem)
router.get('/homepage', datCache(300), getHomepageFaqs);      
router.get('/course/:courseId', getFaqsByCourse); 

// 🔒 API BẢO MẬT (Admin/Instructor quản lý)
// 🎯 SỬA TẠI ĐÂY: Thay thế authorize(...) bằng middleware 'instructor' của bạn
router.post('/', protect, instructor, createFaq);   // POST: /api/faqs
router.put('/:id', protect, instructor, updateFaq);  // PUT: /api/faqs/:id
router.delete('/:id', protect, instructor, deleteFaq); // DELETE: /api/faqs/:id

module.exports = router;