const express = require('express');
const compression = require('compression');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const { chongCsrf } = require('./src/middlewares/chongCsrf');
const connectDB = require('./src/config/db');


dotenv.config();

// Kết nối DB trước khi khởi tạo App
connectDB();

const app = express();

// Tin proxy dung truoc (Vercel, Render, Nginx...).
//
// Khong dat cai nay thi req.ip la IP CUA PROXY chu khong phai cua nguoi dung:
// moi khach deu chung mot IP. Hau qua la bo gioi han dang nhap theo IP tro
// thanh vo nghia, va neu chan theo IP thi chan nham tat ca cung mot luc.
//
// So 1 = chi tin dung MOT lop proxy gan nhat. Dat true (tin het) la cho phep
// ke tan cong tu gia X-Forwarded-For de lam moi lan thu deu nhu mot IP moi.
app.set('trust proxy', 1);

// Bo header X-Powered-By: khong giup gi cho nguoi dung, chi noi cho ke do
// khac may chu chay bang gi.
app.disable('x-powered-by');

// Cac header bao mat.
//
// Tu dat thay vi dung helmet: may chu nay CHI tra JSON, khong phuc vu HTML,
// nen phan lon mac dinh cua helmet khong dung toi. Sau day la nhung cai that
// su co tac dung o day, moi cai kem ly do.
app.use((req, res, next) => {
    // Cam trinh duyet tu doan kieu noi dung. Khong co no, mot file tai len bi
    // tra ve voi kieu sai van co the bi doc thanh HTML/JS va chay.
    res.set('X-Content-Type-Options', 'nosniff');

    // API khong bao gio can nam trong iframe. Chan luon ca hai kieu khai bao:
    // frame-ancestors cho trinh duyet moi, X-Frame-Options cho trinh duyet cu.
    res.set('X-Frame-Options', 'DENY');
    res.set('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'");

    // Khong gui dia chi trang hien tai sang ben thu ba.
    res.set('Referrer-Policy', 'no-referrer');

    // Chi bat HSTS khi chay that: bat luc dev se khoa trinh duyet vao https
    // cho localhost va rat phien de go ra.
    if (process.env.NODE_ENV === 'production') {
        res.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }

    next();
});

// Nen phan hoi. Do duoc tren du lieu that: /api/courses 9.399 -> 2.260 byte,
// /api/documents 9.550 -> khoang 2.400 byte.
//
// Tren Vercel thi CDN cung tu nen, nhung Dockerfile o day chay Express tran
// khong co gi dung truoc, va luc dev cung vay. De o tang ung dung thi noi nao
// cung duoc nen.
app.use(compression());

const allowedOrigins = [
  'https://learning-portal-frontend-gilt.vercel.app',
];

// Khi dev: chap nhan MOI port cua localhost / 127.0.0.1.
// Ly do: Next tu nhay sang 3001, 3002... neu 3000 dang bi chiem,
// truoc day port moi bi chan CORS -> API tra 500 -> giao dien trong tron.
const isLocalhost = (origin) =>
  /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

// Mot ham duy nhat quyet dinh "origin nay co duoc phep khong", dung chung cho
// CA CORS lan chan CSRF. De hai noi tu liet ke rieng thi them mot ten mien moi
// se sua duoc mot cho va quen cho kia - luc do dang nhap duoc nhung moi thao
// tac ghi deu bi tu choi 403, rat kho doan ra.
const originDuocPhep = (origin) => {
  if (allowedOrigins.includes(origin)) return true;
  return process.env.NODE_ENV !== 'production' && isLocalhost(origin);
};

app.use(cors({
  origin: function (origin, callback) {
    // Cho phép request không có origin (mobile apps, curl, etc)
    if (!origin) return callback(null, true);
    if (originDuocPhep(origin)) return callback(null, true);

    // Tra ve false, KHONG nem loi.
    //
    // Ban cu nem `new Error(...)`, ma loi nem trong middleware thi thanh 500 -
    // nghia la moi request tu mot origin la, ke ca mot cai GET vo hai, deu tao
    // ra mot loi 500 trong log. Tra false thi chi don gian la khong gan header
    // CORS: trinh duyet tu chan viec DOC phan hoi, dung nhu CORS von dinh lam.
    //
    // Con viec chan thao tac GHI tu origin la thi da co chongCsrf lo, va no
    // tra 403 - dung ma trang thai cho tinh huong nay.
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200,
}));

// Chan CSRF NGAY SAU cors va TRUOC moi bo phan tich than request.
//
// Dat sau express.json thi mot request tu origin la mang than JSON hong se bi
// tra 400 truoc khi kip kiem origin - vua sai ma trang thai, vua ton cong doc
// than cua mot request dang le phai vut di ngay. Xem middlewares/chongCsrf.js.
app.use(chongCsrf(originDuocPhep));

// Middleware
// 50mb la con so cu, thua 1000 lan so voi nhu cau that: JSON lon nhat ma may
// chu nay nhan la mot bai viet, ma model Post da chan content o 50.000 ky tu
// (~50KB). File anh va tai lieu KHONG di qua day - chung di duong multipart va
// do multer lo, xem utils/uploadCloud.js.
//
// De 50mb tuc la moi request an danh deu co the bat may chu nuot 50MB vao bo
// nho. Vai chuc request song song la het RAM.
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ limit: '1mb', extended: true }));

