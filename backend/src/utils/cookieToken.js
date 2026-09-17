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

// ---------------------------------------------------------------------------
// sameSite
// ---------------------------------------------------------------------------
//
// 'lax' o CA HAI moi truong. Truoc day ban that dung 'none', va day la ly do
// doi:
//
// 'none' nghia la "gui cookie nay kem CA nhung request do trang cua ke khac
// tao ra". Do la be mat CSRF - ke tan cong dung mot trang bat ky la co the ep
// trinh duyet nan nhan goi API nay KEM COOKIE dang nhap cua ho.
// middlewares/chongCsrf.js dang che cho, nhung mot lop che khong bang viec
// khong tao ra lo hong tu dau.
//
// 'none' sinh ra tu gia dinh "frontend va backend o hai mien khac nhau nen
// cookie la ben thu ba". Gia dinh do KHONG con dung: giao dien goi API qua
// rewrites() cua Next (xem frontend/next.config.ts), nen trinh duyet chi thay
// MOT mien.
//
// DA KIEM CHUNG TREN BAN THAT, khong phai suy doan:
//   - GET https://<frontend>/api/courses tra ve 200 kem du lieu that
//     -> duong rewrite hoat dong tren production.
//   - POST https://<frontend>/api/users/logout tra ve
//     `Set-Cookie: token=; Path=/; HttpOnly; Secure; SameSite=None`
//     -> KHONG co thuoc tinh Domain, tuc la cookie thuoc ve chinh mien
//        frontend. No la cookie BEN THU NHAT, khong can 'none'.
//
// KHI NAO PHAI DOI LAI THANH 'none': neu co duong nao khien TRINH DUYET goi
// thang sang mien cua backend, cu the la
//   - dat NEXT_PUBLIC_GOI_THANG_BACKEND=1 o frontend, hoac
//   - mot ung dung di dong / ten mien khac goi thang vao API nay.
// Luc do cookie tro lai la ben thu ba va 'lax' se lam dang nhap hong. Dat
// COOKIE_SAMESITE=none o backend roi deploy lai - khong phai sua ma nguon.
//
// CANH BAO neu phai dung 'none': Safari chan san cookie ben thu ba va Chrome
// dang bo dan, nen do chi la giai phap tam. Huong dung van la cho API di chung
// mien voi giao dien.
const laProd = () => process.env.NODE_ENV === 'production';

const sameSiteMongMuon = () => {
    // Chi doc bien nay khi chay that. Luc dev, 'none' bat buoc di kem
    // secure:true, ma cookie Secure thi khong bao gio duoc dat tren
    // http://localhost - dat nham la ca may dev khong dang nhap duoc.
    if (!laProd()) return 'lax';

    const dat = String(process.env.COOKIE_SAMESITE || '').trim().toLowerCase();
    return dat === 'none' || dat === 'strict' ? dat : 'lax';
};

const tuyChon = () => {
    const sameSite = sameSiteMongMuon();
    return {
        httpOnly: true,
        // 'none' ma khong co Secure thi trinh duyet TU CHOI thang cookie. Buoc
        // secure:true o day de mot lan dat bien sai khong bien thanh "khong ai
        // dang nhap duoc" ma khong ro vi sao.
        secure: laProd() || sameSite === 'none',
        sameSite,
        path: '/',
    };
};

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
