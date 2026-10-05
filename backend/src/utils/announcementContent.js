/**
 * Kiem va lam sach noi dung mot thong bao cong khai truoc khi luu.
 *
 * Ham THUAN - khong CSDL, khong mang - de test duoc tren CI (khong co secret).
 * Dung lai catChu va duongDanNoiBo cua notificationContent.js: thong bao cong
 * khai cung la mot the <a> tren trang, va con nguy hiem hon thong bao chuong vi
 * no hien cho ca khach. De lot mot dia chi ngoai vao day la bien dau trang cua
 * chinh minh thanh noi phat lien ket lua dao.
 */
const {
    catChu,
    duongDanNoiBo,
    DAI_TIEU_DE_TOI_DA,
    DAI_NOI_DUNG_TOI_DA,
} = require('./notificationContent');

const MUC_DO_HOP_LE = ['thong_tin', 'quan_trong'];

/**
 * Doc ngay het han tu du lieu gui len.
 *
 * Rong -> null (hien toi khi go tay). Ngay khong doc duoc hoac nam trong qua
 * khu -> loi, chu khong am tham bo qua: quan tri chon ngay hom qua thi thong bao
 * vua dang da het han ngay, ma khong ai hieu vi sao no khong hien.
 */
const docHetHan = (giaTri, bayGio) => {
    if (giaTri === undefined || giaTri === null || giaTri === '') {
        return { ok: true, hetHan: null };
    }

    const ngay = new Date(giaTri);
    if (Number.isNaN(ngay.getTime())) {
        return { ok: false, loi: 'Ngày hết hạn không hợp lệ.' };
    }
    if (ngay.getTime() <= bayGio.getTime()) {
        return { ok: false, loi: 'Ngày hết hạn phải ở sau thời điểm hiện tại.' };
    }

    return { ok: true, hetHan: ngay };
};

const dungThongBaoChung = (duLieu = {}, bayGio = new Date()) => {
    const d = duLieu || {};

    const tieuDe = catChu(d.tieuDe, DAI_TIEU_DE_TOI_DA);
    if (!tieuDe) {
        return { ok: false, loi: 'Bạn chưa nhập tiêu đề.' };
    }

    const hh = docHetHan(d.hetHan, bayGio);
    if (!hh.ok) return hh;

    return {
        ok: true,
        thongBao: {
            tieuDe,
            noiDung: catChu(d.noiDung, DAI_NOI_DUNG_TOI_DA),
            duongDan: duongDanNoiBo(d.duongDan),
            mucDo: MUC_DO_HOP_LE.includes(d.mucDo) ? d.mucDo : 'thong_tin',
            hetHan: hh.hetHan,
        },
    };
};

const VAI_TRO_HOP_LE = ['student', 'instructor'];

/**
 * Doc hai kenh gui: dai dau trang va chuong. Phai chon it nhat mot - khong thi
 * ban ghi duoc tao ra ma khong ai thay o dau ca.
 *
 * Chi nhan dung `true` (boolean): chuoi "false" gui tu form la truthy trong JS,
 * de lot qua la gui chuong cho ca he thong khi quan tri khong he chon.
 */
const docKenh = (duLieu = {}) => {
    const d = duLieu || {};
    const hienDauTrang = d.hienDauTrang === true;
    const guiChuong = d.guiChuong === true;

    if (!hienDauTrang && !guiChuong) {
        return { ok: false, loi: 'Chọn ít nhất một nơi hiện thông báo.' };
    }

    return {
        ok: true,
        hienDauTrang,
        guiChuong,
        vaiTro: VAI_TRO_HOP_LE.includes(d.vaiTro) ? d.vaiTro : '',
    };
};

// Ai nhan thong bao chuong. Rong = moi hoc vien va giang vien; quan tri khong
// nhan thong bao cua chinh minh.
const locNguoiNhan = (vaiTro) =>
    VAI_TRO_HOP_LE.includes(vaiTro) ? { role: vaiTro } : { role: { $ne: 'admin' } };

/**
 * Dieu kien "dang hien" dung chung cho truy van va cho test.
 *
 * Viet thanh bo loc Mongo o mot cho de duong cong khai va trang quan tri khong
 * moi ben tu dinh nghia "con hieu luc" mot kieu.
 */
const locDangHien = (bayGio = new Date()) => ({
    dangHien: true,
    $or: [{ hetHan: null }, { hetHan: { $gt: bayGio } }],
});

const conHieuLuc = (tb, bayGio = new Date()) =>
    Boolean(tb && tb.dangHien) &&
    (!tb.hetHan || new Date(tb.hetHan).getTime() > bayGio.getTime());

module.exports = {
    dungThongBaoChung,
    docKenh,
    locNguoiNhan,
    locDangHien,
    conHieuLuc,
    MUC_DO_HOP_LE,
};
