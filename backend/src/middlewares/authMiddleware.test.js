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

const ROLES = ['student', 'instructor', 'admin'];

const chay = (guard, user) => {
    let allowed = false;
    let code = null;
    const res = {
        status(m) { code = m; return this; },
        json() { return this; },
    };
    guard({ user }, res, () => { allowed = true; });
    return { allowed, ma: code };
};

test('admin: chi vai tro admin duoc qua', () => {
    for (const role of ROLES) {
        const outcome = chay(admin, { role });
        assert.strictEqual(outcome.allowed, role === 'admin', `vai tro ${role}`);
    }
});

test('instructor: instructor va admin deu qua, student thi khong', () => {
    assert.strictEqual(chay(instructor, { role: 'instructor' }).allowed, true);
    assert.strictEqual(chay(instructor, { role: 'admin' }).allowed, true);
    assert.strictEqual(chay(instructor, { role: 'student' }).allowed, false);
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
            const outcome = chay(guard, user);
            assert.strictEqual(outcome.allowed, false);
            assert.strictEqual(outcome.ma, 403);
        }
    }
});

test('vai tro la khoang trang, chuoi rong hay vai tro la se bi chan', () => {
    for (const role of ['', ' admin', 'ADMIN', 'superadmin', 'root', null, undefined]) {
        assert.strictEqual(chay(admin, { role }).allowed, false, `role=${role}`);
    }
});
