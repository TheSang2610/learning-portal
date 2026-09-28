/**
 * Tao bo cau hoi thuong gap mac dinh cho khu Chia se tai lieu (/share-document).
 *
 *   node scripts/seed-document-faqs.js          # xem truoc, KHONG ghi
 *   node scripts/seed-document-faqs.js --ghi    # ghi that
 *
 * Cau hoi da co (trung noi dung cau hoi) thi bo qua. Admin sua / xoa / them o
 * /admin/faqs, tab "Chia se tai lieu".
 */
require('dotenv').config({ quiet: true });
const mongoose = require('mongoose');
const Faq = require('../src/models/Faq');

const GHI = process.argv.includes('--ghi');

// Moi cau tra loi phai DUNG voi cach he thong dang chay - sua tinh nang thi sua ca day.
const MAC_DINH = [
    [
        'Tài liệu trên đây có miễn phí không?',
        'Có. Mọi tài liệu đều xem và tải về miễn phí, không cần tài khoản. Bạn chỉ cần đăng nhập khi muốn đăng tài liệu, lưu tài liệu hoặc bình luận.',
    ],
    [
        'Tôi có thể đăng những loại file nào?',
        'Hệ thống nhận file PDF, DOC và DOCX. Mỗi bài đăng được tối đa 5 file (ví dụ chương 1 đến chương 5), mỗi file tối đa 20MB. Khi đăng, bạn chọn từ 1 đến 5 môn học và có thể chọn trường đại học của mình.',
    ],
    [
        'Tài liệu có được kiểm duyệt không?',
        'Có. Hệ thống tự động từ chối bài có nội dung chửi thề, tục tĩu, kỳ thị hoặc kích động gây hấn. Quản trị viên có thể ẩn hoặc gỡ tài liệu vi phạm; tài liệu bị ẩn sẽ không còn hiện với người khác.',
    ],
    [
        'Tôi có sửa hoặc xoá tài liệu mình đã đăng được không?',
        'Được. Vào Trang cá nhân, tab "Tài liệu của tôi" để sửa tiêu đề, môn học, trường và nội dung, hoặc xoá bài. File đính kèm không đổi được sau khi đăng — muốn thay file, hãy xoá bài và đăng lại.',
    ],
    [
        'Làm sao để lưu tài liệu để đọc sau?',
        'Bấm biểu tượng dấu trang trên thẻ tài liệu. Tài liệu đã lưu nằm ở Trang cá nhân, tab "Đã lưu", và đi theo tài khoản của bạn trên mọi thiết bị.',
    ],
    [
        'Tôi tìm tài liệu cho môn hoặc trường của mình như thế nào?',
        'Dùng ô tìm kiếm ở đầu trang, chọn một lĩnh vực, hoặc vào mục Trường đại học để xem tài liệu do sinh viên trường bạn chia sẻ. Khi đã đăng nhập, tab "Gợi ý cho bạn" sẽ đề xuất tài liệu theo những môn bạn hay xem.',
    ],
];

(async () => {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(GHI ? '== GHI THAT ==' : '== XEM TRUOC (them --ghi de ghi) ==');
    for (const [question, answer] of MAC_DINH) {
        if (await Faq.exists({ courseId: null, viTri: 'taiLieu', question })) {
            console.log(`  da co : ${question}`);
            continue;
        }
        console.log(`  them  : ${question}`);
        if (GHI) await Faq.create({ courseId: null, viTri: 'taiLieu', question, answer });
    }
    await mongoose.disconnect();
})().catch((e) => {
    console.error(e);
    process.exit(1);
});
