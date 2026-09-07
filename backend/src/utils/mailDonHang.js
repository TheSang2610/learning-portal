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

const dinhDangTien = (so) => `${Number(so || 0).toLocaleString('vi-VN')}đ`;

const dinhDangGio = (moc) => {
    const d = moc instanceof Date ? moc : new Date(moc);
    if (Number.isNaN(d.getTime())) return 'không rõ';
    // Gio Viet Nam, vi quan tri doi chieu voi sao ke ngan hang Viet Nam.
    return d.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
};

/**
 * @param {object} tin
 * @param {string} tin.maDon        ma don, cung la noi dung chuyen khoan
 * @param {number} tin.soTien
 * @param {string} tin.tenHocVien
 * @param {string} tin.emailHocVien
 * @param {string} tin.tenKhoa
 * @param {Date}   tin.baoLuc       thoi diem hoc vien bam "toi da chuyen"
 * @param {boolean} tin.daQuaHan    ma da qua 15 phut chua
 * @param {string} [tin.duongDanQuanTri] link toi trang don hang
 */
const soanMailBaoChuyenKhoan = (tin) => {
    const {
        maDon,
        soTien,
        tenHocVien,
        emailHocVien,
        tenKhoa,
        baoLuc,
        daQuaHan,
        duongDanQuanTri
    } = tin;

    const tien = dinhDangTien(soTien);
    const gio = dinhDangGio(baoLuc);

    // Ma don nam ngay tren tieu de: quan tri tim trong hop thu bang chinh cai
    // ma do, khong phai mo tung mail ra doc.
    const tieuDe = `[aLMS] ${maDon} · ${tien} · ${tenHocVien} báo đã chuyển khoản`;

    const canhBaoHetHan = daQuaHan
        ? 'Mã này đã quá hạn giữ đơn 15 phút. Nếu đối chiếu thấy tiền đã về thì vẫn xác nhận được — hạn 15 phút chỉ để đơn thôi treo trên màn hình học viên.'
        : '';

    const chuThuong = [
        `Học viên vừa báo đã chuyển khoản.`,
        ``,
        `Tìm trong sao kê ngân hàng theo nội dung: ${maDon}`,
        `Số tiền:   ${tien}`,
        `Báo lúc:   ${gio}`,
        ``,
        `Học viên:  ${tenHocVien} <${emailHocVien}>`,
        `Khóa học:  ${tenKhoa}`,
        ...(canhBaoHetHan ? ['', canhBaoHetHan] : []),
        ``,
        `Đối chiếu xong thì vào trang Đơn hàng bấm Xác nhận.`,
        ...(duongDanQuanTri ? [duongDanQuanTri] : [])
    ].join('\n');

    const chuHtml = `
<div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:#0f172a;line-height:1.6">
  <p style="margin:0 0 16px">Học viên vừa báo đã chuyển khoản.</p>

  <div style="border:1px solid #e2e8f0;border-radius:12px;padding:16px;margin:0 0 16px;background:#f8fafc">
    <p style="margin:0 0 4px;font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:.05em">Tìm trong sao kê theo nội dung</p>
    <p style="margin:0 0 14px;font-size:24px;font-weight:700;font-family:ui-monospace,SFMono-Regular,Menlo,monospace">${thoat(maDon)}</p>
    <p style="margin:0"><strong>Số tiền:</strong> ${thoat(tien)}</p>
    <p style="margin:0"><strong>Báo lúc:</strong> ${thoat(gio)}</p>
  </div>

  <p style="margin:0 0 4px"><strong>Học viên:</strong> ${thoat(tenHocVien)} &lt;${thoat(emailHocVien)}&gt;</p>
  <p style="margin:0 0 16px"><strong>Khóa học:</strong> ${thoat(tenKhoa)}</p>

  ${canhBaoHetHan
        ? `<p style="margin:0 0 16px;padding:12px;border-radius:10px;background:#fffbeb;color:#92400e;font-size:14px">${thoat(canhBaoHetHan)}</p>`
        : ''}

  <p style="margin:0 0 16px;color:#475569;font-size:14px">Đối chiếu sao kê xong thì vào trang Đơn hàng bấm Xác nhận.</p>

  ${duongDanQuanTri
        ? `<a href="${thoat(duongDanQuanTri)}" style="display:inline-block;background:#0056d2;color:#fff;text-decoration:none;padding:10px 18px;border-radius:10px;font-weight:700">Mở trang Đơn hàng</a>`
        : ''}
</div>`.trim();

    return { tieuDe, chuHtml, chuThuong };
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
const soanMailDonDaXacNhan = (tin) => {
    const {
        maDon,
        soTien,
        tenHocVien,
        emailHocVien,
        tenKhoa,
        xacNhanLuc,
        nguoiXacNhan,
        daCoKhoaTuTruoc
    } = tin;

    const tien = dinhDangTien(soTien);
    const gio = dinhDangGio(xacNhanLuc);

    const tieuDe = `[aLMS] Đã xác nhận ${maDon} · ${tien} · ${tenHocVien}`;

    // Truong hop hiem nhung co that: don duoc xac nhan cho mot nguoi VON DA co
    // khoa hoc (duoc tang truoc do, hoac don bi xac nhan hai lan). Tien da vao
    // ma khong mo them gi - phai noi ro de con hoan lai hoac bu bang khoa khac.
    const canhBao = daCoKhoaTuTruoc
        ? 'Lưu ý: học viên vốn đã có khoá học này từ trước, nên lần xác nhận này không mở thêm gì. Kiểm tra lại xem có thu trùng tiền không.'
        : '';

    const chuThuong = [
        `Đã xác nhận thanh toán và mở khoá học.`,
        ``,
        `Mã đơn:    ${maDon}`,
        `Số tiền:   ${tien}`,
        `Xác nhận:  ${gio}${nguoiXacNhan ? ` bởi ${nguoiXacNhan}` : ''}`,
        ``,
        `Học viên:  ${tenHocVien} <${emailHocVien}>`,
        `Khóa học:  ${tenKhoa}`,
        ...(canhBao ? ['', canhBao] : [])
    ].join('\n');

    const chuHtml = `
<div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:#0f172a;line-height:1.6">
  <p style="margin:0 0 16px;font-size:16px"><strong>Đã xác nhận thanh toán và mở khoá học.</strong></p>

  <div style="border:1px solid #bbf7d0;border-radius:12px;padding:16px;margin:0 0 16px;background:#f0fdf4">
    <p style="margin:0"><strong>Mã đơn:</strong> <span style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace">${thoat(maDon)}</span></p>
    <p style="margin:0"><strong>Số tiền:</strong> ${thoat(tien)}</p>
    <p style="margin:0"><strong>Xác nhận:</strong> ${thoat(gio)}${nguoiXacNhan ? ` bởi ${thoat(nguoiXacNhan)}` : ''}</p>
  </div>

  <p style="margin:0 0 4px"><strong>Học viên:</strong> ${thoat(tenHocVien)} &lt;${thoat(emailHocVien)}&gt;</p>
  <p style="margin:0 0 16px"><strong>Khóa học:</strong> ${thoat(tenKhoa)}</p>

  ${canhBao
        ? `<p style="margin:0;padding:12px;border-radius:10px;background:#fef2f2;color:#991b1b;font-size:14px">${thoat(canhBao)}</p>`
        : ''}
</div>`.trim();

    return { tieuDe, chuHtml, chuThuong };
};

module.exports = { soanMailBaoChuyenKhoan, soanMailDonDaXacNhan, thoat };
