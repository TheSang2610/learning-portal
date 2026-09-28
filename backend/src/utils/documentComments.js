/**
 * Phan THUAN cua binh luan tai lieu - khong CSDL, nen test duoc tren CI.
 * Viec doc ghi nam o documentController.
 */

const DAI_TOI_THIEU = 2;
const DAI_TOI_DA = 2000;

/**
 * Chuan hoa va kiem do dai mot binh luan.
 *
 * Gop cac dong trong lien tiep: dan mot doan co muoi dong trong vao thi binh
 * luan dai ra mot man hinh ma khong co chu nao. Giu xuong dong don - nguoi ta
 * van can xuong dong khi liet ke.
 *
 * Tra ve { ok: true, noiDung } hoac { ok: false, message }.
 */
const kiemTraBinhLuan = (tho) => {
    const noiDung = (typeof tho === 'string' ? tho : '')
        .replace(/\r\n?/g, '\n')
        .replace(/[ \t]+\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();

    if (noiDung.length < DAI_TOI_THIEU) {
        return { ok: false, message: 'Bình luận quá ngắn.' };
    }
    if (noiDung.length > DAI_TOI_DA) {
        return { ok: false, message: `Bình luận tối đa ${DAI_TOI_DA} ký tự.` };
    }
    return { ok: true, noiDung };
};

/**
 * Tra loi vao binh luan nao thi thuc te gan vao dau.
 *
 * Chi MOT cap: tra loi vao mot tra loi thi gan vao binh luan GOC cua no, de
 * cuoc tro chuyen van nam chung mot cho thay vi thut vao mai.
 */
const idBinhLuanGoc = (dich) => String(dich.traLoi || dich._id);

/**
 * Dung cay mot cap tu danh sach phang (sap CU NHAT truoc).
 *
 * `laAdmin`:
 *   false - bo binh luan da an. An binh luan GOC thi an ca cac tra loi cua no:
 *           con lai tra loi thi doc len khong biet dang tra loi cai gi.
 *   true  - giu ca binh luan an (giao dien danh dau), de admin bo an duoc.
 *
 * Tra loi mo coi (binh luan goc da mat) bi bo.
 */
const dungCayBinhLuan = (binhLuan, { laAdmin = false } = {}) => {
    const ds = Array.isArray(binhLuan) ? binhLuan.filter(Boolean) : [];
    const hien = (b) => laAdmin || !b.daAn;

    const goc = ds.filter((b) => !b.traLoi && hien(b)).map((b) => ({ ...b, traLoi: null, cacTraLoi: [] }));
    const theoId = new Map(goc.map((g) => [String(g._id), g]));

    for (const b of ds) {
        if (!b.traLoi || !hien(b)) continue;
        const cha = theoId.get(String(b.traLoi));
        if (cha) cha.cacTraLoi.push(b);
    }

    return goc;
};

module.exports = {
    kiemTraBinhLuan,
    idBinhLuanGoc,
    dungCayBinhLuan,
    DAI_TOI_THIEU,
    DAI_TOI_DA,
};
