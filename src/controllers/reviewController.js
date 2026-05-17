const Review = require('../models/Review');
const Course = require('../models/Course');
const User = require('../models/User');

// @desc    Tạo review mới cho khóa học
// @route   POST /api/reviews
const createReview = async (req, res) => {
    try {
        const { courseId, rating, comment } = req.body;

        if (!courseId || !rating || !comment) {
            return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating phải từ 1 đến 5' });
        }

        if (comment.length < 10) {
            return res.status(400).json({ message: 'Bình luận phải ít nhất 10 ký tự' });
        }

        // Kiểm tra course tồn tại
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Khóa học không tồn tại' });
        }

        // Kiểm tra user đã đăng ký course này chưa
        const isEnrolled = course.students.includes(req.user._id);
        if (!isEnrolled) {
            return res.status(403).json({ message: 'Bạn phải đăng ký khóa học trước khi đánh giá' });
        }

        // Kiểm tra user đã review course này chưa
        const existingReview = await Review.findOne({
            course: courseId,
            student: req.user._id
        });

        if (existingReview) {
            return res.status(400).json({ message: 'Bạn đã review khóa học này rồi' });
        }

        // Tạo review mới
        const review = new Review({
            course: courseId,
            student: req.user._id,
            rating,
            comment,
            isVerifiedPurchase: true
        });

        const createdReview = await review.save();
        
        // Populate student info
        await createdReview.populate('student', 'name avatar');

        // Cập nhật rating trung bình của course
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
        const { sortBy = 'newest', page = 1, limit = 10 } = req.query;

        // Kiểm tra course tồn tại
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Khóa học không tồn tại' });
        }

        let sortOption = {};
        if (sortBy === 'highest') sortOption = { rating: -1 };
        else if (sortBy === 'lowest') sortOption = { rating: 1 };
        else if (sortBy === 'helpful') sortOption = { helpful: -1 };
        else sortOption = { createdAt: -1 };

        const skip = (page - 1) * limit;

        const reviews = await Review.find({ course: courseId })
            .populate('student', 'name avatar')
            .sort(sortOption)
            .skip(skip)
            .limit(parseInt(limit));

        const totalReviews = await Review.countDocuments({ course: courseId });

        res.json({
            reviews,
            totalReviews,
            totalPages: Math.ceil(totalReviews / limit),
            currentPage: parseInt(page)
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

        // Kiểm tra quyền (chỉ tác giả hoặc admin mới sửa được)
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

        // Cập nhật rating course
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

        // Kiểm tra quyền
        if (review.student.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Bạn không có quyền xóa review này' });
        }

        const courseId = review.course;
        await Review.findByIdAndDelete(req.params.id);

        // Cập nhật rating course
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

        // Tính toán thống kê
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

module.exports = {
    createReview,
    getCourseReviews,
    getReviewById,
    updateReview,
    deleteReview,
    markHelpful,
    markUnhelpful,
    getReviewStats
};
