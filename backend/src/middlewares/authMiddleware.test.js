// Chay:  npm test
//
// Chi test `admin` va `instructor`: ca hai la ham thuan cua req.user nen gia lap
// duoc. Con `protect` phai giai ma JWT va tra cuu User trong CSDL, khong dua vao
// day - muon test no phai co CSDL thu, la viec khac.
//
// Day la hai cai canh cua. Mot lan noi long nham la lo du lieu quan tri, nen
// liet ke tat ca vai tro chu khong chi thu vai truong hop.

const test = require('node:test');
const assert = require('node:assert');

const { admin, instructor } = require('./authMiddleware');

const VAI_TRO = ['student', 'instructor', 'admin'];

const chay = (guard, user) => {
    let cho_qua = false;
    let ma = null;
    const res = {
        status(m) { ma = m; return this; },
        json() { return this; },
    };
    guard({ user }, res, () => { cho_qua = true; });
    return { cho_qua, ma };
};

test('admin: chi vai tro admin duoc qua', () => {
    for (const role of VAI_TRO) {
        const kq = chay(admin, { role });
        assert.strictEqual(kq.cho_qua, role === 'admin', `vai tro ${role}`);
    }
});

test('instructor: instructor va admin deu qua, student thi khong', () => {
    assert.strictEqual(chay(instructor, { role: 'instructor' }).cho_qua, true);
    assert.strictEqual(chay(instructor, { role: 'admin' }).cho_qua, true);
    assert.strictEqual(chay(instructor, { role: 'student' }).cho_qua, false);
});

test('bi tu choi thi tra 403 chu khong phai 401', () => {
    // 401 nghia la "chua dang nhap", 403 la "da dang nhap nhung khong du quyen".
    // Tra nham 401 se khien giao dien da nguoi dung ra man hinh dang nhap.
    assert.strictEqual(chay(admin, { role: 'student' }).ma, 403);
    assert.strictEqual(chay(instructor, { role: 'student' }).ma, 403);
});

test('khong co req.user thi chan, khong duoc no', () => {
    for (const guard of [admin, instructor]) {
        for (const user of [undefined, null]) {
            const kq = chay(guard, user);
            assert.strictEqual(kq.cho_qua, false);
            assert.strictEqual(kq.ma, 403);
        }
    }
});

test('vai tro la khoang trang, chuoi rong hay vai tro la se bi chan', () => {
    for (const role of ['', ' admin', 'ADMIN', 'superadmin', 'root', null, undefined]) {
        assert.strictEqual(chay(admin, { role }).cho_qua, false, `role=${role}`);
    }
});
