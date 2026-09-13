const path = require('path');
const PDFDocument = require('pdfkit');

/**
 * Dung tep PDF cho mot chung nhan hoan thanh khoa hoc.
 *
 * Truoc day "tai PDF" o giao dien la goi window.print(): trinh duyet mo hop
 * thoai in, nguoi dung phai tu chon "Save as PDF", va moi may cho ra mot ket
 * qua khac nhau (le giay, mau nen, co chu). Quan tri thi khong co cach nao xem
 * lai ban chung nhan cua hoc vien vi khong he ton tai tep nao ca.
 *
 * Dung tep tai may chu thi ca hai phia nhin thay DUNG MOT ban, va co mot dia
 * chi mo ra xem duoc.
 */

// PDFKit mac dinh dung Helvetica, ma phong do ma hoa theo WinAnsi - khong co
// chu tieng Viet co dau. Khong nhung phong rieng thi "Nguyễn Thế Sang" in ra
// thanh "Nguy?n Th? Sang". DejaVu Sans phu du bang chu tieng Viet va co giay
// phep cho phep phat hanh kem.
const THUONG = path.join(__dirname, '..', 'assets', 'fonts', 'DejaVuSans.ttf');
const DAM = path.join(__dirname, '..', 'assets', 'fonts', 'DejaVuSans-Bold.ttf');

const XANH = '#0b3f91';
const VANG = '#c9962b';
const CHU = '#1f2937';
const NHAT = '#6b7280';

const ngayVN = (d) => {
    const t = d instanceof Date ? d : new Date(d);
    if (Number.isNaN(t.getTime())) return '—';
    const hai = (n) => String(n).padStart(2, '0');
    return `${hai(t.getDate())}/${hai(t.getMonth() + 1)}/${t.getFullYear()}`;
};

/**
 * @param {object} cc      Ban ghi Certificate (da populate course/student neu co).
 * @param {object} tuyChon
 * @param {string} [tuyChon.tenHocVien]
 * @param {string} [tuyChon.diaChiXacThuc] Dia chi trang tra cuu, in duoi chan.
 * @returns {PDFDocument} Luong doc duoc; goi .pipe(res) roi khong can end().
 */
const dungChungChiPdf = (cc, tuyChon = {}) => {
    const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margin: 0,
        info: {
            Title: `Chung nhan - ${cc.courseName || cc.title || ''}`,
            Author: 'Learning Portal'
        }
    });

    doc.registerFont('thuong', THUONG);
    doc.registerFont('dam', DAM);

    const W = doc.page.width;
    const H = doc.page.height;

    // Khung vien: mot vien day mau xanh va mot vien manh mau vang ben trong.
    doc.rect(0, 0, W, H).fill('#ffffff');
    doc.lineWidth(6).strokeColor(XANH).rect(22, 22, W - 44, H - 44).stroke();
    doc.lineWidth(1).strokeColor(VANG).rect(34, 34, W - 68, H - 68).stroke();

    const giua = (chu, y, co, phong, mau) => {
        doc.font(phong).fontSize(co).fillColor(mau);
        doc.text(chu, 60, y, { width: W - 120, align: 'center' });
    };

    giua('LEARNING PORTAL', 64, 12, 'dam', NHAT);
    giua('CHỨNG NHẬN HOÀN THÀNH KHÓA HỌC', 92, 26, 'dam', XANH);

    doc.lineWidth(1.5).strokeColor(VANG)
        .moveTo(W / 2 - 70, 132).lineTo(W / 2 + 70, 132).stroke();

    giua('Chứng nhận rằng', 152, 12, 'thuong', NHAT);

    const ten = String(tuyChon.tenHocVien || cc.student?.name || 'Học viên').trim();
    // Ten dai thi ha co chu xuong cho khoi tran sang hai dong va de trong khung.
    giua(ten, 176, ten.length > 28 ? 26 : 32, 'dam', CHU);

    giua('đã hoàn thành khóa học', 226, 12, 'thuong', NHAT);
    giua(
        String(cc.courseName || cc.course?.title || cc.title || 'Khóa học'),
        248, 18, 'dam', XANH
    );

    // Ba o thong tin xep deu nhau o nua duoi.
    const o = [
        ['Ngày hoàn thành', ngayVN(cc.completionDate || cc.issuedAt)],
        ['Kết quả', cc.scorePercentage != null ? `${cc.scorePercentage}%` : '—'],
        ['Giảng viên', String(cc.instructorName || cc.signedBy || '—')]
    ];
    const rongO = (W - 200) / 3;
    o.forEach(([nhan, gt], i) => {
        const x = 100 + i * rongO;
        doc.font('thuong').fontSize(9).fillColor(NHAT)
            .text(nhan, x, 300, { width: rongO, align: 'center' });
        doc.font('dam').fontSize(13).fillColor(CHU)
            .text(gt, x, 314, { width: rongO, align: 'center' });
    });

    // Cho ky ben phai. Khong co chu ky that thi van de duong ke va chuc danh:
    // to giay khong co cho ky nhin nhu mot ban nhap chua hoan chinh.
    const xKy = W - 300;
    doc.lineWidth(0.8).strokeColor('#9ca3af')
        .moveTo(xKy + 40, 424).lineTo(xKy + 220, 424).stroke();
    doc.font('dam').fontSize(11).fillColor(CHU)
        .text(String(cc.signedBy || cc.instructorName || 'Learning Portal'),
            xKy, 432, { width: 260, align: 'center' });
    doc.font('thuong').fontSize(8.5).fillColor(NHAT)
        .text('Đại diện Learning Portal', xKy, 448, { width: 260, align: 'center' });

    // Chan trang: so hieu ben trai, ma tra cuu ben phai.
    const yChan = H - 96;
    doc.lineWidth(0.8).strokeColor('#e5e7eb')
        .moveTo(80, yChan - 16).lineTo(W - 80, yChan - 16).stroke();

    doc.font('thuong').fontSize(8.5).fillColor(NHAT)
        .text('Số hiệu chứng nhận', 80, yChan, { width: 260 });
    doc.font('dam').fontSize(11).fillColor(CHU)
        .text(String(cc.certificateNumber || '—'), 80, yChan + 13, { width: 260 });

    doc.font('thuong').fontSize(8.5).fillColor(NHAT)
        .text('Mã tra cứu', W - 340, yChan, { width: 260, align: 'right' });
    doc.font('dam').fontSize(11).fillColor(CHU)
        .text(String(cc.verificationCode || '—'), W - 340, yChan + 13,
            { width: 260, align: 'right' });

    if (tuyChon.diaChiXacThuc) {
        doc.font('thuong').fontSize(8).fillColor(NHAT)
            .text(`Tra cứu tính xác thực tại ${tuyChon.diaChiXacThuc}`,
                60, H - 58, { width: W - 120, align: 'center' });
    }

    // Chung nhan da thu hoi VAN tai ve duoc, nhung phai dong dau ro rang - de
    // khong ai cam mot tep cu di xin viec ma nguoi nhan khong biet no het gia
    // tri. Giau tep di thi ho van con ban da tai truoc do.
    if (cc.isValid === false) {
        doc.save();
        doc.rotate(-28, { origin: [W / 2, H / 2] });
        doc.font('dam').fontSize(64).fillColor('#dc2626').opacity(0.22)
            .text('ĐÃ THU HỒI', 0, H / 2 - 40, { width: W, align: 'center' });
        doc.restore();
        doc.opacity(1);
    }

    doc.end();
    return doc;
};

module.exports = { dungChungChiPdf };
