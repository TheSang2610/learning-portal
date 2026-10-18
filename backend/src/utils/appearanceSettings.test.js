const test = require('node:test');
const assert = require('node:assert');
const { DEFAULTS, mergeAppearance } = require('./appearanceSettings');

test('dau vao rong / sai kieu thi tra mac dinh', () => {
    assert.deepStrictEqual(mergeAppearance(null), DEFAULTS);
    assert.deepStrictEqual(mergeAppearance('abc'), DEFAULTS);
});

test('bat tat cot: chi nhan boolean', () => {
    const r = mergeAppearance({ homeSections: { trendingNow: false, mostPopular: 'false', lạ: true } });
    assert.strictEqual(r.homeSections.trendingNow, false);
    assert.strictEqual(r.homeSections.mostPopular, true);
    assert.ok(!('lạ' in r.homeSections));
});

test('mau: chi nhan hex 3 hoac 6 ky tu, chuan ve chu thuong', () => {
    const r = mergeAppearance({
        banners: { guestPromo: { bgFrom: '#ABCDEF', text: '#fff', buttonBg: 'red', buttonText: '#12345' } },
    });
    assert.strictEqual(r.banners.guestPromo.bgFrom, '#abcdef');
    assert.strictEqual(r.banners.guestPromo.text, '#fff');
    assert.strictEqual(r.banners.guestPromo.buttonBg, DEFAULTS.banners.guestPromo.buttonBg);
    assert.strictEqual(r.banners.guestPromo.buttonText, DEFAULTS.banners.guestPromo.buttonText);
});

test('chuoi chen CSS bi bo', () => {
    const r = mergeAppearance({ banners: { memberPromo: { bgFrom: '#000;background:url(x)' } } });
    assert.strictEqual(r.banners.memberPromo.bgFrom, DEFAULTS.banners.memberPromo.bgFrom);
});

test('gop vao base: truong khong gui thi giu gia tri cu', () => {
    const base = mergeAppearance({ homeSections: { newReleases: false } });
    const r = mergeAppearance({ banners: { guestPromo: { enabled: false } } }, base);
    assert.strictEqual(r.homeSections.newReleases, false);
    assert.strictEqual(r.banners.guestPromo.enabled, false);
});

test('khong lam thay doi DEFAULTS', () => {
    mergeAppearance({ homeSections: { mostPopular: false } });
    assert.strictEqual(DEFAULTS.homeSections.mostPopular, true);
});
