// Kiem tra ba bien Cloudinary trong .env co dung khong.
//
// Chay: npm run check:cloudinary
//
// Co cai nay de khong phai doan: dan khoa vao roi vao trang cai dat bam thu,
// thay bao loi thi van khong biet la sai cloud_name, sai secret, hay mang hong.
// Lenh nay noi thang.

require('dotenv').config();

const TEN = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];

// Tai khoan Cloudinary moi mac dinh CHAN giao file PDF va ZIP. File van tai
// len binh thuong, chi luc nguoi dung bam Tai ve moi nhan 401 - loi kieu do
// rat lau moi phat hien ra. Nen thu that mot vong: day len mot PDF ti hon,
// goi lai dung duong dan cong khai, roi xoa di.
async function thuGiaoPdf(cloudinary) {
    const id = `zz-kiem-tra/pdf-${Date.now()}.pdf`;
    let url = null;
    try {
        const r = await new Promise((res, rej) => {
            const s = cloudinary.uploader.upload_stream(
                { resource_type: 'raw', public_id: id, use_filename: false, unique_filename: false },
                (e, kq) => (e ? rej(e) : res(kq)),
            );
            s.end(Buffer.from('%PDF-1.4\n%%EOF\n'));
        });
        url = r.secure_url;

        const ma = await new Promise((res) => {
            require('https')
                .get(url, (x) => {
                    x.resume();
                    res(x.statusCode);
                })
                .on('error', () => res(0));
        });
        return ma === 200;
    } catch {
        return false;
    } finally {
        if (url) {
            try {
                await cloudinary.api.delete_resources([id], { resource_type: 'raw' });
            } catch {
                // de lai mot file rong 15 byte, khong dang de bao loi
            }
        }
    }
}

async function main() {
    // Dung chinh module cau hinh cua may chu, khong tu doc bien lan nua:
    // hai noi doc khac nhau thi lenh nay bao xanh ma may chu van hong.
    const cloudinary = require('../config/cloudinary')();
    const cfg = cloudinary.config();

    if (!cfg.cloud_name || !cfg.api_key || !cfg.api_secret) {
        console.log('CHUA DU BIEN\n');

        if (process.env.CLOUDINARY_URL) {
            console.log('  Co CLOUDINARY_URL nhung tach ra khong du.');
            console.log('  Dung dang: cloudinary://<api_key>:<api_secret>@<cloud_name>');
        } else {
            for (const t of TEN) {
                console.log(`  ${process.env[t] ? 'co ' : 'THIEU'}  ${t}`);
            }
            console.log('\nCach nhanh hon: dan mot dong CLOUDINARY_URL lay tu trang');
            console.log('API Keys, trong do da co san ca ba gia tri.');
        }

        console.log('\nSua backend/.env roi chay lai lenh nay.');
        process.exit(1);
    }

    console.log(`Dang thu ket noi toi cloud "${cfg.cloud_name}"...`);

    try {
        // ping() la loi goi nhe nhat co xac thuc - du de biet bo khoa dung hay sai.
        const r = await cloudinary.api.ping();
        if (r.status !== 'ok') throw new Error(`Cloudinary tra ve status: ${r.status}`);

        const u = await cloudinary.api.usage();
        console.log('\nKHOA DUNG - tai anh len duoc.\n');
        console.log(`  cloud_name : ${cfg.cloud_name}`);
        if (u.credits) {
            console.log(`  han muc    : da dung ${u.credits.used_percent}% goi thang nay`);
        }

        const pdfOk = await thuGiaoPdf(cloudinary);
        console.log(`  file PDF   : ${pdfOk ? 'tai ve duoc' : 'BI CHAN'}`);

        if (!pdfOk) {
            console.log('\nCANH BAO - trang chia se tai lieu se hong.');
            console.log('  Tai khoan Cloudinary moi mac dinh CHAN giao file PDF va ZIP.');
            console.log('  File van tai len duoc, nhung nguoi dung bam Tai ve se nhan 401.');
            console.log('\n  Sua: Cloudinary Console > Settings > Security >');
            console.log('       bo dau tich "Block delivery of PDF and ZIP files".');
        }

        console.log('\nKhoi dong lai may chu (Ctrl+C roi npm run dev) neu no dang chay,');
        console.log('vi .env chi duoc doc mot lan luc khoi dong.');
        process.exit(pdfOk ? 0 : 1);
    } catch (e) {
        const ma = e?.error?.http_code || e?.http_code;
        console.log('\nKHOA SAI - chua tai anh len duoc.\n');

        if (ma === 401) {
            // Da thu: go sai cloud_name cung ra 401 chu khong phai 404, vi
            // Cloudinary xac thuc truoc khi tra loi. Nen doi chieu ca ba.
            console.log('  Cloudinary tra ve 401. Sai mot trong ba gia tri,');
            console.log('  hay gap nhat la copy thieu ky tu o API_SECRET.');
        } else if (ma === 404) {
            console.log('  Cloudinary tra ve 404: sai CLOUDINARY_CLOUD_NAME.');
        } else {
            console.log(`  ${e?.error?.message || e.message}`);
        }

        console.log('\nMo lai Dashboard tren cloudinary.com va doi chieu ca ba gia tri.');
        console.log('Luu y: API Secret bi che, phai bam hien ra roi moi copy duoc.');
        process.exit(1);
    }
}

main();
