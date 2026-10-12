// Ham thuan doc du lieu form dang tai lieu - khong CSDL, test duoc o CI.

/**
 * Doc danh sach mon nguoi dung gui len thanh mang chuoi tho.
 *
 * Form dang bai la multipart: mang mon di duoi dang MOT chuoi JSON
 * ('["toan","triet"]'). PATCH sua bai thi la JSON that nen nhan thang mang.
 * Chuoi don ("toan") van nhan - may khach cu gui mot mon.
 */
const parseRawSubjects = (v) => {
    let items = v;
    if (typeof items === 'string') {
        const s = items.trim();
        if (s.startsWith('[')) {
            try {
                items = JSON.parse(s);
            } catch {
                return [];
            }
        } else {
            items = s ? [s] : [];
        }
    }
    if (!Array.isArray(items)) return [];
    return items.filter((x) => typeof x === 'string' && x.trim()).map((x) => x.trim());
};

/**
 * Sua ten file tieng Viet bi hong ma hoa.
 *
 * Busboy (duoi Multer) doc ten file trong multipart bang Latin-1, trong khi
 * trinh duyet gui UTF-8 - "Cấu trúc.pdf" thanh "Cáº¥u trÃºc.pdf". Truoc day ten
 * nay khong hien ra dau nen khong ai de y; nay mot bai nhieu file thi ten tung
 * file ("Chương 1.pdf") la thu nguoi xem can doc.
 *
 * Chi doi khi CHAC la bi hong: moi ky tu deu nam trong Latin-1 (<= 0xFF) va
 * doc lai UTF-8 khong ra ky tu loi. Ten da dung (hoac ten ASCII) giu nguyen -
 * khong bao gio lam hong them mot ten dang dung.
 */
const fixFileName = (name) => {
    const s = String(name || '');
    if (!/[\u0080-ÿ]/.test(s) || /[^\u0000-ÿ]/.test(s)) return s;
    const utf8 = Buffer.from(s, 'latin1').toString('utf8');
    return utf8.includes('�') ? s : utf8;
};

module.exports = { parseRawSubjects, fixFileName };
