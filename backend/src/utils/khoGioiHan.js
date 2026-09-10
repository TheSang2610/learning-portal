// Kho luu bo dem cho MOI lop gioi han tan suat trong du an.
//
// Truoc day moi lop tu giu mot `new Map()` rieng trong bo nho tien trinh. Ly
// do phai bo cach do, va vi sao chon Mongo thay vi Redis, ghi day du o dau
// file models/BoDemGioiHan.js - doc cho do truoc khi sua file nay.
//
// File nay lam ba viec:
//   1. Chon noi luu: CSDL khi co ket noi, Map trong bo nho khi khong.
//   2. Boc cac phep tang/khoa/xoa thanh mot API duy nhat, tra ve moc thoi gian
//      dang so mili giay de ben goi khong phai phan biet Date voi number.
//   3. Giu phan CHINH SACH (conBiKhoa / ghiNhanSai) o mot cho, de ba noi dang
//      dung no - dang nhap, dang ky, doi mat khau - khong the lech luat nhau.
//
// KHONG BAO GIO de mot loi cua kho nay lam hong duong dang nhap. Bo dem hong
// thi cung lam la mat mot lop phong thu; nem loi ra thi la tu tay tat luon
// chuc nang dang nhap cua ca he thong. Vi vay moi thao tac CSDL deu boc trong
// try/catch va lui ve bo nho tien trinh khi that bai.

const mongoose = require('mongoose');
const BoDemGioiHan = require('../models/BoDemGioiHan');

// Bo dem du phong, dung khi khong co CSDL (test, script roi le, hoac luc Atlas
// tu choi). Cung chinh la hanh vi cu - khong tot hon, nhung khong te hon.
const boNho = new Map();

// readyState: 0 chua/khong ket noi, 1 da ket noi, 2 dang ket noi, 3 dang ngat.
//
// Nhan ca trang thai 2: luc cold start, connectDB() con dang chay ma request
// dau tien da toi noi. Mongoose tu xep hang lenh cho toi khi ket noi xong -
// dung co che ma moi truy van khac trong du an van dang dua vao - nen gui lenh
// luc nay la an toan. Chi khi readyState = 0 (chua tung ket noi, hoac ket noi
// that bai) moi phai lui ve bo nho.
const coCsdl = () => mongoose.connection?.readyState !== 0;

// Mongo tra Date, bo nho giu number. Quy ve mili giay ngay tai cua ra.
const soMs = (v) => (v instanceof Date ? v.getTime() : v);

const chuanHoa = (rec) => {
    if (!rec) return null;
    return {
        count: rec.count || 0,
        firstAt: soMs(rec.firstAt),
        blockedUntil: rec.blockedUntil ? soMs(rec.blockedUntil) : null,
        expiresAt: soMs(rec.expiresAt),
    };
};

// --------------------------------------------------------------------------
// Bo nho tien trinh
// --------------------------------------------------------------------------

// Chan tran de mot ke spam khoa/email khong bom phinh bo nho lambda.
const MAX_BAN_GHI = 10000;

const donBoNho = (now) => {
    for (const [k, v] of boNho) {
        if (v.expiresAt <= now) boNho.delete(k);
    }
};

const docNhieuBoNho = (khoas, now) => {
    const kq = new Map();
    for (const k of khoas) {
        const rec = boNho.get(k);
        if (rec && rec.expiresAt > now) kq.set(k, chuanHoa(rec));
    }
    return kq;
};

const tangBoNho = (khoa, cuaSoMs, now) => {
    if (boNho.size > MAX_BAN_GHI) donBoNho(now);

    const rec = boNho.get(khoa);

    // Cua so cu da het han (hoac chua tung co) -> mo cua so moi tu 1.
    if (!rec || rec.expiresAt <= now) {
        const moi = { count: 1, firstAt: now, blockedUntil: null, expiresAt: now + cuaSoMs };
        boNho.set(khoa, moi);
        return chuanHoa(moi);
    }

    rec.count += 1;
    return chuanHoa(rec);
};

// --------------------------------------------------------------------------
// CSDL
// --------------------------------------------------------------------------

const docNhieuCsdl = async (khoas, now) => {
    const docs = await BoDemGioiHan.find({
        _id: { $in: khoas },
        expiresAt: { $gt: new Date(now) },
    }).lean();

    const kq = new Map();
    for (const d of docs) kq.set(d._id, chuanHoa(d));
    return kq;
};

// So vong thu lai khi dung phai mot request khac dang mo cung mot cua so.
// Moi vong that bai deu keo theo mot ke khac VUA THANG CONG, nen ba vong la
// qua du - khong co canh vong lap dai o day.
const SO_LAN_THU = 3;

