const Faq = require('../models/Faq');
const Course = require('../models/Course');

// 🏠 1. Lấy danh sách FAQ dành riêng cho TRANG CHỦ (Client)
// @route   GET /api/faqs/homepage
const getHomepageFaqs = async (req, res) => {
    try {
        // Tìm những câu hỏi mà trường courseId không tồn tại hoặc bằng null.
        // $ne 'taiLieu' chu khong phai = 'trangChu': FAQ tao truoc khi co
        // truong viTri khong co truong nay, van phai hien o trang chu.
        const faqs = await Faq.find({
            $or: [
                { courseId: null },
                { courseId: { $exists: false } }
            ],
            viTri: { $ne: 'taiLieu' }
        }).sort({ createdAt: 1 });

        res.status(200).json({ success: true, count: faqs.length, data: faqs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 📄 FAQ của khu Chia sẻ tài liệu (/share-document)
// @route   GET /api/faqs/tai-lieu
const getDocumentFaqs = async (req, res) => {
    try {
        const faqs = await Faq.find({ courseId: null, viTri: 'taiLieu' }).sort({ createdAt: 1 });
        res.status(200).json({ success: true, count: faqs.length, data: faqs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 📚 2. Lấy danh sách FAQ của một KHÓA HỌC cụ thể
// @route   GET /api/faqs/course/:courseId
const getFaqsByCourse = async (req, res) => {
    try {
        const faqs = await Faq.find({ courseId: req.params.courseId }).sort({ createdAt: 1 });
        res.status(200).json({ success: true, count: faqs.length, data: faqs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ➕ 3. Tạo mới một câu hỏi (Cho cả Trang chủ lẫn Khóa học)
// @route   POST /api/faqs
const createFaq = async (req, res) => {
    try {
        const { courseId, question, answer } = req.body;

        // Nếu truyền lên courseId -> Đây là FAQ khóa học, cần check quyền Giảng viên/Admin
        if (courseId) {
            const course = await Course.findById(courseId);
            if (!course) return res.status(404).json({ success: false, message: 'Không tìm thấy khóa học.' });
            
            if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
                return res.status(403).json({ success: false, message: 'Bạn không có quyền tác động vào khóa học này.' });
            }
        } else {
            // Nếu KHÔNG truyền courseId -> Đây là FAQ Trang chủ, BẮT BUỘC phải là Admin tối cao mới được tạo
            if (req.user.role !== 'admin') {
                return res.status(403).json({ success: false, message: 'Chỉ Admin mới có quyền tạo FAQ Trang chủ.' });
            }
        }

        // Khu vuc chi co nghia voi FAQ khong gan khoa hoc; chi nhan dung hai gia tri.
        const viTri = !courseId && req.body.viTri === 'taiLieu' ? 'taiLieu' : 'trangChu';
        const faq = new Faq({ courseId: courseId || null, question, answer, viTri });
        const savedFaq = await faq.save();
        res.status(201).json({ success: true, data: savedFaq });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// 📝 4. Cập nhật câu hỏi (Sửa)
// @route   PUT /api/faqs/:id
const updateFaq = async (req, res) => {
    try {
        const { question, answer } = req.body;
        const faq = await Faq.findById(req.params.id);
        if (!faq) return res.status(404).json({ success: false, message: 'Không tìm thấy câu hỏi.' });

        // Check quyền tương tự khi sửa
        if (faq.courseId) {
            const course = await Course.findById(faq.courseId);
            if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
                return res.status(403).json({ success: false, message: 'Không có quyền chỉnh sửa.' });
            }
        } else {
            if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Chỉ Admin mới được sửa FAQ trang chủ.' });
        }

        faq.question = question || faq.question;
        faq.answer = answer || faq.answer;
        await faq.save();

        res.status(200).json({ success: true, data: faq });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ❌ 5. Xóa câu hỏi
// @route   DELETE /api/faqs/:id
const deleteFaq = async (req, res) => {
    try {
        const faq = await Faq.findById(req.params.id);
        if (!faq) return res.status(404).json({ success: false, message: 'Không tìm thấy câu hỏi cần xóa.' });

        if (faq.courseId) {
            const course = await Course.findById(faq.courseId);
            if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
                return res.status(403).json({ success: false, message: 'Không có quyền xóa.' });
            }
        } else {
            if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Chỉ Admin mới được xóa FAQ trang chủ.' });
        }

        await faq.deleteOne();
        res.status(200).json({ success: true, message: 'Xóa câu hỏi thành công!' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getHomepageFaqs, getDocumentFaqs, getFaqsByCourse, createFaq, updateFaq, deleteFaq };