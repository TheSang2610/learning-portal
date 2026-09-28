// Chay:  npm test
//
// Chi test rankDocuments.js - phan HAM THUAN. Viec doc lich su va tai lieu tu
// CSDL nam o documentController va khong test o day: CI khong co MONGO_URI.

const test = require('node:test');
const assert = require('node:assert');

const {
    chuanHoaMon,
    tachTuKhoa,
    tongHopLichSu,
    gopLichSuTheoTaiLieu,
    chamDiem,
    xepHangTaiLieu,
    DIEM_CUNG_MON_DANG_XEM,
    DIEM_MON_QUAN_TAM_TOI_DA,
    DIEM_TU_KHOA_TOI_DA,
    DIEM_PHO_BIEN_TOI_DA,
} = require('./rankDocuments');

const tl = (id, them = {}) => ({
    _id: id,
    title: `Tai lieu ${id}`,
    monHoc: '',
    downloadCount: 0,
    createdAt: '2026-01-01T00:00:00.000Z',
    ...them,
});

// ------------------------------- chuan hoa -------------------------------

test('cung mot mon viet nhieu cach thi ra cung mot khoa', () => {
    // Day la ly do co monHocKey: khong gop thi "cung mon" gan nhu khong trung.
    const k = chuanHoaMon('Cấu trúc dữ liệu');
    assert.strictEqual(k, 'cau truc du lieu');
    assert.strictEqual(chuanHoaMon('cau truc du lieu'), k);
    assert.strictEqual(chuanHoaMon('  Cấu  trúc   dữ liệu '), k);
    assert.strictEqual(chuanHoaMon('CẤU TRÚC DỮ LIỆU'), k);
});

test('chu đ duoc doi thanh d', () => {
    // NFD khong tach duoc "đ" vi no khong phai chu co dau ghep.
    assert.strictEqual(chuanHoaMon('Đại số'), 'dai so');
});

test('mon rong hoac thieu thi ra chuoi rong', () => {
    assert.strictEqual(chuanHoaMon(''), '');
    assert.strictEqual(chuanHoaMon(undefined), '');
    assert.strictEqual(chuanHoaMon(null), '');
});

test('tach tu khoa bo tu qua chung va tu 1 ky tu', () => {
    // "tai lieu", "giao trinh", "mon" co trong gan nhu moi tieu de.
    const t = tachTuKhoa('Giáo trình môn CTDL & GT tài liệu ôn tập C');
    assert.deepStrictEqual(t, ['ctdl', 'gt']);
});

test('tach tu khoa khong tra ve tu trung nhau', () => {
    assert.deepStrictEqual(tachTuKhoa('Java java JAVA'), ['java']);
});

// ------------------------------- lich su -------------------------------

test('tai tinh nang hon xem khi gom mon quan tam', () => {
    const { monQuanTam } = tongHopLichSu([
        { loai: 'xem', monHocKey: 'toan' },
        { loai: 'tai', monHocKey: 'ly' },
    ]);
    assert.ok(monQuanTam.get('ly') > monQuanTam.get('toan'));
});

test('chi tai lieu DA TAI moi vao danh sach loai tru, da xem thi khong', () => {
    // Da xem ma chua tai co the la luong lu - van nen goi y lai.
    const { daTai } = tongHopLichSu([
        { loai: 'xem', document: 'a', monHocKey: 'x' },
        { loai: 'tai', document: 'b', monHocKey: 'x' },
    ]);
    assert.ok(daTai.has('b'));
    assert.ok(!daTai.has('a'));
});

test('tu khoa lay tu lan tim, khong lay tu lan xem', () => {
    const { tuKhoa } = tongHopLichSu([
        { loai: 'tim', tuKhoa: 'đồ thị Dijkstra' },
        { loai: 'xem', tuKhoa: 'bo qua cai nay', monHocKey: 'x' },
    ]);
    assert.deepStrictEqual(tuKhoa, ['do', 'thi', 'dijkstra']);
});

