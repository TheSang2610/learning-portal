const Course = require('../models/Course');

// @desc    Tạo khóa học mới
// @route   POST /api/courses
const createCourse = async (req, res) => {
    try {
        const { title, description, thumbnail, price, category } = req.body;
        const course = await Course.create({
            title,
            description,
            thumbnail,
            price,
            category,
            instructor: req.user._id // Lấy từ middleware protect
        });
        res.status(201).json(course);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Lấy tất cả khóa học (kèm thông tin giảng viên)
const getCourses = async (req, res) => {
    try {
        const courses = await Course.find().populate('instructor', 'name email');
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createCourse, getCourses };