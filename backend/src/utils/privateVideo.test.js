const test = require('node:test');
const assert = require('node:assert/strict');

const { isValidVideoId, attachPlaybackUrl } = require('./privateVideo');

test('chi nhan public_id trong thu muc bai giang', () => {
    assert.equal(isValidVideoId('learning-portal/bai-giang/abc123XYZ_-'), true);
    assert.equal(isValidVideoId('learning-portal/anh-dai-dien'), false);
    assert.equal(isValidVideoId('learning-portal/bai-giang/../khac'), false);
    assert.equal(isValidVideoId('learning-portal/bai-giang/'), false);
    assert.equal(isValidVideoId(''), false);
    assert.equal(isValidVideoId(undefined), false);
});

const user = { _id: 'u1' };
const fakeGenerator = (lesson, u) => `PHAT:${lesson._id}:${u._id}`;

test('video kho kin: videoUrl la link phat gan voi nguoi xem, khong lo videoPublicId', () => {
    const outcome = attachPlaybackUrl({ _id: 'b1', title: 'A', videoUrl: '', videoPublicId: 'learning-portal/bai-giang/x' }, user, fakeGenerator);
    assert.equal(outcome.videoUrl, 'PHAT:b1:u1');
    assert.equal('videoPublicId' in outcome, false);
});

test('khong biet nguoi xem thi khong cap link', () => {
    const outcome = attachPlaybackUrl({ _id: 'b1', videoPublicId: 'learning-portal/bai-giang/x' }, null, fakeGenerator);
    assert.equal(outcome.videoUrl, '');
});

test('link mac dinh di qua /api/video cua chinh trang, khong phai Cloudinary', () => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'kiem-thu';
    const outcome = attachPlaybackUrl({ _id: 'b1', videoPublicId: 'learning-portal/bai-giang/x' }, user);
    assert.match(outcome.videoUrl, /^\/api\/video\/b1\/master\.m3u8\?t=/);
    assert.doesNotMatch(outcome.videoUrl, /cloudinary/);
});

test('bai cu (link cong khai, YouTube) giu nguyen', () => {
    const outcome = attachPlaybackUrl({ title: 'B', videoUrl: 'https://youtu.be/x', videoPublicId: '' }, user, fakeGenerator);
    assert.equal(outcome.videoUrl, 'https://youtu.be/x');
    assert.equal('videoPublicId' in outcome, false);
});

test('khong sua doi tuong goc va chiu duoc null', () => {
    const origin = { _id: 'b1', videoPublicId: 'learning-portal/bai-giang/x' };
    attachPlaybackUrl(origin, user, fakeGenerator);
    assert.equal(origin.videoPublicId, 'learning-portal/bai-giang/x');
    assert.equal(attachPlaybackUrl(null, user, fakeGenerator), null);
});

test('co videoKin de form sua bai biet video dang o kho kin', () => {
    assert.equal(attachPlaybackUrl({ videoPublicId: 'learning-portal/bai-giang/x' }, user, fakeGenerator).videoKin, true);
    assert.equal(attachPlaybackUrl({ videoUrl: 'https://youtu.be/x' }, user, fakeGenerator).videoKin, false);
});
