// Chan CSRF bang cach kiem Origin cua cac request co lam thay doi du lieu.
//
// VI SAO CAN: tu luc token chuyen sang cookie, trinh duyet TU DONG gui no kem
// moi request toi backend - ke ca request phat ra tu mot trang cua ke tan cong.
// Ke do chi can dung mot form an tren trang cua ho:
//
//     <form method="POST" action="https://api-cua-ban/api/users/deactivate">
//
// va nguoi dung dang dang nhap chi can ghe qua trang do la lenh chay that.
//
// VI SAO CORS KHONG DU: CORS chan viec ke tan cong ĐỌC phan hoi, chu khong
// chan request duoc GUI DI. Voi cac "simple request" - POST mang
// Content-Type la application/x-www-form-urlencoded, multipart/form-data hay
// text/plain - trinh duyet khong hoi truoc (preflight), request cu the ma
// chay. Du an nay bat ca express.urlencoded lan multer nen ca hai kieu do
// deu vao duoc controller.
//
// CACH LAM: request lam thay doi du lieu ma mang Origin la cua noi khac thi
// tu choi. Trinh duyet LUON gui Origin cho POST/PUT/PATCH/DELETE, va khong co
// cach nao de trang cua ke tan cong bo hay gia header nay - no do trinh duyet
// dat, JavaScript khong ghi de duoc.
//
// Origin vang mat thi lui ve xet Referer, roi moi cho qua. Ly do lui chu khong
// chan thang: curl/Postman/ung dung di dong khong gui header nao trong hai cai,
// va chung cung khong mang cookie cua trinh duyet nen khong the bi CSRF.
//
// VI SAO PHAI XET CA REFERER: o du an nay frontend va API nam khac site
// (.vercel.app nam trong Public Suffix List), nen cookie phien buoc phai la
// sameSite: 'none' - trinh duyet se gui cookie kem CA request tu site khac.
// Nghia la kiem tra nay la lop chan CSRF DUY NHAT, khong co sameSite do lung.
// Da vay thi khong nen de mot request chi can VANG Origin la di thang qua:
// con Referer thi cu xet Referer da.

const KHONG_DOI_DU_LIEU = new Set(['GET', 'HEAD', 'OPTIONS']);

// Lay phan goc cua mot dia chi day du. Tra ve null neu khong phan tich duoc -
// gia tri rac thi coi nhu khong co, de ben duoi tu quyet.
const layGoc = (dia) => {
    try {
        return new URL(String(dia)).origin;
    } catch {
        return null;
    }
};

const chongCsrf = (choPhep) => (req, res, next) => {
    if (KHONG_DOI_DU_LIEU.has(req.method)) return next();

    const tuChoi = () =>
        res.status(403).json({ message: 'Yêu cầu bị từ chối: nguồn không hợp lệ' });

    // Origin la bang chung manh nhat: trinh duyet LUON gui no cho cac method
    // nay, va JavaScript cua trang tan cong khong ghi de duoc.
    const origin = req.headers.origin;
    if (origin) return choPhep(origin) ? next() : tuChoi();

    // Khong co Origin. Con Referer thi no cung do trinh duyet dat va cung
    // khong gia duoc, nen dung tam lam bang chung.
    //
    // CO Referer ma khong phan tich duoc thi CHAN, khong cho qua. Day la cho
    // rat de viet hong: 'http://localhost:3000.doc-hai.example/' lam
    // new URL() nem loi, vi '3000.doc-hai.example' khong phai so cong hop le -
    // nen neu coi "khong phan tich duoc" la "khong co header" thi mot dia chi
    // dung ra phai chan lai di thang qua. Trinh duyet that luon gui Referer
    // dung dinh dang; chuoi rac nghia la khong phai trinh duyet that.
    const referer = req.headers.referer;
    if (referer) {
        const goc = layGoc(referer);
        return goc && choPhep(goc) ? next() : tuChoi();
    }

    // Khong header nao ca: khong phai trinh duyet, khong the bi CSRF.
    return next();
};

module.exports = { chongCsrf };
