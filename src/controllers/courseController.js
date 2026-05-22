const Course = require('../models/Course');
const User = require('../models/User');
const { uploadToCloudinary } = require('../utils/uploadCloud');

const slugify = (str) => {
    str = str.toLowerCase();
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    str = str.replace(/[^a-z0-9 -]/g, ""); 
    str = str.replace(/\s+/g, "-"); 
    str = str.replace(/-+/g, "-"); 
    return str;
};

// @desc    Tạo mới khóa học
// @route   POST /api/courses
const createCourse = async (req, res) => {
    try {
        const { title, description, price, category } = req.body;

        const slug = slugify(title);

        const courseExists = await Course.findOne({ slug });
        if (courseExists) {
            return res.status(400).json({ message: 'Tên khóa học này đã tồn tại hoặc tạo ra link trùng lặp.' });
        }
        
        // SỬA LỖI: Khai báo chính xác biến thumbnailUrl 👇
        let thumbnailUrl = '';

        if (req.file) {
            const uploadResult = await uploadToCloudinary(req.file.buffer);
            thumbnailUrl = uploadResult.secure_url; 
        } else {
            thumbnailUrl = req.body.thumbnail || "https://res.cloudinary.com/demo/image/upload/sample.jpg";
        }

        const course = new Course({
            title,
            slug,
            description,
            thumbnail: thumbnailUrl,
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

// @desc    Lấy danh sách khóa học
// @route   GET /api/courses
const getCourses = async (req, res) => {
    try {
        const courses = await Course.find({}).populate('instructor', 'name email');
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi lấy danh sách khóa học' });
    }
};

// SỬA LỖI: Giữ lại hàm lấy chi tiết bằng ID (Dành cho trang quản lý/sửa khóa học)
// @desc    Lấy chi tiết khóa học bằng ID
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

// BỔ SUNG: Hàm lấy chi tiết bằng Slug (Dành cho hiển thị phía học viên bên Frontend)
// @desc    Lấy chi tiết khóa học bằng Slug
// @route   GET /api/courses/slug/:slug
const getCourseBySlug = async (req, res) => {
    try {
        const course = await Course.findOne({ slug: req.params.slug })
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
            if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Bạn không có quyền chỉnh sửa khóa học này' });
            }

            if (req.file) {
                const uploadResult = await uploadToCloudinary(req.file.buffer);
                course.thumbnail = uploadResult.secure_url; 
            } else {
                course.thumbnail = req.body.thumbnail || course.thumbnail; 
            }

            if (req.body.title && req.body.title !== course.title) {
                const newSlug = slugify(req.body.title);
                
                const slugExists = await Course.findOne({ slug: newSlug, _id: { $ne: course._id } });
                if (slugExists) {
                    return res.status(400).json({ message: 'Tên khóa học mới bị trùng link với khóa học khác' });
                }
                
                course.title = req.body.title;
                course.slug = newSlug; 
            }

            course.description = req.body.description || course.description;
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
        const courseId = req.params.id;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Không tìm thấy khóa học' });
        }

        const alreadyEnrolled = await Enrollment.findOne({ course: courseId, student: req.user._id });
        if (alreadyEnrolled) {
            return res.status(400).json({ message: 'Bạn đã đăng ký khóa học này rồi' });
        }

        const enrollment = new Enrollment({
            course: course._id,
            student: req.user._id,
            lessonProgress: []
        });

        course.lessons.forEach((lessonId) => {
            enrollment.lessonProgress.push({
                lesson: lessonId,
                status: 'not_started',
                watchedDuration: 0
            });
        });

        course.studentsCount += 1;

        await course.save();
        await enrollment.save();

        await User.findByIdAndUpdate(req.user._id, {
            $push: { enrolledCourses: course._id }
        });

        res.status(200).json({ 
            message: 'Đăng ký khóa học thành công',
            enrollment
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Đừng quên export cả hàm getCourseBySlug ra ngoài nhé!
module.exports = { createCourse, getCourses, getCourseById, getCourseBySlug, updateCourse, enrollInCourse };