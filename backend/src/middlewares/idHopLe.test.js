const test = require('node:test');
const assert = require('node:assert');
const express = require('express');

const { capIdHopLe, THAM_SO_ID } = require('./idHopLe');

// Router gia: ghi lai cac param da dang ky va cho goi thu tung cai.
const routerGia = () => {
    const daDangKy = {};
    const r = {
        param(ten, fn) {
            daDangKy[ten] = fn;
            return r;
        },
    };
    return { r, daDangKy };
};

// Chay mot param handler, tra ve { status, body, quaDuoc }
const goi = (fn, giaTri) => {
    let status = null;
    let body = null;
    let quaDuoc = false;
    const res = {
        status(m) {
            status = m;
            return res;
        },
        json(b) {
            body = b;
            return res;
        },
    };
    fn({}, res, () => {
        quaDuoc = true;
    }, giaTri);
    return { status, body, quaDuoc };
};

test('capIdHopLe: dang ky dung nhung tham so la ObjectId', () => {
    const { r, daDangKy } = routerGia();
    capIdHopLe(r);
    assert.deepStrictEqual(Object.keys(daDangKy).sort(), [...THAM_SO_ID].sort());
});

test('capIdHopLe: KHONG dang ky cac tham so dang slug', () => {
    const { r, daDangKy } = routerGia();
    capIdHopLe(r);
    // Dang ky nham nhung cai nay se lam hong moi duong tra cuu theo slug.
    for (const ten of ['slug', 'courseSlug', 'lessonSlug', 'code', 'verificationCode']) {
        assert.ok(!(ten in daDangKy), `${ten} khong duoc coi la ObjectId`);
    }
});

test('id hop le thi di tiep', () => {
    const { r, daDangKy } = routerGia();
    capIdHopLe(r);
    const kq = goi(daDangKy.id, '6a801a3f49e450baa602e05a');
    assert.strictEqual(kq.quaDuoc, true);
    assert.strictEqual(kq.status, null);
});

// Day la loi that: truoc khi co lop nay, 12 duong tra 500 chi vi id go sai.
test('id sai dinh dang thi tra 404 chu khong phai 500', () => {
    const { r, daDangKy } = routerGia();
    capIdHopLe(r);
    for (const xau of ['khong-phai-objectid', '../../etc/passwd', '%00', 'null']) {
        const kq = goi(daDangKy.id, xau);
        assert.strictEqual(kq.quaDuoc, false, `${xau} khong duoc di tiep`);
        assert.strictEqual(kq.status, 404, `${xau} phai la 404`);
    }
});

test('thong bao 404 khong he lo he thong dung ObjectId', () => {
    const { r, daDangKy } = routerGia();
    capIdHopLe(r);
    const kq = goi(daDangKy.id, 'sai');
    assert.strictEqual(kq.body.message, 'Không tìm thấy');
    assert.ok(!/ObjectId|Cast|Mongo/i.test(kq.body.message));
});

test('moi tham so id deu duoc chan, khong chi rieng "id"', () => {
    const { r, daDangKy } = routerGia();
    capIdHopLe(r);
    for (const ten of THAM_SO_ID) {
        assert.strictEqual(goi(daDangKy[ten], 'sai').status, 404, `${ten} chua duoc chan`);
    }
});

// Gan duoc vao router that cua Express, va tra lai chinh router do de xau chuoi
test('gan duoc vao router that cua Express', () => {
    const router = express.Router();
    assert.doesNotThrow(() => capIdHopLe(router));
    assert.strictEqual(capIdHopLe(router), router);
});
