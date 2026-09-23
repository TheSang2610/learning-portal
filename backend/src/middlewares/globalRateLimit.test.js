const test = require('node:test');
const assert = require('node:assert');

const { taoTranChung, taoBoDem, ghiMot, BO_QUA, MAX_KHOA } = require('./globalRateLimit');

/* ---------------------------- bo dem thuan ------------------------------ */

test('con duoi nguong thi luon cho di tiep', () => {
    const bo = taoBoDem(60_000, 3);
    const now = 1_000_000;
    assert.strictEqual(ghiMot(bo, 'ip1', now), 0);
    assert.strictEqual(ghiMot(bo, 'ip1', now), 0);
    assert.strictEqual(ghiMot(bo, 'ip1', now), 0);
});

test('vuot nguong thi tra ve so giay phai cho', () => {
    const bo = taoBoDem(60_000, 3);
    const now = 1_000_000;
    for (let i = 0; i < 3; i += 1) ghiMot(bo, 'ip1', now);

    const cho = ghiMot(bo, 'ip1', now);
    assert.ok(cho > 0, 'luot thu 4 phai bi chan');
    assert.ok(cho <= 60, 'khong duoc cho lau hon ca cua so');
});

test('moi dia chi co bo dem RIENG', () => {
    // Neu chung mot bo dem thi mot nguoi dung nang tay se khoa ca he thong.
    const bo = taoBoDem(60_000, 2);
    const now = 1_000_000;
    ghiMot(bo, 'ip1', now);
    ghiMot(bo, 'ip1', now);
    assert.ok(ghiMot(bo, 'ip1', now) > 0, 'ip1 phai bi chan');
    assert.strictEqual(ghiMot(bo, 'ip2', now), 0, 'ip2 khong lien quan gi');
});

test('cua so het han thi bo dem mo lai tu dau', () => {
    const bo = taoBoDem(60_000, 2);
    const now = 1_000_000;
    ghiMot(bo, 'ip1', now);
    ghiMot(bo, 'ip1', now);
    assert.ok(ghiMot(bo, 'ip1', now) > 0);

    // Qua cua so -> duoc di tiep.
    assert.strictEqual(ghiMot(bo, 'ip1', now + 60_001), 0);
});

test('bi chan roi VAN tiep tuc dem', () => {
    // Neu ngung dem khi da chan thi mot ke bi chan lien tuc theo phut se khong
    // bao gio cham nguong theo gio - dung cai nguong sinh ra de bat ho.
    const bo = taoBoDem(60_000, 2);
    const now = 1_000_000;
    for (let i = 0; i < 10; i += 1) ghiMot(bo, 'ip1', now);
    assert.strictEqual(bo.o.get('ip1').dem, 10);
});

test('so khoa dang giu khong vuot tran', () => {
    // Mot dot tan cong tu hang chuc nghin dia chi khac nhau khong duoc phep
    // bom phinh bo nho lambda.
    const bo = taoBoDem(60_000, 5);
    const now = 1_000_000;
    for (let i = 0; i < MAX_KHOA + 500; i += 1) ghiMot(bo, `ip${i}`, now);
    assert.ok(bo.o.size <= MAX_KHOA, `dang giu ${bo.o.size} khoa`);
});

/* ----------------------------- middleware ------------------------------- */

const gia = (duongDan, ip) => {
    const res = {
        maTrangThai: 0,
        than: null,
        header: {},
        set(k, v) {
            this.header[k] = v;
        },
        status(m) {
            this.maTrangThai = m;
            return this;
        },
        json(b) {
            this.than = b;
            return this;
        },
    };
    let daGoiNext = false;
    return {
        req: { path: duongDan, ip },
        res,
        next: () => {
            daGoiNext = true;
        },
        daQua: () => daGoiNext,
    };
};

test('duoi nguong thi request di qua binh thuong', () => {
    const chan = taoTranChung({ nguongPhut: 5, nguongGio: 100 });
    const g = gia('/api/courses', '1.2.3.4');
    chan(g.req, g.res, g.next);
    assert.ok(g.daQua());
    assert.strictEqual(g.res.maTrangThai, 0, 'khong duoc dat ma trang thai nao');
});

