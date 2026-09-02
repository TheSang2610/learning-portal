const Review = require('../models/Review');
const Course = require('../models/Course');
const User = require('../models/User');
const Enrollment = require('../models/Enrollment'); // 🔥 Import thêm model Enrollment để kiểm tra tiến độ
const { phanTrang } = require('../utils/truyVan');

// @desc    Tạo review mới cho khóa học (Chống Seeding & Review rác)
// @route   POST /api/reviews
const createReview = async (req, res) => {
    try {
        const { courseId, rating, comment } = req.body;

        // 1. Kiểm tra dữ liệu đầu vào cơ bản
        if (!courseId || !rating || !comment) {
            return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating phải từ 1 đến 5' });
        }

        if (comment.trim().length < 10) {
            return res.status(400).json({ message: 'Bình luận phải ít nhất 10 ký tự' });
        }

        // 2. Kiểm tra khóa học có tồn tại không
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Khóa học không tồn tại' });
        }

        // 3. 🔥 CHỐNG SPAM: Kiểm tra thông tin đăng ký lớp học thực tế
        const enrollment = await Enrollment.findOne({
            course: courseId,
            student: req.user._id,
            status: { $in: ['active', 'completed'] } // Chỉ cho phép học viên đang học hoặc đã xong review
        });

        if (!enrollment) {
            return res.status(403).json({ message: 'Bạn phải đăng ký và đang học khóa học này mới được quyền đánh giá' });
        }

        // 4. 🔥 CHỐNG SEEDING: Yêu cầu tiến độ học tập đạt tối thiểu (Ví dụ: 10%)
        const MIN_PROGRESS_REQUIRED = 10; 
        if (enrollment.totalProgress < MIN_PROGRESS_REQUIRED) {
            return res.status(403).json({ 
                message: `Hệ thống chống review ảo: Bạn cần học đạt tối thiểu ${MIN_PROGRESS_REQUIRED}% khóa học để mở khóa tính năng này. Tiến độ hiện tại: ${enrollment.totalProgress}%` 
            });
        }

        // 5. 🔥 BIỆN PHÁP NÂNG CAO: Chặn review quá nhanh sau khi đăng ký (Tránh tool click tặc bài học)
        const timeDiffInMinutes = (new Date() - new Date(enrollment.createdAt)) / (1000 * 60);
        const MIN_TIME_REQUIRED_MINUTES = 30; // Yêu cầu đăng ký ít nhất 30 phút mới được review
        
        if (timeDiffInMinutes < MIN_TIME_REQUIRED_MINUTES) {
            return res.status(403).json({
                message: `Bạn cần trải nghiệm khóa học lâu hơn trước khi đưa ra đánh giá khách quan (Vui lòng quay lại sau ${Math.ceil(MIN_TIME_REQUIRED_MINUTES - timeDiffInMinutes)} phút)`
            });
        }

        // 6. Kiểm tra xem học viên này đã từng đánh giá khóa này chưa
        const existingReview = await Review.findOne({
            course: courseId,
            student: req.user._id
        });

        if (existingReview) {
            return res.status(400).json({ message: 'Bạn đã đánh giá khóa học này rồi' });
        }

        // 7. Tiến hành lưu Review sạch
        const review = new Review({
            course: courseId,
            student: req.user._id,
            rating,
            comment: comment.trim(),
            isVerifiedPurchase: true // Đánh dấu đây là tài khoản học thật, mua thật
        });

        const createdReview = await review.save();
        
        // Populate thông tin học viên để frontend render lập tức
        await createdReview.populate('student', 'name avatar');

        // Cập nhật lại rating trung bình và tổng số lượng review trên bảng Course
        await updateCourseRating(courseId);

        res.status(201).json(createdReview);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Lấy tất cả reviews của 1 khóa học
// @route   GET /api/reviews/course/:courseId
const getCourseReviews = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { sortBy = 'newest' } = req.query;
        const { trang, soDong, boQua } = phanTrang(req.query);

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Khóa học không tồn tại' });
        }

        let sortOption = {};
        if (sortBy === 'highest') sortOption = { rating: -1 };
        else if (sortBy === 'lowest') sortOption = { rating: 1 };
        else if (sortBy === 'helpful') sortOption = { helpful: -1 };
        else sortOption = { createdAt: -1 };

        const reviews = await Review.find({ course: courseId })
            .populate('student', 'name avatar')
            .sort(sortOption)
            .skip(boQua)
            .limit(soDong);

        const totalReviews = await Review.countDocuments({ course: courseId });

        res.json({
            reviews,
            totalReviews,
            totalPages: Math.ceil(totalReviews / soDong),
            currentPage: trang
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Lấy review theo ID
// @route   GET /api/reviews/:id
const getReviewById = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id)
            .populate('student', 'name avatar email')
            .populate('course', 'title');

        if (!review) {
            return res.status(404).json({ message: 'Review không tồn tại' });
        }

        res.json(review);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Cập nhật review
// @route   PUT /api/reviews/:id
const updateReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ message: 'Review không tồn tại' });
        }

        if (review.student.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Bạn không có quyền chỉnh sửa review này' });
        }

        if (req.body.rating) {
            if (req.body.rating < 1 || req.body.rating > 5) {
                return res.status(400).json({ message: 'Rating phải từ 1 đến 5' });
            }
            review.rating = req.body.rating;
        }

        if (req.body.comment) {
            if (req.body.comment.length < 10) {
                return res.status(400).json({ message: 'Bình luận phải ít nhất 10 ký tự' });
            }
            review.comment = req.body.comment;
        }

        const updatedReview = await review.save();
        await updatedReview.populate('student', 'name avatar');

        await updateCourseRating(review.course);

        res.json(updatedReview);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Xóa review
