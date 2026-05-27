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

const createCourse = async (req, res) => {
    try {
        // 🔥 ĐÃ SỬA: Thêm bóc tách 'providerId' từ req.body để không bị lỗi undefined
        const { title, description, price, category, instructorId, provider, providerId } = req.body;
        const chosenProvider = provider || providerId || null;

        const slug = slugify(title);

        const courseExists = await Course.findOne({ slug });
        if (courseExists) {
            return res.status(400).json({ message: 'Tên khóa học này đã tồn tại hoặc tạo ra link trùng lặp.' });
        }
        
        let thumbnailUrl = '';
        if (req.file) {
            const uploadResult = await uploadToCloudinary(req.file.buffer);
            thumbnailUrl = uploadResult.secure_url; 
        } else {
            thumbnailUrl = req.body.thumbnail || "https://res.cloudinary.com/demo/image/upload/sample.jpg";
        }

        let assignedInstructor = req.user._id;
        if (req.user.role === 'admin') {
            if (!instructorId) {
                return res.status(400).json({ message: 'Admin tạo khóa học phải chỉ định gán cho một Instructor (instructorId).' });
            }
            assignedInstructor = instructorId; 
        }
        const categoriesData = req.body.category;
        let finalCategories = [];
        if (categoriesData) {
            finalCategories = Array.isArray(categoriesData) ? categoriesData : [categoriesData];
        }
        const course = new Course({
            title,
            slug,
            description,
            thumbnail: thumbnailUrl,
            price,
            category: finalCategories,
            instructor: assignedInstructor,
            provider: chosenProvider,
            isPublished: req.user.role === 'admin' ? (req.body.isPublished === 'true' || req.body.isPublished === true) : false
        });

        const createdCourse = await course.save();
        res.status(201).json(createdCourse);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getCourses = async (req, res) => {
    try {
        const courses = await Course.find({ isPublished: true })
            .populate('instructor', 'name email')
            .populate('category', 'name')
            .populate('provider' );
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi lấy danh sách khóa học' });
    }
};

const getCourseById = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
            .populate('instructor', 'name email')
            .populate('category', 'name')
            .populate('provider')
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

const getCourseBySlug = async (req, res) => {
    try {
        const course = await Course.findOne({ slug: req.params.slug, isPublished: true })
            .populate('instructor', 'name email')
            .populate('category', 'name')
            .populate('provider')
            .populate('lessons')
            .populate({
                path: 'reviews',
                populate: { path: 'student', select: 'name avatar' }
            });

        if (course) {
            res.json(course);
        } else {
            res.status(404).json({ message: 'Không tìm thấy khóa học hoặc khóa học chưa được xuất bản.' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getInstructorCourses = async (req, res) => {
    try {
        const filter = req.user.role === 'admin' ? {} : { instructor: req.user._id };

        const courses = await Course.find(filter)
            .populate('instructor', 'name email')
            .populate('category', 'name') 
            .sort({ createdAt: -1 });    

        res.status(200).json({
            success: true,
            count: courses.length,
            data: courses
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Không thể lấy danh sách khóa học quản trị',
            error: error.message
        });
    }
};

const updateCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({ message: 'Không tìm thấy khóa học' });
        }

        if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Bạn không có quyền chỉnh sửa khóa học này' });
        }

        if (req.file) {
            const uploadResult = await uploadToCloudinary(req.file.buffer);
            course.thumbnail = uploadResult.secure_url; 
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

        if (req.body.category) {
            course.category = Array.isArray(req.body.category) ? req.body.category : [req.body.category];
        }

        course.description = req.body.description || course.description;
        course.price = req.body.price !== undefined ? Number(req.body.price) : course.price;
        course.level = req.body.level || course.level;

        // 🔥 ĐÃ SỬA: Đưa định nghĩa biến lên trước, câu lệnh IF kiểm tra theo sau để sửa triệt để lỗi 500
        const incomingProvider = req.body.provider !== undefined ? req.body.provider : req.body.providerId;
        if (incomingProvider !== undefined) {
            course.provider = incomingProvider || null; 
        }

        if (req.user.role === 'admin' && req.body.instructorId) {
            course.instructor = req.body.instructorId;
        }

        const updatedCourse = await course.save();
        res.json(updatedCourse);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const publishCourse = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Hành động bị từ chối: Chỉ tài khoản Admin tối cao mới có quyền xuất bản khóa học.' });
        }

        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Không tìm thấy khóa học cần xử lý.' });
        }

        if (req.body.isPublished !== undefined) {
            course.isPublished = !!req.body.isPublished; 
        }

        const updatedCourse = await course.save();
        res.json({
            message: `Đã cập nhật trạng thái xuất bản: ${updatedCourse.isPublished ? "CÔNG KHAI" : "BẢN NHÁP"}`,
            isPublished: updatedCourse.isPublished
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

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

const deleteCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Không tìm thấy khóa học để xóa' });
        }

        if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Bạn không có quyền xóa khóa học này' });
        }

        const Lesson = require('../models/Lesson');
        const Enrollment = require('../models/Enrollment');
        const Quiz = require('../models/Quiz');
        const QuizAttempt = require('../models/QuizAttempt');

        // 1. Tìm tất cả các bài Quiz thuộc khóa học này để xóa lịch sử làm bài trước
        const quizzes = await Quiz.find({ course: course._id });
        const quizIds = quizzes.map(q => q._id);

        // 2. Xóa sạch lịch sử làm bài (Attempts) và các bài Quiz
        if (quizIds.length > 0) {
            await QuizAttempt.deleteMany({ quiz: { $in: quizIds } });
            await Quiz.deleteMany({ course: course._id });
        }

        // 3. Xóa bài học và lượt đăng ký học
        await Lesson.deleteMany({ courseId: course._id });
        await Enrollment.deleteMany({ course: course._id });

        // 4. Xóa chính khóa học
        await course.deleteOne();

        res.status(200).json({ message: 'Xóa khóa học, bài học và toàn bộ đề thi/lịch sử liên quan thành công!' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { 
    createCourse, 
    getCourses, 
    getCourseById, 
    getCourseBySlug, 
    getInstructorCourses, 
    updateCourse, 
    publishCourse, 
    deleteCourse,
    enrollInCourse 
};