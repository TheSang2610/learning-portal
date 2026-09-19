const BankTransaction = require('../models/BankTransaction');
const CoinTopUp = require('../models/CoinTopUp');
const { congCoin } = require('../utils/viCoin');
const { hopLe, daCauHinh } = require('../config/webhookNganHang');
const { rutMaNap, duTien, docBaoCo } = require('../utils/khopChuyenKhoan');
const { guiThongBao } = require('./thongBaoController');

/**
 * Nhan bao co tu ngan hang va cong coin ngay khi tien ve.
 *
 * Truoc day hoc vien chuyen khoan xong phai bam "toi da chuyen" roi NGOI CHO
 * quan tri mo sao ke doi chieu tay. Ban dem hoac cuoi tuan la cho ca ngay, ma
 * quan tri thi phai lam mot viec lap di lap lai khong he can suy nghi.
 *
 * Gio ngan hang bao ve thang day: khop ma trong noi dung chuyen khoan voi yeu
 * cau dang cho, du tien thi cong luon. Duong xac nhan tay VAN GIU nguyen cho
 * cac khoan webhook khong khop duoc - go sai ma, chuyen thieu, chuyen sau khi
 * huy - vi nhung khoan do can nguoi nhin.
 *
 * TRANG THAI NAO DUOC CONG TU DONG:
 *
 *   pending    - truong hop thuong
 *   expired    - tien ve o phut thu 16. Tu choi luc nay la an tien cua nguoi
 *                ta: ho da chuyen that, chi cham vai phut.
 *   abandoned  - hoc vien reload mat ma nen he thong cap ma moi, nhung ho da
 *                chuyen theo ma cu. Cung la tien that, cung phai cong.
 *
 *   cancelled  - KHONG cong tu dong. Hoc vien da chu dong huy roi con chuyen
 *                thi day la tinh huong bat thuong, de nguoi nhin.
 *   paid       - da cong roi. Ghi 'trung' chu khong cong them.
 */

/** Cac trang thai con duoc cong khi tien ve. */
const CON_NHAN_TIEN = ['pending', 'expired', 'abandoned'];

/**
 * Xu ly mot bao co da chuan hoa. Tra ve ket qua de ghi vao nhat ky.
 *
 * Ham nay KHONG nem loi ra ngoai cho tung bao co sai: mot bao co hong khong
 * duoc lam hong ca lo. Loi that su cua CSDL thi van nem de tang tren tra 500
 * va nha cung cap phat lai.
 */
const xuLyMotBaoCo = async (bc) => {
    // Tien di ra khong lien quan gi toi nap coin, nhung van ghi nhat ky de sau
    // nay doi chieu so du tai khoan con khop duoc.
    if (!bc.tienVao) {
        return { xuLy: 'bo_qua', ghiChu: 'Giao dich tien ra, không xử lý' };
    }

    const maNap = rutMaNap(bc.noiDung);
    if (!maNap) {
        return { maNap: null, xuLy: 'chua_khop', ghiChu: 'Nội dung không chứa mã nạp hợp lệ' };
    }

    const yc = await CoinTopUp.findOne({ code: maNap });
    if (!yc) {
        return { maNap, xuLy: 'chua_khop', ghiChu: `Không có yêu cầu nạp nào mang mã ${maNap}` };
    }

    if (yc.status === 'paid') {
        return { maNap, topUp: yc._id, xuLy: 'trung', ghiChu: 'Yêu cầu này đã được cộng coin trước đó' };
    }
    if (!CON_NHAN_TIEN.includes(yc.status)) {
        return {
            maNap,
            topUp: yc._id,
            xuLy: 'chua_khop',
            ghiChu: `Yêu cầu đang ở trạng thái "${yc.status}", cần đối chiếu tay`
        };
    }

    if (!duTien(bc.soTien, yc.amount)) {
        return {
            maNap,
            topUp: yc._id,
            xuLy: 'chua_khop',
            ghiChu: `Tiền về ${bc.soTien.toLocaleString('vi-VN')}đ, yêu cầu cần ${yc.amount.toLocaleString('vi-VN')}đ`
        };
    }

    // Danh dau 'paid' TRUOC khi cong, va chi cong khi that su doi duoc mot ban
    // ghi con cho. Giong het duong xac nhan tay: webhook phat lai hai lan cung
    // luc, hoac quan tri bam xac nhan dung luc webhook ve, thi chi mot ben qua
    // duoc cua nay. Cong truoc danh dau sau la hoc vien nhan doi coin.
    const daKhoa = await CoinTopUp.findOneAndUpdate(
        { _id: yc._id, status: { $in: CON_NHAN_TIEN } },
        {
            $set: {
                status: 'paid',
                paidAt: new Date(),
                note: `Tự động cộng theo báo có ngân hàng ${bc.maGiaoDich}`
            }
        },
        { new: true }
    );

    if (!daKhoa) {
        return { maNap, topUp: yc._id, xuLy: 'trung', ghiChu: 'Yêu cầu vừa được xử lý bởi luồng khác' };
    }

    const cong = await congCoin(daKhoa.student, daKhoa.soCoin, {
        loai: 'nap',
        ghiChu: `Nạp coin tự động theo yêu cầu ${daKhoa.code}`
    });

    if (!cong.thanhCong) {
        // Tra yeu cau ve trang thai cho. De no dung 'paid' ma vi khong duoc
        // cong dong nao la mat tien that cua hoc vien, va khong ai biet.
        daKhoa.status = 'pending';
        daKhoa.paidAt = null;
        await daKhoa.save();
        return {
            maNap,
            topUp: yc._id,
            xuLy: 'chua_khop',
            ghiChu: `Cộng coin thất bại: ${cong.loi || 'không rõ nguyên nhân'}`
        };
    }

    // Bao cho hoc vien biet tien da ve va coin da cong.
    //
    // Duong nay chay HOAN TOAN TU DONG, khong co ai bam nut nao: hoc vien
    // chuyen khoan roi dong app, va neu khong bao thi ho phai tu mo lai trang
    // vi de kiem tra. Day dung la cho can thong bao nhat trong ca he thong.
    //
    // guiThongBao() khong bao gio nem - xem ghi chu o ham do. Quan trong o day
    // vi ham nay chay trong webhook: nem la ngan hang nhan ma loi va phat lai
    // bao co, trong khi coin DA duoc cong.
    await guiThongBao(daKhoa.student, 'coin_duoc_cong', { soCoin: daKhoa.soCoin });

    return {
        maNap,
        topUp: daKhoa._id,
        soCoinDaCong: daKhoa.soCoin,
        xuLy: 'da_cong',
        ghiChu: `Đã cộng ${daKhoa.soCoin} coin`
    };
};

