const User = require('../models/User');
const GiaoDichCoin = require('../models/GiaoDichCoin');

/**
 * Doi so du coin cua mot hoc vien, va ghi vao so nhat ky.
 *
 * MOI thay doi so du phai di qua day. Khong noi nao duoc tu `user.soDuCoin = x`
 * roi `save()`.
 *
 * VI SAO: kieu doc-roi-ghi bi mat tien khi hai yeu cau den cung luc. Hoc vien
 * bam Mua hai lan lien tiep, hoac bam mot lan nhung mang cham nen trinh duyet
 * gui lai:
 *
 *     yeu cau A doc so du 800        yeu cau B doc so du 800
 *     A thay du 799, tru con 1       B cung thay du 799, tru con 1
 *     A ghi 1                        B ghi 1
 *
 * Ket qua: tra 799 coin nhung duoc HAI khoa hoc. Loi nay khong tai hien duoc
 * khi bam tay tung lan, chi hien ra khi co that nhieu nguoi dung.
 *
 * Cach chan: dat dieu kien `soDuCoin >= so tien tru` VAO TRONG cau lenh ghi.
 * MongoDB doi chieu va tru trong cung mot thao tac nguyen tu, nen yeu cau den
 * sau se khong tim thay ban ghi nao khop va that bai - dung nhu mong doi.
 */

/**
 * Cong coin vao vi (quan tri nap, hoac hoan lai khi mua that bai).
 *
 * Tra ve { thanhCong, soDuSau, loi }.
 */
const congCoin = async (hocVienId, soCoin, { loai, khoa = null, ghiChu = '', nguoiTao = null }) => {
    if (!Number.isInteger(soCoin) || soCoin <= 0) {
        return { thanhCong: false, soDuSau: null, loi: 'Số coin cộng vào phải là số nguyên dương' };
    }

    const sau = await User.findOneAndUpdate(
        { _id: hocVienId },
        { $inc: { soDuCoin: soCoin } },
        { new: true, projection: 'soDuCoin' }
    );

    if (!sau) {
        return { thanhCong: false, soDuSau: null, loi: 'Không tìm thấy học viên' };
    }

    await ghiSo({
        hocVien: hocVienId,
        loai,
        soCoin,
        soDuSau: sau.soDuCoin,
        khoa,
        ghiChu,
        nguoiTao
    });

    return { thanhCong: true, soDuSau: sau.soDuCoin, loi: '' };
};

/**
 * Tru coin khoi vi. That bai neu khong du - KHONG bao gio de so du xuong am.
 *
 * Tra ve { thanhCong, soDuSau, loi }.
 */
const truCoin = async (hocVienId, soCoin, { loai, khoa = null, ghiChu = '', nguoiTao = null }) => {
    if (!Number.isInteger(soCoin) || soCoin <= 0) {
        return { thanhCong: false, soDuSau: null, loi: 'Số coin trừ đi phải là số nguyên dương' };
    }

    // Dieu kien `$gte` nam ngay trong bo loc: day la ca phep kiem lan phep tru,
    // gop trong mot thao tac. Xem ghi chu dau file.
    const sau = await User.findOneAndUpdate(
        { _id: hocVienId, soDuCoin: { $gte: soCoin } },
        { $inc: { soDuCoin: -soCoin } },
        { new: true, projection: 'soDuCoin' }
    );

    if (!sau) {
        // Khong khop: hoac khong co nguoi nay, hoac khong du coin. Phan biet ra
        // de bao loi cho dung - "khong du coin" va "khong tim thay tai khoan"
        // la hai chuyen rat khac nhau voi nguoi doc.
        const coNguoi = await User.exists({ _id: hocVienId });
        return {
            thanhCong: false,
            soDuSau: null,
            loi: coNguoi ? 'Số dư coin không đủ' : 'Không tìm thấy học viên'
        };
    }

    await ghiSo({
        hocVien: hocVienId,
        loai,
        soCoin: -soCoin,
        soDuSau: sau.soDuCoin,
        khoa,
        ghiChu,
        nguoiTao
    });

    return { thanhCong: true, soDuSau: sau.soDuCoin, loi: '' };
};

/**
 * Ghi mot dong vao so nhat ky.
 *
 * NUOT LOI co chu dich. So du da doi xong roi moi ghi so; neu buoc ghi so hong
 * (mat ket noi dung luc do) ma nem loi ra ngoai thi controller se bao "mua that
 * bai" trong khi coin da bi tru va khoa da mo - hoc vien doc mot dang, he thong
 * o mot dang khac.
 *
 * Chon huong nay vi hau qua nhe hon: so du VAN DUNG, chi thieu mot dong ghi
 * chep. In ra console de con lan lai duoc.
 */
const ghiSo = async (dong) => {
    try {
        await GiaoDichCoin.create(dong);
    } catch (loi) {
        console.error('ghiSo (coin) that bai, so du van dung:', loi.message, dong);
    }
};

/** So du hien tai. Tra 0 khi khong tim thay - de noi goi khong phai kiem null. */
const laySoDu = async (hocVienId) => {
    const u = await User.findById(hocVienId).select('soDuCoin').lean();
    return u?.soDuCoin ?? 0;
};

module.exports = { congCoin, truCoin, laySoDu };
