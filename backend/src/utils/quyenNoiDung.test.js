// Chay:  npm test
//
// Day la cai cong giu video cua khoa co phi. Truoc khi co no, mo mot tai khoan
// mien phi roi goi GET /api/lessons/:id la tai duoc video khoa 1.099.000d.
// Nen liet ke DU cac loi vao, khong chi thu vai truong hop de yen tam.

const test = require('node:test');
const assert = require('node:assert');

const Enrollment = require('../models/Enrollment');
const { duocXemNoiDung, catNoiDung } = require('./quyenNoiDung');

const KHOA = { _id: 'khoa1', instructor: 'gv1' };

// Gia lap Enrollment.exists de khong can CSDL. Tra ve `co` cho lan goi tiep theo.
const voiGhiDanh = async (co, viec) => {
    const that = Enrollment.exists;
    Enrollment.exists = async () => (co ? { _id: 'gd1' } : null);
    try {
        return await viec();
    } finally {
        Enrollment.exists = that;
    }
};

test('khach vang lai (khong dang nhap) khong duoc xem noi dung', async () => {
    assert.equal(await duocXemNoiDung(KHOA, undefined), false);
    assert.equal(await duocXemNoiDung(KHOA, null), false);
});

test('khong co khoa hoc thi khong duoc xem', async () => {
    assert.equal(await duocXemNoiDung(null, { _id: 'u1', role: 'admin' }), false);
});

test('admin xem duoc du khong ghi danh', async () => {
    const duoc = await voiGhiDanh(false, () =>
        duocXemNoiDung(KHOA, { _id: 'admin1', role: 'admin' }),
    );
    assert.equal(duoc, true);
});

test('giang vien cua chinh khoa do xem duoc du khong ghi danh', async () => {
    const duoc = await voiGhiDanh(false, () =>
        duocXemNoiDung(KHOA, { _id: 'gv1', role: 'instructor' }),
    );
    assert.equal(duoc, true);
});

test('giang vien KHOA KHAC thi khong duoc xem', async () => {
    const duoc = await voiGhiDanh(false, () =>
        duocXemNoiDung(KHOA, { _id: 'gv2', role: 'instructor' }),
    );
    assert.equal(duoc, false);
});

test('instructor da populate thanh doi tuong van nhan ra la chu khoa', async () => {
    const khoa = { _id: 'khoa1', instructor: { _id: 'gv1', name: 'Thay A' } };
    const duoc = await voiGhiDanh(false, () =>
        duocXemNoiDung(khoa, { _id: 'gv1', role: 'instructor' }),
    );
    assert.equal(duoc, true);
});

test('hoc vien DA ghi danh thi xem duoc', async () => {
    const duoc = await voiGhiDanh(true, () =>
        duocXemNoiDung(KHOA, { _id: 'hv1', role: 'student' }),
    );
    assert.equal(duoc, true);
});

test('hoc vien CHUA ghi danh thi khong xem duoc - day la lo hong cu', async () => {
    const duoc = await voiGhiDanh(false, () =>
        duocXemNoiDung(KHOA, { _id: 'hv2', role: 'student' }),
    );
    assert.equal(duoc, false);
});

test('catNoiDung bo video, bai viet va tai lieu; giu muc luc', () => {
    const bai = catNoiDung({
        _id: 'b1',
        title: 'Bai 1',
        order: 1,
        duration: '12:40',
        videoUrl: 'https://res.cloudinary.com/bimat.mp4',
        content: 'Noi dung bai viet',
        documentUrl: 'https://res.cloudinary.com/bimat.pdf',
    });

    assert.equal(bai.videoUrl, undefined);
    assert.equal(bai.content, undefined);
    assert.equal(bai.documentUrl, undefined);
    assert.equal(bai.biKhoa, true);

    // Muc luc phai con - do la thu thuyet phuc nguoi ta dang ky.
    assert.equal(bai.title, 'Bai 1');
    assert.equal(bai.order, 1);
    assert.equal(bai.duration, '12:40');
});

test('catNoiDung khong sua tai lieu goc', () => {
    const goc = { _id: 'b1', title: 'Bai 1', videoUrl: 'https://co.that/video.mp4' };
    catNoiDung(goc);
    assert.equal(goc.videoUrl, 'https://co.that/video.mp4');
});

test('catNoiDung chiu duoc tai lieu Mongoose (co toObject)', () => {
    const bai = catNoiDung({
        toObject: () => ({ _id: 'b1', title: 'Bai 1', videoUrl: 'https://co.that/video.mp4' }),
    });
    assert.equal(bai.videoUrl, undefined);
    assert.equal(bai.title, 'Bai 1');
});
