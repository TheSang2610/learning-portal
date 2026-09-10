// Soan hai la thu cua luong dang ky.
//
// Tach khoi cho gui de kiem thu duoc: CI khong co tai khoan mail nao, nen chi
// phan soan chu moi chay test duoc (cung ly do voi mailDonHang.js).
//
// VI SAO CO HAI LA THU chu khong phai mot:
//
// Duong dang ky phai tra ve DUNG MOT CAU cho ca hai truong hop - email chua ai
// dung, va email da co tai khoan. Neu no tra loi khac nhau thi no la mot cai
// may tra loi cau hoi "dia chi nay da dang ky chua": go bat ky email nao vao
// la biet ngay chu tai khoan cua he thong la ai. Khac biet giua hai truong hop
// duoc day het vao NOI DUNG LA THU - thu chi den duoc hom thu cua chu dia chi
// that, nen ke do khong doc duoc.
//
// La thu thu hai khong phai cho co: no bao cho chu tai khoan biet vua co nguoi
// thu dang ky bang dia chi cua ho. Do la mot dau hieu som cua viec bi nham lam
// muc tieu.

const { thoat } = require('./mailDonHang');

const KHUNG = (thanBai) => `
<div style="font-family:system-ui,-apple-system,'Segoe UI',sans-serif;font-size:15px;line-height:1.6;color:#0f172a;max-width:520px">
${thanBai}
<hr style="border:0;border-top:1px solid #e2e8f0;margin:24px 0">
<p style="color:#64748b;font-size:13px;margin:0">Thư này được gửi tự động từ aLMS. Vui lòng không trả lời.</p>
</div>`.trim();

/**
 * Thu gui khi dia chi CHUA co tai khoan: bam vao lien ket la kich hoat.
 *
 * @param {object} tin
 * @param {string} tin.ten     ten nguoi dung tu dat - PHAI thoat HTML
 * @param {string} tin.lienKet dia chi day du kem token
 * @param {number} [tin.soGio] han cua lien ket, tinh bang gio
 */
const soanMailXacMinh = ({ ten, lienKet, soGio = 24 }) => {
    const tenAn = thoat(ten);
    const linkAn = thoat(lienKet);

    return {
        tieuDe: 'Xác minh địa chỉ email của bạn - aLMS',
        chuHtml: KHUNG(`
<p>Chào ${tenAn},</p>
<p>Có người vừa dùng địa chỉ này để đăng ký tài khoản aLMS. Nếu là bạn, hãy bấm nút dưới đây để kích hoạt tài khoản:</p>
<p style="margin:24px 0">
  <a href="${linkAn}" style="background:#2563eb;color:#fff;text-decoration:none;padding:12px 22px;border-radius:8px;display:inline-block;font-weight:600">Xác minh email</a>
</p>
<p style="color:#64748b;font-size:13px">Nút không bấm được? Sao chép địa chỉ này vào trình duyệt:<br><span style="word-break:break-all">${linkAn}</span></p>
<p>Liên kết có hiệu lực trong ${soGio} giờ.</p>
<p style="color:#64748b">Nếu không phải bạn đăng ký, hãy bỏ qua thư này - tài khoản sẽ không được kích hoạt và địa chỉ của bạn vẫn dùng được để đăng ký sau này.</p>`),
        chuThuong: [
            `Chào ${ten},`,
            '',
            'Có người vừa dùng địa chỉ này để đăng ký tài khoản aLMS.',
            'Nếu là bạn, mở địa chỉ sau để kích hoạt tài khoản:',
            '',
            lienKet,
            '',
            `Liên kết có hiệu lực trong ${soGio} giờ.`,
            'Nếu không phải bạn đăng ký, hãy bỏ qua thư này.',
        ].join('\n'),
    };
};

/**
 * Thu gui khi dia chi DA co tai khoan.
 *
 * Khong kem lien ket kich hoat nao - tai khoan da ton tai va nguoi gui yeu cau
 * chua chac la chu no. Chi bao va chi duong dang nhap.
 *
 * @param {object} tin
 * @param {string} tin.lienKetDangNhap trang dang nhap
 */
const soanMailDaCoTaiKhoan = ({ lienKetDangNhap }) => {
    const linkAn = thoat(lienKetDangNhap);

    return {
        tieuDe: 'Địa chỉ email này đã có tài khoản aLMS',
        chuHtml: KHUNG(`
<p>Chào bạn,</p>
<p>Có người vừa thử đăng ký tài khoản aLMS bằng địa chỉ email này, nhưng địa chỉ đã có tài khoản từ trước nên chúng tôi không tạo thêm.</p>
<p><strong>Nếu là bạn:</strong> hãy đăng nhập bằng tài khoản sẵn có.</p>
<p style="margin:24px 0">
  <a href="${linkAn}" style="background:#2563eb;color:#fff;text-decoration:none;padding:12px 22px;border-radius:8px;display:inline-block;font-weight:600">Đăng nhập</a>
</p>
<p style="color:#64748b"><strong>Nếu không phải bạn:</strong> không cần làm gì cả. Tài khoản của bạn vẫn an toàn và mật khẩu không hề thay đổi. Nhưng nếu thư kiểu này đến nhiều lần, hãy đổi sang một mật khẩu mạnh hơn.</p>`),
        chuThuong: [
            'Chào bạn,',
            '',
            'Có người vừa thử đăng ký tài khoản aLMS bằng địa chỉ email này,',
            'nhưng địa chỉ đã có tài khoản từ trước nên chúng tôi không tạo thêm.',
            '',
            `Nếu là bạn, hãy đăng nhập tại: ${lienKetDangNhap}`,
            '',
            'Nếu không phải bạn: không cần làm gì. Mật khẩu của bạn không thay đổi.',
        ].join('\n'),
    };
};

module.exports = { soanMailXacMinh, soanMailDaCoTaiKhoan };
