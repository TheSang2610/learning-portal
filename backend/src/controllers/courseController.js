const mongoose = require('mongoose');

const Course = require('../models/Course');
const { createEnrollment } = require('../utils/enrollment');
const User = require('../models/User');
const { uploadToCloudinary } = require('../utils/uploadCloud');
const { canViewContent, stripContent } = require('../utils/contentAccess');
const { attachPlaybackUrl } = require('../utils/privateVideo');
const Enrollment = require('../models/Enrollment');
const CourseView = require('../models/CourseView');
const { pickRecentViews } = require('../utils/recentViews');
const Category = require('../models/categoryModel');
const { rankSuggestions } = require('../utils/rankSuggestions');
const { phanTrang: paginate, fuzzyRegex } = require('../utils/queryParams');
const { monthKey, incrementViewCount, compareTrending, fillTrending } = require('../utils/viewCount');

// Thu tu muc "Pho bien nhat". Khoa chua ai xem (du lieu cu truoc khi co bo dem)
// thi xet tiep so hoc vien, roi khoa moi hon.
const POPULAR_ORDER = { luotXem: -1, studentsCount: -1, createdAt: -1 };

// Tra khoa hoc ve cho nguoi goi, cat video/bai viet neu ho chua co quyen.
//
// Muc luc van giu nguyen: ten bai, thu tu, thoi luong - do la thu thuyet phuc
// nguoi ta dang ky. Chi cat dung phan noi dung.
const sendCourseForUser = async (courseDoc, user, res) => {
    const allowed = await canViewContent(courseDoc, user);
    const copy = courseDoc.toObject();

    // Duoc xem: video kho kin doi sang link ky (utils/privateVideo.js).
    if (allowed) {
        copy.lessons = (copy.lessons || []).map((b) => attachPlaybackUrl(b, user));
        return res.json(copy);
    }

    copy.lessons = (copy.lessons || []).map(stripContent);
    return res.json(copy);
};

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

