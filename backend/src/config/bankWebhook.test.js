const test = require('node:test');
const assert = require('node:assert');

const { getKeyFromHeader } = require('./bankWebhook');

const req = (headers) => ({ headers });

test('Casso: doc khoa tu header secure-token', () => {
    assert.strictEqual(getKeyFromHeader(req({ 'secure-token': ' abc123 ' })), 'abc123');
});

test('SePay: doc khoa tu Authorization: Apikey', () => {
    assert.strictEqual(getKeyFromHeader(req({ authorization: 'Apikey abc' })), 'abc');
    assert.strictEqual(getKeyFromHeader(req({ authorization: 'apikey  xyz ' })), 'xyz');
});

test('kieu khac (Bearer, khong header) thi khong co khoa', () => {
    assert.strictEqual(getKeyFromHeader(req({ authorization: 'Bearer abc' })), '');
    assert.strictEqual(getKeyFromHeader(req({})), '');
});
