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

// Dat NODE_ENV=production kem mot gia tri COOKIE_SAMESITE cu the.
const voiSameSite = (gt, fn) => {
    const cu = process.env.COOKIE_SAMESITE;
    if (gt === undefined) delete process.env.COOKIE_SAMESITE;
    else process.env.COOKIE_SAMESITE = gt;
    try {
        voiMoiTruong('production', fn);
    } finally {
        if (cu === undefined) delete process.env.COOKIE_SAMESITE;
        else process.env.COOKIE_SAMESITE = cu;
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

test('luc that MAC DINH la lax, khong phai none', () => {
    // 'none' nghia la cookie duoc gui kem CA request do trang cua ke khac
    // tao ra - do la be mat CSRF. Giao dien goi API qua rewrites() cua Next
    // nen trinh duyet chi thay mot mien: cookie la ben thu nhat, khong can
    // 'none'. Da kiem chung tren ban that - xem ghi chu o cookieToken.js.
    voiSameSite(undefined, () => {
        const res = resGia();
        datCookieToken(res, 'abc');
        assert.strictEqual(res.daDat[0].opt.sameSite, 'lax');
        assert.strictEqual(res.daDat[0].opt.secure, true);
    });
});

test('van dat lai duoc none bang bien moi truong', () => {
    // Duong lui cho truong hop trinh duyet phai goi THANG sang mien backend
    // (NEXT_PUBLIC_GOI_THANG_BACKEND=1, hoac mot ung dung di dong). Luc do
    // cookie tro lai la ben thu ba va 'lax' se lam dang nhap hong.
    voiSameSite('none', () => {
        const res = resGia();
        datCookieToken(res, 'abc');
        assert.strictEqual(res.daDat[0].opt.sameSite, 'none');
        // Trinh duyet tu choi cookie SameSite=None ma khong co Secure.
        assert.strictEqual(res.daDat[0].opt.secure, true);
    });
});

test('gia tri la trong bien moi truong thi lui ve lax, khong lam hong dang nhap', () => {
    // Go nham 'None ' hay 'lax;' thi khong duoc phep tra ra mot gia tri
    // vo nghia - trinh duyet se tu choi ca cai cookie.
    for (const rac of ['khong-phai-gia-tri', '', 'LAX ', 'none;']) {
        voiSameSite(rac, () => {
            const res = resGia();
            datCookieToken(res, 'abc');
            assert.strictEqual(res.daDat[0].opt.sameSite, 'lax', `voi gia tri ${JSON.stringify(rac)}`);
        });
    }
});

test('bien moi truong KHONG co tac dung luc dev', () => {
    // Cookie Secure khong bao gio duoc dat tren http://localhost. Neu bien nay
    // an duoc vao moi truong dev thi mot lan dat nham la ca may khong dang
    // nhap duoc, va rat kho doan ra.
    const cu = process.env.COOKIE_SAMESITE;
    process.env.COOKIE_SAMESITE = 'none';
    try {
        voiMoiTruong('development', () => {
            const res = resGia();
            datCookieToken(res, 'abc');
            assert.strictEqual(res.daDat[0].opt.sameSite, 'lax');
            assert.strictEqual(res.daDat[0].opt.secure, false);
        });
    } finally {
        if (cu === undefined) delete process.env.COOKIE_SAMESITE;
        else process.env.COOKIE_SAMESITE = cu;
    }
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