test('"thi" va "co" KHONG bi coi la tu bo qua', () => {
    // Hai tu nay tung nam trong TU_BO_QUA. Bo dau xong, "thì" (lien tu) trung
    // mat chu voi "thi" (đề thi) va "thị" (đồ thị); "có" trung voi "cơ" (Cơ
    // sở dữ liệu). Voi kho tai lieu hoc tap, "de thi" la tin hieu quy nhat.
    assert.ok(tachTuKhoa('Đề thi cuối kỳ').includes('thi'));
    assert.ok(tachTuKhoa('Cơ sở dữ liệu').includes('co'));
});

test('chi lay tu khoa trong 10 lan tim gan nhat', () => {
    const hoatDong = [];
    for (let i = 0; i < 10; i++) hoatDong.push({ loai: 'tim', tuKhoa: `moi${i}` });
    hoatDong.push({ loai: 'tim', tuKhoa: 'cunhat' }); // lan thu 11, cu nhat
    const { tuKhoa } = tongHopLichSu(hoatDong);
    assert.ok(!tuKhoa.includes('cunhat'));
});

test('lich su rong hay sai kieu khong lam no', () => {
    for (const dauVao of [undefined, null, [], [null, {}, { loai: 'la' }]]) {
        const kq = tongHopLichSu(dauVao);
        assert.strictEqual(kq.monQuanTam.size, 0);
        assert.strictEqual(kq.daTai.size, 0);
        assert.deepStrictEqual(kq.tuKhoa, []);
    }
});

// --------------------------- gop lich su de hien ---------------------------

test('moi tai lieu chi con mot dong, lay lan gan nhat', () => {
    const kq = gopLichSuTheoTaiLieu([
        { loai: 'xem', document: 'a', createdAt: '2026-09-03' },
        { loai: 'xem', document: 'b', createdAt: '2026-09-02' },
        { loai: 'xem', document: 'a', createdAt: '2026-09-01' },
    ]);
    assert.deepStrictEqual(kq.map((x) => x.document), ['a', 'b']);
    assert.strictEqual(kq[0].lanCuoi, '2026-09-03');
});

test('tung tai du mot lan thi danh dau da tai, du lan gan nhat chi la xem', () => {
    const [a] = gopLichSuTheoTaiLieu([
        { loai: 'xem', document: 'a', createdAt: '2026-09-03' },
        { loai: 'tai', document: 'a', createdAt: '2026-09-01' },
    ]);
    assert.strictEqual(a.daTai, true);
});

test('lan tim kiem khong vao lich su tai lieu', () => {
    const kq = gopLichSuTheoTaiLieu([
        { loai: 'tim', tuKhoa: 'do thi', createdAt: '2026-09-03' },
        { loai: 'xem', document: 'a', createdAt: '2026-09-01' },
    ]);
    assert.deepStrictEqual(kq.map((x) => x.document), ['a']);
});

test('gop lich su rong hay sai kieu tra ve mang rong', () => {
    assert.deepStrictEqual(gopLichSuTheoTaiLieu(undefined), []);
    assert.deepStrictEqual(gopLichSuTheoTaiLieu([null, {}, { loai: 'xem' }]), []);
});

// ------------------------------- cham diem -------------------------------

test('cung mon voi tai lieu dang xem duoc diem cao nhat va noi ro ten mon', () => {
    const { diem, vi } = chamDiem(tl('a', { monHoc: 'Cấu trúc dữ liệu' }), {
        monDangXem: 'cau truc du lieu',
    });
    assert.strictEqual(diem, DIEM_CUNG_MON_DANG_XEM);
    assert.strictEqual(vi, 'Cùng môn Cấu trúc dữ liệu');
});

