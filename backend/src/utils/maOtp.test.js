const test = require('node:test');
const assert = require('node:assert');

const {
    taoMa,
    maHopLe,
    bamMa,
    khopMa,
    taoPhieu,
    sanThoiGian,
    SAN_THOI_GIAN_MS,
    SO_CHU_SO,
    HAN_PHIEU_MS,
    SO_LAN_SAI_TOI_DA,
    SO_LAN_GUI_TOI_DA,
} = require('./maOtp');

const { bamToken } = require('./tokenXacMinh');

test('ma luon dung 6 chu so', () => {
    for (let i = 0; i < 200; i += 1) {
        const ma = taoMa();
        assert.strictEqual(ma.length, SO_CHU_SO);
        assert.match(ma, /^\d{6}$/);
    }
});

test('ma dung CA dai 000000..999999, khong cat khoang dau', () => {
    // Cat 000000..099999 di cho "dep" la vut bo 10% khong gian ma. Test nay
    // khong the chung minh tuyet doi, nhung 3000 lan boc ma khong lan nao ra
    // chu so dau la 0 thi gan nhu chac chan la co ai do da cat.
    let coSoKhong = false;
    for (let i = 0; i < 3000; i += 1) {
        if (taoMa()[0] === '0') {
            coSoKhong = true;
            break;
        }
    }
    assert.ok(coSoKhong, 'khong lan nao ra ma bat dau bang 0 - co ve khoang dau da bi cat');
});

test('ma khong lap lai ngay - khong phai bo dem co dinh', () => {
    const daThay = new Set();
    for (let i = 0; i < 50; i += 1) daThay.add(taoMa());
    // 50 lan boc tu mot trieu kha nang thi xac suat trung nhau la khong dang
    // ke. Ra it hon 40 gia tri khac nhau nghia la nguon ngau nhien co van de.
    assert.ok(daThay.size > 40, `chi ra ${daThay.size} ma khac nhau trong 50 lan`);
});

test('maHopLe chi nhan dung chuoi 6 chu so', () => {
    assert.ok(maHopLe('000000'));
    assert.ok(maHopLe('123456'));

    assert.ok(!maHopLe('12345'), 'thieu mot chu so');
    assert.ok(!maHopLe('1234567'), 'thua mot chu so');
    assert.ok(!maHopLe('12345a'), 'co chu cai');
    assert.ok(!maHopLe(' 123456'), 'co khoang trang');
    assert.ok(!maHopLe(''), 'chuoi rong');
});

test('maHopLe tu choi thu KHONG phai chuoi', () => {
    // Day moi la cho quan trong: than request {"ma":{"$ne":null}} ma lot qua
    // duoc la no di thang vao truy van Mongo. Xem ghi chu dau
    // utils/xacThucDauVao.js.
    assert.ok(!maHopLe(123456), 'so');
    assert.ok(!maHopLe(null));
    assert.ok(!maHopLe(undefined));
    assert.ok(!maHopLe({ $ne: null }), 'toan tu Mongo');
    assert.ok(!maHopLe(['123456']));
});

test('bam ma roi doi chieu lai thi khop', async () => {
    const ma = '482913';
    const bam = await bamMa(ma);
    assert.ok(await khopMa(ma, bam));
});

test('ma khac thi khong khop', async () => {
    const bam = await bamMa('482913');
    assert.ok(!(await khopMa('482914', bam)));
    assert.ok(!(await khopMa('000000', bam)));
});

test('ban bam KHONG chua ma goc', async () => {
    // Ca ly do de bam la de ai doc duoc CSDL cung khong lay ra duoc ma.
    const ma = '482913';
    const bam = await bamMa(ma);
    assert.ok(!bam.includes(ma));
});

test('bam hai lan cung mot ma ra hai ban bam khac nhau', async () => {
    // bcrypt sinh muoi ngau nhien moi lan. Neu hai ban bam giong nhau thi
    // nghia la khong co muoi - va mot bang tra cuu mot trieu dong la do het.
    const a = await bamMa('482913');
    const b = await bamMa('482913');
    assert.notStrictEqual(a, b);
    assert.ok(await khopMa('482913', a));
    assert.ok(await khopMa('482913', b));
});

