/**
 * Dung noi dung mot thong bao tu loai + du lieu kem theo.
 *
 * Tach rieng khoi controller vi hai le, giong het ly do cua utils/nhacTroLy.js:
 *
 *   1. Day la cho DUY NHAT quyet dinh mot thong bao hien ra chu gi va bam vao
 *      di dau. De rai trong controller thi moi cho goi lai tu viet mot cau chu
 *      khac nhau, va nguoi dung thay he thong noi nang khong nhat quan.
 *   2. Toan bo file nay la ham THUAN - khong CSDL, khong mang. Nho vay moi test
 *      duoc: CI khong co secret nao, cai gi cham toi mang la khong kiem duoc.
 */

const DAI_TIEU_DE_TOI_DA = 200;
const DAI_NOI_DUNG_TOI_DA = 1000;
const DAI_DUONG_DAN_TOI_DA = 500;

/**
 * Chi nhan duong dan NOI BO.
 *
 * Duong dan cua thong bao di thang vao mot the <a> o giao dien. Neu de lot mot
 * dia chi ben ngoai vao day thi bat ky cho nao goi guiThongBao() cung tro thanh
 * mot duong phat tan lien ket - va nguoi dung bam vi tin cai chuong cua chinh
 * trang minh dang dung.
 *
 * Chan luon ca '//example.com': trinh duyet hieu do la dia chi ngoai theo dung
 * giao thuc hien tai, du no bat dau bang dau gach cheo.
 */
const duongDanNoiBo = (dia) => {
    if (typeof dia !== 'string') return '';

    const sach = dia.trim();
    if (!sach.startsWith('/')) return '';
    if (sach.startsWith('//')) return '';
    if (sach.length > DAI_DUONG_DAN_TOI_DA) return '';

    return sach;
};

const catChu = (chu, toiDa) => {
    if (typeof chu !== 'string') return '';
    const sach = chu.trim().replace(/\s+/g, ' ');
    return sach.length <= toiDa ? sach : sach.slice(0, toiDa - 1) + '…';
};

/**
 * Bang noi dung theo tung loai.
 *
 * Moi ham nhan `d` (du lieu kem theo) va tra ve tieu de, noi dung, duong dan.
 * Khong ham nao duoc nem ngoai le: du lieu thieu thi tra ve cau chung chung,
 * vi mot thong bao mo nghia van tot hon mot request 500 lam hong ca viec chinh
 * dang chay (duyet don, cap chung nhan).
 */
const BANG = {
    don_duoc_duyet: (d) => ({
        tieuDe: 'Đơn hàng đã được duyệt',
        noiDung: d.tenKhoa
            ? `Khóa học "${d.tenKhoa}" đã được mở. Bạn có thể vào học ngay.`
            : 'Khóa học bạn mua đã được mở. Bạn có thể vào học ngay.',
        duongDan: d.slugKhoa ? `/course?slug=${encodeURIComponent(d.slugKhoa)}` : '/user/profile',
    }),

    don_bi_tu_choi: (d) => ({
        tieuDe: 'Đơn hàng chưa được duyệt',
        noiDung: d.lyDo
            ? `Đơn hàng của bạn chưa được duyệt. Lý do: ${d.lyDo}`
            : 'Đơn hàng của bạn chưa được duyệt. Vui lòng liên hệ hỗ trợ để biết thêm chi tiết.',
        duongDan: '/user/coin',
    }),

    khoa_duoc_mo: (d) => ({
        tieuDe: 'Khóa học đã mở',
        noiDung: d.tenKhoa
            ? `Bạn đã có quyền vào học khóa "${d.tenKhoa}".`
            : 'Bạn đã có quyền vào học khóa này.',
        duongDan: d.slugKhoa ? `/course?slug=${encodeURIComponent(d.slugKhoa)}` : '/courses',
    }),

    chung_nhan: (d) => ({
        tieuDe: 'Bạn vừa nhận được chứng nhận',
        noiDung: d.tenKhoa
            ? `Chúc mừng bạn đã hoàn thành khóa học "${d.tenKhoa}".`
            : 'Chúc mừng bạn đã hoàn thành khóa học.',
        duongDan: '/user/profile',
    }),

    tra_loi_hoi_dap: (d) => ({
        tieuDe: 'Câu hỏi của bạn đã được trả lời',
        noiDung: d.tenBai
            ? `Có câu trả lời mới cho câu hỏi của bạn ở bài "${d.tenBai}".`
            : 'Có câu trả lời mới cho câu hỏi của bạn.',
        duongDan:
            d.idKhoa && d.idBai
                ? `/learn?courseId=${encodeURIComponent(d.idKhoa)}&lessonId=${encodeURIComponent(d.idBai)}`
                : '/user/profile',
    }),

    coin_duoc_cong: (d) => ({
        tieuDe: 'Ví coin vừa được cộng',
        noiDung:
            typeof d.soCoin === 'number'
                ? `Đã cộng ${d.soCoin.toLocaleString('vi-VN')} coin vào ví của bạn.`
                : 'Ví coin của bạn vừa được cộng thêm.',
        duongDan: '/user/coin',
    }),

    he_thong: (d) => ({
        tieuDe: d.tieuDe || 'Thông báo từ hệ thống',
        noiDung: d.noiDung || '',
        duongDan: d.duongDan || '',
    }),
};

const LOAI_HOP_LE = Object.keys(BANG);

/**
 * Tra ve { ok, loi, thongBao } chu khong nem ngoai le.
 *
 * Cung kieu voi locCauHoi trong nhacTroLy.js: noi goi tu quyet dinh lam gi khi
 * hong. Voi thong bao thi cau tra loi gan nhu luon la "bo qua va di tiep" -
 * khong the vi mot thong bao hong ma lam that bai viec duyet don.
 */
const dungThongBao = (loai, duLieu = {}) => {
    const dung = BANG[loai];
    if (!dung) {
        return { ok: false, loi: `Loai thong bao khong hop le: ${loai}` };
    }

    const tho = dung(duLieu || {});
    const tieuDe = catChu(tho.tieuDe, DAI_TIEU_DE_TOI_DA);

    if (!tieuDe) {
        return { ok: false, loi: 'Thong bao khong co tieu de.' };
    }

    return {
        ok: true,
        thongBao: {
            loai,
            tieuDe,
            noiDung: catChu(tho.noiDung, DAI_NOI_DUNG_TOI_DA),
            duongDan: duongDanNoiBo(tho.duongDan),
        },
    };
};

module.exports = {
    dungThongBao,
    duongDanNoiBo,
    catChu,
    LOAI_HOP_LE,
    DAI_TIEU_DE_TOI_DA,
    DAI_NOI_DUNG_TOI_DA,
    DAI_DUONG_DAN_TOI_DA,
};