// @route   DELETE /api/reviews/:id
const deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ message: 'Review không tồn tại' });
        }

        if (review.student.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Bạn không có quyền xóa review này' });
        }

        const courseId = review.course;
        await Review.findByIdAndDelete(req.params.id);

        await updateCourseRating(courseId);

        res.json({ message: 'Xóa review thành công' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Đánh dấu review hữu ích
// @route   POST /api/reviews/:id/helpful
const markHelpful = async (req, res) => {
    try {
        const review = await Review.findByIdAndUpdate(
            req.params.id,
            { $inc: { helpful: 1 } },
            { new: true }
        ).populate('student', 'name avatar');

        res.json(review);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Đánh dấu review không hữu ích
// @route   POST /api/reviews/:id/unhelpful
const markUnhelpful = async (req, res) => {
    try {
        const review = await Review.findByIdAndUpdate(
            req.params.id,
            { $inc: { unhelpful: 1 } },
            { new: true }
        ).populate('student', 'name avatar');

        res.json(review);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Lấy thống kê rating của course
// @route   GET /api/reviews/stats/:courseId
const getReviewStats = async (req, res) => {
    try {
        const { courseId } = req.params;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Khóa học không tồn tại' });
        }

        const allReviews = await Review.find({ course: courseId });
        
        const stats = {
            totalReviews: allReviews.length,
            averageRating: allReviews.length > 0 
                ? (allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length).toFixed(1)
                : 0,
            ratingDistribution: {
                '5': allReviews.filter(r => r.rating === 5).length,
                '4': allReviews.filter(r => r.rating === 4).length,
                '3': allReviews.filter(r => r.rating === 3).length,
                '2': allReviews.filter(r => r.rating === 2).length,
                '1': allReviews.filter(r => r.rating === 1).length
            }
        };

        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Helper function: Cập nhật rating trung bình của course
const updateCourseRating = async (courseId) => {
    try {
        const reviews = await Review.find({ course: courseId });
        
        if (reviews.length === 0) {
            await Course.findByIdAndUpdate(courseId, {
                rating: 0,
                reviewsCount: 0
            });
            return;
        }

        const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

        await Course.findByIdAndUpdate(courseId, {
            rating: parseFloat(averageRating.toFixed(1)),
            reviewsCount: reviews.length
        });
    } catch (error) {
        console.error('Lỗi cập nhật rating course:', error.message);
    }
};

// @desc    Lấy toàn bộ đánh giá hệ thống (Dành cho giao diện quản trị Admin)
// @route   GET /api/reviews/admin/all
const getAllReviewsForAdmin = async (req, res) => {
    try {
        const { trang, soDong, boQua } = phanTrang(req.query, { macDinh: 50 });

        // Lấy tất cả review, nạp kèm thông tin student (name, email, avatar) và course (title)
        const reviews = await Review.find({})
            .populate('student', 'name email avatar')
            .populate('course', 'title')
            .sort({ createdAt: -1 }) // Mới nhất xếp lên đầu
            .skip(boQua)
            .limit(soDong);

        const totalReviews = await Review.countDocuments({});

        res.json({
            reviews,
            totalReviews,
            totalPages: Math.ceil(totalReviews / soDong),
            currentPage: trang
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createReview,
    getCourseReviews,
    getAllReviewsForAdmin,
    getReviewById,
    updateReview,
    deleteReview,
    markHelpful,
    markUnhelpful,
    getReviewStats
};