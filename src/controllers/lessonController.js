const Lesson = require('../models/Lesson');
const Course = require('../models/Course');

// @desc    Thêm bài học vào khóa học
// @route   POST /api/lessons
const addLesson = async (req, res) => {
    try {
        const { courseId, title, content, videoUrl, order } = req.body;

        const lesson = await Lesson.create({
            courseId, title, content, videoUrl, order
        });

        // Cập nhật mảng lessons trong Course model
        await Course.findByIdAndUpdate(courseId, {
            $push: { lessons: lesson._id }
        });

        res.status(201).json(lesson);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { addLesson };