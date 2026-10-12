/**
 * Xep hang khoa hoc de goi y.
 *
 * Tach rieng khoi controller vi hai le, giong utils/assistantPrompt.js va
 * utils/notificationContent.js:
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
//     Vi vay co tran MAX_CO_LEARNER_SCORE ben duoi.
//
//   POPULAR - yeu nhat, chi dung de pha the hoa. Khong co no thi hai khoa
//     cung diem se xep theo thu tu CSDL tra ve, tuc la ngau nhien voi nguoi dung.
const SAME_CATEGORY_SCORE = 50;
const SCORE_PER_CO_LEARNER = 10;
const MAX_CO_LEARNER_SCORE = 30;
const MAX_POPULARITY_SCORE = 10;

// So hoc vien de dat muc "pho bien toi da". Khoa 20 nguoi hoc va khoa 500 nguoi
// hoc deu duoc coi la pho bien nhu nhau - vi qua nguong nay thi chenh lech chi
// phan anh khoa nao mo truoc, khong phan anh khoa nao hop hon.
const POPULARITY_THRESHOLD = 20;

/**
 * Cham diem MOT khoa.
 *
 * Tra ve ca `vi` - cau giai thich ngan de hien duoi the khoa hoc. Day khong
 * phai trang tri: mot goi y khong noi duoc ly do thi nguoi dung coi no la
 * quang cao, con noi duoc thi ho hieu he thong dang theo doi cai gi.
 */
const scoreDocument = (course, boi = {}) => {
    const learningCategories = boi.learningCategories instanceof Set ? boi.learningCategories : new Set();
    const countCoLearners = boi.countCoLearners instanceof Map ? boi.countCoLearners : new Map();

    const courseId = String(course._id);
    const categoryId = course.category ? String(course.category._id || course.category) : '';

    let score = 0;
    let wallet = '';

    const sameCategory = !!categoryId && learningCategories.has(categoryId);
    if (sameCategory) {
        score += SAME_CATEGORY_SCORE;
        wallet = 'Cùng lĩnh vực với khóa bạn đang học';
    }

    const coLearnerCount = countCoLearners.get(courseId) || 0;
    if (coLearnerCount > 0) {
        score += Math.min(coLearnerCount * SCORE_PER_CO_LEARNER, MAX_CO_LEARNER_SCORE);

        // Cau nay de len truoc cau danh muc khi co ca hai: no cu the hon, va la
        // tin hieu tu nguoi that chu khong tu mot cai nhan phan loai.
        wallet = 'Học viên học khóa giống bạn cũng học khóa này';
    }

    const studentCount = Number(course.studentCount) || 0;
    if (studentCount > 0) {
        score += Math.min(studentCount / POPULARITY_THRESHOLD, 1) * MAX_POPULARITY_SCORE;
        if (!wallet) wallet = 'Đang được nhiều người học';
    }

    if (!wallet) wallet = 'Có thể bạn quan tâm';

    return { diem: score, vi: wallet };
};

/**
 * Xep hang va cat lay N khoa.
 *
 * `learned` la danh sach id PHAI loai bo. Goi y dung thu nguoi ta da mua la loi
 * de thay nhat cua mot muc goi y, va no lam hong long tin vao ca muc do.
 */
const rankSuggestions = (list, boi = {}, count = 6) => {
    if (!Array.isArray(list)) return [];

    const learned = boi.learned instanceof Set ? boi.learned : new Set();

    return list
        .filter((k) => k && k._id && !learned.has(String(k._id)))
        .map((k) => {
            const { diem: score, vi: wallet } = scoreDocument(k, boi);
            return { ...k, diemGoiY: score, viSaoGoiY: wallet };
        })
        .sort((a, b) => {
            if (b.diemGoiY !== a.diemGoiY) return b.diemGoiY - a.diemGoiY;

            // Bang diem thi khoa moi hon len truoc. Khong co nac nay thi thu tu
            // phu thuoc vao CSDL tra ve the nao - doi giua hai lan tai trang,
            // va nguoi dung thay muc goi y nhay lung tung.
            return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        })
        .slice(0, Math.max(1, Math.min(count, 24)));
};

module.exports = {
    scoreDocument,
    rankSuggestions,
    SAME_CATEGORY_SCORE,
    SCORE_PER_CO_LEARNER,
    MAX_CO_LEARNER_SCORE,
    MAX_POPULARITY_SCORE,
    POPULARITY_THRESHOLD,
};
