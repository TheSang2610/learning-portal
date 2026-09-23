// Chay:  npm test
//
// Chi test notificationContent.js - phan HAM THUAN. Viec ghi thong bao xuong CSDL
// nam o notificationController.js va khong test o day: CI khong co MONGO_URI, va
// mot test phu thuoc CSDL la mot test se do vi ly do khong lien quan gi toi ma
// nguon.

const test = require('node:test');
const assert = require('node:assert');

const {
    dungThongBao,
    duongDanNoiBo,
    catChu,
    LOAI_HOP_LE,
    DAI_TIEU_DE_TOI_DA,
    DAI_NOI_DUNG_TOI_DA,
} = require('./notificationContent');

test('duongDanNoiBo chan moi dia chi ben ngoai', () => {
    // Day la rao chan quan trong nhat cua file: duong dan di thang vao the <a>.
    assert.strictEqual(duongDanNoiBo('https://vi-du.com/bay'), '');
    assert.strictEqual(duongDanNoiBo('http://vi-du.com'), '');

    // '//vi-du.com' trong bi hieu la duong dan noi bo nhung trinh duyet doc no
    // la dia chi ngoai theo giao thuc hien tai.
    assert.strictEqual(duongDanNoiBo('//vi-du.com'), '');

    assert.strictEqual(duongDanNoiBo('javascript:alert(1)'), '');
    assert.strictEqual(duongDanNoiBo('/courses'), '/courses');
    assert.strictEqual(duongDanNoiBo('  /user/profile  '), '/user/profile');
});

test('duongDanNoiBo bo duong dan qua dai thay vi cat cut', () => {
    // Cat mot duong dan la tao ra mot duong dan KHAC, tro toi cho khong ai
    // ngo. Tha khong co lien ket con hon co lien ket sai.
    const dai = '/' + 'a'.repeat(600);
    assert.strictEqual(duongDanNoiBo(dai), '');
});

test('duongDanNoiBo khong vo khi nhan gia tri khong phai chuoi', () => {
    assert.strictEqual(duongDanNoiBo(null), '');
    assert.strictEqual(duongDanNoiBo(undefined), '');
    assert.strictEqual(duongDanNoiBo(123), '');
    assert.strictEqual(duongDanNoiBo({}), '');
});

test('catChu gom khoang trang va cat dung do dai', () => {
    assert.strictEqual(catChu('  hai   khoang  ', 100), 'hai khoang');
    assert.strictEqual(catChu('abcdef', 3), 'ab…');
    assert.strictEqual(catChu('abc', 3), 'abc');
    assert.strictEqual(catChu(null, 10), '');
});

test('dungThongBao tu choi loai khong co trong bang', () => {
    const kq = dungThongBao('loai_bia_ra');
    assert.strictEqual(kq.ok, false);
    assert.match(kq.loi, /khong hop le/);
});

test('moi loai trong LOAI_HOP_LE deu dung duoc, khong loai nao nem ngoai le', () => {
    // Bang enum trong model va bang noi dung o day phai khop nhau. Test nay bat
    // truong hop them loai vao model ma quen viet noi dung cho no.
    for (const loai of LOAI_HOP_LE) {
        const kq = dungThongBao(loai, {});
        assert.strictEqual(kq.ok, true, `loai ${loai} phai dung duoc voi du lieu rong`);
        assert.ok(kq.thongBao.tieuDe.length > 0, `loai ${loai} phai co tieu de`);
        assert.strictEqual(kq.thongBao.loai, loai);
    }
});

test('don_duoc_duyet co ten khoa thi dan ten vao, khong co thi van chay', () => {
    const co = dungThongBao('don_duoc_duyet', { tenKhoa: 'Lập trình C', slugKhoa: 'lap-trinh-c' });
    assert.ok(co.thongBao.noiDung.includes('Lập trình C'));
    assert.strictEqual(co.thongBao.duongDan, '/course?slug=lap-trinh-c');

    const khong = dungThongBao('don_duoc_duyet', {});
    assert.strictEqual(khong.ok, true);
    assert.strictEqual(khong.thongBao.duongDan, '/user/profile');
});

test('slug duoc ma hoa nen khong pha duoc chuoi truy van', () => {
    // Slug la du lieu tu CSDL, nhung khong co gi bao dam no sach: admin go tay
    // duoc. Khong ma hoa thi mot slug chua '&' se de ra tham so la.
    const kq = dungThongBao('don_duoc_duyet', { tenKhoa: 'X', slugKhoa: 'a&b=c' });
    assert.strictEqual(kq.thongBao.duongDan, '/course?slug=a%26b%3Dc');
});

test('he_thong khong cho nhet duong dan ngoai vao', () => {
    // Loai nay nhan duong dan tu noi goi nen la cho de bi loi nhat.
    const kq = dungThongBao('he_thong', {
        tieuDe: 'Bao tri',
        noiDung: 'He thong bao tri luc 2h sang.',
        duongDan: 'https://trang-gia.com',
    });
    assert.strictEqual(kq.ok, true);
    assert.strictEqual(kq.thongBao.duongDan, '');
});

test('tieu de va noi dung khong bao gio vuot nguong cua model', () => {
    // Vuot nguong la Mongoose nem loi validate, ma noi goi thi dang giua chung
    // viec duyet don - hong o day la hong ca viec chinh.
    const kq = dungThongBao('he_thong', {
        tieuDe: 'T'.repeat(500),
        noiDung: 'N'.repeat(3000),
        duongDan: '/courses',
    });
    assert.ok(kq.thongBao.tieuDe.length <= DAI_TIEU_DE_TOI_DA);
    assert.ok(kq.thongBao.noiDung.length <= DAI_NOI_DUNG_TOI_DA);
});

test('coin_duoc_cong dinh dang so theo kieu Viet Nam', () => {
    const kq = dungThongBao('coin_duoc_cong', { soCoin: 50000 });
    assert.ok(kq.thongBao.noiDung.includes('50.000'));

    // Thieu so thi van ra cau doc duoc, khong ra chu "undefined".
    const thieu = dungThongBao('coin_duoc_cong', {});
    assert.ok(!thieu.thongBao.noiDung.includes('undefined'));
});