// @desc    Danh sach khoa hoc public, co the loc va phan trang
// @route   GET /api/courses[?page=1&limit=24&search=...&category=slug]
// @access  cong khai
//
// HAI HINH DANG PHAN HOI, va do la co chu dich:
//
//   - Khong co tham so nao  -> tra ve MANG, y het truoc day.
//   - Co bat ky tham so nao -> tra ve { danhSach, trang, soDong, tong, conNua }.
//
// Vi sao khong doi thang sang hinh dang moi cho ca hai: duong nay dang chay
// tren web that va co it nhat ba noi goi (trang chu, trang /courses, va ban
// dung san o may chu). Doi hinh dang phan hoi la lam trang chu trong rong cho
// toi khi moi noi goi deu duoc sua xong va deploy cung luc. Duong lui nay cho
// phep chuyen tung cho mot.
//
// Truoc day ham nay tra ve TOAN BO khoa da xuat ban, khong gioi han, moi lan
// goi - va viec loc thi lam o trinh duyet. Vai chuc khoa thi khong sao; vai
// tram khoa la moi luot vao trang chu keo ve ca danh muc kem mo ta.
const getCourses = async (req, res) => {
    try {
        const { page, limit, search, category } = req.query || {};
        const hasFilter = [page, limit, search, category].some((t) => t !== undefined);

        const conditions = { isPublished: true };

        // Tim theo ten. fuzzyRegex() thoat ky tu regex - khong co no thi mot dau '('
        // trong o tim kiem la mot mau regex hong va ca truy van nem 500.
        if (typeof search === 'string' && search.trim()) {
            conditions.title = fuzzyRegex(search.trim());
        }

        // Loc theo slug danh muc chu khong theo id: dia chi /courses?category=web
        // la thu nguoi dung nhin thay va chia se duoc, con id thi khong.
        if (typeof category === 'string' && category.trim()) {
            const dm = await Category.findOne({ slug: category.trim() }).select('_id').lean();

            // Slug khong ton tai -> danh sach rong, KHONG phai bo qua bo loc.
            // Bo qua thi nguoi dung go sai mot chu se thay toan bo khoa hoc va
            // tuong danh muc do chua het tung ay.
            if (!dm) {
                return res.json(
                    hasFilter ? { danhSach: [], trang: 1, soDong: 0, tong: 0, conNua: false } : [],
                );
            }

            // `category` trong Course la MANG, nen phep so sanh nay khop khi
            // mang co chua id do.
            conditions.category = dm._id;
        }

        if (!hasFilter) {
            const courses = await Course.find(conditions)
                .populate('instructor', 'name')
                .populate('category', 'name')
                .populate('provider');
            return res.json(courses);
        }

        const { trang: pageNumber, soDong: pageSize, skip } = paginate(req.query, { defaults: 24, toiDa: 100 });

        const [list, total] = await Promise.all([
            Course.find(conditions)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(pageSize)
                .populate('instructor', 'name')
                .populate('category', 'name')
                .populate('provider'),
            Course.countDocuments(conditions),
        ]);

        res.json({ danhSach: list, trang: pageNumber, soDong: pageSize, tong: total, conNua: skip + list.length < total });
    } catch (error) {
        console.error('[courses]', error.message);
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
            await sendCourseForUser(course, req.user, res);
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
            // Moi lan mo trang khoa hoc hay trang hoc (ca F5) la mot luot - ca hai
            // trang deu tai khoa qua dung duong nay. Khong await: dem luot hong
            // thi nguoi dung van phai xem duoc khoa hoc.
            Course.updateOne({ _id: course._id }, incrementViewCount(monthKey()), { updatePipeline: true })
                .catch((err) => console.error('Loi dem luot xem:', err.message));
            // "Xem gan day" cua nguoi dang dang nhap (muc tren dashboard). Cung
            // khong await, cung ly do o tren.
            if (req.user?._id) {
                CourseView.updateOne(
                    { user: req.user._id, course: course._id },
                    { $set: { viewedAt: new Date() } },
                    { upsert: true }
                ).catch((err) => console.error('Loi ghi lich su xem:', err.message));
            }
            await sendCourseForUser(course, req.user, res);
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
        // Thoi han hoc: chi quan tri dat (utils/accessPeriod.js).
        if (req.body.accessDays !== undefined && req.user.role === 'admin') {
            const days = Number(req.body.accessDays);
            if (!Number.isInteger(days) || days < 1 || days > 3650) {
                return res.status(400).json({ message: 'Thời hạn học phải là số ngày từ 1 đến 3650' });
            }
            updateData.accessDays = days;
        }
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
            // ordersContainingCourse: khoa co the nam trong don gio hang (truong `courses`).
            const paidOrder = await Order.findOne({
                ...require('../utils/orderCourses').ordersContainingCourse(courseId),
                student: req.user._id,
                status: 'paid'
            });

            if (!paidOrder) {
                // 402 Payment Required - dung nghia den cua ma trang thai nay.
                return res.status(402).json({
                    message: 'Khóa học này có phí, vui lòng thanh toán trước',
                    requiresPayment: true,
                    price: course.price
                });
            }
        }

        const { enrollment, created } = await createEnrollment(courseId, req.user._id);

        if (!created) {
            return res.status(400).json({ message: 'Bạn đã đăng ký khóa học này rồi' });
        }

        const update = await Course.findById(courseId).select('studentsCount');

        return res.status(200).json({
            message: 'Đăng ký khóa học thành công',
            enrollment,
            studentsCount: update?.studentsCount
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
        //
        // Ba muc tu xep, admin khong ghim tay nua:
        //  - Pho bien nhat: tong luot xem tu truoc toi nay (khong reset).
        //  - Dang thinh hanh: luot xem trong thang nay (sang thang moi tu ve 0).
        //  - Moi phat hanh: khoa tao sau nam tren.
        const COURSE_COUNT = 5;
        const month = monthKey();
        const withRefs = (filter, sort, limit = COURSE_COUNT) =>
            Course.find(filter)
                .sort(sort)
                .populate('instructor', 'name')
                .populate('provider', 'name logo slug')
                .limit(limit);

        const [mostPopular, hotThisMonth, newReleases] = await Promise.all([
            withRefs({ isPublished: true }, POPULAR_ORDER),
            withRefs(
                { isPublished: true, thangLuotXem: month, luotXemThang: { $gt: 0 } },
                { luotXemThang: -1, ...POPULAR_ORDER },
            ),
            withRefs({ isPublished: true }, { createdAt: -1 }),
        ]);
        const trendingNow = fillTrending(hotThisMonth, mostPopular, COURSE_COUNT);

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

// =========================================================================
// BAN QUẢN TRỊ (ADMIN) - 3 HÀM ĐỔ DATA DANH SÁCH RA VIEW QUẢN LÝ
// =========================================================================

const getAdminPopularCourses = async (req, res) => {
    try {
        const courses = await Course.find({ isPublished: true })
            .sort(POPULAR_ORDER)
            .populate('instructor', 'name email')
            .populate('category', 'name');
        res.status(200).json(courses);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi lấy danh sách phổ biến admin', error: error.message });
    }
};

const getAdminTrendingCourses = async (req, res) => {
    try {
        // Xep trong JS vi luot thang cu phai tinh la 0 - Mongo sort thang tren
        // luotXemThang se dua khoa hot thang truoc len dau.
        const courses = await Course.find({ isPublished: true })
            .populate('instructor', 'name email')
            .populate('category', 'name');
        res.status(200).json(courses.sort(compareTrending(monthKey())));
    } catch (error) {
        res.status(500).json({ message: 'Lỗi lấy danh sách xu hướng admin', error: error.message });
    }
};

const getAdminNewReleasesCourses = async (req, res) => {
    try {
        const courses = await Course.find({ isPublished: true })
            .sort({ createdAt: -1 })
            .populate('instructor', 'name email')
            .populate('category', 'name');
        res.status(200).json(courses);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi lấy danh sách mới phát hành admin', error: error.message });
    }
};

// Export đầy đủ tất cả các hàm ra ngoài để routes sử dụng
// @desc    Goi y khoa hoc tiep theo
// @route   GET /api/courses/goi-y?soLuong=6
// @access  cong khai (dang nhap thi goi y ca nhan hoa, khong thi tra khoa pho bien)
//
// Phan cham diem nam o utils/rankSuggestions.js - ham thuan, co test. O day chi lo
// viec gom du lieu, va gom co GIOI HAN: moi truy van deu co .limit().
//
// Vi sao phai gioi han: ba buoc duoi day la mot phep lan theo do thi (nguoi ->
// khoa -> nguoi khac -> khoa khac). Khong chan thi mot khoa co vai nghin hoc
// vien se keo ca bang Enrollment ve RAM chi de goi y sau o khoa hoc.
const suggestCourses = async (req, res) => {
    try {
        const count = Math.min(Math.max(parseInt(req.query.soLuong, 10) || 6, 1), 24);

        const learned = new Set();
        const learningCategories = new Set();
        const countCoLearners = new Map();

        // `courseId` = "goi y KHOA LIEN QUAN voi khoa dang xem", dung cho trang
        // chi tiet khoa hoc. Khac han goi y o trang chu:
        //
        //   - Danh muc lay tu CHINH khoa dang xem, khong phai tu khoa da hoc.
        //     Nguoi dang xem mot khoa tieng Nhat thi muon thay them khoa tieng
        //     Nhat, du ho dang hoc lap trinh.
        //   - Nguoi hoc cung dem tu hoc vien cua DUNG khoa do - day moi la
        //     "nguoi mua khoa nay cung mua khoa kia" theo dung nghia.
        //   - Chinh khoa dang xem bi loai khoi ket qua.
        const viewingCourse = req.query.courseId;
        const hasSourceCourse = mongoose.Types.ObjectId.isValid(viewingCourse);

        if (hasSourceCourse) {
            learned.add(String(viewingCourse));

            const origin = await Course.findById(viewingCourse).select('category').lean();
            if (origin?.category) {
                const items = Array.isArray(origin.category) ? origin.category : [origin.category];
                for (const c of items) learningCategories.add(String(c));
            }

            const sameCourse = await Enrollment.find({ course: viewingCourse })
                .select('student')
                .limit(500)
                .lean();

            const theirIds = [...new Set(sameCourse.map((g) => String(g.student)))];

            if (theirIds.length > 0) {
                const otherCourses = await Enrollment.find({
                    student: { $in: theirIds },
                    course: { $ne: viewingCourse },
                })
                    .select('course')
                    .limit(1000)
                    .lean();

                for (const g of otherCourses) {
                    const id = String(g.course);
                    countCoLearners.set(id, (countCoLearners.get(id) || 0) + 1);
                }
            }
        }

        if (req.user) {
            // Van loai bo khoa da hoc du dang o che do "khoa lien quan": goi y
            // dung thu nguoi ta da mua la loi de thay nhat cua ca muc nay.
            const mine = await Enrollment.find({ student: req.user._id })
                .select('course')
                .limit(50)
                .lean();

            for (const g of mine) learned.add(String(g.course));

            // Che do "khoa lien quan" da tu dung tin hieu cua rieng no o tren,
            // khong tron them tin hieu tu lich su hoc vao nua.
            if (!hasSourceCourse && learned.size > 0) {
                const myIds = [...learned];

                const myCourses = await Course.find({ _id: { $in: myIds } })
                    .select('category')
                    .lean();

                for (const k of myCourses) {
                    if (k.category) learningCategories.add(String(k.category));
                }

                // Nguoi khac cung hoc mot trong nhung khoa cua minh.
                const studyCopy = await Enrollment.find({
                    course: { $in: myIds },
                    student: { $ne: req.user._id },
                })
                    .select('student')
                    .limit(500)
                    .lean();

                const studyCopyId = [...new Set(studyCopy.map((g) => String(g.student)))];

                if (studyCopyId.length > 0) {
                    const theirCourses = await Enrollment.find({
                        student: { $in: studyCopyId },
                        course: { $nin: myIds },
                    })
                        .select('course')
                        .limit(1000)
                        .lean();

                    for (const g of theirCourses) {
                        const id = String(g.course);
                        countCoLearners.set(id, (countCoLearners.get(id) || 0) + 1);
                    }
                }
            }
        }

        const candidates = await Course.find({
            isPublished: true,
            ...(learned.size ? { _id: { $nin: [...learned] } } : {}),
        })
            // lessons: chi la mang id, de the khoa hoc dem duoc "N bai hoc" (thieu
            // truong nay thi the ghi "0 bai hoc" du khoa co bai).
            .select('title slug thumbnail price category instructor provider level rating reviewsCount createdAt lessons')
            .populate('instructor', 'name')
            .populate('category', 'name')
            .populate('provider', 'name logo')
            .limit(200)
            .lean();

        // So hoc vien cua tung khoa ung vien, dem mot luot bang aggregate thay
        // vi mot truy van cho moi khoa.
        const countStudents = await Enrollment.aggregate([
            { $match: { course: { $in: candidates.map((k) => k._id) } } },
            { $group: { _id: '$course', so: { $sum: 1 } } },
        ]);

        const studentTable = new Map(countStudents.map((d) => [String(d._id), d.so]));

        const pull = candidates.map((k) => ({
            ...k,
            studentCount: studentTable.get(String(k._id)) || 0,
        }));

        const result = rankSuggestions(pull, { learned, learningCategories, countCoLearners }, count);

        res.status(200).json({
            danhSach: result,
            // De giao dien biet nen ghi "Gợi ý cho bạn" hay "Đang được quan tâm".
            // Che do khoa lien quan luon coi la da ca nhan hoa: goi y do dua
            // tren chinh khoa nguoi dung dang xem.
            caNhanHoa: hasSourceCourse || (!!req.user && learned.size > 0),
        });
    } catch (error) {
        console.error('[goi-y]', error.message);
        res.status(500).json({ message: 'Không lấy được gợi ý khóa học.' });
    }
};

// @desc    Khoa hoc nguoi dang nhap vua mo xem (muc "Xem gan day" o dashboard)
// @route   GET /api/courses/da-xem?soLuong=3
const getRecentlyViewed = async (req, res) => {
    try {
        const [views, mine] = await Promise.all([
            CourseView.find({ user: req.user._id })
                .sort({ viewedAt: -1 })
                .limit(50)
                .select('course viewedAt')
                .lean(),
            Enrollment.find({ student: req.user._id }).select('course').lean(),
        ]);

        const courses = views.length
            ? await Course.find({ _id: { $in: views.map((v) => v.course) }, isPublished: true })
                .select('title slug thumbnail price level rating reviewsCount provider')
                .populate('provider', 'name logo')
                .lean()
            : [];

        res.status(200).json({
            danhSach: pickRecentViews(views, courses, mine.map((g) => g.course), req.query.soLuong),
        });
    } catch (error) {
        console.error('[da-xem]', error.message);
        res.status(500).json({ message: 'Không lấy được khóa học đã xem.' });
    }
};

module.exports = {
    getRecentlyViewed,
    createCourse,
    getCourses,
    suggestCourses,
    getCourseById, 
    getCourseBySlug, 
    getInstructorCourses, 
    updateCourse, 
    publishCourse, 
    deleteCourse,
    enrollInCourse,
    getHomeSections,
    getAdminPopularCourses,
    getAdminTrendingCourses,
    getAdminNewReleasesCourses
};