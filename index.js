const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./src/config/db');

dotenv.config();

// Kết nối DB trước khi khởi tạo App
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
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

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(
            `Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
        );
    });
}

module.exports = app;