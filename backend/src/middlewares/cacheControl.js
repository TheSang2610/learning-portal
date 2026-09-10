// Dat Cache-Control cho cac duong CONG KHAI va giong nhau voi moi nguoi.
//
// Chi dung duoc khi ca hai dieu sau dung, da kiem tay tung ham truoc khi gan:
//   1. Phan hoi khong phu thuoc req.user  -> nguoi nay khong nhan duoc du lieu
//      cua nguoi kia tu bo dem chung.
//   2. Ham khong co tac dung phu (khong $inc, khong ghi gi)  -> vi dem tra ban
//      luu san se lam tac dung phu do khong chay. Day chinh la ly do
//      GET /api/posts/:slug KHONG duoc gan: no dem luot xem.
//
// max-age=0 nen trinh duyet luon hoi lai may chu, va nho ETag san co cua
// Express, lan hoi lai do thuong tra ve 304 rong thay vi ca goi JSON. Nguoi
// vua dang bai van thay bai cua minh ngay.
//
// s-maxage moi la phan an tien: CDN (Vercel) giu ban sao trong tung ay giay,
// nen luot xem thu hai tro di khong danh thuc ham serverless nua.
const datCache = (giay = 60) => (req, res, next) => {
    if (req.method === 'GET') {
        res.set(
            'Cache-Control',
            `public, max-age=0, s-maxage=${giay}, stale-while-revalidate=${giay * 5}`,
        );
    }
    next();
};

// Nguoc lai voi datCache: cam luu, cho MOI duong tra ve du lieu rieng cua mot
// nguoi hoac dat cookie phien.
//
// Phan hoi cua /login, /google va /profile mang ten, email, vai tro cua chinh
// nguoi dang goi, va di kem Set-Cookie chua token. Khong noi ro "dung luu" thi
// moi bo dem tren duong di - CDN, proxy cua co quan, bo dem cua trinh duyet -
// deu duoc quyen tu quyet dinh, va mot ban sao con nam lai o do la du de nguoi
// dung tiep theo tren cung may thay du lieu cua nguoi truoc.
//
// no-store la manh nhat: khong duoc ghi ra dia, khong duoc giu trong RAM.
// Kem no-cache + max-age=0 cho cac bo dem cu chi hieu HTTP/1.0.
const khongLuuCache = (req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, max-age=0, must-revalidate');
    res.set('Pragma', 'no-cache');
    next();
};

module.exports = { datCache, khongLuuCache };
