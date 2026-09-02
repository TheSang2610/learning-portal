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
// Origin vang mat thi cho qua: do la curl/Postman/ung dung di dong, va nhung
// thu do khong mang cookie cua trinh duyet nen khong the bi CSRF.

const KHONG_DOI_DU_LIEU = new Set(['GET', 'HEAD', 'OPTIONS']);

const chongCsrf = (choPhep) => (req, res, next) => {
    if (KHONG_DOI_DU_LIEU.has(req.method)) return next();

    const origin = req.headers.origin;
    if (!origin) return next();

    if (choPhep(origin)) return next();

    return res.status(403).json({ message: 'Yêu cầu bị từ chối: nguồn không hợp lệ' });
};

module.exports = { chongCsrf };