test('khopMa voi ban bam rong tra ve false chu khong nem', async () => {
    // Tai khoan chua tung yeu cau ma thi resetOtpHash la undefined. Neu ham
    // nay nem thi duong kiem ma thanh 500 - va mot cai 500 chi xay ra voi
    // dung nhung dia chi co that cung la mot tin hieu phan biet duoc.
    assert.strictEqual(await khopMa('123456', undefined), false);
    assert.strictEqual(await khopMa('123456', null), false);
    assert.strictEqual(await khopMa('123456', ''), false);
});

test('khopMa voi ban bam rac tra ve false chu khong nem', async () => {
    assert.strictEqual(await khopMa('123456', 'khong-phai-bcrypt'), false);
});

test('phieu: cai di ve trinh duyet va cai di vao CSDL la hai thu khac nhau', () => {
    const { phieu, bam } = taoPhieu();
    assert.notStrictEqual(phieu, bam);
    assert.ok(!bam.includes(phieu));
});

test('phieu duoc bam bang dung ham bamToken dung chung', () => {
    // Buoc dat lai tra cuu bang bamToken(phieu). Lech ham bam o hai dau la
    // khong ai dat lai duoc mat khau, va loi do im lang.
    const { phieu, bam } = taoPhieu();
    assert.strictEqual(bam, bamToken(phieu));
});

test('phieu du dai de khong do duoc', () => {
    const { phieu } = taoPhieu();
    // 32 byte -> 64 ky tu hex.
    assert.strictEqual(phieu.length, 64);
    assert.match(phieu, /^[0-9a-f]+$/);
});

test('hai phieu lien tiep khong trung nhau', () => {
    const a = taoPhieu().phieu;
    const b = taoPhieu().phieu;
    assert.notStrictEqual(a, b);
});

test('han cua phieu tinh tu moc truyen vao', () => {
    const moc = 1_700_000_000_000;
    const { hetHan } = taoPhieu(moc);
    assert.strictEqual(hetHan.getTime(), moc + HAN_PHIEU_MS);
});

test('cac nguong dung bang con so chu du an da chot', () => {
    // Doi mot trong hai con so nay la doi chinh sach, khong phai don dep. Test
    // nay de viec do phai la mot quyet dinh co y.
    assert.strictEqual(SO_LAN_SAI_TOI_DA, 3);
    assert.strictEqual(SO_LAN_GUI_TOI_DA, 2);
});

/* ------------------------- san thoi gian -------------------------------- */

test('sanThoiGian keo nhanh NHANH len bang san', async () => {
    // Cai bay ma ham nay sinh ra de vo: duong quen mat khau tra cung mot cau
    // cho moi truong hop, nhung nhanh "dia chi co that" phai bam bcrypt va
    // gui mot la thu, con nhanh "dia chi bia" tra ve ngay. Chenh gan tram lan
    // - do bang dong ho la quet duoc ca danh sach email.
    const batDau = Date.now();
    await sanThoiGian(batDau, 120);
    assert.ok(Date.now() - batDau >= 115, 'khong doi du san');
});

test('sanThoiGian KHONG keo dai them viec da cham san', async () => {
    // Viec that da lau hon san thi tra ve ngay, khong cong don.
    const batDau = Date.now() - 500;
    const truoc = Date.now();
    await sanThoiGian(batDau, 120);
    assert.ok(Date.now() - truoc < 60, 'cong don them thoi gian cho');
});

test('san mac dinh du dai de che mot luot gui thu', async () => {
    // Gui thu qua SMTP thuong mat 0,5-1,5 giay. San ngan hon khoang do thi
    // no khong che duoc gi.
    assert.ok(SAN_THOI_GIAN_MS >= 1000, 'san qua ngan, khong che duoc luot gui thu');
});
