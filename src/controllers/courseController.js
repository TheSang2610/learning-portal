const Course = require('../models/Course');
const { taoGhiDanh } = require('../utils/ghiDanh');
const User = require('../models/User');
const { uploadToCloudinary } = require('../utils/uploadCloud');

// Hàm tạo Slug URL thân thiện
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

// @desc    Tạo khóa học mới
const createCourse = async (req, res) => {
    try {
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

// @desc    Lấy toàn bộ danh sách khóa học public
const getCourses = async (req, res) => {
    try {
        const courses = await Course.find({ isPublished: true })
            .populate('instructor', 'name')
            .populate('category', 'name')
            .populate('provider' );
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi lấy danh sách khóa học' });
    }
};

// @desc    Lấy chi tiết khóa học bằng ID
const getCourseById = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
            .populate('instructor', 'name')
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

// @desc    Lấy chi tiết khóa học bằng Slug
const getCourseBySlug = async (req, res) => {
    try {
        const course = await Course.findOne({ slug: req.params.slug, isPublished: true })
            .populate('instructor', 'name')
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

// @desc    Lấy danh sách khóa học của Instructor/Admin
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

// @desc    Cập nhật khóa học
// @desc    Cập nhật khóa học
const updateCourse = async (req, res) => {
    try {
        const courseId = req.params.id;
        
        // 1. Kiểm tra sự tồn tại của khóa học và check quyền trước
        const currentCourse = await Course.findById(courseId);
        if (!currentCourse) {
            return res.status(404).json({ message: 'Không tìm thấy khóa học' });
        }

        if (currentCourse.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Bạn không có quyền chỉnh sửa khóa học này' });
        }

        // 2. Tạo một object chứa các trường cần cập nhật động
        const updateData = {};

        // Xử lý upload ảnh bìa mới lên Cloudinary (nếu có file đính kèm)
        if (req.file) {
            const uploadResult = await uploadToCloudinary(req.file.buffer);
            updateData.thumbnail = uploadResult.secure_url; 
        }

        // Xử lý cập nhật Title và Slug tự động
        if (req.body.title && req.body.title !== currentCourse.title) {
            const newSlug = slugify(req.body.title);
            // Kiểm tra trùng lặp slug với các khóa học khác (trừ chính nó)
            const slugExists = await Course.findOne({ slug: newSlug, _id: { $ne: courseId } });
            if (slugExists) {
                return res.status(400).json({ message: 'Tên khóa học mới bị trùng link với khóa học khác' });
            }
            updateData.title = req.body.title;
            updateData.slug = newSlug; 
        } else if (req.body.slug) {
            // Trường hợp tiêu đề không đổi nhưng Frontend chủ động gửi slug mới lên
            updateData.slug = req.body.slug;
        }

        // Chuẩn hóa mảng danh mục tags (Category)
        if (req.body.category) {
            updateData.category = Array.isArray(req.body.category) ? req.body.category : [req.body.category];
        }

        // Cập nhật các thông tin cơ bản khác
        if (req.body.description !== undefined) updateData.description = req.body.description;
        if (req.body.price !== undefined) updateData.price = Number(req.body.price);
        if (req.body.level !== undefined) updateData.level = req.body.level;

        // Xử lý thông tin Đơn vị đối tác / Trường học liên kết
        const incomingProvider = req.body.provider !== undefined ? req.body.provider : req.body.providerId;
        if (incomingProvider !== undefined) {
            updateData.provider = incomingProvider || null; 
        }

        // Phân quyền: Chỉ Admin mới được phép đổi giảng viên phụ trách khóa học này
        if (req.user.role === 'admin' && req.body.instructorId) {
            updateData.instructor = req.body.instructorId;
        }

        // 3. Thực hiện ghi trực tiếp xuống database bằng findByIdAndUpdate để né lỗi Version OCC
        const updatedCourse = await Course.findByIdAndUpdate(
            courseId,
            { $set: updateData },
            { new: true, runValidators: true } // Trả về bản ghi mới sau sửa đổi và kích hoạt validate schema
        );

        res.status(200).json(updatedCourse);
    } catch (error) {
        console.error("Lỗi cập nhật khóa học phía Backend:", error.message);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Bật/Tắt xuất bản khóa học
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

// @desc    Đăng ký khóa học
const enrollInCourse = async (req, res) => {
    try {
        const courseId = req.params.id;

        const course = await Course.findById(courseId).select('price lessons');
        if (!course) {
            return res.status(404).json({ message: 'Không tìm thấy khóa học' });
        }

        // CHAN KHOA CO PHI.
        //
        // Truoc day duong nay khong he doc gia: bam Dang ky la vao hoc duoc moi
        // khoa, ke ca khoa 1.099.000d. Truong price ton tai va hien ra tren
        // giao dien, nhung khong cho nao thuc thi no.
        //
        // Kiem tra o day chu khong phai o giao dien: an nut Mua di thi nguoi ta
        // van goi thang duong nay bang curl.
        if (course.price > 0) {
            const Order = require('../models/Order');
            const donDaTra = await Order.findOne({
                course: courseId,
                student: req.user._id,
                status: 'paid'
            });

            if (!donDaTra) {
                // 402 Payment Required - dung nghia den cua ma trang thai nay.
                return res.status(402).json({
                    message: 'Khóa học này có phí, vui lòng thanh toán trước',
                    requiresPayment: true,
                    price: course.price
                });
            }
        }

        const { enrollment, moiTao } = await taoGhiDanh(courseId, req.user._id);

        if (!moiTao) {
            return res.status(400).json({ message: 'Bạn đã đăng ký khóa học này rồi' });
        }

        const capNhat = await Course.findById(courseId).select('studentsCount');

        return res.status(200).json({
            message: 'Đăng ký khóa học thành công',
            enrollment,
            studentsCount: capNhat?.studentsCount
        });
    } catch (error) {
        console.error('enrollInCourse:', error.message);
        return res.status(500).json({ message: 'Không đăng ký được khóa học' });
    }
};

// @desc    Xóa khóa học và dữ liệu liên quan
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

        const quizzes = await Quiz.find({ course: course._id });
        const quizIds = quizzes.map(q => q._id);

        if (quizIds.length > 0) {
            await QuizAttempt.deleteMany({ quiz: { $in: quizIds } });
            await Quiz.deleteMany({ course: course._id });
        }

        await Lesson.deleteMany({ courseId: course._id });
        await Enrollment.deleteMany({ course: course._id });

        await course.deleteOne();

        res.status(200).json({ message: 'Xóa khóa học, bài học và toàn bộ đề thi/lịch sử liên quan thành công!' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getHomeSections = async (req, res) => {
    try {
        // 🎯 Lọc ĐÚNG khóa học đã Publish VÀ được Admin ghim tag tương ứng
        //
        // Ba truy van doc lap nhau. Truoc day dung 3 lan `await` lien tiep nen
        // chung chay tuan tu: tong thoi gian = 3 x round-trip toi Atlas (~440ms).
        // Promise.all cho ca ba di cung luc -> chi con ~1 round-trip.
        const withRefs = (filter) =>
            Course.find(filter)
                .populate('instructor', 'name')
                .populate('provider', 'name logo')
                .limit(5);

        const [mostPopular, trendingNow, newReleases] = await Promise.all([
            withRefs({ isPublished: true, isPopular: true }),
            withRefs({ isPublished: true, isTrending: true }),
            withRefs({ isPublished: true, isNewRelease: true }),
        ]);

        res.status(200).json({
            success: true,
            data: {
                mostPopular,
                trendingNow,
                newReleases
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateCourseTags = async (req, res) => {
    try {
        const { isPopular, isTrending, isNewRelease } = req.body;

        // Tạo object chứa các trường cần cập nhật
        const updateData = {};
        if (isPopular !== undefined) updateData.isPopular = !!isPopular;
        if (isTrending !== undefined) updateData.isTrending = !!isTrending;
        if (isNewRelease !== undefined) updateData.isNewRelease = !!isNewRelease;

        // Cập nhật trực tiếp xuống DB (Bypass qua mọi loại validate hoặc check quyền)
        const updatedCourse = await Course.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true, runValidators: false }
        );

        if (!updatedCourse) {
            return res.status(404).json({ 
                success: false, 
                message: 'Không tìm thấy khóa học cần xử lý.' 
            });
        }

        // Trả về kết quả xanh cho Frontend nhận diện
        res.status(200).json({
            success: true,
            message: "Cập nhật cấu hình hiển thị trang chủ thành công!",
            data: updatedCourse
        });
    } catch (error) {
        console.error("Lỗi cập nhật tags:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// =========================================================================
// BAN QUẢN TRỊ (ADMIN) - 3 HÀM ĐỔ DATA DANH SÁCH RA VIEW QUẢN LÝ
// =========================================================================

const getAdminPopularCourses = async (req, res) => {
    try {
        const courses = await Course.find({ isPublished: true })
            .sort({ isPopular: -1, studentsCount: -1 })
            .populate('instructor', 'name email')
            .populate('category', 'name');
        res.status(200).json(courses);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi lấy danh sách phổ biến admin', error: error.message });
    }
};

const getAdminTrendingCourses = async (req, res) => {
    try {
        const courses = await Course.find({ isPublished: true })
            .sort({ isTrending: -1, rating: -1, studentsCount: -1 })
            .populate('instructor', 'name email')
            .populate('category', 'name');
        res.status(200).json(courses);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi lấy danh sách xu hướng admin', error: error.message });
    }
};

const getAdminNewReleasesCourses = async (req, res) => {
    try {
        const courses = await Course.find({ isPublished: true })
            .sort({ isNewRelease: -1, createdAt: -1 })
            .populate('instructor', 'name email')
            .populate('category', 'name');
        res.status(200).json(courses);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi lấy danh sách mới phát hành admin', error: error.message });
    }
};

// Export đầy đủ tất cả các hàm ra ngoài để routes sử dụng
module.exports = { 
    createCourse, 
    getCourses, 
    getCourseById, 
    getCourseBySlug, 
    getInstructorCourses, 
    updateCourse, 
    publishCourse, 
    deleteCourse,
    enrollInCourse,
    getHomeSections,
    updateCourseTags,
    getAdminPopularCourses,
    getAdminTrendingCourses,
    getAdminNewReleasesCourses
};