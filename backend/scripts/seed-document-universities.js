/**
 * Tao danh sach TRUONG DAI HOC mac dinh cho kho tai lieu.
 *
 *   node scripts/seed-document-universities.js          # xem truoc, KHONG ghi
 *   node scripts/seed-document-universities.js --ghi    # ghi that
 *
 * Truong da co (trung ten, ke ca khac dau/hoa thuong) thi bo qua. Chay lai bao
 * nhieu lan cung duoc. Admin them / doi ten / xoa o /admin/document-subjects.
 */
require('dotenv').config({ quiet: true });
const mongoose = require('mongoose');
const DocumentUniversity = require('../src/models/DocumentUniversity');
const { chuanHoaMon } = require('../src/utils/rankDocuments');
const { khoaTenChinh } = require('../src/utils/universityName');

const GHI = process.argv.includes('--ghi');

const MAC_DINH = [
    'Học viện Công nghệ Bưu chính Viễn thông',
    'Trường Đại học Ngoại thương',
    'Trường Đại học FPT',
    'Trường Đại học Bách khoa Hà Nội',
    'Trường Đại học Bách khoa - Đại học Quốc gia Thành phố Hồ Chí Minh',
    'Đại học Kinh tế Quốc dân',
    'Trường Đại học Kinh tế Thành phố Hồ Chí Minh',
    'Trường Đại học Sư phạm Kỹ thuật Thành phố Hồ Chí Minh',
    'Trường Đại học Thương mại',
    'Trường Đại học Tôn Đức Thắng',
    'Trường Đại học Tài chính - Marketing',
    'Trường Đại học Công nghiệp Thành phố Hồ Chí Minh',
    'Trường Đại học Văn Lang',
    'Trường Đại học Công nghệ Thông tin - Đại học Quốc gia Thành phố Hồ Chí Minh',
    'Trường Đại học Khoa học Tự nhiên - Đại học Quốc gia Thành phố Hồ Chí Minh',
    'Trường Đại học Công nghệ - Đại học Quốc gia Hà Nội',
    'Trường Đại học Luật Hà Nội',
    'Trường Đại học Luật Thành phố Hồ Chí Minh',
    'Học viện Tài chính',
    'Học viện Ngân hàng',
    // Dot 2 - danh sach "truong pho bien" chu du an gui.
    'Trường Đại học Cần Thơ',
    'Trường Đại học Duy Tân',
    'Trường Đại học Luật Hà Nội',
    'Đại học Sư phạm Hà Nội',
    'Đại học Hà Nội',
    'Trường Đại học Công nghiệp Hà Nội',
    'Trường Đại học Kinh tế - Luật, Đại học Quốc gia Thành phố Hồ Chí Minh',
    'Trường Đại học Ngoại ngữ - Tin học Thành phố Hồ Chí Minh',
    'Trường Đại học Sư phạm Thành phố Hồ Chí Minh',
    'Trường Đại học Giao thông Vận tải',
    'Đại học Hàng hải Việt Nam',
    'International University - VNU-HCM',
    'Trường Đại học Ngoại ngữ, Đại học Đà Nẵng',
    'Đại học Thủy lợi',
    'Trường Đại học Bách khoa - Đại học Đà Nẵng',
    'Trường Đại học Kinh tế, Đại học Quốc gia Hà Nội',
    'Trường Cao đẳng Thực hành FPT',
    'Trường Đại học Trà Vinh',
    'Trường Đại học Nội vụ Hà Nội',
    'University of Economics HCMC - International School of Business',
    'Trường Đại học Cửu Long',
    'Trường Đại học Giao thông Vận tải Thành phố Hồ Chí Minh',
];

(async () => {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(GHI ? '== GHI THAT ==' : '== XEM TRUOC (them --ghi de ghi) ==');
    // Chong trung theo TEN CHINH: "Đại học Tôn Đức Thắng" va "Trường Đại học
    // Tôn Đức Thắng" la mot truong.
    const daCo = new Map(
        (await DocumentUniversity.find().select('ten').lean()).map((t) => [khoaTenChinh(t.ten), t.ten]),
    );
    for (const [i, ten] of MAC_DINH.entries()) {
        const key = chuanHoaMon(ten);
        const trung = daCo.get(khoaTenChinh(ten));
        if (trung) {
            console.log(`  da co  : ${ten}${trung !== ten ? `  (= "${trung}")` : ''}`);
            continue;
        }
        daCo.set(khoaTenChinh(ten), ten);
        console.log(`  them   : ${ten}`);
        if (GHI) await DocumentUniversity.create({ ten, key, thuTu: i });
    }
    await mongoose.disconnect();
})().catch((e) => {
    console.error(e);
    process.exit(1);
});
