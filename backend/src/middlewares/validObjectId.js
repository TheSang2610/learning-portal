const mongoose = require('mongoose');

// Chan id sai dinh dang NGAY TRUOC khi vao controller.
//
// Khong co lop nay thi mot duong dan nhu /api/courses/abc se di thang xuong
// Course.findById('abc'), Mongoose nem CastError, va vi moi controller deu bat
// loi bang `catch { res.status(500) }` nen nguoi dung nhan 500. Da do that:
// 12 duong tra 500 chi vi id go sai, phan lon la duong cong khai - nghia la
// bat ky lien ket hong nao, hay con bot nao do URL, cung tao ra 500 trong log.
//
// Dung 404 chu khong phai 400: id sai dinh dang thi tai nguyen do chac chan
// khong ton tai, va 404 khong he lo rang he thong dung ObjectId.

// Chi nhung tham so THUC SU la ObjectId. Cac tham so con lai (`slug`,
// `courseSlug`, `lessonSlug`, `code`, `verificationCode`) la chuoi tu do -
// dem chung vao day se lam hong cac duong tra cuu theo slug.
const ID_PARAMS = ['id', 'courseId', 'studentId', 'attemptId', 'userId'];

// Goi ngay sau khi tao router, truoc khi khai bao cac duong.
const guardObjectIds = (router) => {
    for (const name of ID_PARAMS) {
        router.param(name, (req, res, next, value) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                return res.status(404).json({ message: 'Không tìm thấy' });
            }
            next();
        });
    }
    return router;
};

module.exports = { guardObjectIds, ID_PARAMS };
