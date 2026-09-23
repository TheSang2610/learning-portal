// Tran chung cho TOAN BO API - luoi an toan cuoi cung chong vong lap va quet.
//
// ===========================================================================
// VI SAO BO DEM NAY NAM TRONG BO NHO, KHONG DUNG utils/rateLimitStore.js
// ===========================================================================
//
// khoGioiHan dem trong MongoDB, va do la lua chon dung cho nhung cho no dang
// phuc vu: dang nhap sai, xin ma dat lai mat khau. Cac duong do bi goi vai
// chuc lan mot ngay, nen mot luot ghi CSDL moi lan la khong dang ke, doi lai
// bo dem song xuyen qua moi lambda instance.
//
// Dem nhu vay cho MOI request API thi la tu ban vao chan minh: moi luot goi
// se ton THEM mot luot ghi Atlas. Tuc la de tranh mot luot DOC CSDL cua ke
// quet, ta tu nguyen tra mot luot GHI CSDL cho ca nghin nguoi dung that - va
// tren Vercel con cong them mot vong di-ve toi Atlas (~150ms) vao moi request.
// Doi mot cai gia lay dung cai gia do, con nang hon.
//
// Nen o day dem bang Map trong tien trinh: dong bo, khong cham CSDL, khong
// them mot mili giay nao vao duong chay binh thuong.
//
// ===========================================================================
// CAI NAY LAM DUOC GI VA KHONG LAM DUOC GI - DOC KY TRUOC KHI TIN VAO NO
// ===========================================================================
//
// LAM DUOC: chan ke quet KHONG cho cham vao CSDL. Day moi la thu quan trong.
// Atlas co tran so ket noi, va khi tran thi CA WEB ngung phuc vu - khong phai
// rieng ke quet. Tu choi ngay o day thi request chet truoc khi kip mo mot
// truy van nao.
//
// KHONG LAM DUOC: giam so lan Vercel khoi dong ham. Request van toi noi, van
// tinh tien. Va vi bo dem nam trong tung instance, mot dot tan cong rai deu
// tren nhieu instance se duoc nhan so lan thu len - moi instance tu dem rieng
// cua no.
//
// Muon chan TRUOC KHI ham chay thi phai dat o tang bien (Vercel Firewall).
// Day chi la luoi thu hai, va no duoc viet ra voi dung nhan thuc do.
//
// ===========================================================================
// VI SAO NGUONG DAT RONG DEN THE
// ===========================================================================
//
// Ca mot truong hoc hay van phong di ra Internet bang MOT dia chi IP duy nhat
// (NAT). Mot lop 40 sinh vien cung mo trang, moi lan tai trang goi khoang 10
// duong API, la da vai tram luot mot phut tu cung mot IP - va do la nguoi
// dung THAT.
//
// Con vong lap hay bot thi khong chay 1.200 luot mot phut, no chay hang chuc
// nghin. Khoang cach giua hai loai rat xa, nen dat nguong rong van bat duoc
// dung ke can bat ma khong bao gio cham vao lop hoc do.
//
// Hai cua so chu khong phai mot: cua so phut bat dot bung, cua so gio bat kieu
// nho giot deu deu - thu ma chi nhin theo phut se khong bao gio thay.

// Tran co the chinh bang bien moi truong, khong phai sua ma nguon.
const so = (ten, macDinh) => {
    const v = Number(process.env[ten]);
    return Number.isFinite(v) && v > 0 ? v : macDinh;
};

const NGUONG_PHUT = so('TRAN_API_MOI_PHUT', 1200);
const NGUONG_GIO = so('TRAN_API_MOI_GIO', 20000);

// Chan tran so khoa dang giu, de mot dot tan cong tu hang chuc nghin dia chi
// khac nhau khong bom phinh bo nho lambda.
const MAX_KHOA = 20000;