test('cung mon dang xem thi KHONG cong them diem lich su cho cung mon do', () => {
    // Dem hai lan mot tin hieu se day tai lieu cung mon vuot xa moi thu khac.
    const { diem } = chamDiem(tl('a', { monHoc: 'Toán' }), {
        monDangXem: 'toan',
        monQuanTam: new Map([['toan', 99]]),
    });
    assert.strictEqual(diem, DIEM_CUNG_MON_DANG_XEM);
});

test('diem mon quan tam co tran', () => {
    const { diem } = chamDiem(tl('a', { monHoc: 'Toán' }), {
        monQuanTam: new Map([['toan', 1000]]),
    });
    assert.strictEqual(diem, DIEM_MON_QUAN_TAM_TOI_DA);
});

test('diem tu khoa co tran, tieu de dai khong vuot mat tai lieu cung mon', () => {
    const nhieuTu = ['aa', 'bb', 'cc', 'dd', 'ee', 'ff'];
    const khopNhieu = chamDiem(tl('a', { title: nhieuTu.join(' ') }), { tuKhoa: nhieuTu });
    assert.strictEqual(khopNhieu.diem, DIEM_TU_KHOA_TOI_DA);
    assert.ok(khopNhieu.diem < DIEM_CUNG_MON_DANG_XEM);
});

test('cau giai thich doi theo nguon tu khoa', () => {
    const doc = tl('a', { title: 'Thuat toan Dijkstra' });
    assert.strictEqual(
        chamDiem(doc, { tuKhoa: ['dijkstra'], nguonTuKhoa: 'tim' }).vi,
        'Liên quan tới "dijkstra" bạn đã tìm',
    );
    assert.strictEqual(
        chamDiem(doc, { tuKhoa: ['dijkstra'], nguonTuKhoa: 'tieuDe' }).vi,
        'Nội dung gần với tài liệu đang xem',
    );
});

test('co nhieu ly do thi cau cu the nhat duoc chon', () => {
    // Vua cung mon vua duoc tai nhieu: "cung mon X" noi nhieu hon "duoc tai nhieu".
    const { vi } = chamDiem(tl('a', { monHoc: 'Toán', downloadCount: 50 }), {
        monDangXem: 'toan',
    });
    assert.strictEqual(vi, 'Cùng môn Toán');
});

test('diem pho bien co tran', () => {
    const { diem, vi } = chamDiem(tl('a', { downloadCount: 100000 }));
    assert.strictEqual(diem, DIEM_PHO_BIEN_TOI_DA);
    assert.strictEqual(vi, 'Được tải nhiều');
});

test('khong co tin hieu nao thi diem 0 va van co cau giai thich', () => {
    const { diem, vi } = chamDiem(tl('a'));
    assert.strictEqual(diem, 0);
    assert.strictEqual(vi, 'Mới được chia sẻ');
});

test('tai lieu cu chua co monHocKey van so duoc mon', () => {
    // Tai lieu dang truoc khi co truong monHocKey: tinh khoa tai cho tu monHoc.
    const { diem } = chamDiem({ _id: 'a', title: 'x', monHoc: 'Vật lý' }, { monDangXem: 'vat ly' });
    assert.strictEqual(diem, DIEM_CUNG_MON_DANG_XEM);
});

// ------------------------------- xep hang -------------------------------

test('tai lieu trong danh sach loai tru bi bo', () => {
    const kq = xepHangTaiLieu([tl('a'), tl('b')], { loaiTru: new Set(['a']) });
    assert.strictEqual(kq.length, 1);
    assert.strictEqual(kq[0]._id, 'b');
});

test('cung mon xep truoc khac mon', () => {
    const kq = xepHangTaiLieu(
        [tl('khac', { monHoc: 'Lý' }), tl('cung', { monHoc: 'Toán' })],
        { monDangXem: 'toan' },
    );
    assert.strictEqual(kq[0]._id, 'cung');
});

