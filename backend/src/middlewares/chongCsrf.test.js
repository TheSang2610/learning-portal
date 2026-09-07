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

// ---------------------------------------------------------------------------
// Lui ve Referer khi khong co Origin
//
// Truoc day chi can VANG Origin la request ghi di thang qua. O du an nay dieu
// do dang lo hon binh thuong: frontend va API khac site nen cookie phien phai
// la sameSite:'none', tuc trinh duyet gui cookie kem ca request tu site khac
// va kiem tra nay la lop chan CSRF duy nhat. Con Referer thi phai xet Referer.
// ---------------------------------------------------------------------------

// Nhu goi() o tren nhung dat duoc tuy y header.
const goiVoi = (method, headers) => {
    let status = null;
    let quaDuoc = false;
    const res = {
        status(m) {
            status = m;
            return res;
        },
        json() {
            return res;
        },
    };
    chongCsrf(choPhep)({ method, headers }, res, () => {
        quaDuoc = true;
    });
    return { status, quaDuoc };
};

test('khong co Origin nhung Referer dung goc thi cho qua', () => {
    const kq = goiVoi('POST', { referer: 'http://localhost:3000/tai-lieu/them' });
    assert.strictEqual(kq.quaDuoc, true);
});

test('khong co Origin va Referer la thi bi chan 403', () => {
    for (const r of [
        'https://trang-doc-hai.example/bay',
        'http://localhost:3001/',
        'http://localhost:3000.doc-hai.example/',
    ]) {
        const kq = goiVoi('POST', { referer: r });
        assert.strictEqual(kq.quaDuoc, false, `${r} phai bi chan`);
        assert.strictEqual(kq.status, 403, `${r} phai la 403`);
    }
});

test('CO Referer ma khong phan tich duoc thi CHAN, khong cho qua', () => {
    // Cho nay tung viet hong theo huong nguy hiem. Dia chi
    // 'http://localhost:3000.doc-hai.example/' lam new URL() nem loi, vi
    // '3000.doc-hai.example' khong phai so cong hop le. Neu coi "khong phan
    // tich duoc" la "khong co header" thi dung cai dia chi dang le phai chan
    // lai di thang qua. Trinh duyet that luon gui Referer dung dinh dang.
    for (const r of ['khong-phai-dia-chi', 'http://localhost:3000.doc-hai.example/', '   ']) {
        assert.strictEqual(goiVoi('POST', { referer: r }).quaDuoc, false, `${r} phai bi chan`);
    }
});

test('Origin van thang Referer khi ca hai cung co', () => {
    // Origin la bang chung manh hon. Neu Origin la thi Referer dung cung
    // khong cuu duoc.
    const kq = goiVoi('POST', {
        origin: 'https://trang-doc-hai.example',
        referer: 'http://localhost:3000/',
    });
    assert.strictEqual(kq.status, 403);
});

test('khong Origin, khong Referer thi van cho qua (curl/Postman)', () => {
    assert.strictEqual(goiVoi('POST', {}).quaDuoc, true);
    assert.strictEqual(goiVoi('DELETE', {}).quaDuoc, true);
});
