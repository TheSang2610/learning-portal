// Soan hai la thu cua luong quen mat khau.
//
// Tach khoi cho gui de kiem thu duoc: CI khong co tai khoan mail nao, nen chi
// phan soan chu moi chay test duoc (cung ly do voi mailXacMinh.js).
//
// VI SAO CO HAI LA THU:
//
//   1. Thu mang MA - gui khi co nguoi yeu cau dat lai mat khau.
//   2. Thu bao NHAP SAI QUA NHIEU - gui khi cham nguong khoa.
//
// La thu thu hai khong phai cho co. Duong kiem ma CO Y tra ve cung mot cau
// cho ca "ma sai" lan "dang bi khoa" (xem quenMatKhauController.js), nen neu
// khong co thu nay thi mot nguoi go nham ba lan se ngoi go tiep mai ma khong
// hieu vi sao ma dung van bao sai. Thu la duong duy nhat noi cho ho biet -
// va no den dung hom thu cua chu tai khoan, noi ke do khong voi toi.
//
// No con lam mot viec thu hai quan trong hon: bao cho chu tai khoan biet co
// nguoi dang thu dat lai mat khau cua ho. Do la dau hieu som cua viec bi nham
// lam muc tieu.

const { thoat } = require('./mailDonHang');

const KHUNG = (thanBai) => `
<div style="font-family:system-ui,-apple-system,'Segoe UI',sans-serif;font-size:15px;line-height:1.6;color:#0f172a;max-width:520px">
${thanBai}
<hr style="border:0;border-top:1px solid #e2e8f0;margin:24px 0">
<p style="color:#64748b;font-size:13px;margin:0">Thư này được gửi tự động từ aLMS. Vui lòng không trả lời.</p>
</div>`.trim();

/**
 * Thu mang ma dat lai mat khau.
 *
 * @param {object} tin
 * @param {string} tin.ten    ten nguoi dung tu dat - PHAI thoat HTML
 * @param {string} tin.ma     ma 6 chu so
 * @param {number} [tin.soPhut] han cua ma, tinh bang phut
 */
const soanMailMaDatLai = ({ ten, ma, soPhut = 10 }) => {
    const tenAn = thoat(ten);
    const maAn = thoat(ma);

    return {
        // Ma KHONG nam tren tieu de. Tieu de hien ra o man hinh khoa dien
        // thoai va o danh sach hom thu - tuc la bat ky ai cam may len cung doc
        // duoc ma ma khong can mo khoa may.
        tieuDe: 'Mã đặt lại mật khẩu aLMS',
        chuHtml: KHUNG(`
<p>Chào ${tenAn},</p>
<p>Có người vừa yêu cầu đặt lại mật khẩu cho tài khoản aLMS của bạn. Nếu là bạn, hãy nhập mã dưới đây vào trang đăng nhập:</p>
<p style="margin:24px 0">
  <span style="display:inline-block;background:#f1f5f9;border:1px solid #e2e8f0;border-radius:10px;padding:14px 24px;font-size:30px;font-weight:700;letter-spacing:10px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace">${maAn}</span>
</p>
<p>Mã có hiệu lực trong ${soPhut} phút và chỉ dùng được một lần.</p>
<p style="color:#64748b">Nếu không phải bạn yêu cầu, hãy bỏ qua thư này — mật khẩu của bạn không hề thay đổi. Nhưng nếu thư kiểu này đến nhiều lần, hãy đổi sang một mật khẩu mạnh hơn.</p>
<p style="color:#64748b"><strong>Đừng gửi mã này cho bất kỳ ai.</strong> Nhân viên aLMS không bao giờ hỏi mã của bạn.</p>`),
        chuThuong: [
            `Chào ${ten},`,
            '',
            'Có người vừa yêu cầu đặt lại mật khẩu cho tài khoản aLMS của bạn.',
            'Nếu là bạn, hãy nhập mã sau vào trang đăng nhập:',
            '',
            `    ${ma}`,
            '',
            `Mã có hiệu lực trong ${soPhut} phút và chỉ dùng được một lần.`,
            '',
            'Nếu không phải bạn yêu cầu, hãy bỏ qua thư này - mật khẩu của bạn',
            'không hề thay đổi.',
            '',
            'Đừng gửi mã này cho bất kỳ ai. Nhân viên aLMS không bao giờ hỏi mã của bạn.',
        ].join('\n'),
    };
};

/**
 * Thu bao da nhap sai qua nhieu lan.
 *
 * CO Y khong ghi con bao lau nua thi mo lai, va cung khong ghi da nhap sai
 * may lan. Xem ghi chu "khong noi con bao lau" trong
 * controllers/quenMatKhauController.js - day la mot quyet dinh cua chu du an,
 * khong phai sot.
 */
