// Chay:  npm test

const test = require('node:test');
const assert = require('node:assert');

const { gocGiaoDien, lienKetXacMinh, lienKetDangNhap, MAC_DINH } = require('./diaChiGiaoDien');

test('uu tien FRONTEND_URL khi co', () => {
    const env = { FRONTEND_URL: 'https://alms.vn', FRONTEND_ORIGINS: 'https://cu.vercel.app' };
    assert.strictEqual(gocGiaoDien(env), 'https://alms.vn');
});

test('khong co FRONTEND_URL thi lay origin dau tien', () => {
    const env = { FRONTEND_ORIGINS: 'https://alms.vercel.app,https://alms.vn' };
    assert.strictEqual(gocGiaoDien(env), 'https://alms.vercel.app');
});

test('bo dau gach thua o cuoi', () => {
    // Khong bo thi lien ket thanh https://alms.vn//verify-email
    assert.strictEqual(gocGiaoDien({ FRONTEND_URL: 'https://alms.vn///' }), 'https://alms.vn');
    assert.strictEqual(
        gocGiaoDien({ FRONTEND_ORIGINS: 'https://alms.vn/ , https://x' }),
        'https://alms.vn',
    );
});

test('khong dat bien nao thi lui ve localhost', () => {
    assert.strictEqual(gocGiaoDien({}), MAC_DINH);
    assert.strictEqual(gocGiaoDien({ FRONTEND_URL: '   ', FRONTEND_ORIGINS: '' }), MAC_DINH);
});

test('lui ve localhost: im lang khi dev, keu len khi chay that, va chi keu mot lan', () => {
    // Day la su co im lang nguy hiem nhat cua ca luong: dang ky van tra 202,
    // thu van gui di, chi co dieu lien ket ben trong tro toi localhost nen
    // khong mot ai kich hoat duoc tai khoan. Phai co mot dong log doc duoc.
    //
    // Ba khang dinh nam trong CUNG mot test co chu dich: co "chi keu mot lan"
    // la bien cap module, nen tach ra thi test chay sau se an theo ket qua cua
    // test chay truoc va khong con kiem duoc gi.
    const goc = console.error;
    const daKeu = [];
    console.error = (...a) => daKeu.push(a.join(' '));

    try {
        gocGiaoDien({});
        assert.strictEqual(daKeu.length, 0, 'chay dev thi khong duoc keu');

        gocGiaoDien({ NODE_ENV: 'production' });
        assert.strictEqual(daKeu.length, 1, 'chay that thi phai keu');
        assert.match(daKeu[0], /FRONTEND_URL/);

        gocGiaoDien({ NODE_ENV: 'production' });
        gocGiaoDien({ NODE_ENV: 'production' });
        assert.strictEqual(daKeu.length, 1, 'moi luot dang ky sau khong duoc lam day log');
    } finally {
        console.error = goc;
    }
});

test('lien ket xac minh dung dinh dang va mang token', () => {
    const env = { FRONTEND_URL: 'https://alms.vn' };
    assert.strictEqual(
        lienKetXacMinh('abc123', env),
        'https://alms.vn/verify-email?token=abc123',
    );
});

test('token duoc ma hoa URL', () => {
    // Token that la hex nen khong can, nhung de mot ky tu dac biet lot vao la
    // lien ket gay giua chung va nguoi dung khong kich hoat duoc.
    const env = { FRONTEND_URL: 'https://alms.vn' };
    assert.ok(lienKetXacMinh('a b&c=d', env).endsWith('token=a%20b%26c%3Dd'));
});

test('lien ket dang nhap mo dung hop dang nhap', () => {
    // AuthModalGate mo hop khi co tham so `auth` tren dia chi.
    const env = { FRONTEND_URL: 'https://alms.vn' };
    assert.ok(lienKetDangNhap(env).includes('auth='));
});

// Diem quan trong nhat cua ca file nay.
test('dia chi KHONG bao gio lay tu dau vao cua nguoi goi', () => {
    // Ghep lien ket tu req.headers.host la lo hong host header injection: ke
    // tan cong dat Host cua rieng minh, la thu xac minh cua nan nhan tro ve
    // may ho, nan nhan bam vao la nop token. Ham nay chi doc bien moi truong -
    // test duoi day chot lai dieu do bang cach khong co duong nao truyen host
    // vao duoc.
    // Chi doc hai bien duoc phep. Moi thu khac - ke ca nhung ten trong giong
    // that nhu HOST hay X_FORWARDED_HOST - deu khong anh huong gi.
    assert.strictEqual(gocGiaoDien({ HOST: 'ke-tan-cong.com' }), MAC_DINH);
    assert.strictEqual(
        gocGiaoDien({ HOST: 'ke-tan-cong.com', FRONTEND_URL: 'https://alms.vn' }),
        'https://alms.vn',
    );
});
