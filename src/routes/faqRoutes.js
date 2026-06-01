const express = require('express');
const router = express.Router();

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
router.get('/homepage', getHomepageFaqs);      
router.get('/course/:courseId', getFaqsByCourse); 

// 🔒 API BẢO MẬT (Admin/Instructor quản lý)
// 🎯 SỬA TẠI ĐÂY: Thay thế authorize(...) bằng middleware 'instructor' của bạn
router.post('/', protect, instructor, createFaq);   // POST: /api/faqs
router.put('/:id', protect, instructor, updateFaq);  // PUT: /api/faqs/:id
router.delete('/:id', protect, instructor, deleteFaq); // DELETE: /api/faqs/:id

module.exports = router;