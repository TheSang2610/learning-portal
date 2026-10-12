const test = require('node:test');
const assert = require('node:assert');
const express = require('express');

const { guardObjectIds, ID_PARAMS } = require('./validObjectId');

// Router gia: ghi lai cac param da dang ky va cho goi thu tung cai.
const fakeRouter = () => {
    const registered = {};
    const r = {
        param(name, fn) {
            registered[name] = fn;
            return r;
        },
    };
    return { r, registered };
};

// Chay mot param handler, tra ve { status, body, canPass }
const call = (fn, value) => {
    let status = null;
    let body = null;
    let canPass = false;
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
        canPass = true;
    }, value);
    return { status, body, canPass };
};

test('capIdHopLe: dang ky dung nhung tham so la ObjectId', () => {
    const { r, registered } = fakeRouter();
    guardObjectIds(r);
    assert.deepStrictEqual(Object.keys(registered).sort(), [...ID_PARAMS].sort());
});

test('capIdHopLe: KHONG dang ky cac tham so dang slug', () => {
    const { r, registered } = fakeRouter();
    guardObjectIds(r);
    // Dang ky nham nhung cai nay se lam hong moi duong tra cuu theo slug.
    for (const name of ['slug', 'courseSlug', 'lessonSlug', 'code', 'verificationCode']) {
        assert.ok(!(name in registered), `${name} khong duoc coi la ObjectId`);
    }
});

test('id hop le thi di tiep', () => {
    const { r, registered } = fakeRouter();
    guardObjectIds(r);
    const outcome = call(registered.id, '6a801a3f49e450baa602e05a');
    assert.strictEqual(outcome.canPass, true);
    assert.strictEqual(outcome.status, null);
});

// Day la loi that: truoc khi co lop nay, 12 duong tra 500 chi vi id go sai.
test('id sai dinh dang thi tra 404 chu khong phai 500', () => {
    const { r, registered } = fakeRouter();
    guardObjectIds(r);
    for (const xau of ['khong-phai-objectid', '../../etc/passwd', '%00', 'null']) {
        const outcome = call(registered.id, xau);
        assert.strictEqual(outcome.canPass, false, `${xau} khong duoc di tiep`);
        assert.strictEqual(outcome.status, 404, `${xau} phai la 404`);
    }
});

test('thong bao 404 khong he lo he thong dung ObjectId', () => {
    const { r, registered } = fakeRouter();
    guardObjectIds(r);
    const outcome = call(registered.id, 'sai');
    assert.strictEqual(outcome.body.message, 'Không tìm thấy');
    assert.ok(!/ObjectId|Cast|Mongo/i.test(outcome.body.message));
});

test('moi tham so id deu duoc chan, khong chi rieng "id"', () => {
    const { r, registered } = fakeRouter();
    guardObjectIds(r);
    for (const name of ID_PARAMS) {
        assert.strictEqual(call(registered[name], 'sai').status, 404, `${name} chua duoc chan`);
    }
});

// Gan duoc vao router that cua Express, va tra lai chinh router do de xau chuoi
test('gan duoc vao router that cua Express', () => {
    const router = express.Router();
    assert.doesNotThrow(() => guardObjectIds(router));
    assert.strictEqual(guardObjectIds(router), router);
});
