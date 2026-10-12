/**
 * Kiem va lam sach noi dung mot thong bao cong khai truoc khi luu.
 *
 * Ham THUAN - khong CSDL, khong mang - de test duoc tren CI (khong co secret).
 * Dung lai truncate va isInternalPath cua notificationContent.js: thong bao cong
 * khai cung la mot the <a> tren trang, va con nguy hiem hon thong bao chuong vi
 * no hien cho ca khach. De lot mot dia chi ngoai vao day la bien dau trang cua
 * chinh minh thanh noi phat lien ket lua dao.
 */
const {
    truncate,
    isInternalPath,
    MAX_TITLE_LENGTH,
    MAX_CONTENT_LENGTH,
} = require('./notificationContent');

const VALID_LEVELS = ['thong_tin', 'quan_trong'];

/**
 * Doc ngay het han tu du lieu gui len.
 *
 * Rong -> null (hien toi khi go tay). Ngay khong doc duoc hoac nam trong qua
 * khu -> loi, chu khong am tham bo qua: quan tri chon ngay hom qua thi thong bao
 * vua dang da het han ngay, ma khong ai hieu vi sao no khong hien.
 */
const parseExpiry = (value, now) => {
    if (value === undefined || value === null || value === '') {
        return { ok: true, hetHan: null };
    }

    const day = new Date(value);
    if (Number.isNaN(day.getTime())) {
        return { ok: false, loi: 'Ngày hết hạn không hợp lệ.' };
    }
    if (day.getTime() <= now.getTime()) {
        return { ok: false, loi: 'Ngày hết hạn phải ở sau thời điểm hiện tại.' };
    }

    return { ok: true, hetHan: day };
};

const buildAnnouncement = (data = {}, now = new Date()) => {
    const d = data || {};

    const title = truncate(d.tieuDe, MAX_TITLE_LENGTH);
    if (!title) {
        return { ok: false, loi: 'Bạn chưa nhập tiêu đề.' };
    }

    const hh = parseExpiry(d.hetHan, now);
    if (!hh.ok) return hh;

    return {
        ok: true,
        thongBao: {
            tieuDe: title,
            noiDung: truncate(d.noiDung, MAX_CONTENT_LENGTH),
            duongDan: isInternalPath(d.duongDan),
            mucDo: VALID_LEVELS.includes(d.mucDo) ? d.mucDo : 'thong_tin',
            hetHan: hh.hetHan,
        },
    };
};

const VALID_ROLES = ['student', 'instructor'];

/**
 * Doc hai kenh gui: dai dau trang va chuong. Phai chon it nhat mot - khong thi
 * ban ghi duoc tao ra ma khong ai thay o dau ca.
 *
 * Chi nhan dung `true` (boolean): chuoi "false" gui tu form la truthy trong JS,
 * de lot qua la gui chuong cho ca he thong khi quan tri khong he chon.
 */
const readChannel = (data = {}) => {
    const d = data || {};
    const showPinned = d.hienDauTrang === true;
    const sendBell = d.guiChuong === true;

    if (!showPinned && !sendBell) {
        return { ok: false, loi: 'Chọn ít nhất một nơi hiện thông báo.' };
    }

    return {
        ok: true,
        hienDauTrang: showPinned,
        guiChuong: sendBell,
        vaiTro: VALID_ROLES.includes(d.vaiTro) ? d.vaiTro : '',
    };
};

// Ai nhan thong bao chuong. Rong = moi hoc vien va giang vien; quan tri khong
// nhan thong bao cua chinh minh.
const recipientFilter = (role) =>
    VALID_ROLES.includes(role) ? { role: role } : { role: { $ne: 'admin' } };

/**
 * Dieu kien "dang hien" dung chung cho truy van va cho test.
 *
 * Viet thanh bo loc Mongo o mot cho de duong cong khai va trang quan tri khong
 * moi ben tu dinh nghia "con hieu luc" mot kieu.
 */
const visibleFilter = (now = new Date()) => ({
    dangHien: true,
    $or: [{ hetHan: null }, { hetHan: { $gt: now } }],
});

const isActive = (tb, now = new Date()) =>
    Boolean(tb && tb.dangHien) &&
    (!tb.hetHan || new Date(tb.hetHan).getTime() > now.getTime());

module.exports = {
    buildAnnouncement,
    readChannel,
    recipientFilter,
    visibleFilter,
    isActive,
    VALID_LEVELS,
};
