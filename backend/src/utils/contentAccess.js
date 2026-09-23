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

// Cac truong chi nguoi co quyen moi duoc nhan.
const TRUONG_KIN = ['videoUrl', 'content', 'documentUrl'];

/**
 * @param {object} khoa   Tai lieu Course (co _id va instructor)
 * @param {object} [nguoiDung]  req.user, co the khong co (khach vang lai)
 */
const duocXemNoiDung = async (khoa, nguoiDung) => {
    if (!khoa || !nguoiDung) return false;

    // Admin xem duoc tat ca - dung dung mot cho voi middleware `admin`.
    if (nguoiDung.role === 'admin') return true;

    // Giang vien cua chinh khoa do. `instructor` co the da populate thanh doi
    // tuong, cung co the con la ObjectId - phai chiu ca hai hinh dang.
    const chuKhoa = khoa.instructor?._id ?? khoa.instructor;
    if (chuKhoa && String(chuKhoa) === String(nguoiDung._id)) return true;

    // Con lai: phai co ban ghi ghi danh. Kiem o day la du cho ca khoa co phi,
    // vi ban ghi ghi danh cua khoa co phi chi tao duoc sau khi don da `paid`
    // (xem cong 402 trong enrollInCourse).
    const daGhiDanh = await Enrollment.exists({
        course: khoa._id,
        student: nguoiDung._id,
    });

    return Boolean(daGhiDanh);
};

/**
 * Bo cac truong kin khoi mot bai hoc.
 *
 * Nhan ca tai lieu Mongoose lan doi tuong thuong. Tra ve doi tuong thuong -
 * khong sua tai chỗ, vi tai lieu Mongoose con dung cho viec khac o noi goi.
 */
const catNoiDung = (baiHoc) => {
    if (!baiHoc) return baiHoc;

    const doi = typeof baiHoc.toObject === 'function' ? baiHoc.toObject() : { ...baiHoc };
    for (const truong of TRUONG_KIN) delete doi[truong];

    // Bao cho giao dien biet vi sao thieu, de con hien nut "Dang ky de xem".
    doi.biKhoa = true;
    return doi;
};

module.exports = { duocXemNoiDung, catNoiDung, TRUONG_KIN };
