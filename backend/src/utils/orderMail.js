/**
 * Soan mail bao quan tri "co nguoi vua bao da chuyen khoan".
 *
 * Tach ra khoi cho gui de kiem thu duoc: CI khong co tai khoan mail nao, nen
 * chi phan soan chu moi chay test duoc.
 *
 * Muc tieu cua noi dung mail: quan tri doc xong la MO APP NGAN HANG TIM DUOC
 * NGAY, khong phai mo lai trang quan tri de tra cuu. Nen ba thu quan trong
 * nhat - noi dung chuyen khoan, so tien, thoi diem - nam ngay dau mail.
 */

/**
 * Doi ky tu dac biet thanh thuc the HTML.
 *
 * BAT BUOC: ten va email hoc vien la chuoi NGUOI DUNG TU DAT. Mot nguoi dat
 * ten la `<img src=x onerror=...>` roi bao da chuyen khoan la ma do chay ngay
 * trong hop thu cua quan tri. Nhieu ung dung mail chan script, nhung khong phai
 * cai nao cung chan, va the <a> hay <img> thi hau nhu deu cho qua.
 */
const thoat = (tho) =>
    String(tho ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

const formatMoney = (count) => `${Number(count || 0).toLocaleString('vi-VN')}đ`;

const formatTime = (moc) => {
    const d = moc instanceof Date ? moc : new Date(moc);
    if (Number.isNaN(d.getTime())) return 'không rõ';
    // Gio Viet Nam, vi quan tri doi chieu voi sao ke ngan hang Viet Nam.
    return d.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
};

/**
 * @param {object} tin
 * @param {string} tin.orderCode        ma don, cung la noi dung chuyen khoan
 * @param {number} tin.soTien
 * @param {string} tin.studentName
 * @param {string} tin.studentEmail
 * @param {string} tin.tenKhoa
 * @param {Date}   tin.reportedAt       thoi diem hoc vien bam "toi da chuyen"
 * @param {boolean} tin.daQuaHan    ma da qua 15 phut chua
 * @param {string} [tin.adminUrl] link toi trang don hang
 */
const composeTransferReportMail = (messages) => {
    const {
        orderCode,
        soTien: amount,
        studentName,
        studentEmail,
        tenKhoa: courseTitle,
        reportedAt,
        daQuaHan: overdue,
        adminUrl
    } = messages;

    const money = formatMoney(amount);
    const hour = formatTime(reportedAt);

    // Ma don nam ngay tren tieu de: quan tri tim trong hop thu bang chinh cai
    // ma do, khong phai mo tung mail ra doc.
    const title = `[aLMS] ${orderCode} · ${money} · ${studentName} báo đã chuyển khoản`;

    const expiryWarning = overdue
        ? 'Mã này đã quá hạn giữ đơn 15 phút. Nếu đối chiếu thấy tiền đã về thì vẫn xác nhận được — hạn 15 phút chỉ để đơn thôi treo trên màn hình học viên.'
        : '';

    const plainText = [
        `Học viên vừa báo đã chuyển khoản.`,
        ``,
        `Tìm trong sao kê ngân hàng theo nội dung: ${orderCode}`,
        `Số tiền:   ${money}`,
        `Báo lúc:   ${hour}`,
        ``,
        `Học viên:  ${studentName} <${studentEmail}>`,
        `Khóa học:  ${courseTitle}`,
        ...(expiryWarning ? ['', expiryWarning] : []),
        ``,
        `Đối chiếu xong thì vào trang Đơn hàng bấm Xác nhận.`,
        ...(adminUrl ? [adminUrl] : [])
    ].join('\n');

    const htmlBody = `
<div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:#0f172a;line-height:1.6">
  <p style="margin:0 0 16px">Học viên vừa báo đã chuyển khoản.</p>

  <div style="border:1px solid #e2e8f0;border-radius:12px;padding:16px;margin:0 0 16px;background:#f8fafc">
    <p style="margin:0 0 4px;font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:.05em">Tìm trong sao kê theo nội dung</p>
    <p style="margin:0 0 14px;font-size:24px;font-weight:700;font-family:ui-monospace,SFMono-Regular,Menlo,monospace">${thoat(orderCode)}</p>
    <p style="margin:0"><strong>Số tiền:</strong> ${thoat(money)}</p>
    <p style="margin:0"><strong>Báo lúc:</strong> ${thoat(hour)}</p>
  </div>

  <p style="margin:0 0 4px"><strong>Học viên:</strong> ${thoat(studentName)} &lt;${thoat(studentEmail)}&gt;</p>
  <p style="margin:0 0 16px"><strong>Khóa học:</strong> ${thoat(courseTitle)}</p>

  ${expiryWarning
        ? `<p style="margin:0 0 16px;padding:12px;border-radius:10px;background:#fffbeb;color:#92400e;font-size:14px">${thoat(expiryWarning)}</p>`
        : ''}

  <p style="margin:0 0 16px;color:#475569;font-size:14px">Đối chiếu sao kê xong thì vào trang Đơn hàng bấm Xác nhận.</p>

  ${adminUrl
        ? `<a href="${thoat(adminUrl)}" style="display:inline-block;background:#0056d2;color:#fff;text-decoration:none;padding:10px 18px;border-radius:10px;font-weight:700">Mở trang Đơn hàng</a>`
        : ''}
</div>`.trim();

    return { tieuDe: title, htmlBody, plainText };
};

/**
 * Mail bao "da xac nhan xong, khoa hoc da mo".
 *
 * Gui SAU khi quan tri bam Xac nhan. Nghe qua thi thua - chinh ho vua bam ma -
 * nhung day la dong so sach: hop thu tro thanh nhat ky ban hang tra cuu duoc
 * bang tim kiem, doi chieu voi sao ke ngan hang cuoi thang ma khong phai mo
 * trang quan tri va bam qua tung trang.
 *
 * Va no bat duoc mot truong hop that: hai quan tri cung xac nhan mot don trong
 * vai giay. Nguoi thu hai nhan 400 "da xac nhan truoc do", nhung neu ho khong
 * de y thi ca hai deu tuong minh la nguoi mo khoa. Mail ghi ro AI xac nhan.
 */
const composeOrderConfirmedMail = (messages) => {
    const {
        orderCode,
        soTien: amount,
        studentName,
        studentEmail,
        tenKhoa: courseTitle,
        confirmedAt,
        confirmedByName,
        alreadyOwned
    } = messages;

    const money = formatMoney(amount);
    const hour = formatTime(confirmedAt);

    const title = `[aLMS] Đã xác nhận ${orderCode} · ${money} · ${studentName}`;

    // Truong hop hiem nhung co that: don duoc xac nhan cho mot nguoi VON DA co
    // khoa hoc (duoc tang truoc do, hoac don bi xac nhan hai lan). Tien da vao
    // ma khong mo them gi - phai noi ro de con hoan lai hoac bu bang khoa khac.
    const warning = alreadyOwned
        ? 'Lưu ý: học viên vốn đã có khoá học này từ trước, nên lần xác nhận này không mở thêm gì. Kiểm tra lại xem có thu trùng tiền không.'
        : '';

    const plainText = [
        `Đã xác nhận thanh toán và mở khoá học.`,
        ``,
        `Mã đơn:    ${orderCode}`,
        `Số tiền:   ${money}`,
        `Xác nhận:  ${hour}${confirmedByName ? ` bởi ${confirmedByName}` : ''}`,
        ``,
        `Học viên:  ${studentName} <${studentEmail}>`,
        `Khóa học:  ${courseTitle}`,
        ...(warning ? ['', warning] : [])
    ].join('\n');

    const htmlBody = `
<div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:#0f172a;line-height:1.6">
  <p style="margin:0 0 16px;font-size:16px"><strong>Đã xác nhận thanh toán và mở khoá học.</strong></p>

  <div style="border:1px solid #bbf7d0;border-radius:12px;padding:16px;margin:0 0 16px;background:#f0fdf4">
    <p style="margin:0"><strong>Mã đơn:</strong> <span style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace">${thoat(orderCode)}</span></p>
    <p style="margin:0"><strong>Số tiền:</strong> ${thoat(money)}</p>
    <p style="margin:0"><strong>Xác nhận:</strong> ${thoat(hour)}${confirmedByName ? ` bởi ${thoat(confirmedByName)}` : ''}</p>
  </div>

  <p style="margin:0 0 4px"><strong>Học viên:</strong> ${thoat(studentName)} &lt;${thoat(studentEmail)}&gt;</p>
  <p style="margin:0 0 16px"><strong>Khóa học:</strong> ${thoat(courseTitle)}</p>

  ${warning
        ? `<p style="margin:0;padding:12px;border-radius:10px;background:#fef2f2;color:#991b1b;font-size:14px">${thoat(warning)}</p>`
        : ''}
</div>`.trim();

    return { tieuDe: title, htmlBody, plainText };
};

module.exports = { composeTransferReportMail, composeOrderConfirmedMail, thoat };