const tangCsdl = async (khoa, cuaSoMs, now) => {
    const nowD = new Date(now);
    const cuaSoMoi = () => ({
        count: 1,
        firstAt: nowD,
        blockedUntil: null,
        expiresAt: new Date(now + cuaSoMs),
    });

    for (let lan = 0; lan < SO_LAN_THU; lan += 1) {
        // Buoc 1: tang tai cho, va CHI khi cua so hien tai con song. Dieu kien
        // expiresAt > now nam ngay trong bo loc nen phep doc-roi-ghi la mot
        // lenh nguyen tu cua Mongo: hai request song song khong the cung doc
        // ra 4 roi cung ghi 5.
        const rec = await BoDemGioiHan.findOneAndUpdate(
            { _id: khoa, expiresAt: { $gt: nowD } },
            { $inc: { count: 1 } },
            { returnDocument: 'after' },
        ).lean();
        if (rec) return chuanHoa(rec);

        // Buoc 2: khong co cua so nao dang song -> mo cua so moi.
        //
        // LO HONG DA VA - bo dem bi dat lai khi bi ban song song:
        //
        // Ban dau bo loc o day chi co { _id }. Voi mot khoa con nguoi (lan sai
        // dau tien cua mot cua so), CA HAI MUOI request song song deu truot
        // buoc 1, roi ca hai muoi cung chay buoc 2 - va vi $set ghi de, moi
        // cai lai dat count ve 1. Do duoc bang npm run check:gioihan: ban 20
        // luot song song, dem cuoi cung ra 3. Nghia la ke tan cong chi can ban
        // song song thay vi lan luot la bo dem khong bao gio leo len toi
        // nguong.
        //
        // Nhanh bo nho tien trinh KHONG dinh loi nay va se khong bao gio lo ra
        // no: JavaScript don luong nen hai luot tang khong the chen vao giua
        // nhau. Chi co chay that tren Mongo moi thay.
        //
        // Bo loc expiresAt <= now sua tan goc: buoc nay chi ghi de len mot cua
        // so DA HET HAN. Con cua so dang song thi khong khop, upsert chuyen
        // sang chen moi, dung ngay khoa trung _id -> E11000 -> quay lai buoc 1
        // de CONG DON len ban ghi cua ke vua thang, thay vi xoa no di.
        const moi = cuaSoMoi();

        try {
            await BoDemGioiHan.updateOne(
                { _id: khoa, expiresAt: { $lte: nowD } },
                { $set: moi },
                { upsert: true },
            );
            return chuanHoa(moi);
        } catch (e) {
            if (e?.code !== 11000) throw e;
            // Ke khac vua mo cua so truoc mot nhip. Vong sau se tang len tren no.
        }
    }

    // Cuc hiem: ba vong lien tiep deu dung vao dua khac. Tra ve mot ban ghi
    // hop le chu khong nem loi - bo dem lech mot luot con hon lam hong ca
    // duong dang nhap.
    return chuanHoa(cuaSoMoi());
};

// --------------------------------------------------------------------------
// API chung
// --------------------------------------------------------------------------

const docNhieu = async (khoas, now) => {
    if (coCsdl()) {
        try {
            return await docNhieuCsdl(khoas, now);
        } catch (e) {
            console.error('khoGioiHan.docNhieu:', e.message);
        }
    }
    return docNhieuBoNho(khoas, now);
};

const tang = async (khoa, cuaSoMs, now) => {
    if (coCsdl()) {
        try {
            return await tangCsdl(khoa, cuaSoMs, now);
        } catch (e) {
            console.error('khoGioiHan.tang:', e.message);
        }
    }
    return tangBoNho(khoa, cuaSoMs, now);
};

const datKhoa = async (khoa, denKhiNao) => {
    if (coCsdl()) {
        try {
            await BoDemGioiHan.updateOne(
                { _id: khoa },
                { $set: { blockedUntil: new Date(denKhiNao), expiresAt: new Date(denKhiNao) } },
            );
            return;
        } catch (e) {
            console.error('khoGioiHan.datKhoa:', e.message);
        }
    }
    const rec = boNho.get(khoa);
    if (rec) {
        rec.blockedUntil = denKhiNao;
        rec.expiresAt = denKhiNao;
    }
};

const xoaKhoa = async (khoa) => {
    if (coCsdl()) {
        try {
            await BoDemGioiHan.deleteOne({ _id: khoa });
            return;
        } catch (e) {
            console.error('khoGioiHan.xoaKhoa:', e.message);
        }
    }
    boNho.delete(khoa);
};

// --------------------------------------------------------------------------
// Chinh sach dung chung
// --------------------------------------------------------------------------

/**
 * So giay con bi khoa, lay theo khoa "nang nhat" trong danh sach. 0 = khong bi
 * khoa. Doc mot lan cho ca danh sach de khong bien moi luot dang nhap thanh ba
 * luot di CSDL.
 */
const conBiKhoa = async (khoas, now = Date.now()) => {
    const recs = await docNhieu(khoas, now);

    let xa = 0;
    for (const rec of recs.values()) {
        if (rec.blockedUntil && rec.blockedUntil > now) {
            xa = Math.max(xa, rec.blockedUntil);
        }
    }

    return xa > now ? Math.ceil((xa - now) / 1000) : 0;
};

/**
 * Ghi nhan mot lan sai tren mot khoa. Cham nguong thi khoa het mot cua so nua.
 */
const ghiNhanSai = async (khoa, nguong, cuaSoMs, now = Date.now()) => {
    const rec = await tang(khoa, cuaSoMs, now);
    if (rec.count >= nguong && !rec.blockedUntil) {
        await datKhoa(khoa, now + cuaSoMs);
    }
    return rec;
};

// Chi dung cho test: xoa sach trang thai giua cac lan chay.
const _resetForTest = () => boNho.clear();

module.exports = {
    docNhieu,
    tang,
    datKhoa,
    xoaKhoa,
    conBiKhoa,
    ghiNhanSai,
    _resetForTest,
};
