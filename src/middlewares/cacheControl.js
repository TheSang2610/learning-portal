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

module.exports = { datCache };
