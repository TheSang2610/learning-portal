/**
 * Xep hang khoa hoc de goi y.
 *
 * Tach rieng khoi controller vi hai le, giong utils/nhacTroLy.js va
 * utils/noiDungThongBao.js:
 *
 *   1. Day la cho DUY NHAT quyet dinh thu tu goi y. Rai trong controller thi
 *      moi cho hien goi y lai xep mot kieu, va nguoi dung thay he thong tu mau
 *      thuan voi chinh no.
 *   2. Toan bo file nay la ham THUAN - khong CSDL, khong mang. Nho vay moi test
 *      duoc: CI khong co MONGO_URI nao.
 *
 * VI SAO DUNG QUY TAC CHU KHONG DUNG MO HINH HOC MAY:
 *   He thong nay chua du du lieu de huan luyen bat cu thu gi - vai tram ghi
 *   danh thi mot mo hinh loc cong tac se hoc ra nhieu la hon la quy luat. Quan
 *   trong hon: quy tac o day GIAI THICH DUOC. Khi hoc vien hoi "sao lai goi y
 *   khoa nay", cau tra loi la mot cau van, khong phai mot vector trong so.
 */

// Trong so. Ba nguon tin hieu, xep theo do tin cay giam dan:
//
//   CUNG_DANH_MUC - manh nhat va re nhat. Nguoi dang hoc "Lap trinh web" thi
//     khoa web khac gan nhu chac chan lien quan. Khong can du lieu hanh vi.
//
//   HOC_CUNG - nguoi hoc khoa A cung hoc khoa B. Tin hieu that tu hanh vi,
//     nhung nhieu khi it nguoi: mot trung hop ngau nhien cung day diem len.
//     Vi vay co tran DIEM_HOC_CUNG_TOI_DA ben duoi.
//
//   PHO_BIEN - yeu nhat, chi dung de pha the hoa. Khong co no thi hai khoa
//     cung diem se xep theo thu tu CSDL tra ve, tuc la ngau nhien voi nguoi dung.
const DIEM_CUNG_DANH_MUC = 50;
const DIEM_MOI_NGUOI_HOC_CUNG = 10;
const DIEM_HOC_CUNG_TOI_DA = 30;
const DIEM_PHO_BIEN_TOI_DA = 10;

// So hoc vien de dat muc "pho bien toi da". Khoa 20 nguoi hoc va khoa 500 nguoi
// hoc deu duoc coi la pho bien nhu nhau - vi qua nguong nay thi chenh lech chi
// phan anh khoa nao mo truoc, khong phan anh khoa nao hop hon.
const NGUONG_PHO_BIEN = 20;

/**
 * Cham diem MOT khoa.
 *
 * Tra ve ca `vi` - cau giai thich ngan de hien duoi the khoa hoc. Day khong
 * phai trang tri: mot goi y khong noi duoc ly do thi nguoi dung coi no la
 * quang cao, con noi duoc thi ho hieu he thong dang theo doi cai gi.
 */
const chamDiem = (khoa, boi = {}) => {
    const danhMucDangHoc = boi.danhMucDangHoc instanceof Set ? boi.danhMucDangHoc : new Set();
    const demHocCung = boi.demHocCung instanceof Map ? boi.demHocCung : new Map();

    const idKhoa = String(khoa._id);
    const idDanhMuc = khoa.category ? String(khoa.category._id || khoa.category) : '';

    let diem = 0;
    let vi = '';

    const cungDanhMuc = !!idDanhMuc && danhMucDangHoc.has(idDanhMuc);
    if (cungDanhMuc) {
        diem += DIEM_CUNG_DANH_MUC;
        vi = 'Cùng lĩnh vực với khóa bạn đang học';
    }

    const soHocCung = demHocCung.get(idKhoa) || 0;
    if (soHocCung > 0) {
        diem += Math.min(soHocCung * DIEM_MOI_NGUOI_HOC_CUNG, DIEM_HOC_CUNG_TOI_DA);

        // Cau nay de len truoc cau danh muc khi co ca hai: no cu the hon, va la
        // tin hieu tu nguoi that chu khong tu mot cai nhan phan loai.
        vi = 'Học viên học khóa giống bạn cũng học khóa này';
    }

    const soHocVien = Number(khoa.soHocVien) || 0;
    if (soHocVien > 0) {
        diem += Math.min(soHocVien / NGUONG_PHO_BIEN, 1) * DIEM_PHO_BIEN_TOI_DA;
        if (!vi) vi = 'Đang được nhiều người học';
    }

    if (!vi) vi = 'Có thể bạn quan tâm';

    return { diem, vi };
};

/**
 * Xep hang va cat lay N khoa.
 *
 * `daHoc` la danh sach id PHAI loai bo. Goi y dung thu nguoi ta da mua la loi
 * de thay nhat cua mot muc goi y, va no lam hong long tin vao ca muc do.
 */
const xepHangGoiY = (danhSach, boi = {}, soLuong = 6) => {
    if (!Array.isArray(danhSach)) return [];

    const daHoc = boi.daHoc instanceof Set ? boi.daHoc : new Set();

    return danhSach
        .filter((k) => k && k._id && !daHoc.has(String(k._id)))
        .map((k) => {
            const { diem, vi } = chamDiem(k, boi);
            return { ...k, diemGoiY: diem, viSaoGoiY: vi };
        })
        .sort((a, b) => {
            if (b.diemGoiY !== a.diemGoiY) return b.diemGoiY - a.diemGoiY;

            // Bang diem thi khoa moi hon len truoc. Khong co nac nay thi thu tu
            // phu thuoc vao CSDL tra ve the nao - doi giua hai lan tai trang,
            // va nguoi dung thay muc goi y nhay lung tung.
            return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        })
        .slice(0, Math.max(1, Math.min(soLuong, 24)));
};

module.exports = {
    chamDiem,
    xepHangGoiY,
    DIEM_CUNG_DANH_MUC,
    DIEM_MOI_NGUOI_HOC_CUNG,
    DIEM_HOC_CUNG_TOI_DA,
    DIEM_PHO_BIEN_TOI_DA,
    NGUONG_PHO_BIEN,
};