/**
 * POST /api/coin/webhook/ngan-hang
 *
 * Duong nay KHONG di qua protect: ngan hang khong co tai khoan tren he thong.
 * Danh tinh dua hoan toan vao khoa bi mat trong header, xem
 * config/webhookNganHang.js.
 */
const nhanBaoCoNganHang = async (req, res) => {
    // Chua dat khoa thi tu choi, khong xu ly gi. Tra 503 chu khong 401 de
    // nguoi dung dich vu biet la LOI CAU HINH BEN MINH, khong phai ho gui sai.
    if (!daCauHinh()) {
        console.error('nhanBaoCoNganHang: chua dat WEBHOOK_NGAN_HANG_SECRET');
        return res.status(503).json({ success: false, message: 'Webhook chưa được cấu hình' });
    }

    if (!hopLe(req)) {
        // Khong noi ro sai o dau, va khong in gi ve khoa nhan duoc.
        return res.status(401).json({ success: false, message: 'Không hợp lệ' });
    }

    try {
        const danhSach = docBaoCo(req.body);
        if (danhSach.length === 0) {
            return res.status(200).json({ success: true, daXuLy: 0, message: 'Không có báo có nào' });
        }

        const ketQua = [];

        for (const bc of danhSach) {
            // Ghi nhat ky TRUOC khi cong coin. Khoa duy nhat tren maGiaoDich la
            // thu duy nhat chan duoc viec cong hai lan khi nha cung cap phat
            // lai - phai dat no xong moi duoc dong toi vi tien.
            let ban;
            try {
                ban = await BankTransaction.create({
                    maGiaoDich: bc.maGiaoDich,
                    soTien: bc.soTien,
                    noiDung: String(bc.noiDung).slice(0, 500),
                    nganHang: bc.nganHang,
                    soTaiKhoan: bc.soTaiKhoan,
                    thoiGianNganHang: bc.thoiGian ? new Date(bc.thoiGian) : null,
                    xuLy: 'chua_khop'
                });
            } catch (loi) {
                if (loi?.code === 11000) {
                    // Da nhan bao co nay roi. Tra 200 de nha cung cap thoi phat
                    // lai; tra loi thi ho cu phat mai.
                    ketQua.push({ maGiaoDich: bc.maGiaoDich, xuLy: 'trung' });
                    continue;
                }
                throw loi;
            }

            const kq = await xuLyMotBaoCo(bc);

            ban.maNap = kq.maNap ?? null;
            ban.topUp = kq.topUp ?? null;
            ban.soCoinDaCong = kq.soCoinDaCong ?? 0;
            ban.xuLy = kq.xuLy;
            ban.ghiChu = String(kq.ghiChu || '').slice(0, 500);
            await ban.save();

            ketQua.push({ maGiaoDich: bc.maGiaoDich, xuLy: kq.xuLy });
        }

        // Luon 200 khi da xu ly xong, ke ca khi khong khop duoc yeu cau nao:
        // "khong khop" la viec cua quan tri, khong phai loi cua nha cung cap,
        // va bao loi chi lam ho phat lai mot bao co da ghi nhat ky roi.
        return res.status(200).json({ success: true, daXuLy: ketQua.length, ketQua });
    } catch (error) {
        console.error('nhanBaoCoNganHang:', error.message);
        // 500 la co y: day la loi THAT (mat ket noi CSDL chang han), va minh
        // MUON nha cung cap phat lai bao co nay.
        return res.status(500).json({ success: false, message: 'Lỗi xử lý báo có' });
    }
};

/**
 * GET /api/coin/quan-tri/bao-co - nhat ky bao co cho quan tri doi chieu.
 */
const danhSachBaoCo = async (req, res) => {
    try {
        const loc = {};
        if (req.query.xuLy) loc.xuLy = req.query.xuLy;

        const soDong = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
        const trang = Math.max(1, Number(req.query.page) || 1);

        const [ds, tong] = await Promise.all([
            BankTransaction.find(loc)
                .populate({ path: 'topUp', select: 'code soCoin student', populate: { path: 'student', select: 'name email' } })
                .sort({ createdAt: -1 })
                .skip((trang - 1) * soDong)
                .limit(soDong),
            BankTransaction.countDocuments(loc)
        ]);

        return res.status(200).json({
            baoCo: ds,
            total: tong,
            page: trang,
            pages: Math.max(1, Math.ceil(tong / soDong))
        });
    } catch (error) {
        console.error('danhSachBaoCo:', error.message);
        return res.status(500).json({ message: 'Không đọc được nhật ký báo có' });
    }
};

module.exports = { nhanBaoCoNganHang, danhSachBaoCo, xuLyMotBaoCo, CON_NHAN_TIEN };
