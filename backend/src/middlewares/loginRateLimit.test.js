// Chay:  npm test
//
// Bo gioi han dang nhap la thu de tin la "chac dung roi" ma that ra khong chay.
// Cac test duoi day kiem ca hai chieu: co chan ke tan cong that khong, va co
// chan nham nguoi dung binh thuong khong.
//
// Khong mo ket noi CSDL: khi mongoose chua ket noi, utils/rateLimitStore.js tu lui
// ve bo dem trong bo nho tien trinh - dung nhanh do la test van thuan.

const test = require('node:test');
const assert = require('node:assert');

const {
    loginRateLimit,
    recordLoginFailure,
    clearLoginAttempts,
    MAX_FAILS_EMAIL,
    MAX_FAILS_IP,
    MAX_ACCOUNT_FAILS,
} = require('./loginRateLimit');
const { _resetForTest } = require('../utils/rateLimitStore');

// Gia lap mot luot dang nhap. Tra ve { chan, ma, keys }.
const attempt = async (ip, email) => {
    const req = { ip, body: { email } };
    let code = null;
    let allowed = false;
    const res = {
        set() { return this; },
        status(m) { code = m; return this; },
        json() { return this; },
    };
    await loginRateLimit(req, res, () => { allowed = true; });
    return { chan: !allowed, ma: code, keys: req.loginAttemptKey };
};

// Dang nhap sai n lan lien tiep. Tra ve so lan thuc su di qua duoc.
const failManyTimes = async (ip, email, n) => {
    for (let i = 0; i < n; i += 1) {
        const outcome = await attempt(ip, email);
        if (outcome.chan) return i; // da bi chan tu lan thu i
        await recordLoginFailure(outcome.keys);
    }
    return n;
};

test('do mat khau MOT tai khoan tu MOT IP: bi chan sau dung 5 lan sai', async () => {
    _resetForTest();
    const failed = await failManyTimes('1.1.1.1', 'nan-nhan@vidu.com', 10);
    assert.strictEqual(failed, MAX_FAILS_EMAIL, 'phai chan ngay sau lan sai thu 5');

    const outcome = await attempt('1.1.1.1', 'nan-nhan@vidu.com');
    assert.strictEqual(outcome.chan, true);
    assert.strictEqual(outcome.ma, 429);
});

test('thu MOT mat khau tren NHIEU email: van bi chan nho bo dem theo IP', async () => {
    // Day la lo hong cua ban dau tien: moi email mot bo dem moi nen khong bao
    // gio cham nguong. Bo dem theo IP phai bat duoc.
    _resetForTest();

    let passCount = 0;
    for (let i = 0; i < MAX_FAILS_IP + 20; i += 1) {
        const outcome = await attempt('9.9.9.9', `nguoi${i}@vidu.com`);
        if (outcome.chan) break;
        passCount += 1;
        await recordLoginFailure(outcome.keys);
    }

    assert.strictEqual(passCount, MAX_FAILS_IP, `phai chan sau ${MAX_FAILS_IP} lan sai tu cung mot IP`);
    assert.strictEqual((await attempt('9.9.9.9', 'nguoi-moi-tinh@vidu.com')).chan, true);
});

test('do MOT tai khoan tu NHIEU IP: van bi chan nho bo dem theo email', async () => {
    // Lo hong that su cua ban truoc: khoa dem la `ip|email`, nen ke tan cong
    // co proxy chi viec doi IP sau moi 4 lan thu la vinh vien khong cham
    // nguong nao, trong khi van do dung mot nan nhan. Moi IP duoi day chi thu
    // 4 lan - duoi ca nguong 5 cua khoa ip|email lan nguong 30 cua khoa IP -
    // nen thu duy nhat co the chan la bo dem theo rieng email.
    _resetForTest();
    const email = 'nan-nhan@vidu.com';

    let passCount = 0;
    for (let i = 0; i < MAX_ACCOUNT_FAILS + 10; i += 1) {
        const ip = `10.0.0.${Math.floor(i / 4)}`; // moi IP dung dung 4 lan
        const outcome = await attempt(ip, email);
        if (outcome.chan) break;
        passCount += 1;
        await recordLoginFailure(outcome.keys);
    }

    assert.strictEqual(
        passCount,
        MAX_ACCOUNT_FAILS,
        `phai chan sau ${MAX_ACCOUNT_FAILS} lan sai tren cung mot email, du moi lan mot IP khac`,
    );

    // IP hoan toan moi cung khong vao duoc nua - do la muc dich cua khoa nay.
    assert.strictEqual((await attempt('203.0.113.7', email)).chan, true);
});

test('nguong theo tai khoan phai cao hon nguong mot IP', () => {
    // Neu de bang hoac thap hon, mot nguoi go nham mat khau cua chinh minh se
    // tu khoa tai khoan tren MOI thiet bi chu khong chi may dang ngoi.
    assert.ok(
        MAX_ACCOUNT_FAILS > MAX_FAILS_EMAIL,
        'nguong theo email phai noi long hon nguong theo ip|email',
    );
});

