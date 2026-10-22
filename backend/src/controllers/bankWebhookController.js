const BankTransaction = require('../models/BankTransaction');
const { isValid, daCauHinh: isConfigured } = require('../config/bankWebhook');
const { extractOrderCode, isPaidEnough, parseBankCredits } = require('../utils/matchBankTransfer');
const Order = require('../models/Order');
const { unlockOrder } = require('./adminOrderController');
const { transferInfo } = require('../config/payment');

/**
 * Nhan bao co tu ngan hang va tu mo khoa don hang ngay khi tien ve.
 *
 * Truoc day hoc vien chuyen khoan xong phai NGOI CHO quan tri mo sao ke doi
 * chieu tay. Ban dem hoac cuoi tuan la cho ca ngay, ma quan tri thi phai lam
 * mot viec lap di lap lai khong he can suy nghi.
 *
 * Gio ngan hang bao ve thang day: khop ma don trong noi dung chuyen khoan, du
 * tien thi mo khoa luon. Duong xac nhan tay cua quan tri VAN GIU nguyen cho cac
 * khoan webhook khong khop duoc - go sai ma, chuyen thieu, chuyen sau khi huy -
 * vi nhung khoan do can nguoi nhin.
 *
 * Truoc 08/10/2026 webhook nay con cong coin cho ma nap "NAP...". Coin da bo,
 * thanh toan chi con chuyen khoan QR theo don.
 */

/**
 * Tien ve mang ma don hang ("DH...") -> tu mo khoa, khong cho quan tri bam.
 *
 * Truoc 04/10/2026 webhook chua doc ma don; don mua khoa thi luon nam cho
 * quan tri mo sao ke doi chieu, hoc vien chuyen khoan xong phai ngoi cho. Mo
 * khoa di qua unlockOrder - DUNG cung mot ham voi nut xac nhan cua quan tri,
 * nen hai duong khong bao gio lam khac nhau (mo thieu khoa, thieu mail...).
 *
 * Don da HUY thi khong tu mo: hoc vien da bo don do, co the da dat don khac
 * cho cung khoa. Ghi 'chua_khop' de quan tri xem tay roi quyet hoan tien hay mo.
 */
const processOrderCredit = async (bc, orderCode) => {
    const order = await Order.findOne({ code: orderCode }).select('_id status amount');
    if (!order) {
        return { maNap: orderCode, xuLy: 'chua_khop', ghiChu: `Không có đơn hàng nào mang mã ${orderCode}` };
    }
    if (order.status === 'paid') {
        return { maNap: orderCode, order: order._id, xuLy: 'trung', ghiChu: 'Đơn này đã được xác nhận trước đó' };
    }
    if (order.status === 'cancelled') {
        return {
            maNap: orderCode,
            order: order._id,
            xuLy: 'chua_khop',
            ghiChu: 'Đơn đã bị hủy nhưng tiền vẫn về, cần đối chiếu tay'
        };
    }
    if (!isPaidEnough(bc.soTien, order.amount)) {
        return {
            maNap: orderCode,
            order: order._id,
            xuLy: 'chua_khop',
            ghiChu: `Tiền về ${bc.soTien.toLocaleString('vi-VN')}đ, đơn cần ${order.amount.toLocaleString('vi-VN')}đ`
        };
    }

    const outcome = await unlockOrder(order._id, { note: `Tự động xác nhận theo báo có ngân hàng ${bc.maGiaoDich}` });
    if (!outcome.ok) {
        return { maNap: orderCode, order: order._id, xuLy: 'trung', ghiChu: 'Đơn vừa được xác nhận bởi luồng khác' };
    }

    return { maNap: orderCode, order: order._id, xuLy: 'da_mo_khoa', ghiChu: 'Đã tự xác nhận đơn và mở khóa học' };
};

/**
 * Xu ly mot bao co da chuan hoa. Tra ve ket qua de ghi vao nhat ky.
 *
 * Ham nay KHONG nem loi ra ngoai cho tung bao co sai: mot bao co hong khong
 * duoc lam hong ca lo. Loi that su cua CSDL thi van nem de tang tren tra 500
 * va nha cung cap phat lai.
 */
const processBankCredit = async (bc) => {
    // Tien di ra khong lien quan gi toi don hang, nhung van ghi nhat ky de sau
    // nay doi chieu so du tai khoan con khop duoc.
    if (!bc.incoming) {
        return { xuLy: 'bo_qua', ghiChu: 'Giao dich tien ra, không xử lý' };
    }

    // Mot tai khoan Casso co the theo doi nhieu tai khoan ngan hang (vd. ca tai
    // khoan nhan tien cua infinity-store) va gui het ve moi webhook. Tien vao
    // tai khoan KHAC tai khoan nhan hoc phi thi khong phai tien don hang.
    const ownAccount = transferInfo({}).soTaiKhoan;
    if (bc.soTaiKhoan && ownAccount && bc.soTaiKhoan !== ownAccount) {
        return { xuLy: 'bo_qua', ghiChu: `Tiền vào tài khoản khác (${bc.soTaiKhoan}), không phải tài khoản nhận học phí` };
    }

    const orderCode = extractOrderCode(bc.noiDung);
    if (!orderCode) {
        // infinity-store dung CHUNG tai khoan nhan tien va chung tai khoan Casso,
        // nen moi khoan tra don ben do cung bao ve day. Ma don ben do la "HA" +
        // 10 ky tu hex (generateOrderCode cua infinity). Danh 'bo_qua' de nhat
        // ky khong day nhung dong "chua khop" ma quan tri tuong la hoc vien
        // chuyen sai.
        if (/HA[0-9A-F]{10}/.test(String(bc.noiDung).toUpperCase())) {
            return { maNap: null, xuLy: 'bo_qua', ghiChu: 'Tiền đơn hàng của infinity-store (cùng tài khoản nhận)' };
        }
        return { maNap: null, xuLy: 'chua_khop', ghiChu: 'Nội dung không chứa mã đơn hợp lệ' };
    }
    return processOrderCredit(bc, orderCode);
};

