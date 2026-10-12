const jwt = require('jsonwebtoken');
const Lesson = require('../models/Lesson');
const getCloudinary = require('../config/cloudinary');
const { getToken } = require('../utils/cookieToken');
const { playbackUrl } = require('../utils/privateVideo');
const { verifyStreamToken, isAllowedUpstream, rewritePlaylist } = require('../utils/videoStream');

/**
 * GET /api/video/:lessonId/master.m3u8 | p.m3u8 | s  - xem utils/videoStream.js.
 *
 * Moi request kiem HAI thu: ve `t` con han va dung bai, VA cookie dang nhap la
 * cua dung nguoi trong ve. Chi doc JWT trong cookie, khong tra CSDL: mot video
 * 30 phut co ~180 doan, tra CSDL moi doan la ton vo ich; ve het han sau 2 gio
 * nen tai khoan bi khoa giua chung cung chi xem them toi da chung do.
 */
const viewerError = (req) => {
    const ticket = verifyStreamToken(req.query.t);
    if (!ticket || ticket.lessonId !== String(req.params.lessonId)) return 'Link phát đã hết hạn, hãy tải lại trang bài học';
    const raw = getToken(req);
    if (!raw) return 'Cần đăng nhập để xem video';
    try {
        const decoded = jwt.verify(raw, process.env.JWT_SECRET, { algorithms: ['HS256'] });
        if (String(decoded.id) !== ticket.userId) return 'Link phát này thuộc tài khoản khác';
    } catch {
        return 'Phiên đăng nhập đã hết hạn';
    }
    return null;
};

const fetchUpstream = async (url) => {
    const r = await fetch(url);
    if (!r.ok) {
        const e = new Error(`Cloudinary tra ${r.status}`);
        e.status = r.status === 404 ? 404 : 502;
        throw e;
    }
    return r;
};

const sendPlaylist = (req, res, text, upstream) => {
    const { lessonId } = req.params;
    const t = encodeURIComponent(req.query.t);
    const out = rewritePlaylist(text, upstream, (abs, isList) =>
        `/api/video/${lessonId}/${isList ? 'p.m3u8' : 's'}?u=${encodeURIComponent(abs)}&t=${t}`);
    res.set('Content-Type', 'application/vnd.apple.mpegurl');
    res.set('Cache-Control', 'no-store');
    res.send(out);
};

const streamVideo = async (req, res) => {
    const err = viewerError(req);
    if (err) return res.status(401).json({ message: err });

    try {
        const { kind } = req.params;
        const cloudName = getCloudinary().config().cloud_name;

        if (kind === 'master.m3u8') {
            const lesson = await Lesson.findById(req.params.lessonId).select('videoPublicId').lean();
            if (!lesson || !lesson.videoPublicId) return res.status(404).json({ message: 'Bài học không có video kín' });
            const upstream = playbackUrl(lesson.videoPublicId);
            const r = await fetchUpstream(upstream);
            return sendPlaylist(req, res, await r.text(), upstream);
        }

        const upstream = String(req.query.u || '');
        if (!isAllowedUpstream(upstream, cloudName)) return res.status(400).json({ message: 'Địa chỉ video không hợp lệ' });

        const r = await fetchUpstream(upstream);
        if (kind === 'p.m3u8') return sendPlaylist(req, res, await r.text(), upstream);
        if (kind !== 's') return res.status(404).json({ message: 'Không tìm thấy' });

        res.set('Content-Type', r.headers.get('content-type') || 'video/mp2t');
        // private: chi trinh duyet nay giu, CDN/proxy dung chung khong duoc luu.
        res.set('Cache-Control', 'private, max-age=7200');
        return res.send(Buffer.from(await r.arrayBuffer()));
    } catch (error) {
        console.error('streamVideo:', error.message);
        return res.status(error.status || 500).json({ message: 'Không tải được video' });
    }
};

module.exports = { streamVideo, viewerError };
