// Chay:  npm test
//
// Bo gioi han dang nhap la thu de tin la "chac dung roi" ma that ra khong chay.
// Cac test duoi day kiem ca hai chieu: co chan ke tan cong that khong, va co
// chan nham nguoi dung binh thuong khong.

const test = require('node:test');
const assert = require('node:assert');

const {
    loginRateLimit,
    recordLoginFailure,
    clearLoginAttempts,
    _resetForTest,
    MAX_FAILS_EMAIL,
    MAX_FAILS_IP,
} = require('./loginRateLimit');

// Gia lap mot luot dang nhap. Tra ve { chan, ma, keys }.
const thu = (ip, email) => {
    const req = { ip, body: { email } };
    let ma = null;
    let choQua = false;
    const res = {
        set() { return this; },
        status(m) { ma = m; return this; },
        json() { return this; },
    };
    loginRateLimit(req, res, () => { choQua = true; });
    return { chan: !choQua, ma, keys: req.loginAttemptKey };
};

// Dang nhap sai n lan lien tiep.
const saiNhieuLan = (ip, email, n) => {
    for (let i = 0; i < n; i += 1) {
        const kq = thu(ip, email);
        if (kq.chan) return i; // da bi chan tu lan thu i
        recordLoginFailure(kq.keys);
    }
    return n;
};

test('do mat khau MOT tai khoan: bi chan sau dung 5 lan sai', () => {
    _resetForTest();
    const daSai = saiNhieuLan('1.1.1.1', 'nan-nhan@vidu.com', 10);
    assert.strictEqual(daSai, MAX_FAILS_EMAIL, 'phai chan ngay sau lan sai thu 5');

    const kq = thu('1.1.1.1', 'nan-nhan@vidu.com');
    assert.strictEqual(kq.chan, true);
    assert.strictEqual(kq.ma, 429);
});

test('thu MOT mat khau tren NHIEU email: van bi chan nho bo dem theo IP', () => {
    // Day chinh la lo hong cua ban cu: moi email mot bo dem moi nen khong bao
    // gio cham nguong. Nay bo dem theo IP phai bat duoc.
    _resetForTest();

    let soLanQua = 0;
    for (let i = 0; i < MAX_FAILS_IP + 20; i += 1) {
        const kq = thu('9.9.9.9', `nguoi${i}@vidu.com`);
        if (kq.chan) break;
        soLanQua += 1;
        recordLoginFailure(kq.keys);
    }

    assert.strictEqual(soLanQua, MAX_FAILS_IP, `phai chan sau ${MAX_FAILS_IP} lan sai tu cung mot IP`);
    assert.strictEqual(thu('9.9.9.9', 'nguoi-moi-tinh@vidu.com').chan, true);
});

test('nguoi dung o IP khac khong bi va lay', () => {
    _resetForTest();
    saiNhieuLan('1.1.1.1', 'nan-nhan@vidu.com', 10);
    assert.strictEqual(thu('2.2.2.2', 'nan-nhan@vidu.com').chan, false);
});

test('dang nhap dung thi xoa bo dem cua email do', () => {
    _resetForTest();
    const ip = '3.3.3.3';
    const email = 'toi@vidu.com';

    // Sai 4 lan (chua toi nguong 5)
    saiNhieuLan(ip, email, MAX_FAILS_EMAIL - 1);

    const kq = thu(ip, email);
    assert.strictEqual(kq.chan, false);
    clearLoginAttempts(kq.keys); // dang nhap dung

    // Duoc dem lai tu dau
    const daSai = saiNhieuLan(ip, email, MAX_FAILS_EMAIL + 3);
    assert.strictEqual(daSai, MAX_FAILS_EMAIL);
});

test('dang nhap dung KHONG lam moi han muc theo IP', () => {
    // Neu lam moi, ke tan cong chi can do trung mot tai khoan bat ky la duoc
    // cap lai ca han muc IP - nguong kia thanh vo dung.
    _resetForTest();
    const ip = '4.4.4.4';

    for (let i = 0; i < MAX_FAILS_IP - 1; i += 1) {
        const kq = thu(ip, `nguoi${i}@vidu.com`);
        recordLoginFailure(kq.keys);
    }

    // Mot lan dang nhap dung
    const ok = thu(ip, 'trung-roi@vidu.com');
    clearLoginAttempts(ok.keys);

    // Chi con dung mot lan sai nua la cham nguong IP
    const kq = thu(ip, 'nguoi-khac@vidu.com');
    assert.strictEqual(kq.chan, false);
    recordLoginFailure(kq.keys);
    assert.strictEqual(thu(ip, 'nguoi-khac-nua@vidu.com').chan, true);
});

test('phan hoi 429 co kem Retry-After', () => {
    _resetForTest();
    saiNhieuLan('5.5.5.5', 'ai-do@vidu.com', MAX_FAILS_EMAIL);

    let header = null;
    const res = {
        set(t, v) { if (t === 'Retry-After') header = v; return this; },
        status() { return this; },
        json() { return this; },
    };
    loginRateLimit({ ip: '5.5.5.5', body: { email: 'ai-do@vidu.com' } }, res, () => {});
    assert.ok(Number(header) > 0, 'phai co Retry-After tinh bang giay');
});

test('khong co req.ip thi van chay, khong no', () => {
    _resetForTest();
    const req = { body: { email: 'x@vidu.com' } };
    let choQua = false;
    loginRateLimit(req, { set() { return this; }, status() { return this; }, json() { return this; } },
        () => { choQua = true; });
    assert.strictEqual(choQua, true);
    assert.ok(req.loginAttemptKey.theoIp.includes('unknown'));
});