test('vuot nguong thi tra 429 kem Retry-After', () => {
    const chan = taoTranChung({ nguongPhut: 2, nguongGio: 100 });
    for (let i = 0; i < 2; i += 1) {
        const q = gia('/api/courses', '1.2.3.4');
        chan(q.req, q.res, q.next);
    }

    const g = gia('/api/courses', '1.2.3.4');
    chan(g.req, g.res, g.next);

    assert.ok(!g.daQua(), 'khong duoc cho di tiep');
    assert.strictEqual(g.res.maTrangThai, 429);
    assert.ok(g.res.header['Retry-After'], 'thieu header Retry-After');
    assert.ok(g.res.than.message.length > 0);
});

test('cua so GIO bat duoc kieu nho giot ma cua so phut khong thay', () => {
    // Ke chi goi 1 luot moi phut thi khong bao gio cham nguong theo phut,
    // nhung ca ngay thi van la mot khoi luong lon. Day la ly do co hai cua so.
    const chan = taoTranChung({ nguongPhut: 1000, nguongGio: 3 });
    for (let i = 0; i < 3; i += 1) {
        const q = gia('/api/courses', '9.9.9.9');
        chan(q.req, q.res, q.next);
    }

    const g = gia('/api/courses', '9.9.9.9');
    chan(g.req, g.res, g.next);
    assert.strictEqual(g.res.maTrangThai, 429, 'nguong theo gio phai bat duoc');
});

test('duong kiem tra suc khoe KHONG bao gio bi chan', () => {
    // Chan no la tu bao minh chet trong khi van song.
    const chan = taoTranChung({ nguongPhut: 1, nguongGio: 1 });
    for (let i = 0; i < 50; i += 1) {
        const q = gia('/', '1.2.3.4');
        chan(q.req, q.res, q.next);
        assert.ok(q.daQua(), `luot ${i} bi chan`);
    }
});

test('webhook ngan hang KHONG bao gio bi chan', () => {
    // Duong nay dinh toi TIEN. Mot cai 429 o day nghia la tien da vao tai
    // khoan ma coin khong duoc cong cho hoc vien.
    const chan = taoTranChung({ nguongPhut: 1, nguongGio: 1 });
    for (let i = 0; i < 50; i += 1) {
        const q = gia('/api/coin/webhook/ngan-hang', '5.5.5.5');
        chan(q.req, q.res, q.next);
        assert.ok(q.daQua(), `luot ${i} bi chan`);
    }
});

test('danh sach bo qua dung DUNG duong webhook dang mount', () => {
    // Doi duong trong routes/coinRoutes.js ma quen sua o day thi webhook se
    // roi vao dien bi chan, va loi do chi lo ra khi co giao dich that.
    assert.ok(BO_QUA.has('/api/coin/webhook/ngan-hang'));
});

test('mot dia chi bi chan khong keo theo dia chi khac', () => {
    const chan = taoTranChung({ nguongPhut: 1, nguongGio: 100 });
    const a = gia('/api/courses', '1.1.1.1');
    chan(a.req, a.res, a.next);

    const b = gia('/api/courses', '1.1.1.1');
    chan(b.req, b.res, b.next);
    assert.strictEqual(b.res.maTrangThai, 429);

    const c = gia('/api/courses', '2.2.2.2');
    chan(c.req, c.res, c.next);
    assert.ok(c.daQua(), 'dia chi khac bi va lay');
});

test('thieu req.ip thi van co khoa de dem, khong nem', () => {
    // req.ip rong khi chay sau mot proxy chua cau hinh. Khong duoc phep lam
    // sap request - te nhat thi moi khach chung mot o dem.
    const chan = taoTranChung({ nguongPhut: 5, nguongGio: 100 });
    const g = gia('/api/courses', undefined);
    assert.doesNotThrow(() => chan(g.req, g.res, g.next));
    assert.ok(g.daQua());
});
