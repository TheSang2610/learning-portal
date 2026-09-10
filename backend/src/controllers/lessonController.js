const Lesson = require('../models/Lesson');
const Course = require('../models/Course');
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const { protect } = require('../middlewares/authMiddleware');
const { uploadToCloudinary } = require('../utils/uploadCloud');
const { duocXemNoiDung } = require('../utils/quyenNoiDung');

// Hàm helper chuyển đổi Tiếng Việt có dấu thành Slug gọn đẹp
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

// @desc    Thêm bài học vào khóa học
// @route   POST /api/lessons
const addLesson = async (req, res) => {
    try {
        const { courseId, title, content, order } = req.body;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Không tìm thấy khóa học' });
        }

        // Kiểm tra quyền
        if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Bạn không có quyền thêm bài học vào khóa học này' });
        }

        // Tự động tạo slug bài học
        const slug = slugify(title);

        let videoUrl = req.body.videoUrl || "";
        let documentUrl = req.body.documentUrl || "";

        // Xử lý upload file khi tạo mới
        if (req.files) {
            if (req.files['video'] && req.files['video'][0]) {
                const videoFile = req.files['video'][0];
                const videoUpload = await uploadToCloudinary(videoFile.buffer, 'video');
                videoUrl = videoUpload.secure_url.replace(/\.[^/.]+$/, ".m3u8");
            }

            if (req.files['document'] && req.files['document'][0]) {
                const docFile = req.files['document'][0];
                const docUpload = await uploadToCloudinary(docFile.buffer, 'raw');
                documentUrl = docUpload.secure_url; 
            }
        }

        const lesson = await Lesson.create({
            courseId, title, slug, content, videoUrl, documentUrl, order
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

// @desc    Lấy chi tiết một bài học bằng ID (Dành cho Admin/Sửa bài học)
// @route   GET /api/lessons/:id
const getLessonById = async (req, res) => {
    try {
        const lesson = await Lesson.findById(req.params.id);

        if (!lesson) {
            return res.status(404).json({ message: 'Không tìm thấy bài học' });
        }

        // Dang nhap thoi CHUA du. Truoc day duong nay chi co `protect`, nen mot
        // tai khoan mien phi bat ky goi thang vao day la lay duoc videoUrl cua
        // khoa co phi - di vong hoan toan qua cong 402 o enrollInCourse.
        const course = await Course.findById(lesson.courseId).select('instructor');
        if (!(await duocXemNoiDung(course, req.user))) {
            return res.status(403).json({
                message: 'Bạn cần đăng ký khóa học này để xem nội dung bài học',
                requiresEnrollment: true,
            });
        }

        res.status(200).json(lesson);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Lấy chi tiết một bài học bằng SLUG (Dành cho Học viên xem bài học chuẩn SEO)
// @route   GET /api/lessons/course/:courseSlug/lesson/:lessonSlug
const getLessonBySlug = async (req, res) => {
    try {
        const { courseSlug, lessonSlug } = req.params;

        // 1. Tìm thông tin khóa học dựa vào courseSlug trước
        const course = await Course.findOne({ slug: courseSlug });
        if (!course) {
            return res.status(404).json({ message: 'Không tìm thấy khóa học tương ứng' });
        }

        // 2. Tìm bài học có slug tương ứng nằm trong khóa học đó
        const lesson = await Lesson.findOne({ courseId: course._id, slug: lessonSlug });
        if (!lesson) {
            return res.status(404).json({ message: 'Không tìm thấy bài học trong khóa học này' });
        }

        // Cung mot cong nhu getLessonById - hai duong dan khac nhau toi cung
        // mot tai san thi phai khoa ca hai, khoa mot cai la nhu khong khoa.
        if (!(await duocXemNoiDung(course, req.user))) {
            return res.status(403).json({
                message: 'Bạn cần đăng ký khóa học này để xem nội dung bài học',
                requiresEnrollment: true,
            });
        }

        res.status(200).json(lesson);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Cập nhật thông tin bài học
// @route   PUT /api/lessons/:id
const updateLesson = async (req, res) => {
    try {
        const { title, content, order } = req.body;
        
        let lesson = await Lesson.findById(req.params.id);
        if (!lesson) {
            return res.status(404).json({ message: 'Không tìm thấy bài học để cập nhật' });
        }

        // Kiểm tra quyền
        const course = await Course.findById(lesson.courseId);
        if (course && course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Bạn không có quyền chỉnh sửa bài học này' });
        }

        // XỬ LÝ UPLOAD FILE KHI CẬP NHẬT
        if (req.files) {
            if (req.files['video'] && req.files['video'][0]) {
                const videoFile = req.files['video'][0];
                const videoUpload = await uploadToCloudinary(videoFile.buffer, 'video');
                lesson.videoUrl = videoUpload.secure_url.replace(/\.[^/.]+$/, ".m3u8");
            } else {
                lesson.videoUrl = req.body.videoUrl !== undefined ? req.body.videoUrl : lesson.videoUrl;
            }

            if (req.files['document'] && req.files['document'][0]) {
                const docFile = req.files['document'][0];
                const docUpload = await uploadToCloudinary(docFile.buffer, 'raw');
                lesson.documentUrl = docUpload.secure_url;
            } else {
                lesson.documentUrl = req.body.documentUrl !== undefined ? req.body.documentUrl : lesson.documentUrl;
            }
        } else {
            lesson.videoUrl = req.body.videoUrl !== undefined ? req.body.videoUrl : lesson.videoUrl;
            lesson.documentUrl = req.body.documentUrl !== undefined ? req.body.documentUrl : lesson.documentUrl;
        }

        // Tiến hành cập nhật dữ liệu chữ mới và cập nhật lại slug nếu đổi tiêu đề bài học
        if (title) {
            lesson.title = title;
            lesson.slug = slugify(title); 
        }
        
        lesson.content = content !== undefined ? content : lesson.content;
        lesson.order = order !== undefined ? order : lesson.order;

        const updatedLesson = await lesson.save();
        res.status(200).json(updatedLesson);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Xóa một bài học
// @route   DELETE /api/lessons/:id
const deleteLesson = async (req, res) => {
    try {
        const lesson = await Lesson.findById(req.params.id);
        if (!lesson) {
            return res.status(404).json({ message: 'Không tìm thấy bài học để xóa' });
        }

        // Kiểm tra quyền (Chỉ Admin hoặc Instructor sở hữu khóa học mới được xóa)
        const course = await Course.findById(lesson.courseId);
        if (course && course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Bạn không có quyền xóa bài học này' });
        }

        // 1. Gỡ ID bài học ra khỏi mảng lessons của khóa học tương ứng
        await Course.findByIdAndUpdate(lesson.courseId, {
            $pull: { lessons: lesson._id }
        });

        // 2. Tiến hành xóa bài học khỏi bảng Lesson
        await lesson.deleteOne();

        res.status(200).json({ message: 'Xóa bài học thành công' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { addLesson, getLessonById, getLessonBySlug, updateLesson, deleteLesson };