const Course = require('../models/Course');

const createCourse = async (req, res) => {
    try {
        const { title, description, thumbnail, price, category } = req.body;

        // req.user được gán từ middleware protect
        const course = new Course({
            title,
            description,
            thumbnail,
            price,
            category,
            instructor: req.user._id
        });

        const createdCourse = await course.save();
        res.status(201).json(createdCourse);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getCourses = async (req, res) => {
    try {
        const courses = await Course.find({}).populate('instructor', 'name email');
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi lấy danh sách khóa học' });
    }
};

module.exports = { createCourse, getCourses };