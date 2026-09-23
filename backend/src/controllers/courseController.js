const mongoose = require('mongoose');

const Course = require('../models/Course');
const { taoGhiDanh } = require('../utils/enrollment');
const User = require('../models/User');
const { uploadToCloudinary } = require('../utils/uploadCloud');
const { duocXemNoiDung, catNoiDung } = require('../utils/contentAccess');
const Enrollment = require('../models/Enrollment');
const Category = require('../models/categoryModel');
const { xepHangGoiY } = require('../utils/rankSuggestions');
const { phanTrang, timGan } = require('../utils/queryParams');

// Tra khoa hoc ve cho nguoi goi, cat video/bai viet neu ho chua co quyen.
//
// Muc luc van giu nguyen: ten bai, thu tu, thoi luong - do la thu thuyet phuc
// nguoi ta dang ky. Chi cat dung phan noi dung.
const traKhoaTheoQuyen = async (khoa, nguoiDung, res) => {
    const duoc = await duocXemNoiDung(khoa, nguoiDung);
    if (duoc) return res.json(khoa);

    const doi = khoa.toObject();
    doi.lessons = (doi.lessons || []).map(catNoiDung);
    return res.json(doi);
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
        const coLoc = [page, limit, search, category].some((t) => t !== undefined);

        const dieuKien = { isPublished: true };

        // Tim theo ten. timGan() thoat ky tu regex - khong co no thi mot dau '('
        // trong o tim kiem la mot mau regex hong va ca truy van nem 500.
        if (typeof search === 'string' && search.trim()) {
            dieuKien.title = timGan(search.trim());
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
                    coLoc ? { danhSach: [], trang: 1, soDong: 0, tong: 0, conNua: false } : [],
                );
            }

            // `category` trong Course la MANG, nen phep so sanh nay khop khi
            // mang co chua id do.
            dieuKien.category = dm._id;
        }

        if (!coLoc) {
            const courses = await Course.find(dieuKien)
                .populate('instructor', 'name')
                .populate('category', 'name')
                .populate('provider');
            return res.json(courses);
        }

        const { trang, soDong, boQua } = phanTrang(req.query, { macDinh: 24, toiDa: 100 });

        const [danhSach, tong] = await Promise.all([
            Course.find(dieuKien)
                .sort({ createdAt: -1 })
                .skip(boQua)
                .limit(soDong)
                .populate('instructor', 'name')
                .populate('category', 'name')
                .populate('provider'),
            Course.countDocuments(dieuKien),
        ]);

        res.json({ danhSach, trang, soDong, tong, conNua: boQua + danhSach.length < tong });
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
            await traKhoaTheoQuyen(course, req.user, res);
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
            await traKhoaTheoQuyen(course, req.user, res);
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
const goiYKhoaHoc = async (req, res) => {
    try {
        const soLuong = Math.min(Math.max(parseInt(req.query.soLuong, 10) || 6, 1), 24);

        const daHoc = new Set();
        const danhMucDangHoc = new Set();
        const demHocCung = new Map();

        // `courseId` = "goi y KHOA LIEN QUAN voi khoa dang xem", dung cho trang
        // chi tiet khoa hoc. Khac han goi y o trang chu:
        //
        //   - Danh muc lay tu CHINH khoa dang xem, khong phai tu khoa da hoc.
        //     Nguoi dang xem mot khoa tieng Nhat thi muon thay them khoa tieng
        //     Nhat, du ho dang hoc lap trinh.
        //   - Nguoi hoc cung dem tu hoc vien cua DUNG khoa do - day moi la
        //     "nguoi mua khoa nay cung mua khoa kia" theo dung nghia.
        //   - Chinh khoa dang xem bi loai khoi ket qua.
        const khoaDangXem = req.query.courseId;
        const coKhoaGoc = mongoose.Types.ObjectId.isValid(khoaDangXem);

        if (coKhoaGoc) {
            daHoc.add(String(khoaDangXem));

            const goc = await Course.findById(khoaDangXem).select('category').lean();
            if (goc?.category) {
                const ds = Array.isArray(goc.category) ? goc.category : [goc.category];
                for (const c of ds) danhMucDangHoc.add(String(c));
            }

            const cungKhoa = await Enrollment.find({ course: khoaDangXem })
                .select('student')
                .limit(500)
                .lean();

            const idHo = [...new Set(cungKhoa.map((g) => String(g.student)))];

            if (idHo.length > 0) {
                const khoaKhac = await Enrollment.find({
                    student: { $in: idHo },
                    course: { $ne: khoaDangXem },
                })
                    .select('course')
                    .limit(1000)
                    .lean();

                for (const g of khoaKhac) {
                    const id = String(g.course);
                    demHocCung.set(id, (demHocCung.get(id) || 0) + 1);
                }
            }
        }

        if (req.user) {
            // Van loai bo khoa da hoc du dang o che do "khoa lien quan": goi y
            // dung thu nguoi ta da mua la loi de thay nhat cua ca muc nay.
            const cuaToi = await Enrollment.find({ student: req.user._id })
                .select('course')
                .limit(50)
                .lean();

            for (const g of cuaToi) daHoc.add(String(g.course));

            // Che do "khoa lien quan" da tu dung tin hieu cua rieng no o tren,
            // khong tron them tin hieu tu lich su hoc vao nua.
            if (!coKhoaGoc && daHoc.size > 0) {
                const idCuaToi = [...daHoc];

                const khoaCuaToi = await Course.find({ _id: { $in: idCuaToi } })
                    .select('category')
                    .lean();

                for (const k of khoaCuaToi) {
                    if (k.category) danhMucDangHoc.add(String(k.category));
                }

                // Nguoi khac cung hoc mot trong nhung khoa cua minh.
                const banHoc = await Enrollment.find({
                    course: { $in: idCuaToi },
                    student: { $ne: req.user._id },
                })
                    .select('student')
                    .limit(500)
                    .lean();

                const idBanHoc = [...new Set(banHoc.map((g) => String(g.student)))];

                if (idBanHoc.length > 0) {
                    const khoaCuaHo = await Enrollment.find({
                        student: { $in: idBanHoc },
                        course: { $nin: idCuaToi },
                    })
                        .select('course')
                        .limit(1000)
                        .lean();

                    for (const g of khoaCuaHo) {
                        const id = String(g.course);
                        demHocCung.set(id, (demHocCung.get(id) || 0) + 1);
                    }
                }
            }
        }

        const ungVien = await Course.find({
            isPublished: true,
            ...(daHoc.size ? { _id: { $nin: [...daHoc] } } : {}),
        })
            .select('title slug thumbnail price category instructor createdAt')
            .populate('instructor', 'name')
            .populate('category', 'name')
            .limit(200)
            .lean();

        // So hoc vien cua tung khoa ung vien, dem mot luot bang aggregate thay
        // vi mot truy van cho moi khoa.
        const demHocVien = await Enrollment.aggregate([
            { $match: { course: { $in: ungVien.map((k) => k._id) } } },
            { $group: { _id: '$course', so: { $sum: 1 } } },
        ]);

        const bangHocVien = new Map(demHocVien.map((d) => [String(d._id), d.so]));

        const keo = ungVien.map((k) => ({
            ...k,
            soHocVien: bangHocVien.get(String(k._id)) || 0,
        }));

        const ketQua = xepHangGoiY(keo, { daHoc, danhMucDangHoc, demHocCung }, soLuong);

        res.status(200).json({
            danhSach: ketQua,
            // De giao dien biet nen ghi "Gợi ý cho bạn" hay "Đang được quan tâm".
            // Che do khoa lien quan luon coi la da ca nhan hoa: goi y do dua
            // tren chinh khoa nguoi dung dang xem.
            caNhanHoa: coKhoaGoc || (!!req.user && daHoc.size > 0),
        });
    } catch (error) {
        console.error('[goi-y]', error.message);
        res.status(500).json({ message: 'Không lấy được gợi ý khóa học.' });
    }
};

module.exports = {
    createCourse,
    getCourses,
    goiYKhoaHoc,
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