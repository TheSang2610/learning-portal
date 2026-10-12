const test = require('node:test');
const assert = require('node:assert');

const { chongCsrf } = require('./csrf');

const allow = (origin) => origin === 'http://localhost:3000';

// Chay middleware, tra ve { status, body, canPass }
const call = (method, origin) => {
    let status = null;
    let body = null;
    let canPass = false;
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
    chongCsrf(allow)(req, res, () => {
        canPass = true;
    });
    return { status, body, canPass };
};

test('origin dung thi ghi duoc', () => {
    for (const m of ['POST', 'PUT', 'PATCH', 'DELETE']) {
        assert.strictEqual(call(m, 'http://localhost:3000').canPass, true, m);
    }
});

// Day chinh la kieu tan cong ma viec chuyen token sang cookie mo ra:
// trinh duyet tu gui cookie kem theo request do trang cua ke khac tao ra.
test('origin la thi thao tac ghi bi tu choi 403', () => {
    for (const m of ['POST', 'PUT', 'PATCH', 'DELETE']) {
        const outcome = call(m, 'https://trang-doc-hai.example');
        assert.strictEqual(outcome.canPass, false, `${m} khong duoc di tiep`);
        assert.strictEqual(outcome.status, 403, `${m} phai la 403`);
    }
});

test('doc du lieu thi khong bi chan, du origin la', () => {
    for (const m of ['GET', 'HEAD', 'OPTIONS']) {
        assert.strictEqual(call(m, 'https://trang-doc-hai.example').canPass, true, m);
    }
});

// curl/Postman/ung dung di dong khong gui Origin, va chung cung khong mang
// cookie cua trinh duyet nen khong the bi CSRF. Trinh duyet thi LUON gui
// Origin cho cac method nay, va trang cua ke tan cong khong bo di duoc.
test('khong co Origin thi cho qua', () => {
    assert.strictEqual(call('POST', undefined).canPass, true);
    assert.strictEqual(call('DELETE', undefined).canPass, true);
});

test('thong bao tu choi khong he lo danh sach origin duoc phep', () => {
    const outcome = call('POST', 'https://trang-doc-hai.example');
    assert.ok(!/localhost|vercel|allowedOrigins/i.test(outcome.body.message));
});

test('origin gan giong nhung khong trung thi van bi chan', () => {
    for (const item of [
        'http://localhost:3001',
        'https://localhost:3000',
        'http://localhost:3000.doc-hai.example',
        'http://evil.com#http://localhost:3000',
    ]) {
        assert.strictEqual(call('POST', item).status, 403, `${item} phai bi chan`);
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
const callWith = (method, headers) => {
    let status = null;
    let canPass = false;
    const res = {
        status(m) {
            status = m;
            return res;
        },
        json() {
            return res;
        },
    };
    chongCsrf(allow)({ method, headers }, res, () => {
        canPass = true;
    });
    return { status, canPass };
};

test('khong co Origin nhung Referer dung goc thi cho qua', () => {
    const outcome = callWith('POST', { referer: 'http://localhost:3000/tai-lieu/them' });
    assert.strictEqual(outcome.canPass, true);
});

test('khong co Origin va Referer la thi bi chan 403', () => {
    for (const r of [
        'https://trang-doc-hai.example/bay',
        'http://localhost:3001/',
        'http://localhost:3000.doc-hai.example/',
    ]) {
        const outcome = callWith('POST', { referer: r });
        assert.strictEqual(outcome.canPass, false, `${r} phai bi chan`);
        assert.strictEqual(outcome.status, 403, `${r} phai la 403`);
    }
});

test('CO Referer ma khong phan tich duoc thi CHAN, khong cho qua', () => {
    // Cho nay tung viet hong theo huong nguy hiem. Dia chi
    // 'http://localhost:3000.doc-hai.example/' lam new URL() nem loi, vi
    // '3000.doc-hai.example' khong phai so cong hop le. Neu coi "khong phan
    // tich duoc" la "khong co header" thi dung cai dia chi dang le phai chan
    // lai di thang qua. Trinh duyet that luon gui Referer dung dinh dang.
    for (const r of ['khong-phai-dia-chi', 'http://localhost:3000.doc-hai.example/', '   ']) {
        assert.strictEqual(callWith('POST', { referer: r }).canPass, false, `${r} phai bi chan`);
    }
});

test('Origin van thang Referer khi ca hai cung co', () => {
    // Origin la bang chung manh hon. Neu Origin la thi Referer dung cung
    // khong cuu duoc.
    const outcome = callWith('POST', {
        origin: 'https://trang-doc-hai.example',
        referer: 'http://localhost:3000/',
    });
    assert.strictEqual(outcome.status, 403);
});

test('khong Origin, khong Referer thi van cho qua (curl/Postman)', () => {
    assert.strictEqual(callWith('POST', {}).canPass, true);
    assert.strictEqual(callWith('DELETE', {}).canPass, true);
});