test('bang diem thi tai lieu moi hon len truoc', () => {
    const kq = xepHangTaiLieu([
        tl('cu', { createdAt: '2026-01-01T00:00:00.000Z' }),
        tl('moi', { createdAt: '2026-06-01T00:00:00.000Z' }),
    ]);
    assert.strictEqual(kq[0]._id, 'moi');
});

test('moi goi y co diem va cau giai thich', () => {
    const [d] = xepHangTaiLieu([tl('a')]);
    assert.strictEqual(typeof d.diemGoiY, 'number');
    assert.strictEqual(typeof d.viSaoGoiY, 'string');
});

test('so luong bi chan trong khoang 1 den 24', () => {
    const nhieu = Array.from({ length: 40 }, (_, i) => tl(String(i)));
    assert.strictEqual(xepHangTaiLieu(nhieu, {}, 999).length, 24);
    assert.strictEqual(xepHangTaiLieu(nhieu, {}, 0).length, 1);
});

test('dau vao khong phai mang thi tra ve mang rong', () => {
    assert.deepStrictEqual(xepHangTaiLieu(null), []);
    assert.deepStrictEqual(xepHangTaiLieu(undefined), []);
});

// ---------------------------------------------------------------------------
// Mot tai lieu nhieu mon
// ---------------------------------------------------------------------------

test('nhieu mon: trung MOT mon voi tai lieu dang xem la "cung mon", noi dung mon trung', () => {
    const { chamDiem, DIEM_CUNG_MON_DANG_XEM } = require('./rankDocuments');
    const r = chamDiem(
        { title: 'x', monHoc: ['Toán', 'Toán rời rạc'], monHocKey: ['toan', 'toan roi rac'] },
        { monDangXem: ['giai tich', 'toan roi rac'] },
    );
    assert.strictEqual(r.diem, DIEM_CUNG_MON_DANG_XEM);
    assert.strictEqual(r.vi, 'Cùng môn Toán rời rạc');
});

test('nhieu mon: trung hai mon KHONG cong don diem cung mon', () => {
    const { chamDiem, DIEM_CUNG_MON_DANG_XEM } = require('./rankDocuments');
    const r = chamDiem(
        { title: 'x', monHoc: ['Toán', 'Toán rời rạc'], monHocKey: ['toan', 'toan roi rac'] },
        { monDangXem: ['toan', 'toan roi rac'] },
    );
    assert.strictEqual(r.diem, DIEM_CUNG_MON_DANG_XEM);
});

test('nhieu mon: lich su chon mon co trong so cao nhat de giai thich', () => {
    const { chamDiem } = require('./rankDocuments');
    const r = chamDiem(
        { title: 'x', monHoc: ['Toán', 'Triết'], monHocKey: ['toan', 'triet'] },
        { monQuanTam: new Map([['toan', 1], ['triet', 3]]) },
    );
    assert.strictEqual(r.vi, 'Môn Triết bạn hay xem');
    assert.strictEqual(r.diem, 30);
});

test('tongHopLichSu: ban ghi mang nhieu mon tinh cho moi mon, ban ghi cu dang chuoi van doc duoc', () => {
    const { tongHopLichSu } = require('./rankDocuments');
    const { monQuanTam } = tongHopLichSu([
        { loai: 'tai', document: 'a', monHocKey: ['toan', 'toan cao cap'] },
        { loai: 'xem', document: 'b', monHocKey: 'toan' },
    ]);
    assert.strictEqual(monQuanTam.get('toan'), 4);
    assert.strictEqual(monQuanTam.get('toan cao cap'), 3);
});

test('cacMonCua: tai lieu cu chi co ten dang chuoi van ra khoa', () => {
    const { cacMonCua } = require('./rankDocuments');
    assert.deepStrictEqual(cacMonCua({ monHoc: 'Cấu trúc dữ liệu' }), [
        { key: 'cau truc du lieu', ten: 'Cấu trúc dữ liệu' },
    ]);
    assert.deepStrictEqual(cacMonCua({ monHoc: [], monHocKey: [] }), []);
});
