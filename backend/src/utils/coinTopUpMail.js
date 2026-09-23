const { thoat } = require('./orderMail');

/**
 * Soan mail bao quan tri "co nguoi vua bao da chuyen khoan nap coin".
 *
 * Vi sao co tep rieng chu khong nhet vao orderMail.js: don hang gan voi MOT
 * KHOA HOC, nap coin thi khong. Quan tri doc mail don hang la biet phai mo khoa
 * nao; doc mail nap coin la biet phai cong bao nhieu coin. Hai viec khac nhau,
 * hai mau chu khac nhau. Dung chung mot ham roi truyen `tenKhoa` rong se de lai
 * mot o trong vo nghia trong mail.
 *
 * Dung lai ham `thoat` cua mailDonHang: ten hoc vien la chuoi NGUOI DUNG TU
 * DAT, khong thoat thi mot cai ten dat la `<img src=x onerror=...>` se chay
 * ngay trong hop thu quan tri.
 *
 * Tach khoi cho gui de kiem thu duoc: CI khong co tai khoan mail nao, nen chi
 * phan soan chu moi chay test duoc.
 */

const dinhDangTien = (so) => `${Number(so || 0).toLocaleString('vi-VN')}đ`;
const dinhDangCoin = (so) => `${Number(so || 0).toLocaleString('vi-VN')} coin`;

const dinhDangGio = (moc) => {
    const d = moc instanceof Date ? moc : new Date(moc);
    if (Number.isNaN(d.getTime())) return 'không rõ';
    // Gio Viet Nam, vi quan tri doi chieu voi sao ke ngan hang Viet Nam.
    return d.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
};

/**
 * @param {object} tin
 * @param {string} tin.maNap         ma nap, cung la noi dung chuyen khoan
 * @param {number} tin.soTien
 * @param {number} tin.soCoin
 * @param {string} tin.tenHocVien
 * @param {string} tin.emailHocVien
 * @param {Date}   tin.baoLuc        thoi diem hoc vien bam "toi da chuyen"
 * @param {boolean} tin.daQuaHan     ma da qua 15 phut chua
 * @param {string} [tin.duongDanQuanTri] link toi trang duyet nap coin
 */
const soanMailBaoNapCoin = (tin) => {
    const {
        maNap,
        soTien,
        soCoin,
        tenHocVien,
        emailHocVien,
        baoLuc,
        daQuaHan,
        duongDanQuanTri
    } = tin;

    const tien = dinhDangTien(soTien);
    const coin = dinhDangCoin(soCoin);
    const gio = dinhDangGio(baoLuc);

    // Ma nap nam ngay tren tieu de: quan tri tim trong hop thu bang chinh cai
    // ma do, khong phai mo tung mail ra doc.
    const tieuDe = `[aLMS] ${maNap} · ${tien} · ${tenHocVien} báo đã chuyển khoản nạp coin`;

    const canhBaoHetHan = daQuaHan
        ? 'Mã này đã quá hạn giữ 15 phút. Nếu đối chiếu thấy tiền đã về thì vẫn xác nhận được — hạn 15 phút chỉ để mã thôi treo trên màn hình học viên.'
        : '';

    const chuThuong = [
        `Học viên vừa báo đã chuyển khoản để nạp coin.`,
        ``,
        `Tìm trong sao kê ngân hàng theo nội dung: ${maNap}`,
        `Số tiền:   ${tien}`,
        `Sẽ cộng:   ${coin}`,
        `Báo lúc:   ${gio}`,
        ``,
        `Học viên:  ${tenHocVien} <${emailHocVien}>`,
        ...(canhBaoHetHan ? ['', canhBaoHetHan] : []),
        ``,
        `Đối chiếu xong thì vào trang Nạp coin bấm Xác nhận.`,
        ...(duongDanQuanTri ? [duongDanQuanTri] : [])
    ].join('\n');

    const chuHtml = `
<div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:#0f172a;line-height:1.6">
  <p style="margin:0 0 16px">Học viên vừa báo đã chuyển khoản để nạp coin.</p>

  <div style="border:1px solid #e2e8f0;border-radius:12px;padding:16px;margin:0 0 16px;background:#f8fafc">
    <p style="margin:0 0 4px;font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:.05em">Tìm trong sao kê theo nội dung</p>
    <p style="margin:0 0 14px;font-size:24px;font-weight:700;font-family:ui-monospace,SFMono-Regular,Menlo,monospace">${thoat(maNap)}</p>
    <p style="margin:0"><strong>Số tiền:</strong> ${thoat(tien)}</p>
    <p style="margin:0"><strong>Sẽ cộng:</strong> ${thoat(coin)}</p>
    <p style="margin:0"><strong>Báo lúc:</strong> ${thoat(gio)}</p>
  </div>

  <p style="margin:0 0 16px"><strong>Học viên:</strong> ${thoat(tenHocVien)} &lt;${thoat(emailHocVien)}&gt;</p>

  ${canhBaoHetHan
        ? `<p style="margin:0 0 16px;padding:12px;border-radius:10px;background:#fffbeb;color:#92400e;font-size:14px">${thoat(canhBaoHetHan)}</p>`
        : ''}

  <p style="margin:0 0 16px;color:#475569;font-size:14px">Đối chiếu sao kê xong thì vào trang Nạp coin bấm Xác nhận.</p>

  ${duongDanQuanTri
        ? `<a href="${thoat(duongDanQuanTri)}" style="display:inline-block;background:#0056d2;color:#fff;text-decoration:none;padding:10px 18px;border-radius:10px;font-weight:700">Mở trang Nạp coin</a>`
        : ''}
</div>`.trim();

    return { tieuDe, chuHtml, chuThuong };
};

module.exports = { soanMailBaoNapCoin };
