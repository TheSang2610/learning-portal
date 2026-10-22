const test = require('node:test');
const assert = require('node:assert');

const { getKeyFromHeader } = require('./bankWebhook');

const req = (headers) => ({ headers });

test('doc khoa tu header secure-token cua Casso', () => {
    assert.strictEqual(getKeyFromHeader(req({ 'secure-token': ' abc123 ' })), 'abc123');
});

test('khong con nhan khoa kieu SePay (Authorization: Apikey)', () => {
    assert.strictEqual(getKeyFromHeader(req({ authorization: 'Apikey abc' })), '');
    assert.strictEqual(getKeyFromHeader(req({})), '');
});
