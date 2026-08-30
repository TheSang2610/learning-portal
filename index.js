const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./src/config/db');


dotenv.config();

// Kết nối DB trước khi khởi tạo App
connectDB();

const app = express();

const allowedOrigins = [
  'https://learning-portal-frontend-gilt.vercel.app',
];

// Khi dev: chap nhan MOI port cua localhost / 127.0.0.1.
// Ly do: Next tu nhay sang 3001, 3002... neu 3000 dang bi chiem,
// truoc day port moi bi chan CORS -> API tra 500 -> giao dien trong tron.
const isLocalhost = (origin) =>
  /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

app.use(cors({
  origin: function (origin, callback) {
    // Cho phép request không có origin (mobile apps, curl, etc)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    if (process.env.NODE_ENV !== 'production' && isLocalhost(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS not allowed for origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200,
}));

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

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

// Middleware xử lý lỗi 404 (Khi không tìm thấy route)
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

// Middleware xử lý lỗi tập trung
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
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