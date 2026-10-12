// Chay:  npm test
//
// Day la cai cong giu video cua khoa co phi. Truoc khi co no, mo mot tai khoan
// mien phi roi goi GET /api/lessons/:id la tai duoc video khoa 1.099.000d.
// Nen liet ke DU cac loi vao, khong chi thu vai truong hop de yen tam.

const test = require('node:test');
const assert = require('node:assert');

const Enrollment = require('../models/Enrollment');
const { canViewContent, stripContent } = require('./contentAccess');

const KEY = { _id: 'khoa1', instructor: 'gv1', price: 799000 };

// Gia lap Enrollment.exists de khong can CSDL. Tra ve `co` cho lan goi tiep theo.
let lastFilter = null;
const withEnrollment = async (size, viec) => {
    const that = Enrollment.exists;
    Enrollment.exists = async (filter) => {
        lastFilter = filter;
        return size ? { _id: 'gd1' } : null;
    };
    try {
        return await viec();
    } finally {
        Enrollment.exists = that;
    }
};

test('khoa CO PHI: chi tinh ghi danh con han', async () => {
    await withEnrollment(true, () => canViewContent(KEY, { _id: 'u1', role: 'student' }));
    assert.ok(lastFilter.$or, 'phai loc theo expiresAt');
});

test('khoa MIEN PHI (ke ca tung co phi): bo qua han hoc', async () => {
    const free = { ...KEY, price: 0 };
    const allowed = await withEnrollment(true, () => canViewContent(free, { _id: 'u1', role: 'student' }));
    assert.equal(allowed, true);
    assert.equal(lastFilter.$or, undefined);
});

test('khach vang lai (khong dang nhap) khong duoc xem noi dung', async () => {
    assert.equal(await canViewContent(KEY, undefined), false);
    assert.equal(await canViewContent(KEY, null), false);
});

test('khong co khoa hoc thi khong duoc xem', async () => {
    assert.equal(await canViewContent(null, { _id: 'u1', role: 'admin' }), false);
});

test('admin xem duoc du khong ghi danh', async () => {
    const allowed = await withEnrollment(false, () =>
        canViewContent(KEY, { _id: 'admin1', role: 'admin' }),
    );
    assert.equal(allowed, true);
});

test('giang vien cua chinh khoa do xem duoc du khong ghi danh', async () => {
    const allowed = await withEnrollment(false, () =>
        canViewContent(KEY, { _id: 'gv1', role: 'instructor' }),
    );
    assert.equal(allowed, true);
});

test('giang vien KHOA KHAC thi khong duoc xem', async () => {
    const allowed = await withEnrollment(false, () =>
        canViewContent(KEY, { _id: 'gv2', role: 'instructor' }),
    );
    assert.equal(allowed, false);
});

test('instructor da populate thanh doi tuong van nhan ra la chu khoa', async () => {
    const course = { _id: 'khoa1', instructor: { _id: 'gv1', name: 'Thay A' } };
    const allowed = await withEnrollment(false, () =>
        canViewContent(course, { _id: 'gv1', role: 'instructor' }),
    );
    assert.equal(allowed, true);
});

test('hoc vien DA ghi danh thi xem duoc', async () => {
    const allowed = await withEnrollment(true, () =>
        canViewContent(KEY, { _id: 'hv1', role: 'student' }),
    );
    assert.equal(allowed, true);
});

test('hoc vien CHUA ghi danh thi khong xem duoc - day la lo hong cu', async () => {
    const allowed = await withEnrollment(false, () =>
        canViewContent(KEY, { _id: 'hv2', role: 'student' }),
    );
    assert.equal(allowed, false);
});

test('catNoiDung bo video, bai viet va tai lieu; giu muc luc', () => {
    const lesson = stripContent({
        _id: 'b1',
        title: 'Bai 1',
        order: 1,
        duration: '12:40',
        videoUrl: 'https://res.cloudinary.com/bimat.mp4',
        content: 'Noi dung bai viet',
        documentUrl: 'https://res.cloudinary.com/bimat.pdf',
    });

    assert.equal(lesson.videoUrl, undefined);
    assert.equal(lesson.content, undefined);
    assert.equal(lesson.documentUrl, undefined);
    assert.equal(lesson.biKhoa, true);

    // Muc luc phai con - do la thu thuyet phuc nguoi ta dang ky.
    assert.equal(lesson.title, 'Bai 1');
    assert.equal(lesson.order, 1);
    assert.equal(lesson.duration, '12:40');
});

test('catNoiDung khong sua tai lieu goc', () => {
    const origin = { _id: 'b1', title: 'Bai 1', videoUrl: 'https://co.that/video.mp4' };
    stripContent(origin);
    assert.equal(origin.videoUrl, 'https://co.that/video.mp4');
});

test('catNoiDung chiu duoc tai lieu Mongoose (co toObject)', () => {
    const lesson = stripContent({
        toObject: () => ({ _id: 'b1', title: 'Bai 1', videoUrl: 'https://co.that/video.mp4' }),
    });
    assert.equal(lesson.videoUrl, undefined);
    assert.equal(lesson.title, 'Bai 1');
});