/**
 * Duong KHONG bao gio bi chan.
 *
 * `/` la duong kiem tra suc khoe - cong cu giam sat goi deu dan, chan no la
 * tu bao minh chet trong khi van song.
 *
 * Duong webhook ngan hang la duong TIEN VE. Nha cung cap goi tu may chu cua
 * ho, tuc la tu MOT dia chi IP co dinh; neu ho gui don mot dot (vi du sau khi
 * he thong ho bi gian doan roi gui bu) thi mot cai 429 o day nghia la tien da
 * vao tai khoan ma coin khong duoc cong. Han muc phia tren rong hon nhu cau
 * cua ho rat nhieu lan, nhung mot duong dinh toi tien thi khong dat cuoc vao
 * chu "rat nhieu lan".
 */
const BO_QUA = new Set(['/', '/api/coin/webhook/ngan-hang']);

// --------------------------------------------------------------------------
// Bo dem cua so co dinh - phan thuan, kiem thu duoc
// --------------------------------------------------------------------------

const taoBoDem = (cuaSoMs, nguong) => ({ cuaSoMs, nguong, o: new Map() });

const don = (bo, now) => {
    for (const [k, v] of bo.o) {
        if (v.hetHan <= now) bo.o.delete(k);
    }
    // Don xong van day nghia la dang bi ban tu rat nhieu dia chi cung luc.
    // Xoa sach con hon de bo nho phinh: mat bo dem mot nhip la mat mot lop
    // phong thu, con het RAM la sap han tien trinh.
    if (bo.o.size >= MAX_KHOA) bo.o.clear();
};

/**
 * Ghi mot luot va cho biet co vuot nguong khong.
 * @returns {number} so giay phai cho neu VUOT, 0 neu con di tiep duoc.
 */
const ghiMot = (bo, khoa, now) => {
    let rec = bo.o.get(khoa);

    if (!rec || rec.hetHan <= now) {
        if (bo.o.size >= MAX_KHOA) don(bo, now);
        rec = { dem: 0, hetHan: now + bo.cuaSoMs };
        bo.o.set(khoa, rec);
    }

    rec.dem += 1;
    if (rec.dem <= bo.nguong) return 0;
    return Math.max(1, Math.ceil((rec.hetHan - now) / 1000));
};

// --------------------------------------------------------------------------
// Middleware
// --------------------------------------------------------------------------

// req.ip chi dung khi index.js da dat app.set('trust proxy', 1).
// Thieu dong do thi day la IP cua proxy, va MOI khach chung mot o dem - tuc
// la mot nguoi dung nang tay co the khoa ca he thong.
const ipCua = (req) => req.ip || req.socket?.remoteAddress || 'unknown';

const taoTranChung = ({
    nguongPhut = NGUONG_PHUT,
    nguongGio = NGUONG_GIO,
} = {}) => {
    const cacBo = [
        taoBoDem(60 * 1000, nguongPhut),
        taoBoDem(60 * 60 * 1000, nguongGio),
    ];

    return (req, res, next) => {
        if (BO_QUA.has(req.path)) return next();

        const now = Date.now();
        const khoa = ipCua(req);

        // Ghi vao CA HAI cua so truoc roi moi quyet dinh.
        //
        // Neu tra ve ngay khi cua so phut vuot thi cua so gio khong duoc ghi -
        // va the la mot ke bi chan lien tuc theo phut lai khong bao gio cham
        // nguong theo gio, dung cai nguong sinh ra de bat ho.
        let choGiay = 0;
        for (const bo of cacBo) {
            choGiay = Math.max(choGiay, ghiMot(bo, khoa, now));
        }

        if (choGiay > 0) {
            res.set('Retry-After', String(choGiay));
            return res.status(429).json({
                message: 'Quá nhiều yêu cầu từ địa chỉ này. Vui lòng thử lại sau ít phút.',
                retryAfter: choGiay,
            });
        }

        return next();
    };
};

module.exports = { taoTranChung, taoBoDem, ghiMot, BO_QUA, MAX_KHOA };
