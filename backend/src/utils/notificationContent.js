/**
 * Dung noi dung mot thong bao tu loai + du lieu kem theo.
 *
 * Tach rieng khoi controller vi hai le, giong het ly do cua utils/assistantPrompt.js:
 *
 *   1. Day la cho DUY NHAT quyet dinh mot thong bao hien ra chu gi va bam vao
 *      di dau. De rai trong controller thi moi cho goi lai tu viet mot cau chu
 *      khac nhau, va nguoi dung thay he thong noi nang khong nhat quan.
 *   2. Toan bo file nay la ham THUAN - khong CSDL, khong mang. Nho vay moi test
 *      duoc: CI khong co secret nao, cai gi cham toi mang la khong kiem duoc.
 */

const MAX_TITLE_LENGTH = 200;
const MAX_CONTENT_LENGTH = 1000;
const MAX_PATH_LENGTH = 500;

/**
 * Chi nhan duong dan NOI BO.
 *
 * Duong dan cua thong bao di thang vao mot the <a> o giao dien. Neu de lot mot
 * dia chi ben ngoai vao day thi bat ky cho nao goi sendNotification() cung tro thanh
 * mot duong phat tan lien ket - va nguoi dung bam vi tin cai chuong cua chinh
 * trang minh dang dung.
 *
 * Chan luon ca '//example.com': trinh duyet hieu do la dia chi ngoai theo dung
 * giao thuc hien tai, du no bat dau bang dau gach cheo.
 */
const isInternalPath = (address) => {
    if (typeof address !== 'string') return '';

    const clean = address.trim();
    if (!clean.startsWith('/')) return '';
    if (clean.startsWith('//')) return '';
    if (clean.length > MAX_PATH_LENGTH) return '';

    return clean;
};

const truncate = (text, max) => {
    if (typeof text !== 'string') return '';
    const clean = text.trim().replace(/\s+/g, ' ');
    return clean.length <= max ? clean : clean.slice(0, max - 1) + '…';
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
        duongDan: d.courseSlug ? `/course?slug=${encodeURIComponent(d.courseSlug)}` : '/user/profile',
    }),

    don_bi_tu_choi: (d) => ({
        tieuDe: 'Đơn hàng chưa được duyệt',
        noiDung: d.lyDo
            ? `Đơn hàng của bạn chưa được duyệt. Lý do: ${d.lyDo}`
            : 'Đơn hàng của bạn chưa được duyệt. Vui lòng liên hệ hỗ trợ để biết thêm chi tiết.',
        duongDan: '/help',
    }),

    khoa_duoc_mo: (d) => ({
        tieuDe: 'Khóa học đã mở',
        noiDung: d.tenKhoa
            ? `Bạn đã có quyền vào học khóa "${d.tenKhoa}".`
            : 'Bạn đã có quyền vào học khóa này.',
        duongDan: d.courseSlug ? `/course?slug=${encodeURIComponent(d.courseSlug)}` : '/courses',
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
            d.courseId && d.lessonId
                ? `/learn?courseId=${encodeURIComponent(d.courseId)}&lessonId=${encodeURIComponent(d.lessonId)}`
                : '/user/profile',
    }),

    he_thong: (d) => ({
        tieuDe: d.tieuDe || 'Thông báo từ hệ thống',
        noiDung: d.noiDung || '',
        duongDan: d.duongDan || '',
    }),
};

const VALID_TYPES = Object.keys(BANG);

/**
 * Tra ve { ok, loi, thongBao } chu khong nem ngoai le.
 *
 * Cung kieu voi filterQuestion trong assistantPrompt.js: noi goi tu quyet dinh lam gi khi
 * hong. Voi thong bao thi cau tra loi gan nhu luon la "bo qua va di tiep" -
 * khong the vi mot thong bao hong ma lam that bai viec duyet don.
 */
const buildNotification = (loai, data = {}) => {
    const correct = BANG[loai];
    if (!correct) {
        return { ok: false, loi: `Loai thong bao khong hop le: ${loai}` };
    }

    const tho = correct(data || {});
    const title = truncate(tho.tieuDe, MAX_TITLE_LENGTH);

    if (!title) {
        return { ok: false, loi: 'Thong bao khong co tieu de.' };
    }

    return {
        ok: true,
        thongBao: {
            loai,
            tieuDe: title,
            noiDung: truncate(tho.noiDung, MAX_CONTENT_LENGTH),
            duongDan: isInternalPath(tho.duongDan),
        },
    };
};

module.exports = {
    buildNotification,
    isInternalPath,
    truncate,
    VALID_TYPES,
    MAX_TITLE_LENGTH,
    MAX_CONTENT_LENGTH,
    MAX_PATH_LENGTH,
};
