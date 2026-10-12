const test = require('node:test');
const assert = require('node:assert');

const { setTokenCookie, clearTokenCookie, getToken, COOKIE_NAME, TTL_MS } = require('./cookieToken');

// res gia: ghi lai lenh cookie/clearCookie
const fakeRes = () => {
    const wasSet = [];
    const deleted = [];
    return {
        wasSet,
        daXoa: deleted,
        cookie: (name, value, opt) => wasSet.push({ ten: name, giaTri: value, opt }),
        clearCookie: (name, opt) => deleted.push({ ten: name, opt }),
    };
};

const withEnv = (gt, fn) => {
    const old = process.env.NODE_ENV;
    process.env.NODE_ENV = gt;
    try {
        fn();
    } finally {
        process.env.NODE_ENV = old;
    }
};

// Dat NODE_ENV=production kem mot gia tri COOKIE_SAMESITE cu the.
const withSameSite = (gt, fn) => {
    const old = process.env.COOKIE_SAMESITE;
    if (gt === undefined) delete process.env.COOKIE_SAMESITE;
    else process.env.COOKIE_SAMESITE = gt;
    try {
        withEnv('production', fn);
    } finally {
        if (old === undefined) delete process.env.COOKIE_SAMESITE;
        else process.env.COOKIE_SAMESITE = old;
    }
};

// --- setTokenCookie ---------------------------------------------------------

// Day la ca ly do doi sang cookie: httpOnly thi document.cookie khong doc duoc,
// nen mot lo XSS khong lay duoc token nua.
test('cookie luon la httpOnly', () => {
    for (const mt of ['development', 'production']) {
        withEnv(mt, () => {
            const res = fakeRes();
            setTokenCookie(res, 'abc');
            assert.strictEqual(res.wasSet[0].opt.httpOnly, true, mt);
        });
    }
});

test('han cookie khop voi han cua JWT (1 ngay)', () => {
    const res = fakeRes();
    setTokenCookie(res, 'abc');
    assert.strictEqual(res.wasSet[0].opt.maxAge, TTL_MS);
    assert.strictEqual(TTL_MS, 24 * 60 * 60 * 1000);
});

test('luc dev: sameSite lax, khong bat secure', () => {
    withEnv('development', () => {
        const res = fakeRes();
        setTokenCookie(res, 'abc');
        // secure:true luc dev se lam cookie khong bao gio duoc dat tren http://localhost
        assert.strictEqual(res.wasSet[0].opt.secure, false);
        assert.strictEqual(res.wasSet[0].opt.sameSite, 'lax');
    });
});

test('luc that MAC DINH la lax, khong phai none', () => {
    // 'none' nghia la cookie duoc gui kem CA request do trang cua ke khac
    // tao ra - do la be mat CSRF. Giao dien goi API qua rewrites() cua Next
    // nen trinh duyet chi thay mot mien: cookie la ben thu nhat, khong can
    // 'none'. Da kiem chung tren ban that - xem ghi chu o cookieToken.js.
    withSameSite(undefined, () => {
        const res = fakeRes();
        setTokenCookie(res, 'abc');
        assert.strictEqual(res.wasSet[0].opt.sameSite, 'lax');
        assert.strictEqual(res.wasSet[0].opt.secure, true);
    });
});

test('van dat lai duoc none bang bien moi truong', () => {
    // Duong lui cho truong hop trinh duyet phai goi THANG sang mien backend
    // (NEXT_PUBLIC_GOI_THANG_BACKEND=1, hoac mot ung dung di dong). Luc do
    // cookie tro lai la ben thu ba va 'lax' se lam dang nhap hong.
    withSameSite('none', () => {
        const res = fakeRes();
        setTokenCookie(res, 'abc');
        assert.strictEqual(res.wasSet[0].opt.sameSite, 'none');
        // Trinh duyet tu choi cookie SameSite=None ma khong co Secure.
        assert.strictEqual(res.wasSet[0].opt.secure, true);
    });
});

test('gia tri la trong bien moi truong thi lui ve lax, khong lam hong dang nhap', () => {
    // Go nham 'None ' hay 'lax;' thi khong duoc phep tra ra mot gia tri
    // vo nghia - trinh duyet se tu choi ca cai cookie.
    for (const rac of ['khong-phai-gia-tri', '', 'LAX ', 'none;']) {
        withSameSite(rac, () => {
            const res = fakeRes();
            setTokenCookie(res, 'abc');
            assert.strictEqual(res.wasSet[0].opt.sameSite, 'lax', `voi gia tri ${JSON.stringify(rac)}`);
        });
    }
});

test('bien moi truong KHONG co tac dung luc dev', () => {
    // Cookie Secure khong bao gio duoc dat tren http://localhost. Neu bien nay
    // an duoc vao moi truong dev thi mot lan dat nham la ca may khong dang
    // nhap duoc, va rat kho doan ra.
    const old = process.env.COOKIE_SAMESITE;
    process.env.COOKIE_SAMESITE = 'none';
    try {
        withEnv('development', () => {
            const res = fakeRes();
            setTokenCookie(res, 'abc');
            assert.strictEqual(res.wasSet[0].opt.sameSite, 'lax');
            assert.strictEqual(res.wasSet[0].opt.secure, false);
        });
    } finally {
        if (old === undefined) delete process.env.COOKIE_SAMESITE;
        else process.env.COOKIE_SAMESITE = old;
    }
});

// --- clearTokenCookie ---------------------------------------------------------

// Trinh duyet chi xoa cookie khi cac thuoc tinh khop voi luc dat. Lech mot
// thuoc tinh la no coi day la cookie khac, va cookie cu van nam nguyen -
// nguoi dung bam "dang xuat" nhung van con dang nhap.
test('xoa cookie dung bo thuoc tinh da dung luc dat', () => {
    for (const mt of ['development', 'production']) {
        withEnv(mt, () => {
            const r1 = fakeRes();
            setTokenCookie(r1, 'abc');
            const r2 = fakeRes();
            clearTokenCookie(r2);

            const { maxAge, ...onSet } = r1.wasSet[0].opt;
            assert.deepStrictEqual(r2.daXoa[0].opt, onSet, mt);
            assert.strictEqual(r2.daXoa[0].ten, r1.wasSet[0].ten, mt);
        });
    }
});

// --- getToken ---------------------------------------------------------------

test('uu tien cookie hon header', () => {
    const req = {
        cookies: { [COOKIE_NAME]: 'tu-cookie' },
        headers: { authorization: 'Bearer tu-header' },
    };
    assert.strictEqual(getToken(req), 'tu-cookie');
});

// Giu duong Bearer de curl/Postman va ung dung ngoai trinh duyet van goi duoc.
test('khong co cookie thi lui ve header Bearer', () => {
    assert.strictEqual(
        getToken({ cookies: {}, headers: { authorization: 'Bearer abc' } }),
        'abc',
    );
});

test('khong co gi thi tra null', () => {
    assert.strictEqual(getToken({ cookies: {}, headers: {} }), null);
    assert.strictEqual(getToken({ headers: {} }), null);
});

test('header khong phai dang Bearer thi bo qua', () => {
    assert.strictEqual(getToken({ cookies: {}, headers: { authorization: 'Basic abc' } }), null);
    assert.strictEqual(getToken({ cookies: {}, headers: { authorization: 'Bearer' } }), null);
});
