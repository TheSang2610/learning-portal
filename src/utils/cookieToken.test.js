const test = require('node:test');
const assert = require('node:assert');

const { datCookieToken, xoaCookieToken, layToken, TEN_COOKIE, HAN_MS } = require('./cookieToken');

// res gia: ghi lai lenh cookie/clearCookie
const resGia = () => {
    const daDat = [];
    const daXoa = [];
    return {
        daDat,
        daXoa,
        cookie: (ten, giaTri, opt) => daDat.push({ ten, giaTri, opt }),
        clearCookie: (ten, opt) => daXoa.push({ ten, opt }),
    };
};

const voiMoiTruong = (gt, fn) => {
    const cu = process.env.NODE_ENV;
    process.env.NODE_ENV = gt;
    try {
        fn();
    } finally {
        process.env.NODE_ENV = cu;
    }
};

// --- datCookieToken ---------------------------------------------------------

// Day la ca ly do doi sang cookie: httpOnly thi document.cookie khong doc duoc,
// nen mot lo XSS khong lay duoc token nua.
test('cookie luon la httpOnly', () => {
    for (const mt of ['development', 'production']) {
        voiMoiTruong(mt, () => {
            const res = resGia();
            datCookieToken(res, 'abc');
            assert.strictEqual(res.daDat[0].opt.httpOnly, true, mt);
        });
    }
});

test('han cookie khop voi han cua JWT (1 ngay)', () => {
    const res = resGia();
    datCookieToken(res, 'abc');
    assert.strictEqual(res.daDat[0].opt.maxAge, HAN_MS);
    assert.strictEqual(HAN_MS, 24 * 60 * 60 * 1000);
});

test('luc dev: sameSite lax, khong bat secure', () => {
    voiMoiTruong('development', () => {
        const res = resGia();
        datCookieToken(res, 'abc');
        // secure:true luc dev se lam cookie khong bao gio duoc dat tren http://localhost
        assert.strictEqual(res.daDat[0].opt.secure, false);
        assert.strictEqual(res.daDat[0].opt.sameSite, 'lax');
    });
});

test('luc that: sameSite none PHAI di kem secure', () => {
    voiMoiTruong('production', () => {
        const res = resGia();
        datCookieToken(res, 'abc');
        const { sameSite, secure } = res.daDat[0].opt;
        assert.strictEqual(sameSite, 'none');
        // Trinh duyet tu choi cookie SameSite=None ma khong co Secure.
        assert.strictEqual(secure, true);
    });
});

// --- xoaCookieToken ---------------------------------------------------------

// Trinh duyet chi xoa cookie khi cac thuoc tinh khop voi luc dat. Lech mot
// thuoc tinh la no coi day la cookie khac, va cookie cu van nam nguyen -
// nguoi dung bam "dang xuat" nhung van con dang nhap.
test('xoa cookie dung bo thuoc tinh da dung luc dat', () => {
    for (const mt of ['development', 'production']) {
        voiMoiTruong(mt, () => {
            const r1 = resGia();
            datCookieToken(r1, 'abc');
            const r2 = resGia();
            xoaCookieToken(r2);

            const { maxAge, ...khiDat } = r1.daDat[0].opt;
            assert.deepStrictEqual(r2.daXoa[0].opt, khiDat, mt);
            assert.strictEqual(r2.daXoa[0].ten, r1.daDat[0].ten, mt);
        });
    }
});

// --- layToken ---------------------------------------------------------------

test('uu tien cookie hon header', () => {
    const req = {
        cookies: { [TEN_COOKIE]: 'tu-cookie' },
        headers: { authorization: 'Bearer tu-header' },
    };
    assert.strictEqual(layToken(req), 'tu-cookie');
});

// Giu duong Bearer de curl/Postman va ung dung ngoai trinh duyet van goi duoc.
test('khong co cookie thi lui ve header Bearer', () => {
    assert.strictEqual(
        layToken({ cookies: {}, headers: { authorization: 'Bearer abc' } }),
        'abc',
    );
});

test('khong co gi thi tra null', () => {
    assert.strictEqual(layToken({ cookies: {}, headers: {} }), null);
    assert.strictEqual(layToken({ headers: {} }), null);
});

test('header khong phai dang Bearer thi bo qua', () => {
    assert.strictEqual(layToken({ cookies: {}, headers: { authorization: 'Basic abc' } }), null);
    assert.strictEqual(layToken({ cookies: {}, headers: { authorization: 'Bearer' } }), null);
});
