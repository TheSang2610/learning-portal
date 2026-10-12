/**
 * Ai duoc xem NOI DUNG bai hoc, va cat gi khi khong duoc.
 *
 * Truoc day cong hoc bi ho o cho nay: cong 402 chi dung o duong GHI DANH
 * (`enrollInCourse`), con duong DOC BAI thi khong kiem gi ca. Ket qua la mo mot
 * tai khoan mien phi roi goi thang GET /api/lessons/:id la lay duoc `videoUrl`
 * cua khoa 1.099.000d. Nang hon: GET /api/courses/:id khong can dang nhap ma
 * van `.populate('lessons')`, tuc la ai cung tai duoc toan bo video.
 *
 * Nen quy tac dat o day, mot noi, cho ca bon duong doc dung chung. De moi
 * controller tu kiem thi som muon co cai quen.
 *
 * Ranh gioi:
 *   - Muc luc (ten bai, thu tu, thoi luong) la thu de MOI cho khach xem, vi do
 *     chinh la thu ban khoa hoc. Van tra ve cho khach vang lai.
 *   - Noi dung (video, bai viet, tai lieu) chi cho nguoi da ghi danh, chinh
 *     giang vien cua khoa, va admin.
 */

const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const { activeFilter } = require('./accessPeriod');

// Cac truong chi nguoi co quyen moi duoc nhan.
// videoPublicId: ma video o kho kin - khong lo cho nguoi chua mua, va nguoi da
// mua cung chi nhan link ky (utils/privateVideo.attachPlaybackUrl), khong nhan ma.
const PRIVATE_FIELDS = ['videoUrl', 'videoPublicId', 'content', 'documentUrl'];

/**
 * @param {object} khoa   Tai lieu Course (co _id va instructor)
 * @param {object} [nguoiDung]  req.user, co the khong co (khach vang lai)
 */
const canViewContent = async (course, user) => {
    if (!course || !user) return false;

    // Admin xem duoc tat ca - dung dung mot cho voi middleware `admin`.
    if (user.role === 'admin') return true;

    // Giang vien cua chinh khoa do. `instructor` co the da populate thanh doi
    // tuong, cung co the con la ObjectId - phai chiu ca hai hinh dang.
    const courseOwner = course.instructor?._id ?? course.instructor;
    if (courseOwner && String(courseOwner) === String(user._id)) return true;

    // Con lai: phai co ban ghi ghi danh. Kiem o day la du cho ca khoa co phi,
    // vi ban ghi ghi danh cua khoa co phi chi tao duoc sau khi don da `paid`
    // (xem cong 402 trong enrollInCourse).
    // Khoa co phi het han hoc (utils/accessPeriod.js) thi khong duoc xem nua;
    // tien do, lich su bai lam va chung nhan van giu.
    //
    // Khoa DANG mien phi thi bo qua han: khoa tung co phi roi quan tri chuyen
    // sang mien phi, nguoi mua cu da het han van phai hoc duoc nhu moi nguoi.
    // Noi goi khong phai luc nao cung chon san `price` nen thieu thi tu doc.
    const price = course.price !== undefined
        ? course.price
        : (await Course.findById(course._id).select('price').lean())?.price;
    const enrolled = await Enrollment.exists({
        course: course._id,
        student: user._id,
        ...(Number(price) > 0 ? activeFilter() : {}),
    });

    return Boolean(enrolled);
};

/**
 * Bo cac truong kin khoi mot bai hoc.
 *
 * Nhan ca tai lieu Mongoose lan doi tuong thuong. Tra ve doi tuong thuong -
 * khong sua tai chỗ, vi tai lieu Mongoose con dung cho viec khac o noi goi.
 */
const stripContent = (lesson) => {
    if (!lesson) return lesson;

    const copy = typeof lesson.toObject === 'function' ? lesson.toObject() : { ...lesson };
    for (const school of PRIVATE_FIELDS) delete copy[school];

    // Bao cho giao dien biet vi sao thieu, de con hien nut "Dang ky de xem".
    copy.biKhoa = true;
    return copy;
};

module.exports = { canViewContent, stripContent, PRIVATE_FIELDS };