test('nguoi dung o IP khac khong bi va lay', async () => {
    _resetForTest();
    await failManyTimes('1.1.1.1', 'nan-nhan@vidu.com', 10);
    assert.strictEqual((await attempt('2.2.2.2', 'nan-nhan@vidu.com')).chan, false);
});

test('dang nhap dung thi xoa bo dem cua email do', async () => {
    _resetForTest();
    const ip = '3.3.3.3';
    const email = 'toi@vidu.com';

    // Sai 4 lan (chua toi nguong 5)
    await failManyTimes(ip, email, MAX_FAILS_EMAIL - 1);

    const outcome = await attempt(ip, email);
    assert.strictEqual(outcome.chan, false);
    await clearLoginAttempts(outcome.keys); // dang nhap dung

    // Duoc dem lai tu dau
    const failed = await failManyTimes(ip, email, MAX_FAILS_EMAIL + 3);
    assert.strictEqual(failed, MAX_FAILS_EMAIL);
});

test('dang nhap dung thi xoa ca bo dem theo rieng tai khoan', async () => {
    // Nguoi dung go nham o vai may khac nhau roi vao dung: khong duoc de so
    // lan nham cu tich lai tren khoa theo email.
    _resetForTest();
    const email = 'hay-quen@vidu.com';

    for (let i = 0; i < MAX_ACCOUNT_FAILS - 1; i += 1) {
        const outcome = await attempt(`10.1.0.${Math.floor(i / 4)}`, email);
        await recordLoginFailure(outcome.keys);
    }

    const ok = await attempt('10.9.9.9', email);
    assert.strictEqual(ok.chan, false);
    await clearLoginAttempts(ok.keys); // dang nhap dung

    // Neu bo dem theo email KHONG duoc xoa thi no dang o 19, chi mot lan sai
    // nua la cham nguong 20 va chan ngay. Da xoa thi con nguyen han muc, va
    // thu chan truoc phai la khoa ip|email o lan thu 5.
    const failed = await failManyTimes('10.9.9.9', email, MAX_FAILS_EMAIL + 3);
    assert.strictEqual(failed, MAX_FAILS_EMAIL, 'bo dem theo email phai duoc xoa khi dang nhap dung');
});

test('dang nhap dung KHONG lam moi han muc theo IP', async () => {
    // Neu lam moi, ke tan cong chi can do trung mot tai khoan bat ky la duoc
    // cap lai ca han muc IP - nguong kia thanh vo dung.
    _resetForTest();
    const ip = '4.4.4.4';

    for (let i = 0; i < MAX_FAILS_IP - 1; i += 1) {
        const outcome = await attempt(ip, `nguoi${i}@vidu.com`);
        await recordLoginFailure(outcome.keys);
    }

    // Mot lan dang nhap dung
    const ok = await attempt(ip, 'trung-roi@vidu.com');
    await clearLoginAttempts(ok.keys);

    // Chi con dung mot lan sai nua la cham nguong IP
    const outcome = await attempt(ip, 'nguoi-khac@vidu.com');
    assert.strictEqual(outcome.chan, false);
    await recordLoginFailure(outcome.keys);
    assert.strictEqual((await attempt(ip, 'nguoi-khac-nua@vidu.com')).chan, true);
});

test('phan hoi 429 co kem Retry-After', async () => {
    _resetForTest();
    await failManyTimes('5.5.5.5', 'ai-do@vidu.com', MAX_FAILS_EMAIL);

    let header = null;
    const res = {
        set(t, v) { if (t === 'Retry-After') header = v; return this; },
        status() { return this; },
        json() { return this; },
    };
    await loginRateLimit({ ip: '5.5.5.5', body: { email: 'ai-do@vidu.com' } }, res, () => {});
    assert.ok(Number(header) > 0, 'phai co Retry-After tinh bang giay');
});

test('khong co req.ip thi van chay, khong no', async () => {
    _resetForTest();
    const req = { body: { email: 'x@vidu.com' } };
    let allowed = false;
    await loginRateLimit(
        req,
        { set() { return this; }, status() { return this; }, json() { return this; } },
        () => { allowed = true; },
    );
    assert.strictEqual(allowed, true);
    assert.ok(req.loginAttemptKey.byIp.includes('unknown'));
});

test('khoa cua dang nhap khong dam vao khoa cua duong khac', async () => {
    // Kho dem la kho DUNG CHUNG (dang ky, doi mat khau cung ghi vao do). Thieu
    // tien to thi mot IP bi chan o duong dang ky se bi chan luon o dang nhap.
    _resetForTest();
    const outcome = await attempt('7.7.7.7', 'ai@vidu.com');
    assert.ok(outcome.keys.byIp.startsWith('dangnhap:'));
    assert.ok(outcome.keys.theoEmail.startsWith('dangnhap:'));
    assert.ok(outcome.keys.byAccount.startsWith('dangnhap:'));
});
