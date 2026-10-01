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

const MA_DE = /^[a-z0-9-]{1,40}$/;
const SO_CAU_TOI_DA = 200; // bo lon nhat tren trang la 100 cau
const SO_DAP_AN_TOI_DA = 8;
const GIAY_TOI_DA = 24 * 60 * 60;

const soNguyen = (x, min, max) => Number.isInteger(x) && x >= min && x <= max;

/** Hoan vi hop le cua 0..n-1 (khong trung, khong thieu). */
const laHoanVi = (ds) =>
    ds.length <= SO_DAP_AN_TOI_DA &&
    ds.every((x) => soNguyen(x, 0, ds.length - 1)) &&
    new Set(ds).size === ds.length;

/**
 * @returns {{ loi: string } | { duLieu: object }}
 */
function chuanHoaBaiLam(than) {
    const { deId, cau, dapAn, chon, soDung, giay } = than || {};

    if (typeof deId !== 'string' || !MA_DE.test(deId)) return { loi: 'Mã đề không hợp lệ.' };

    if (!Array.isArray(cau) || cau.length === 0 || cau.length > SO_CAU_TOI_DA) {
        return { loi: 'Danh sách câu không hợp lệ.' };
    }
    if (!cau.every((x) => soNguyen(x, 0, 100000))) return { loi: 'Danh sách câu không hợp lệ.' };
    if (new Set(cau).size !== cau.length) return { loi: 'Danh sách câu bị trùng.' };

    const n = cau.length;
    if (!Array.isArray(dapAn) || dapAn.length !== n) return { loi: 'Thứ tự đáp án không hợp lệ.' };
    if (!dapAn.every((d) => Array.isArray(d) && (d.length === 0 || laHoanVi(d)))) {
        return { loi: 'Thứ tự đáp án không hợp lệ.' };
    }

    if (!Array.isArray(chon) || chon.length !== n) return { loi: 'Bài làm không hợp lệ.' };
    const chonHopLe = chon.every(
        (c) =>
            Array.isArray(c) &&
            c.length <= SO_DAP_AN_TOI_DA &&
            c.every((x) => soNguyen(x, 0, SO_DAP_AN_TOI_DA - 1)) &&
            new Set(c).size === c.length,
    );
    if (!chonHopLe) return { loi: 'Bài làm không hợp lệ.' };

    if (!soNguyen(soDung, 0, n)) return { loi: 'Số câu đúng không hợp lệ.' };
    // Nop ma khong lam cau nao thi khong the dung cau nao
    const soDaLam = chon.filter((c) => c.length > 0).length;
    if (soDung > soDaLam) return { loi: 'Số câu đúng không hợp lệ.' };

    if (!soNguyen(giay, 0, GIAY_TOI_DA)) return { loi: 'Thời gian làm bài không hợp lệ.' };

    return { duLieu: { deId, cau, dapAn, chon, soDung, soCau: n, giay } };
}

module.exports = { chuanHoaBaiLam, SO_CAU_TOI_DA };
