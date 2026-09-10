// Dat va xoa token dang nhap duoi dang cookie httpOnly.
//
// VI SAO httpOnly: truoc day token nam trong localStorage, nghia la BAT KY
// doan JavaScript nao chay tren trang cung doc duoc no - mot lo XSS la mat
// token, va khong lop bao mat nao o duoi cuu duoc. Cookie httpOnly thi
// document.cookie khong nhin thay, nen XSS khong lay ra duoc.
//
// Doi lai: cookie duoc trinh duyet TU DONG gui kem moi request toi mien do,
// ke ca request do trang cua ke khac tao ra. Do la CSRF. Vi vay bat buoc phai
// co middlewares/chongCsrf.js di kem - dung cai nay ma bo cai kia la doi mot
// lo hong lay mot lo hong khac.

const TEN_COOKIE = 'token';

// Khop voi HAN_TOKEN trong utils/matKhau.js ('1d').
// De lech nhau thi cookie con song sau khi JWT ben trong da het han: nguoi
// dung thay minh "van dang nhap" nhung moi request deu 401.
const HAN_MS = 24 * 60 * 60 * 1000;

// sameSite:
//   'lax'  khi dev - frontend va backend cung la localhost (cookie khong phan
//          biet cong nen hai ben van la cung site), va 'lax' thi trinh duyet
//          nao cung nhan.
//   'none' khi that - frontend o vercel.app, backend o mien khac, tuc la
//          cookie ben thu ba. 'none' BAT BUOC di kem secure:true.
//
// CANH BAO ve 'none': Safari chan san cookie ben thu ba, Chrome dang bo dan.
// Neu hai ben nam o hai mien goc khac nhau that thi phai cho API di chung mien
// voi giao dien (proxy qua Next, hoac api.mien.com + app.mien.com) - xem README.
const laProd = () => process.env.NODE_ENV === 'production';

const tuyChon = () => ({
    httpOnly: true,
    secure: laProd(),
    sameSite: laProd() ? 'none' : 'lax',
    path: '/',
});

const datCookieToken = (res, token) => {
    res.cookie(TEN_COOKIE, token, { ...tuyChon(), maxAge: HAN_MS });
};

// Phai truyen DUNG cac tuy chon luc dat (tru maxAge), neu khong trinh duyet
// coi day la mot cookie khac va cookie cu van nam nguyen.
const xoaCookieToken = (res) => {
    res.clearCookie(TEN_COOKIE, tuyChon());
};

// Uu tien cookie; con doc header Bearer de cac cong cu goi API (curl, Postman)
// va cac ung dung ngoai trinh duyet van dung duoc.
const layToken = (req) => {
    if (req.cookies && req.cookies[TEN_COOKIE]) return req.cookies[TEN_COOKIE];

    const h = req.headers.authorization;
    if (h && h.startsWith('Bearer ')) return h.split(' ')[1];

    return null;
};

module.exports = { datCookieToken, xoaCookieToken, layToken, TEN_COOKIE, HAN_MS };
