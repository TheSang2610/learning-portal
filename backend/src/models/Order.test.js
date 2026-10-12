const test = require('node:test');
const assert = require('node:assert');

const Order = require('./Order');

const { generateCode, ORDER_HOLD_MS } = Order;

test('sinhMa: dung dinh dang DH + 4 ky tu', () => {
    for (let i = 0; i < 200; i += 1) {
        assert.match(generateCode(), /^DH[A-Z2-9]{4}$/);
    }
});

// Day la ly do that su cua bang chu cai rut gon: nguoi dung phai GO LAI ma nay
// vao noi dung chuyen khoan khi khong quet duoc QR. "DH0O1I" thi go nham la
// chuyen tien di dau khong biet.
test('sinhMa: khong bao gio sinh ky tu de nhin nham', () => {
    const confusable = ['0', 'O', '1', 'I', 'L'];
    for (let i = 0; i < 500; i += 1) {
        const code = generateCode().slice(2);
        for (const char of confusable) {
            assert.ok(!code.includes(char), `ma ${code} chua ky tu de nhin nham "${char}"`);
        }
    }
});

test('sinhMa: co du ngau nhien, khong tra ve mot gia tri co dinh', () => {
    const seen = new Set();
    for (let i = 0; i < 300; i += 1) seen.add(generateCode());
    // 300 lan ma chi ra duoi 100 ma khac nhau thi ham dang hong.
    assert.ok(seen.size > 100, `chi sinh duoc ${seen.size} ma khac nhau`);
});

test('han giu don la 15 phut', () => {
    assert.strictEqual(ORDER_HOLD_MS, 15 * 60 * 1000);
});

test('daHetHan: don dang cho va qua han thi tinh la het han', () => {
    const order = new Order({
        code: 'DHTEST',
        course: '6a801a3f49e450baa602e05a',
        student: '6a801a3f49e450baa602e05b',
        amount: 499000,
        status: 'pending',
        expiresAt: new Date(Date.now() - 1000)
    });
    assert.strictEqual(order.expired(), true);
});

test('daHetHan: don dang cho va con han thi chua het han', () => {
    const order = new Order({
        code: 'DHTEST',
        course: '6a801a3f49e450baa602e05a',
        student: '6a801a3f49e450baa602e05b',
        amount: 499000,
        status: 'pending',
        expiresAt: new Date(Date.now() + 60_000)
    });
    assert.strictEqual(order.expired(), false);
});

// Quan trong: don DA THANH TOAN roi thi khong bao gio duoc coi la het han, du
// moc thoi gian da qua tu lau. Nham cho nay la thu hoi khoa hoc cua nguoi da
// tra tien.
test('daHetHan: don da thanh toan khong bao gio bi coi la het han', () => {
    const order = new Order({
        code: 'DHTEST',
        course: '6a801a3f49e450baa602e05a',
        student: '6a801a3f49e450baa602e05b',
        amount: 499000,
        status: 'paid',
        expiresAt: new Date(Date.now() - 86_400_000)
    });
    assert.strictEqual(order.expired(), false);
});

test('amount khong duoc am', () => {
    const order = new Order({
        code: 'DHTEST',
        course: '6a801a3f49e450baa602e05a',
        student: '6a801a3f49e450baa602e05b',
        amount: -1,
        expiresAt: new Date()
    });
    const err = order.validateSync();
    assert.ok(err?.errors?.amount, 'so tien am phai bi tu choi');
});

test('status chi nhan 4 gia tri da dinh nghia', () => {
    const order = new Order({
        code: 'DHTEST',
        course: '6a801a3f49e450baa602e05a',
        student: '6a801a3f49e450baa602e05b',
        amount: 1000,
        status: 'da_thanh_toan_roi_nhe',
        expiresAt: new Date()
    });
    assert.ok(order.validateSync()?.errors?.status, 'trang thai la phai bi tu choi');
});
