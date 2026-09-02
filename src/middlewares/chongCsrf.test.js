const test = require('node:test');
const assert = require('node:assert');

const { chongCsrf } = require('./chongCsrf');

const choPhep = (origin) => origin === 'http://localhost:3000';

// Chay middleware, tra ve { status, body, quaDuoc }
const goi = (method, origin) => {
    let status = null;
    let body = null;
    let quaDuoc = false;
    const res = {
        status(m) {
            status = m;
            return res;
        },
        json(b) {
            body = b;
            return res;
        },
    };
    const req = { method, headers: origin === undefined ? {} : { origin } };
    chongCsrf(choPhep)(req, res, () => {
        quaDuoc = true;
    });
    return { status, body, quaDuoc };
};

test('origin dung thi ghi duoc', () => {
    for (const m of ['POST', 'PUT', 'PATCH', 'DELETE']) {
        assert.strictEqual(goi(m, 'http://localhost:3000').quaDuoc, true, m);
    }
});

// Day chinh la kieu tan cong ma viec chuyen token sang cookie mo ra:
// trinh duyet tu gui cookie kem theo request do trang cua ke khac tao ra.
test('origin la thi thao tac ghi bi tu choi 403', () => {
    for (const m of ['POST', 'PUT', 'PATCH', 'DELETE']) {
        const kq = goi(m, 'https://trang-doc-hai.example');
        assert.strictEqual(kq.quaDuoc, false, `${m} khong duoc di tiep`);
        assert.strictEqual(kq.status, 403, `${m} phai la 403`);
    }
});

test('doc du lieu thi khong bi chan, du origin la', () => {
    for (const m of ['GET', 'HEAD', 'OPTIONS']) {
        assert.strictEqual(goi(m, 'https://trang-doc-hai.example').quaDuoc, true, m);
    }
});

// curl/Postman/ung dung di dong khong gui Origin, va chung cung khong mang
// cookie cua trinh duyet nen khong the bi CSRF. Trinh duyet thi LUON gui
// Origin cho cac method nay, va trang cua ke tan cong khong bo di duoc.
test('khong co Origin thi cho qua', () => {
    assert.strictEqual(goi('POST', undefined).quaDuoc, true);
    assert.strictEqual(goi('DELETE', undefined).quaDuoc, true);
});

test('thong bao tu choi khong he lo danh sach origin duoc phep', () => {
    const kq = goi('POST', 'https://trang-doc-hai.example');
    assert.ok(!/localhost|vercel|allowedOrigins/i.test(kq.body.message));
});

test('origin gan giong nhung khong trung thi van bi chan', () => {
    for (const o of [
        'http://localhost:3001',
        'https://localhost:3000',
        'http://localhost:3000.doc-hai.example',
        'http://evil.com#http://localhost:3000',
    ]) {
        assert.strictEqual(goi('POST', o).status, 403, `${o} phai bi chan`);
    }
});
