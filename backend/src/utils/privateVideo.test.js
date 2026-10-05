const test = require('node:test');
const assert = require('node:assert/strict');

const { idVideoHopLe, ganLinkPhat } = require('./privateVideo');

test('chi nhan public_id trong thu muc bai giang', () => {
    assert.equal(idVideoHopLe('learning-portal/bai-giang/abc123XYZ_-'), true);
    assert.equal(idVideoHopLe('learning-portal/anh-dai-dien'), false);
    assert.equal(idVideoHopLe('learning-portal/bai-giang/../khac'), false);
    assert.equal(idVideoHopLe('learning-portal/bai-giang/'), false);
    assert.equal(idVideoHopLe(''), false);
    assert.equal(idVideoHopLe(undefined), false);
});

const sinhGia = (id) => `KY:${id}`;

test('video kho kin: thay videoUrl bang link ky, khong lo videoPublicId', () => {
    const kq = ganLinkPhat({ title: 'A', videoUrl: '', videoPublicId: 'learning-portal/bai-giang/x' }, sinhGia);
    assert.equal(kq.videoUrl, 'KY:learning-portal/bai-giang/x');
    assert.equal('videoPublicId' in kq, false);
});

test('bai cu (link cong khai, YouTube) giu nguyen', () => {
    const kq = ganLinkPhat({ title: 'B', videoUrl: 'https://youtu.be/x', videoPublicId: '' }, sinhGia);
    assert.equal(kq.videoUrl, 'https://youtu.be/x');
    assert.equal('videoPublicId' in kq, false);
});

test('khong sua doi tuong goc va chiu duoc null', () => {
    const goc = { videoPublicId: 'learning-portal/bai-giang/x' };
    ganLinkPhat(goc, sinhGia);
    assert.equal(goc.videoPublicId, 'learning-portal/bai-giang/x');
    assert.equal(ganLinkPhat(null, sinhGia), null);
});

test('co videoKin de form sua bai biet video dang o kho kin', () => {
    assert.equal(ganLinkPhat({ videoPublicId: 'learning-portal/bai-giang/x' }, sinhGia).videoKin, true);
    assert.equal(ganLinkPhat({ videoUrl: 'https://youtu.be/x' }, sinhGia).videoKin, false);
});
