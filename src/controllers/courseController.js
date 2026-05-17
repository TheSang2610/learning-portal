const Course = require('../models/Course');
const User = require('../models/User');

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

// @desc    Lấy chi tiết khóa học và bài học
// @route   GET /api/courses/:id
const getCourseById = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
            .populate('instructor', 'name email')
            .populate('lessons')
            .populate({
                path: 'reviews',
                populate: { path: 'student', select: 'name avatar' }
            });

        if (course) {
            res.json(course);
        } else {
            res.status(404).json({ message: 'Không tìm thấy khóa học' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Cập nhật khóa học
// @route   PUT /api/courses/:id
const updateCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        if (course) {
            // Kiểm tra xem người dùng có phải là instructor của khóa học này không
            if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Bạn không có quyền chỉnh sửa khóa học này' });
            }

            course.title = req.body.title || course.title;
            course.description = req.body.description || course.description;
            course.thumbnail = req.body.thumbnail || course.thumbnail;
            course.price = req.body.price || course.price;
            course.category = req.body.category || course.category;
            course.level = req.body.level || course.level;
            course.isPublished = req.body.isPublished !== undefined ? req.body.isPublished : course.isPublished;

            const updatedCourse = await course.save();
            res.json(updatedCourse);
        } else {
            res.status(404).json({ message: 'Không tìm thấy khóa học' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Đăng ký khóa học
// @route   POST /api/courses/:id/enroll
const enrollInCourse = async (req, res) => {
    try {
        const Enrollment = require('../models/Enrollment');
        const course = await Course.findById(req.params.id);

        if (course) {
            const alreadyEnrolled = course.students.find(
                (id) => id.toString() === req.user._id.toString()
            );

            if (alreadyEnrolled) {
                return res.status(400).json({ message: 'Bạn đã đăng ký khóa học này rồi' });
            }

            // Thêm student vào Course
            course.students.push(req.user._id);
            
            // Thêm course vào User
            const user = await User.findById(req.user._id);
            user.enrolledCourses.push(course._id);
            
            // Tạo Enrollment record
            const enrollment = new Enrollment({
                course: course._id,
                student: req.user._id,
                lessonProgress: []
            });

            // Khởi tạo lesson progress cho tất cả bài học
            const lessonsPopulated = await course.populate('lessons');
            lessonsPopulated.lessons.forEach((lesson) => {
                enrollment.lessonProgress.push({
                    lesson: lesson._id,
                    status: 'not_started',
                    watchedDuration: 0
                });
            });

            await course.save();
            await user.save();
            await enrollment.save();

            res.status(200).json({ 
                message: 'Đăng ký khóa học thành công',
                enrollment
            });
        } else {
            res.status(404).json({ message: 'Không tìm thấy khóa học' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createCourse, getCourses, getCourseById, updateCourse, enrollInCourse };