// Doc cookie token. Phai dung TRUOC moi route vi protect() lay token tu day.
app.use(cookieParser());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Che noi dung loi 5xx truoc khi no ra khoi may chu.
//
// 109 cho trong cac controller deu tu bat loi roi tra thang
// `res.status(500).json({ message: error.message })`. Message do khong phai cau
// minh viet cho nguoi dung ma la cau chu cua Mongoose hoac cua driver Mongo,
// doi khi kem ten bang, ten truong, ca mot phan chuoi ket noi.
//
// Sua ca 109 cho thi vua nhieu vua de sot ve sau, nen chan o dung mot noi: boc
// res.json lai mot lop. Loi 4xx giu nguyen vi do la cau minh chu dong viet ra
// de bao cho nguoi dung ("Email da ton tai", "Khong tim thay khoa hoc"...).
app.use((req, res, next) => {
  // Luc dev thi giu nguyen loi that, khong thi khong con gi ma sua.
  if (process.env.NODE_ENV === 'development') return next();

  const traJson = res.json.bind(res);

  res.json = (body) => {
    if (res.statusCode >= 500 && body && typeof body === 'object' && body.message) {
      // Giau voi khach thi phai hien voi minh, neu khong loi bien mat khong dau vet.
      console.error(`[${req.method} ${req.originalUrl}] ${res.statusCode}:`, body.message);
      return traJson({ ...body, message: 'Đã có lỗi xảy ra, vui lòng thử lại sau' });
    }
    return traJson(body);
  };

  next();
});

// Routes
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Chú ý: Đảm bảo đường dẫn file chính xác
app.use('/api/users', require('./src/routes/userRoutes'));
app.use('/api/categories', require('./src/routes/categoryRoutes'));
app.use('/api/courses', require('./src/routes/courseRoutes'));
app.use('/api/lessons', require('./src/routes/lessonRoutes'));
app.use('/api/reviews', require('./src/routes/reviewRoutes'));
app.use('/api/enrollments', require('./src/routes/enrollmentRoutes'));
app.use('/api/quizzes', require('./src/routes/quizRoutes'));
app.use('/api/certificates', require('./src/routes/certificateRoutes'));
app.use('/api/admin', require('./src/routes/adminRoutes'));
app.use("/api/providers", require("./src/routes/providerRoutes"));
app.use('/api/faqs', require('./src/routes/faqRoutes'));
app.use('/api/banners', require('./src/routes/bannerRoutes'));
app.use('/api/documents', require('./src/routes/documentRoutes'));
app.use('/api/posts', require('./src/routes/postRoutes'));

// Middleware xử lý lỗi 404 (Khi không tìm thấy route)
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

// Middleware xử lý lỗi tập trung
app.use((err, req, res, next) => {
  // Uu tien ma trang thai ma chinh loi mang theo.
  //
  // Cac loi cua Express deu gan san .status: body qua co -> 413, JSON hong ->
  // 400. Ban cu chi nhin res.statusCode nen bien tat ca thanh 500, tuc la bao
  // "may chu hong" trong khi loi la do phia goi gui sai. 5xx con bi che noi
  // dung o lop tren nua, nen nguoi goi khong con manh moi nao de sua.
  const maCuaLoi = Number(err.status || err.statusCode);
  const statusCode =
    maCuaLoi >= 400 && maCuaLoi <= 599
      ? maCuaLoi
      : res.statusCode === 200
        ? 500
        : res.statusCode;

  // Truoc day dieu kien la `NODE_ENV === 'production' ? null : err.stack`:
  // QUEN dat bien moi truong luc deploy la stack trace ra thang cho khach xem.
  // Dao lai thanh "chi hien khi la development" nen quen bien thi lo ve phia an toan.
  const laDev = process.env.NODE_ENV === 'development';

  // Loi 5xx la loi ngoai y muon, message cua no thuong la cau chu cua Mongoose
  // hoac cua driver - doi khi kem ca ten bang, ten truong. Loi 4xx thi nguoc lai:
  // do chinh minh viet ra de bao cho nguoi dung, nen giu nguyen.
  const message =
    statusCode >= 500 && !laDev
      ? 'Đã có lỗi xảy ra, vui lòng thử lại sau'
      : err.message;

  // Giau voi khach thi phai hien voi minh, neu khong loi 500 bien mat khong dau vet.
  if (statusCode >= 500) {
    console.error(`[${req.method} ${req.originalUrl}]`, err);
  }

  res.status(statusCode).json({
    message,
    stack: laDev ? err.stack : null,
  });
});

const PORT = process.env.PORT || 5000;

// Tren Vercel, ham serverless duoc goi qua module.exports - KHONG duoc listen.
// Goi app.listen() o do se chiem cong vo ich va keo dai cold start.
// Chi listen khi chay truc tiep bang `node index.js` hoac nodemon.
if (require.main === module && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(
      `🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
    );
  });
}

module.exports = app;