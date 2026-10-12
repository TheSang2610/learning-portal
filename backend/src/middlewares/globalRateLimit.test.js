const test = require('node:test');
const assert = require('node:assert');

const { createGlobalLimiter, createCounter, recordHit, SKIP_PATHS, MAX_KEYS } = require('./globalRateLimit');

/* ---------------------------- bo dem thuan ------------------------------ */

test('con duoi nguong thi luon cho di tiep', () => {
    const remove = createCounter(60_000, 3);
    const now = 1_000_000;
    assert.strictEqual(recordHit(remove, 'ip1', now), 0);
    assert.strictEqual(recordHit(remove, 'ip1', now), 0);
    assert.strictEqual(recordHit(remove, 'ip1', now), 0);
});

test('vuot nguong thi tra ve so giay phai cho', () => {
    const remove = createCounter(60_000, 3);
    const now = 1_000_000;
    for (let i = 0; i < 3; i += 1) recordHit(remove, 'ip1', now);

    const wait = recordHit(remove, 'ip1', now);
    assert.ok(wait > 0, 'luot thu 4 phai bi chan');
    assert.ok(wait <= 60, 'khong duoc cho lau hon ca cua so');
});

test('moi dia chi co bo dem RIENG', () => {
    // Neu chung mot bo dem thi mot nguoi dung nang tay se khoa ca he thong.
    const remove = createCounter(60_000, 2);
    const now = 1_000_000;
    recordHit(remove, 'ip1', now);
    recordHit(remove, 'ip1', now);
    assert.ok(recordHit(remove, 'ip1', now) > 0, 'ip1 phai bi chan');
    assert.strictEqual(recordHit(remove, 'ip2', now), 0, 'ip2 khong lien quan gi');
});

test('cua so het han thi bo dem mo lai tu dau', () => {
    const remove = createCounter(60_000, 2);
    const now = 1_000_000;
    recordHit(remove, 'ip1', now);
    recordHit(remove, 'ip1', now);
    assert.ok(recordHit(remove, 'ip1', now) > 0);

    // Qua cua so -> duoc di tiep.
    assert.strictEqual(recordHit(remove, 'ip1', now + 60_001), 0);
});

test('bi chan roi VAN tiep tuc dem', () => {
    // Neu ngung dem khi da chan thi mot ke bi chan lien tuc theo phut se khong
    // bao gio cham nguong theo gio - dung cai nguong sinh ra de bat ho.
    const remove = createCounter(60_000, 2);
    const now = 1_000_000;
    for (let i = 0; i < 10; i += 1) recordHit(remove, 'ip1', now);
    assert.strictEqual(remove.o.get('ip1').dem, 10);
});

test('so khoa dang giu khong vuot tran', () => {
    // Mot dot tan cong tu hang chuc nghin dia chi khac nhau khong duoc phep
    // bom phinh bo nho lambda.
    const remove = createCounter(60_000, 5);
    const now = 1_000_000;
    for (let i = 0; i < MAX_KEYS + 500; i += 1) recordHit(remove, `ip${i}`, now);
    assert.ok(remove.o.size <= MAX_KEYS, `dang giu ${remove.o.size} khoa`);
});

/* ----------------------------- middleware ------------------------------- */

const fake = (path, ip) => {
    const res = {
        statusCode: 0,
        than: null,
        header: {},
        set(k, v) {
            this.header[k] = v;
        },
        status(m) {
            this.statusCode = m;
            return this;
        },
        json(b) {
            this.than = b;
            return this;
        },
    };
    let nextCalled = false;
    return {
        req: { path: path, ip },
        res,
        next: () => {
            nextCalled = true;
        },
        daQua: () => nextCalled,
    };
};

test('duoi nguong thi request di qua binh thuong', () => {
    const block = createGlobalLimiter({ minuteThreshold: 5, hourlyThreshold: 100 });
    const g = fake('/api/courses', '1.2.3.4');
    block(g.req, g.res, g.next);
    assert.ok(g.daQua());
    assert.strictEqual(g.res.statusCode, 0, 'khong duoc dat ma trang thai nao');
});

