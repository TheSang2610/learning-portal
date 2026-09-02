// Chay:  npm test
//
// Middleware nay chi doc req.method va goi res.set, nen gia lap hai thu do la
// du - khong can dung ca Express len.

const test = require('node:test');
const assert = require('node:assert');

const { datCache } = require('./cacheControl');

// res gia: ghi lai nhung header duoc dat.
const gia = (method) => {
    const headers = {};
    let daGoiNext = false;
    const req = { method };
    const res = { set: (ten, gt) => { headers[ten] = gt; } };
    const next = () => { daGoiNext = true; };
    return { req, res, next, headers, xong: () => daGoiNext };
};

test('GET: dat Cache-Control theo dung so giay truyen vao', () => {
    const m = gia('GET');
    datCache(120)(m.req, m.res, m.next);
    assert.strictEqual(
        m.headers['Cache-Control'],
        'public, max-age=0, s-maxage=120, stale-while-revalidate=600',
    );
});

test('stale-while-revalidate luon gap 5 lan s-maxage', () => {
    for (const giay of [60, 300, 1]) {
        const m = gia('GET');
        datCache(giay)(m.req, m.res, m.next);
        assert.match(
            m.headers['Cache-Control'],
            new RegExp(`s-maxage=${giay}, stale-while-revalidate=${giay * 5}$`),
        );
    }
});

test('mac dinh la 60 giay khi khong truyen tham so', () => {
    const m = gia('GET');
    datCache()(m.req, m.res, m.next);
    assert.match(m.headers['Cache-Control'], /s-maxage=60,/);
});

test('max-age=0 de trinh duyet luon hoi lai may chu', () => {
    const m = gia('GET');
    datCache(60)(m.req, m.res, m.next);
    assert.match(m.headers['Cache-Control'], /(^|, )max-age=0(,|$)/);
});

// Quan trong: dat Cache-Control cong khai len mot phan hoi ghi du lieu la sai
// nghiem trong - CDN co the phuc vu lai ket qua cua nguoi khac.
test('POST/PUT/DELETE: KHONG dat header nao', () => {
    for (const method of ['POST', 'PUT', 'PATCH', 'DELETE']) {
        const m = gia(method);
        datCache(60)(m.req, m.res, m.next);
        assert.deepStrictEqual(m.headers, {}, `${method} khong duoc dat header`);
    }
});

test('luon goi next() du phuong thuc la gi', () => {
    for (const method of ['GET', 'POST', 'DELETE', 'HEAD']) {
        const m = gia(method);
        datCache(60)(m.req, m.res, m.next);
        assert.ok(m.xong(), `${method} phai goi next()`);
    }
});
