const test = require('node:test');
const assert = require('node:assert');

const { processBankCredit } = require('./bankWebhookController');

// Cac nhanh duoi day tra ve TRUOC khi dung toi CSDL nen chay duoc khong can Mongo.
const credit = (over) => ({ maGiaoDich: 'FT1', soTien: 100000, incoming: true, noiDung: '', soTaiKhoan: '', ...over });

test('tien ra thi bo qua', async () => {
    const r = await processBankCredit(credit({ incoming: false }));
    assert.strictEqual(r.xuLy, 'bo_qua');
});

test('tien vao tai khoan khac thi bo qua', async () => {
    const r = await processBankCredit(credit({ soTaiKhoan: '0000000000', noiDung: 'DH7K3M' }));
    assert.strictEqual(r.xuLy, 'bo_qua');
});

test('tien don hang cua infinity-store (ma HA + 10 hex) thi bo qua, khong bao chua khop', async () => {
    const r = await processBankCredit(credit({ noiDung: 'CK DON HANG HA1B2C3D4E5F' }));
    assert.strictEqual(r.xuLy, 'bo_qua');
});

test('khong co ma don nao thi de quan tri xem tay', async () => {
    const r = await processBankCredit(credit({ noiDung: 'chuyen tien hoc phi' }));
    assert.strictEqual(r.xuLy, 'chua_khop');
});