const soanMailSaiQuaNhieu = ({ ten }) => {
    const tenAn = thoat(ten);

    return {
        tieuDe: 'Tạm dừng đặt lại mật khẩu aLMS',
        chuHtml: KHUNG(`
<p>Chào ${tenAn},</p>
<p>Mã đặt lại mật khẩu vừa bị nhập sai quá nhiều lần, nên chúng tôi tạm dừng việc đặt lại mật khẩu cho tài khoản này.</p>
<p><strong>Bạn hãy thử lại sau.</strong> Mã cũ đã hết hiệu lực — lần sau bạn cần yêu cầu một mã mới.</p>
<p style="color:#64748b">Nếu không phải bạn làm việc này, mật khẩu của bạn vẫn an toàn và không hề thay đổi — người kia không vào được tài khoản. Dù vậy, chúng tôi khuyên bạn đăng nhập và đổi sang một mật khẩu mạnh hơn khi có thể.</p>`),
        chuThuong: [
            `Chào ${ten},`,
            '',
            'Mã đặt lại mật khẩu vừa bị nhập sai quá nhiều lần, nên chúng tôi tạm',
            'dừng việc đặt lại mật khẩu cho tài khoản này.',
            '',
            'Bạn hãy thử lại sau. Mã cũ đã hết hiệu lực - lần sau bạn cần yêu cầu',
            'một mã mới.',
            '',
            // Giu nguyen cum "không hề thay đổi" tren MOT dong. Ngat dong giua
            // cum nay lam nguoi doc luot qua khong bat duoc y chinh cua ca la
            // thu - va do cung la cau ma test kiem.
            'Nếu không phải bạn làm việc này, mật khẩu của bạn vẫn an toàn,',
            'không hề thay đổi - người kia không vào được tài khoản.',
            '',
            'Dù vậy, chúng tôi khuyên bạn đổi sang một mật khẩu mạnh hơn khi có thể.',
        ].join('\n'),
    };
};

/**
 * Thu bao mat khau VUA BI DOI.
 *
 * VI SAO LA THU NAY BAT BUOC PHAI CO:
 *
 * Neu ke tan cong doc trom duoc ma trong hom thu nan nhan (may bi cai phan
 * mem theo doi, hom thu dung chung, dien thoai bi muon) thi ho doi mat khau
 * xong la vao duoc tai khoan - va nan nhan KHONG CO CACH NAO biet, cho toi
 * lan sau ho dang nhap va thay mat khau cua minh khong con dung. Luc do ke
 * kia da o trong do ca tuan.
 *
 * La thu nay bien mot vu chiem tai khoan im lang thanh mot vu chiem tai khoan
 * CO BAO DONG, gui ngay tai thoi diem xay ra.
 *
 * Vi vay thu phai noi ro phai lam gi tiep, chu khong chi thong bao suong.
 */
const soanMailDaDoiMatKhau = ({ ten, luc }) => {
    const tenAn = thoat(ten);
    const d = luc instanceof Date ? luc : new Date(luc);
    // Gio Viet Nam: nguoi doc phai doi chieu duoc voi "luc do minh dang lam gi".
    const gio = Number.isNaN(d.getTime())
        ? 'không rõ'
        : d.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
    const gioAn = thoat(gio);

    return {
        tieuDe: 'Mật khẩu aLMS của bạn vừa được đổi',
        chuHtml: KHUNG(`
<p>Chào ${tenAn},</p>
<p>Mật khẩu tài khoản aLMS của bạn vừa được đổi lúc <strong>${gioAn}</strong> qua chức năng quên mật khẩu.</p>
<p><strong>Nếu là bạn:</strong> không cần làm gì thêm. Mọi thiết bị đang đăng nhập đã bị đăng xuất, bạn hãy đăng nhập lại bằng mật khẩu mới.</p>
<p style="margin:16px 0;padding:12px;border-radius:10px;background:#fef2f2;color:#991b1b">
  <strong>Nếu KHÔNG phải bạn:</strong> có người đang giữ quyền vào hộp thư này. Hãy đổi mật khẩu hộp thư trước, rồi dùng lại chức năng quên mật khẩu của aLMS để giành lại tài khoản.
</p>`),
        chuThuong: [
            `Chào ${ten},`,
            '',
            `Mật khẩu tài khoản aLMS của bạn vừa được đổi lúc ${gio} qua chức năng`,
            'quên mật khẩu.',
            '',
            'Nếu là bạn: không cần làm gì thêm. Mọi thiết bị đang đăng nhập đã bị',
            'đăng xuất, bạn hãy đăng nhập lại bằng mật khẩu mới.',
            '',
            'Nếu KHÔNG phải bạn: có người đang giữ quyền vào hộp thư này. Hãy đổi',
            'mật khẩu hộp thư trước, rồi dùng lại chức năng quên mật khẩu của aLMS',
            'để giành lại tài khoản.',
        ].join('\n'),
    };
};

module.exports = { soanMailMaDatLai, soanMailSaiQuaNhieu, soanMailDaDoiMatKhau };
