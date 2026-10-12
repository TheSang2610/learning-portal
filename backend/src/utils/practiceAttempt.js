/**
 * Kiem tra + chuan hoa mot bai luyen tap gui len (POST /api/luyen-tap/bai-lam).
 *
 * De va cau hoi luyen tap nam o frontend (file JSON), may chu KHONG co dap an
 * nen khong tu cham duoc: diem do trinh duyet cham roi gui len. Day la luyen
 * tap ca nhan, khong co thuong phat gi dua tren diem, nen chap nhan dieu do.
 * Viec o day chi la chan du lieu rac / qua co: moi mang deu co tran, moi so
 * deu phai la so nguyen trong khoang hop le - khong ai day duoc mot ban ghi
 * vai MB vao CSDL.
 *
 * Luu du de dung lai DUNG bai da lam:
 *   cau[i]   = vi tri cau thu i (thu tu da hien) trong file de, dem tu 0
 *   dapAn[i] = thu tu dap an da hien cua cau do ([] = giu nguyen thu tu goc)
 *   chon[i]  = cac dap an nguoi lam chon, theo thu tu DA HIEN
 */

const QUIZ_CODES = /^[a-z0-9-]{1,40}$/;
const MAX_QUESTIONS = 200; // bo lon nhat tren trang la 100 cau
const MAX_ANSWERS = 8;
const MAX_SECONDS = 24 * 60 * 60;

const integer = (x, min, max) => Number.isInteger(x) && x >= min && x <= max;

/** Hoan vi hop le cua 0..n-1 (khong trung, khong thieu). */
const isPermutation = (items) =>
    items.length <= MAX_ANSWERS &&
    items.every((x) => integer(x, 0, items.length - 1)) &&
    new Set(items).size === items.length;

/**
 * @returns {{ loi: string } | { data: object }}
 */
function normalizeAttempt(body) {
    const { deId: quizId, cau: questionItem, dapAn: answer, chon: choice, soDung: correctCount, giay: seconds } = body || {};

    if (typeof quizId !== 'string' || !QUIZ_CODES.test(quizId)) return { loi: 'Mã đề không hợp lệ.' };

    if (!Array.isArray(questionItem) || questionItem.length === 0 || questionItem.length > MAX_QUESTIONS) {
        return { loi: 'Danh sách câu không hợp lệ.' };
    }
    if (!questionItem.every((x) => integer(x, 0, 100000))) return { loi: 'Danh sách câu không hợp lệ.' };
    if (new Set(questionItem).size !== questionItem.length) return { loi: 'Danh sách câu bị trùng.' };

    const n = questionItem.length;
    if (!Array.isArray(answer) || answer.length !== n) return { loi: 'Thứ tự đáp án không hợp lệ.' };
    if (!answer.every((d) => Array.isArray(d) && (d.length === 0 || isPermutation(d)))) {
        return { loi: 'Thứ tự đáp án không hợp lệ.' };
    }

    if (!Array.isArray(choice) || choice.length !== n) return { loi: 'Bài làm không hợp lệ.' };
    const isValidChoice = choice.every(
        (c) =>
            Array.isArray(c) &&
            c.length <= MAX_ANSWERS &&
            c.every((x) => integer(x, 0, MAX_ANSWERS - 1)) &&
            new Set(c).size === c.length,
    );
    if (!isValidChoice) return { loi: 'Bài làm không hợp lệ.' };

    if (!integer(correctCount, 0, n)) return { loi: 'Số câu đúng không hợp lệ.' };
    // Nop ma khong lam cau nao thi khong the dung cau nao
    const answeredCount = choice.filter((c) => c.length > 0).length;
    if (correctCount > answeredCount) return { loi: 'Số câu đúng không hợp lệ.' };

    if (!integer(seconds, 0, MAX_SECONDS)) return { loi: 'Thời gian làm bài không hợp lệ.' };

    return { data: { deId: quizId, cau: questionItem, dapAn: answer, chon: choice, soDung: correctCount, soCau: n, giay: seconds } };
}

module.exports = { normalizeAttempt, MAX_QUESTIONS };
