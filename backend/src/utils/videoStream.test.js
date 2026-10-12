const test = require('node:test');
const assert = require('node:assert/strict');

process.env.JWT_SECRET = process.env.JWT_SECRET || 'kiem-thu';
const jwt = require('jsonwebtoken');
const {
    STREAM_TTL_MS, signStreamToken, verifyStreamToken, isAllowedUpstream, rewritePlaylist,
} = require('./videoStream');
const { viewerError } = require('../controllers/videoStreamController');

const NOW = 1_800_000_000_000;

test('ve phat dung: doc lai duoc bai va nguoi', () => {
    const t = signStreamToken('bai1', 'nguoi1', NOW);
    assert.deepEqual(verifyStreamToken(t, NOW + 1000), { lessonId: 'bai1', userId: 'nguoi1' });
});

test('ve het han sau 2 gio', () => {
    const t = signStreamToken('bai1', 'nguoi1', NOW);
    assert.equal(verifyStreamToken(t, NOW + STREAM_TTL_MS + 1), null);
});

test('sua bat ky phan nao cua ve thi chu ky sai', () => {
    const t = signStreamToken('bai1', 'nguoi1', NOW);
    const [, , exp, sig] = t.split('.');
    assert.equal(verifyStreamToken(`bai1.nguoi2.${exp}.${sig}`, NOW), null);
    assert.equal(verifyStreamToken(`bai2.nguoi1.${exp}.${sig}`, NOW), null);
    assert.equal(verifyStreamToken(`bai1.nguoi1.${Number(exp) + 999999}.${sig}`, NOW), null);
    assert.equal(verifyStreamToken('rac', NOW), null);
    assert.equal(verifyStreamToken(undefined, NOW), null);
});

test('chi tai ve tu kho video kin cua dung tai khoan Cloudinary', () => {
    assert.equal(isAllowedUpstream('https://res.cloudinary.com/abc/video/authenticated/s--x--/a.ts', 'abc'), true);
    assert.equal(isAllowedUpstream('https://res.cloudinary.com/khac/video/authenticated/a.ts', 'abc'), false);
    assert.equal(isAllowedUpstream('https://res.cloudinary.com/abc/image/upload/a.png', 'abc'), false);
    assert.equal(isAllowedUpstream('http://res.cloudinary.com/abc/video/authenticated/a.ts', 'abc'), false);
    assert.equal(isAllowedUpstream('https://evil.com/abc/video/authenticated/a.ts', 'abc'), false);
    assert.equal(isAllowedUpstream('http://169.254.169.254/latest', 'abc'), false);
    assert.equal(isAllowedUpstream('khong-phai-url', 'abc'), false);
});

const BASE = 'https://res.cloudinary.com/abc/video/authenticated/s--sig--/sp_auto/v1/bai.m3u8';
const make = (abs, isList) => `${isList ? 'L' : 'S'}<${abs}>`;

test('viet lai danh sach tong: link tuong doi thanh tuyet doi roi qua may chu', () => {
    const master = [
        '#EXTM3U',
        '#EXT-X-STREAM-INF:BANDWIDTH=800000,RESOLUTION=640x360',
        'sd/bai.m3u8',
        '#EXT-X-STREAM-INF:BANDWIDTH=2500000,RESOLUTION=1280x720',
        'hd/bai.m3u8',
    ].join('\n');
    const out = rewritePlaylist(master, BASE, make);
    assert.match(out, /L<https:\/\/res\.cloudinary\.com\/abc\/video\/authenticated\/s--sig--\/sp_auto\/v1\/sd\/bai\.m3u8>/);
    assert.doesNotMatch(out, /^sd\//m);
});

test('bo cac muc chat luong qua nang cho Vercel, tru khi bo het', () => {
    const master = [
        '#EXTM3U',
        '#EXT-X-STREAM-INF:BANDWIDTH=2500000',
        'hd.m3u8',
        '#EXT-X-STREAM-INF:BANDWIDTH=6000000',
        'fhd.m3u8',
    ].join('\n');
    const out = rewritePlaylist(master, BASE, make, 3500000);
    assert.match(out, /hd\.m3u8/);
    assert.doesNotMatch(out, /fhd\.m3u8/);
    assert.doesNotMatch(out, /BANDWIDTH=6000000/);

    const onlyHeavy = ['#EXTM3U', '#EXT-X-STREAM-INF:BANDWIDTH=6000000', 'fhd.m3u8'].join('\n');
    assert.match(rewritePlaylist(onlyHeavy, BASE, make, 3500000), /fhd\.m3u8/);
});

test('danh sach con: doan video va URI="..." deu qua may chu', () => {
    const media = [
        '#EXTM3U',
        '#EXT-X-MAP:URI="init.mp4"',
        '#EXTINF:10.0,',
        'seg-1.ts',
        '#EXT-X-ENDLIST',
    ].join('\n');
    const out = rewritePlaylist(media, BASE, make);
    assert.match(out, /URI="S<https:\/\/res\.cloudinary\.com\/abc\/video\/authenticated\/s--sig--\/sp_auto\/v1\/init\.mp4>"/);
    assert.match(out, /^S<https:\/\/res\.cloudinary\.com\/abc\/video\/authenticated\/s--sig--\/sp_auto\/v1\/seg-1\.ts>$/m);
    assert.match(out, /#EXT-X-ENDLIST/);
});

const fakeReq = (t, cookieUser, lessonId = 'bai1') => ({
    params: { lessonId },
    query: { t },
    cookies: cookieUser ? { token: jwt.sign({ id: cookieUser }, process.env.JWT_SECRET) } : {},
    headers: {},
});

test('link chep sang trinh duyet khac (khong cookie) bi chan', () => {
    const t = signStreamToken('bai1', 'nguoi1');
    assert.match(viewerError(fakeReq(t, null)), /đăng nhập/);
});

test('cookie cua nguoi khac dung ve cua minh bi chan', () => {
    const t = signStreamToken('bai1', 'nguoi1');
    assert.match(viewerError(fakeReq(t, 'nguoi2')), /tài khoản khác/);
});

test('dung nguoi, dung bai, con han thi cho xem', () => {
    const t = signStreamToken('bai1', 'nguoi1');
    assert.equal(viewerError(fakeReq(t, 'nguoi1')), null);
    assert.match(viewerError(fakeReq(t, 'nguoi1', 'bai2')), /hết hạn/);
});