/**
 * POST /api/ngan-hang/webhook (va duong cu /api/coin/webhook/ngan-hang)
 *
 * Duong nay KHONG di qua protect: ngan hang khong co tai khoan tren he thong.
 * Danh tinh dua hoan toan vao khoa bi mat trong header, xem
 * config/bankWebhook.js.
 */
const receiveBankCredit = async (req, res) => {
    // Chua dat khoa thi tu choi, khong xu ly gi. Tra 503 chu khong 401 de
    // nguoi dung dich vu biet la LOI CAU HINH BEN MINH, khong phai ho gui sai.
    if (!isConfigured()) {
        console.error('nhanBaoCoNganHang: chua dat WEBHOOK_NGAN_HANG_SECRET (hoac CASSO_WEBHOOK_SECRET)');
        return res.status(503).json({ success: false, message: 'Webhook chưa được cấu hình' });
    }

    if (!isValid(req)) {
        // Khong noi ro sai o dau, va khong in gi ve khoa nhan duoc.
        return res.status(401).json({ success: false, message: 'Không hợp lệ' });
    }

    try {
        const list = parseBankCredits(req.body);
        if (list.length === 0) {
            return res.status(200).json({ success: true, processed: 0, message: 'Không có báo có nào' });
        }

        const result = [];

        for (const bc of list) {
            // Ghi nhat ky TRUOC khi mo khoa. Khoa duy nhat tren maGiaoDich la
            // thu duy nhat chan duoc viec xu ly hai lan khi nha cung cap phat
            // lai - phai dat no xong moi duoc dong toi don hang.
            let record;
            try {
                record = await BankTransaction.create({
                    maGiaoDich: bc.maGiaoDich,
                    soTien: bc.soTien,
                    noiDung: String(bc.noiDung).slice(0, 500),
                    nganHang: bc.nganHang,
                    soTaiKhoan: bc.soTaiKhoan,
                    thoiGianNganHang: bc.thoiGian ? new Date(bc.thoiGian) : null,
                    xuLy: 'chua_khop'
                });
            } catch (err) {
                if (err?.code === 11000) {
                    // Da nhan bao co nay roi. Tra 200 de nha cung cap thoi phat
                    // lai; tra loi thi ho cu phat mai.
                    result.push({ maGiaoDich: bc.maGiaoDich, xuLy: 'trung' });
                    continue;
                }
                throw err;
            }

            const outcome = await processBankCredit(bc);

            record.maNap = outcome.maNap ?? null;
            record.order = outcome.order ?? null;
            record.xuLy = outcome.xuLy;
            record.ghiChu = String(outcome.ghiChu || '').slice(0, 500);
            await record.save();

            result.push({ maGiaoDich: bc.maGiaoDich, xuLy: outcome.xuLy });
        }

        // Luon 200 khi da xu ly xong, ke ca khi khong khop duoc yeu cau nao:
        // "khong khop" la viec cua quan tri, khong phai loi cua nha cung cap,
        // va bao loi chi lam ho phat lai mot bao co da ghi nhat ky roi.
        return res.status(200).json({ success: true, processed: result.length, ketQua: result });
    } catch (error) {
        console.error('nhanBaoCoNganHang:', error.message);
        // 500 la co y: day la loi THAT (mat ket noi CSDL chang han), va minh
        // MUON nha cung cap phat lai bao co nay.
        return res.status(500).json({ success: false, message: 'Lỗi xử lý báo có' });
    }
};

/**
 * GET /api/ngan-hang/quan-tri/bao-co - nhat ky bao co cho quan tri doi chieu.
 */
const listBankCredits = async (req, res) => {
    try {
        const query = {};
        if (req.query.xuLy) query.xuLy = req.query.xuLy;

        const pageSize = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
        const page = Math.max(1, Number(req.query.page) || 1);

        const [items, total] = await Promise.all([
            BankTransaction.find(query)
                .populate({ path: 'order', select: 'code amount status student', populate: { path: 'student', select: 'name email' } })
                .sort({ createdAt: -1 })
                .skip((page - 1) * pageSize)
                .limit(pageSize),
            BankTransaction.countDocuments(query)
        ]);

        return res.status(200).json({
            bankCredit: items,
            total: total,
            page: page,
            pages: Math.max(1, Math.ceil(total / pageSize))
        });
    } catch (error) {
        console.error('danhSachBaoCo:', error.message);
        return res.status(500).json({ message: 'Không đọc được nhật ký báo có' });
    }
};

module.exports = { receiveBankCredit, listBankCredits, processBankCredit };