test('vuot nguong thi tra 429 kem Retry-After', () => {
    const block = createGlobalLimiter({ minuteThreshold: 2, hourlyThreshold: 100 });
    for (let i = 0; i < 2; i += 1) {
        const q = fake('/api/courses', '1.2.3.4');
        block(q.req, q.res, q.next);
    }

    const g = fake('/api/courses', '1.2.3.4');
    block(g.req, g.res, g.next);

    assert.ok(!g.daQua(), 'khong duoc cho di tiep');
    assert.strictEqual(g.res.statusCode, 429);
    assert.ok(g.res.header['Retry-After'], 'thieu header Retry-After');
    assert.ok(g.res.than.message.length > 0);
});

test('cua so GIO bat duoc kieu nho giot ma cua so phut khong thay', () => {
    // Ke chi goi 1 luot moi phut thi khong bao gio cham nguong theo phut,
    // nhung ca ngay thi van la mot khoi luong lon. Day la ly do co hai cua so.
    const block = createGlobalLimiter({ minuteThreshold: 1000, hourlyThreshold: 3 });
    for (let i = 0; i < 3; i += 1) {
        const q = fake('/api/courses', '9.9.9.9');
        block(q.req, q.res, q.next);
    }

    const g = fake('/api/courses', '9.9.9.9');
    block(g.req, g.res, g.next);
    assert.strictEqual(g.res.statusCode, 429, 'nguong theo gio phai bat duoc');
});

test('duong kiem tra suc khoe KHONG bao gio bi chan', () => {
    // Chan no la tu bao minh chet trong khi van song.
    const block = createGlobalLimiter({ minuteThreshold: 1, hourlyThreshold: 1 });
    for (let i = 0; i < 50; i += 1) {
        const q = fake('/', '1.2.3.4');
        block(q.req, q.res, q.next);
        assert.ok(q.daQua(), `luot ${i} bi chan`);
    }
});

test('webhook ngan hang KHONG bao gio bi chan', () => {
    // Duong nay dinh toi TIEN. Mot cai 429 o day nghia la tien da vao tai
    // khoan ma don khong duoc mo khoa cho hoc vien.
    const block = createGlobalLimiter({ minuteThreshold: 1, hourlyThreshold: 1 });
    for (const route of ['/api/ngan-hang/webhook', '/api/coin/webhook/ngan-hang']) {
        for (let i = 0; i < 50; i += 1) {
            const q = fake(route, '5.5.5.5');
            block(q.req, q.res, q.next);
            assert.ok(q.daQua(), `${route} luot ${i} bi chan`);
        }
    }
});

test('danh sach bo qua dung DUNG duong webhook dang mount', () => {
    // Doi duong trong routes/bankRoutes.js hay index.js ma quen sua o day thi
    // webhook se roi vao dien bi chan, va loi do chi lo ra khi co giao dich that.
    assert.ok(SKIP_PATHS.has('/api/ngan-hang/webhook'));
    assert.ok(SKIP_PATHS.has('/api/coin/webhook/ngan-hang'));
});

test('mot dia chi bi chan khong keo theo dia chi khac', () => {
    const block = createGlobalLimiter({ minuteThreshold: 1, hourlyThreshold: 100 });
    const a = fake('/api/courses', '1.1.1.1');
    block(a.req, a.res, a.next);

    const b = fake('/api/courses', '1.1.1.1');
    block(b.req, b.res, b.next);
    assert.strictEqual(b.res.statusCode, 429);

    const c = fake('/api/courses', '2.2.2.2');
    block(c.req, c.res, c.next);
    assert.ok(c.daQua(), 'dia chi khac bi va lay');
});

test('thieu req.ip thi van co khoa de dem, khong nem', () => {
    // req.ip rong khi chay sau mot proxy chua cau hinh. Khong duoc phep lam
    // sap request - te nhat thi moi khach chung mot o dem.
    const block = createGlobalLimiter({ minuteThreshold: 5, hourlyThreshold: 100 });
    const g = fake('/api/courses', undefined);
    assert.doesNotThrow(() => block(g.req, g.res, g.next));
    assert.ok(g.daQua());
});
