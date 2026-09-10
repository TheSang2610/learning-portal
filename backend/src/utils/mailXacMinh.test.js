// Chay:  npm test

const test = require('node:test');
const assert = require('node:assert');

const { soanMailXacMinh, soanMailDaCoTaiKhoan } = require('./mailXacMinh');

const LIEN_KET = 'https://alms.example.com/verify-email?token=deadbeef';

test('thu xac minh co day du lien ket o ca ban HTML lan ban chu thuong', () => {
    // Nhieu ung dung mail chan HTML hoac nguoi dung tat anh. Thieu ban chu
    // thuong la ho khong con duong nao kich hoat.
    const m = soanMailXacMinh({ ten: 'An', lienKet: LIEN_KET });
    assert.ok(m.chuHtml.includes(LIEN_KET));
    assert.ok(m.chuThuong.includes(LIEN_KET));
    assert.ok(m.tieuDe.length > 0);
});

test('thu xac minh in ca lien ket dang chu de nguoi dung tu chep', () => {
    const m = soanMailXacMinh({ ten: 'An', lienKet: LIEN_KET });
    // Xuat hien it nhat hai lan: mot lan trong href, mot lan hien ra man hinh.
    const soLan = m.chuHtml.split(LIEN_KET).length - 1;
    assert.ok(soLan >= 2, `lien ket phai xuat hien ca trong nut lan duoi dang chu (dem duoc ${soLan})`);
});

test('ten nguoi dung duoc thoat HTML', () => {
    // Ten la chuoi NGUOI DUNG TU DAT. Khong thoat thi mot cai ten dang
    // `<img src=x onerror=...>` la ma chay ngay trong hom thu nguoi nhan.
    const m = soanMailXacMinh({
        ten: '<img src=x onerror="alert(1)">',
        lienKet: LIEN_KET,
    });
    // Cai phai bien mat la CAU TRUC the, khong phai chuoi chu "onerror":
    // sau khi thoat, `onerror=&quot;...&quot;` chi con la chu chay tren man
    // hinh, khong con la thuoc tinh cua the nao ca.
    assert.ok(!m.chuHtml.includes('<img'), 'the <img> phai bi thoat');
    assert.ok(!m.chuHtml.includes('onerror="'), 'khong duoc con thuoc tinh onerror that');
    assert.ok(m.chuHtml.includes('&lt;img'), 'phai con lai dang thuc the HTML');
});

test('lien ket cung duoc thoat truoc khi dat vao href', () => {
    const m = soanMailXacMinh({
        ten: 'An',
        lienKet: 'https://x.com/a?t=1"><script>alert(1)</script>',
    });
    assert.ok(!m.chuHtml.includes('<script>'), 'khong duoc thoat ra ngoai thuoc tinh href');
});

test('so gio hien trong thu khop tham so truyen vao', () => {
    const m = soanMailXacMinh({ ten: 'An', lienKet: LIEN_KET, soGio: 6 });
    assert.ok(m.chuHtml.includes('6 giờ'));
    assert.ok(m.chuThuong.includes('6 giờ'));
});

test('thu "da co tai khoan" KHONG mang lien ket kich hoat nao', () => {
    // Day la diem then chot: nguoi bam nut dang ky chua chac la chu dia chi.
    // Gui kem mot lien ket vao thang tai khoan la trao tai khoan cho ke la.
    const m = soanMailDaCoTaiKhoan({ lienKetDangNhap: 'https://alms.example.com/?auth=login' });
    assert.ok(!m.chuHtml.includes('verify-email'), 'khong duoc chua lien ket xac minh');
    assert.ok(!m.chuHtml.includes('token='), 'khong duoc chua token nao');
    assert.ok(!m.chuThuong.includes('token='));
});

test('thu "da co tai khoan" chi tro ve trang dang nhap', () => {
    const link = 'https://alms.example.com/?auth=login';
    const m = soanMailDaCoTaiKhoan({ lienKetDangNhap: link });
    assert.ok(m.chuHtml.includes(link));
    assert.ok(m.chuThuong.includes(link));
});

test('hai la thu co tieu de KHAC nhau', () => {
    // Chung den hai hom thu khac nhau va noi hai chuyen khac nhau. Trung tieu
    // de chi lam nguoi nhan kho hieu, khong loi gi.
    const a = soanMailXacMinh({ ten: 'An', lienKet: LIEN_KET });
    const b = soanMailDaCoTaiKhoan({ lienKetDangNhap: 'https://x' });
    assert.notStrictEqual(a.tieuDe, b.tieuDe);
});

test('ca hai la thu deu day du ba phan', () => {
    for (const m of [
        soanMailXacMinh({ ten: 'An', lienKet: LIEN_KET }),
        soanMailDaCoTaiKhoan({ lienKetDangNhap: 'https://x' }),
    ]) {
        assert.ok(m.tieuDe && m.chuHtml && m.chuThuong);
    }
});
